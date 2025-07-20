import { Settings } from "../../../constants/settings";

import { RestartableGenerator, type EndableNode } from "../../core/emitter";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/* General-purpose ADSR envelope; this envelope can vary between 0.0 and 1.0.
** It also has a sustain level, where 'sustainLevel' can be maximum 1.0 (100%).
**
** This is NOT a multiplier, it is not  an intermediat node. This is a source of signal and it has no inputs.
** Instead it has an output, the actual ADSR signal itself. So it cannot be used to 'amplify' a signal, because
** it has no inputs, it's a standalone source of signal (a generator).
**
** The ADSR enevelope is always between 0.0 and 1.0 and it supposed to by multiplied by an external 'evelope amount',
** where the 'envelope amount' is no longer a relative value (between 0 and 1) but an absolute value,
** in the same measurement units as the parameter (destination) it's modulating. This multiplication
** is optional and is made outside this class, usually through a GainNode.
**
** Then, the ADSR envelope is added to the current value of the parameter it's modulating.
**
** The optional 'envelope amount' can be positive or negative. When it's positive, the ADSR envelope is added to
** the current value of the parameter it's modulating. When the 'envelope amount' is negative, the result of
** the ADSR envelope is subtracted from the current value of the parameter it's modulating.
** But regardless of the sign, the ADSR envelope is first multiplied with the 'envelope amount' and then
** added to the current value of the parameter it's modulating.
**
** The ADSR envelope is a modulator, thus is must emit a signal. The main functionality of the ADSR envelope comes
** from a GainNode, but the GainNode itself does not emit any signal, it is just a multiplier that multiplies a
** input signal. So the ADSR envelope will not work with just a GainNode. It also needs en emitter of signal.
** That emitter is a ConstanSourceNode, which is fed through the GainNode.
** Whithout the ConstantSourceNode, the ADSR envelope will not work, because it won't emit any signal. */

export class AdsrEnvelopeGenerator extends RestartableGenerator
{
    /* the audio context used to create and connect nodes; must be supplied from outside the class */
    private audioContext: AudioContext;

    // The emitter of a continous constant signal.
    // Must be initialized somewere inside the constructor, in this case the initNodes() method.
    private adsrConstantSource!: ConstantSourceNode;

    // A multiplier to multiply the previous 'adsrConstantSource' constant signal with.
    // Must be initialized somewere inside the constructor, in this case the initNodes() method.
    private adsrGainNode!: GainNode;

    private endableNodes: Array<EndableNode> = new Array<EndableNode>();

    // the final output of this class; this is used to connect the signal outputed from this class to other nodes
    private outputNode: GainNode;

    // main parameters: durations (not times/moments!) and sustain level
    private attackDuration: number = Settings.defaultAdsrAttackDuration;
    private decayDuration: number = Settings.defaultAdsrDecayDuration;
    private sustainLevel: number = Settings.defaultAdsrSustainLevel;
    private releaseDuration: number = Settings.defaultAdsrReleaseDuration;

    // time parameters:
    private onTime = 0; // time when the ADSR is turned on
    private attackStartTime = this.onTime + Settings.adsrSafetyDuration;
    private attackEndTime = this.attackDuration; // the time the attack phase should end
    private decayEndTime = this.attackEndTime + this.decayDuration; // the time the decay phase should end
    private releaseStartTime = this.decayEndTime + Settings.adsrSafetyDuration; // the time the release should start
    private releaseEndTime = this.releaseStartTime + this.releaseDuration; // the time the release phase should end
    private offTime = this.releaseEndTime + Settings.adsrSafetyDuration; // time when ADSR is turned off
    
