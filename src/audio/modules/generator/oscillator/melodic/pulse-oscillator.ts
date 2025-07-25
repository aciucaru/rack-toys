import { OscillatorSettings, Settings } from "../../../../core/settings";
import { NoteSettings } from "../../../settings/note-settings";

import { RestartableGenerator, type EndableNode } from "../../../../core/emitter";
import type { FrequencyBasedSignal, PulseBasedSignal } from "../../../../core/signal";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export class PulseOscillator extends RestartableGenerator implements FrequencyBasedSignal, PulseBasedSignal
{
    private audioContext: AudioContext;

    // The saw oscillator is the main 'ingredient' in making a pulse oscillator
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private sawOscillatorNode!: OscillatorNode; 

    private constantCurve: Float32Array = new Float32Array(2);
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private constantWaveShaper!: WaveShaperNode;

    private squareCurve: Float32Array = new Float32Array(256);
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private squareWaveShaper!: WaveShaperNode;

    // This gain node is what makes the 'pulse width' adjustment possible;
    // The pulse width is also modulatable, thanks to this gain node;
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private pulseWidthGainNode!: GainNode;

    private endableNodes: Array<EndableNode> = new Array<EndableNode>();

    private outputNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "PulseOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        super();

        this.audioContext = audioContext;

        // Instantiate the final output node separately, and before the other nodes
        this.outputNode = this.audioContext.createGain();

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
    protected override setEndableNodes(): void
    {
        // Clear the array
        this.endableNodes.length = 0;

        // Add the required nodes
        this.endableNodes.push(this.sawOscillatorNode);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override initNodes(): void
    {
        // 1. Instantiate fresh nodes:
        // instantiate the sawtooth oscillator and set parameters
        this.sawOscillatorNode = this.audioContext.createOscillator();
        this.sawOscillatorNode.type = "sawtooth";
        this.sawOscillatorNode.frequency.setValueAtTime(NoteSettings.defaultFrequency, this.audioContext.currentTime);

        // define the curve for the constant wave shaper node
        this.constantCurve[0] = OscillatorSettings.defaultPulseWidth;
        this.constantCurve[1] = OscillatorSettings.defaultPulseWidth;

        // define the curve for the square wave shaper node
        this.squareCurve.fill(-1, 0, 128); // set all elements from 0...127 to value -1
        this.squareCurve.fill(1, 128, 256); // set all elements from 128...256 to value 1

        // instantiate the wave shaper nodes
        this.constantWaveShaper = new WaveShaperNode(this.audioContext, { curve: this.constantCurve });
        this.squareWaveShaper = new WaveShaperNode(this.audioContext, { curve: this.squareCurve });

        // instatiate the gain node
        this.pulseWidthGainNode = this.audioContext.createGain();
        // set the initial gain of the gain nodes
        this.pulseWidthGainNode.gain.setValueAtTime(OscillatorSettings.defaultPulseWidth, this.audioContext.currentTime);

        // 2. Connect nodes between them:
        this.sawOscillatorNode.connect(this.constantWaveShaper);
        this.constantWaveShaper.connect(this.pulseWidthGainNode);
        this.sawOscillatorNode.connect(this.pulseWidthGainNode); // extra node, but necessary
        this.pulseWidthGainNode.connect(this.squareWaveShaper);
        // connect the waveshaper to the final output node (a gain node)
        this.squareWaveShaper.connect(this.outputNode);

        /* Before starting all source nodes, we unmute the final output node, because it has been muted
        ** in the 'stop' and 'disconnect' phase */
        this.outputNode.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override startNodes(): void
    {
        // Start all audio sources, in this case only one oscillator
        this.sawOscillatorNode.start(this.audioContext.currentTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override stopNodes(): void
    {
        /* Before stopping all nodes, we mute the final output node, just to make sure
        ** we don't hear any clicks when stopping all nodes */
        // this.outputNode.gain.linearRampToValueAtTime(0.0, stopTime); // not quite correct, needs adjustment

        this.sawOscillatorNode.stop(this.audioContext.currentTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override disconnectNodes(): void
    {
        /* Before disconnecting all nodes, we mute the final output node, just to make sure
        ** we don't hear any clicks when disconnecting all nodes */
        // this.outputNode.gain.linearRampToValueAtTime(0.0, this.audioContext.currentTime); // necessary?

        // We disconnect nodes in the reverse order we connected them
        this.squareWaveShaper.disconnect(this.outputNode);
        this.pulseWidthGainNode.disconnect(this.squareWaveShaper);
        this.sawOscillatorNode.disconnect(this.pulseWidthGainNode);
        this.constantWaveShaper.disconnect(this.pulseWidthGainNode);
        this.sawOscillatorNode.disconnect(this.constantWaveShaper);
    }

    // Method inherited from interface 'FrequencyBasedSignal'
    public setFrequency(frequency: number): boolean
    {
        if (frequency >= 0.0)
        {
            PulseOscillator.logger.debug(`setFrequency(${frequency})`);

            // set the frequency
            this.sawOscillatorNode.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            PulseOscillator.logger.warn(`setFrequency(${frequency}): parameter is outside bounds`);
            return false; // change was not succesfull
        }
    }

    // Method inherited from interface 'PulseBasedSignal'
    public setPulseWidth(pulseWidth: number): boolean
    {
        if (OscillatorSettings.minPulseWidth <= pulseWidth && pulseWidth <= OscillatorSettings.maxPulseWidth)
        {
            PulseOscillator.logger.debug(`setPulseWidth(${pulseWidth})`);

            // this seems the correct one
            this.constantCurve[0] = pulseWidth;
            this.constantCurve[1] = pulseWidth;

            // set the pulse width
            this.pulseWidthGainNode.gain.setValueAtTime(pulseWidth, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            PulseOscillator.logger.warn(`setPulseWidth(${pulseWidth}): parameter is outside bounds`);
            return false; // change was not succesfull
        }
    }

    public getOscillatorNode(): OscillatorNode { return this.sawOscillatorNode; }
}