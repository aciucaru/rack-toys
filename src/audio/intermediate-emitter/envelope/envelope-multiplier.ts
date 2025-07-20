import { Settings } from "../../../constants/settings";

import type { EnvelopeMultiplier } from "../../core/envelope-multiplier";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


/* General-purpose ADSR envelope; this envelope can vary between 0.0 and 1.0.
** It also has a sustain level, where 'sustainLevel' can be maximum 1.0 (100%).
**
** This is a multiplier, it is an intermediate node. */

export class AdsrEnvelopeMultiplier implements EnvelopeMultiplier
{
    /* the audio context used to create and connect nodes; must be supplied from outside the class */
    private audioContext: AudioContext;

    // The emitter of a continous constant signal.
    // Must be initialized somewere inside the constructor, in this case the initNodes() method.
    private inputNode!: AudioNode;

    // A multiplier to multiply the previous 'adsrConstantSource' constant signal with.
    // Must be initialized somewere inside the constructor, in this case the initNodes() method.
    private adsrGainNode!: GainNode;

    // private endableNodes: Array<EndableNode> = new Array<EndableNode>();

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
    
    private static readonly logger: Logger<ILogObj> = new Logger({name: "AdsrEnvelopeMultiplier", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        // Instantiate the final output node separately, and before the other nodes
        this.outputNode = this.audioContext.createGain();
        this.outputNode.gain.setValueAtTime(Settings.baseSourceDefaultGain, this.audioContext.currentTime);

        // Instantiate and connect all nodes and set their parameters
        this.initNodes();
        // this.startNodes();

        /* Set the array of 'EndableNodes' (nodes with 'onended' event) */
        // this.setEndableNodes();
    }

    // Method inherited from 'EnvelopeMultiplier' interface (through 'Emitter' interface)
    public getOutputNode(): AudioNode { return this.outputNode; }

    private initNodes(): void
    {
        this.inputNode = this.audioContext.createConstantSource();
        this.inputNode.offset.setValueAtTime(1.0, this.audioContext.currentTime);

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
        this.inputNode.connect(this.adsrGainNode);
        this.adsrGainNode.connect(this.outputNode);
    }

    // private startNodes(): void
    // {
    //     AdsrEnvelopeMultiplier.logger.debug(`startNodes(): triggered`);

    //     /* It might be possible that the attack-decay-sustain phase has started before the previous ADSR event has finished.
    //     ** If we just add an 'attack-decay-sustain' event and not cancel all remaining events, the remaining events will trigger
    //     ** as well, because, chronologically, they are scheduled AFTER this event.
    //     ** In order to prevent this bug, we use 'cancelAndHoldAtTime()'. */

    //     // Compute the time AFTER which all the events of the gain parameter should be canceled
    //     const cancelationStartTime = this.audioContext.currentTime;

    //     /* Then we cancel all events that start AFTER the previous cancelation time but we keep the value
    //     ** that the parameter had when the cancelation started */ 
    //     this.adsrGainNode.gain.cancelAndHoldAtTime(cancelationStartTime);
    //     this.outputNode.gain.cancelAndHoldAtTime(cancelationStartTime);

    //     /* After we checked the current ADSR phase based on ADSR times, we can now compute and overwrite ADSR times
    //     ** with new values.
    //     ** Overwriting the ADSR times should only be done after we used them to check what phase we are in!
    //     ** These new ADSR times will be used in the stop() method as well. */
    //     this.onTime = cancelationStartTime + Settings.adsrSafetyDuration;
    //     this.attackStartTime = this.onTime + Settings.adsrSafetyDuration; // save the attack start time
    //     this.attackEndTime = this.attackStartTime + this.attackDuration; // the time the attack phase should end
    //     this.decayEndTime = this.attackEndTime + this.decayDuration; // the time the decay phase should end

    //     // First, turn on the ADSR envelope, otherwise the emitted signal will be zero
    //     this.outputNode.gain.linearRampToValueAtTime(Settings.adsrOnLevel, this.onTime);

    //     /* Attack and decay phases */
    //     this.adsrGainNode.gain.linearRampToValueAtTime(Settings.maxAdsrSustainLevel, this.attackEndTime); // attack
    //     this.adsrGainNode.gain.linearRampToValueAtTime(this.sustainLevel, this.decayEndTime); // decay

    //     // Start the emitter
    //     this.inputNode.start();
    // }

    private stopNodes(): void
    {
        AdsrEnvelopeMultiplier.logger.debug(`stopNodes(): triggered`);

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

        this.inputNode.stop(this.offTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    // protected disconnectNodes(): void
    // {
    //     // Disconnect nodes in the reverse order we connected them: from highest-level node (parent)
    //     // to lowest-level node (child)
    //     this.adsrGainNode.disconnect(this.outputNode);
    //     this.inputNode.disconnect(this.adsrGainNode);
    // }

    public getAttackDuration(): number { return this.attackDuration; }

    public setAttackDuration(attackDuration: number): boolean
    {
        if (Settings.minAdsrAttackDuration <= attackDuration && attackDuration <= Settings.maxAdsrAttackDuration)
        {
            AdsrEnvelopeMultiplier.logger.debug(`setAttackTime(${attackDuration})`);

            this.attackDuration = attackDuration;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeMultiplier.logger.warn(`setAttackTime(${attackDuration}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getDecayDuration(): number { return this.decayDuration; }

    public setDecayDuration(decayDuration: number): boolean
    {
        if (Settings.minAdsrDecayDuration <= decayDuration && decayDuration <= Settings.maxAdsrDecayDuration)
        {
            AdsrEnvelopeMultiplier.logger.debug(`setDecayTime(${decayDuration})`);

            this.decayDuration = decayDuration;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeMultiplier.logger.warn(`setDecayTime(${decayDuration}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getSustainLevel(): number { return this.sustainLevel; }

    public setSustainLevel(sustainLevel: number): boolean
    {
        if (Settings.minAdsrSustainLevel <= sustainLevel && sustainLevel <= Settings.maxAdsrSustainLevel)
        {
            AdsrEnvelopeMultiplier.logger.debug(`setSustainLevel(${sustainLevel})`);

            this.sustainLevel = sustainLevel;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeMultiplier.logger.warn(`setSustainLevel(${sustainLevel}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }

    public getReleaseDuration(): number { return this.releaseDuration; }

    public setReleaseDuration(releaseDuration: number): boolean
    {
        if (Settings.minAdsrReleaseDuration <= releaseDuration && releaseDuration <= Settings.maxAdsrReleaseDuration)
        {
            AdsrEnvelopeMultiplier.logger.debug(`setReleaseTime(${releaseDuration})`);

            this.releaseDuration = releaseDuration;
            return true; // value change was succesfull
        }
        else
        {
            AdsrEnvelopeMultiplier.logger.warn(`setReleaseTime(${releaseDuration}): argument is outside bounds`);
            return false; // value change was not succesfull
        }
    }
}