    private static readonly logger: Logger<ILogObj> = new Logger({name: "AdsrEnvelope", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        super();

        this.audioContext = audioContext;

        // Instantiate the final output node separately, and before the other nodes
        this.outputNode = this.audioContext.createGain();
        this.outputNode.gain.setValueAtTime(Settings.baseSourceDefaultGain, this.audioContext.currentTime);

        // Instantiate and connect all nodes and set their parameters
        this.initNodes();

        /* Set the array of 'EndableNodes' (nodes with 'onended' event) */
        this.setEndableNodes();
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    public override getOutputNode(): AudioNode { return this.outputNode; }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override getEndableNodes(): EndableNode[] { return this.endableNodes; }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected setEndableNodes(): void
    {
        // Clear the array
        this.endableNodes.length = 0;

        // Add the required nodes
        this.endableNodes.push(this.adsrConstantSource);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected initNodes(): void
    {
        this.adsrConstantSource = this.audioContext.createConstantSource();
        this.adsrConstantSource.offset.setValueAtTime(1.0, this.audioContext.currentTime);

        this.adsrGainNode = this.audioContext.createGain();
        this.adsrGainNode.gain.setValueAtTime(Settings.minAdsrSustainLevel, this.audioContext.currentTime);

        /* The on/off gain node (final node) is 'ouputGainNode', inherited from BaseSource class.
        ** This second gain node is used for completely turning off the ADSR envelope.
        ** This node is necessary because the 'adsrGainNode' cannot have a totaly zero gain, because
        ** the 'adsrGainNode' could also be used with exponential ramps, which cannot ramp to exactly zero,
        ** leaving a very small signal that might still be audible.
        ** But the 'outputGainNode' never uses an exponential ramp, so it can go completely to zero, making the
        ** ADSR truly silent when necessary (in the 'release' phase). */
        this.outputNode.gain.setValueAtTime(Settings.adsrOffLevel, this.audioContext.currentTime);

        // connect nodes betweem them
        this.adsrConstantSource.connect(this.adsrGainNode);
        this.adsrGainNode.connect(this.outputNode);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected startNodes(): void
    {
        AdsrEnvelopeGenerator.logger.debug(`startNodes(): triggered`);

        /* It might be possible that the attack-decay-sustain phase has started before the previous ADSR event has finished.
        ** If we just add an 'attack-decay-sustain' event and not cancel all remaining events, the remaining events will trigger
        ** as well, because, chronologically, they are scheduled AFTER this event.
        ** In order to prevent this bug, we use 'cancelAndHoldAtTime()'. */

        // Compute the time AFTER which all the events of the gain parameter should be canceled
        const cancelationStartTime = this.audioContext.currentTime;

        /* Then we cancel all events that start AFTER the previous cancelation time but we keep the value
        ** that the parameter had when the cancelation started */ 
        this.adsrGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);
        this.outputNode.gain.cancelAndHoldAtTime(cancelationStartTime);

        /* After we checked the current ADSR phase based on ADSR times, we can now compute and overwrite ADSR times
        ** with new values.
        ** Overwriting the ADSR times should only be done after we used them to check what phase we are in!
        ** These new ADSR times will be used in the stop() method as well. */
        this.onTime = cancelationStartTime + Settings.adsrSafetyDuration;
        this.attackStartTime = this.onTime + Settings.adsrSafetyDuration; // save the attack start time
        this.attackEndTime = this.attackStartTime + this.attackDuration; // the time the attack phase should end
        this.decayEndTime = this.attackEndTime + this.decayDuration; // the time the decay phase should end

        // First, turn on the ADSR envelope, otherwise the emitted signal will be zero
        this.outputNode.gain.linearRampToValueAtTime(Settings.adsrOnLevel, this.onTime);

        /* Attack and decay phases */
        this.adsrGainNode.gain.linearRampToValueAtTime(Settings.maxAdsrSustainLevel, this.attackEndTime); // attack
        this.adsrGainNode.gain.linearRampToValueAtTime(this.sustainLevel, this.decayEndTime); // decay

        // Start the emitter
        this.adsrConstantSource.start();
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected stopNodes(): void
    {
        AdsrEnvelopeGenerator.logger.debug(`stopNodes(): triggered`);

        /* It might be possible that the release phase has started before the previous ADSR event has finished.
        ** If we just add a 'release' event and not cancel all remaining events, the remaining events will trigger
        ** as well, because, chronologically, they are scheduled AFTER this 'release' event.
        ** In order to prevent this bug, we use 'cancelAndHoldAtTime()'. */

        // now we compute the time AFTER all scheduled events should be canceled
        const cancelationStartTime = this.audioContext.currentTime;

        // cancel all remaining events
        this.adsrGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);
        this.outputNode.gain.cancelAndHoldAtTime(cancelationStartTime);

        // compute the start and end of the 'release' phase
        this.releaseStartTime = cancelationStartTime;
        this.releaseEndTime = this.releaseStartTime + this.releaseDuration;
        this.offTime = this.releaseEndTime + Settings.adsrSafetyDuration;

        // then start the actual 'release' phase by ramping down to the minimum possible
        // for 'release' phase we use linear ramp, not exponential, because exponential goes down to quick
        this.adsrGainNode.gain.linearRampToValueAtTime(Settings.minAdsrSustainLevel, this.releaseEndTime);
        this.outputNode.gain.linearRampToValueAtTime(Settings.adsrOffLevel, this.offTime);

        this.adsrConstantSource.stop(this.offTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected disconnectNodes(): void
    {
        // Disconnect nodes in the reverse order we connected them: from highest-level node (parent)
        // to lowest-level node (child)
        this.adsrGainNode.disconnect(this.outputNode);
        this.adsrConstantSource.disconnect(this.adsrGainNode);
    }

    public getAttackTime(): number { return this.attackDuration; }

    public setAttackTime(attackTime: number): boolean
    {
        if (Settings.minAdsrAttackDuration <= attackTime && attackTime <= Settings.maxAdsrAttackDuration)
        {
            AdsrEnvelopeGenerator.logger.debug(`setAttackTime(${attackTime})`);

            this.attackDuration = attackTime;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeGenerator.logger.warn(`setAttackTime(${attackTime}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getDecayTime(): number { return this.decayDuration; }

    public setDecayTime(decayTime: number): boolean
    {
        if (Settings.minAdsrDecayDuration <= decayTime && decayTime <= Settings.maxAdsrDecayDuration)
        {
            AdsrEnvelopeGenerator.logger.debug(`setDecayTime(${decayTime})`);

            this.decayDuration = decayTime;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeGenerator.logger.warn(`setDecayTime(${decayTime}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getSustainLevel(): number { return this.sustainLevel; }

    public setSustainLevel(sustainLevel: number): boolean
    {
        if (Settings.minAdsrSustainLevel <= sustainLevel && sustainLevel <= Settings.maxAdsrSustainLevel)
        {
            AdsrEnvelopeGenerator.logger.debug(`setSustainLevel(${sustainLevel})`);

            this.sustainLevel = sustainLevel;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeGenerator.logger.warn(`setSustainLevel(${sustainLevel}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getReleaseTime(): number { return this.releaseDuration; }

    public setReleaseTime(releaseTime: number): boolean
    {
        if (Settings.minAdsrReleaseDuration <= releaseTime && releaseTime <= Settings.maxAdsrReleaseDuration)
        {
            AdsrEnvelopeGenerator.logger.debug(`setReleaseTime(${releaseTime})`);

            this.releaseDuration = releaseTime;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeGenerator.logger.warn(`setReleaseTime(${releaseTime}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }
}