import { Settings } from "../../../../core/settings";
import { NoteSettings } from "../../../settings/note-settings";

import { RestartableGenerator, type EndableNode } from "../../../../core/emitter";
import type { FrequencyBasedSignal, PulseBasedSignal } from "../../../../core/signal";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

export const SimpleWaveshape =
{
    SINE: "sine",
    TRIANGLE: "triangle",
    SAWTOOTH: "sawtooth",
    SQUARE: "square"
} as const;

export type SimpleWaveshape = (typeof SimpleWaveshape)[keyof typeof SimpleWaveshape];

export class SimpleOscillator extends RestartableGenerator implements FrequencyBasedSignal
{
    private audioContext: AudioContext;

    // The saw oscillator is the main 'ingredient' in making a pulse oscillator
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private triangleOscillatorNode!: OscillatorNode;
    private waveshape: SimpleWaveshape = SimpleWaveshape.SINE;

    private endableNodes: Array<EndableNode> = new Array<EndableNode>();

    private outputNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TriangleOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, waveshape: SimpleWaveshape)
    {
        super();

        this.audioContext = audioContext;

        this.waveshape = waveshape;

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
        this.endableNodes.push(this.triangleOscillatorNode);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override initNodes(): void
    {
        // 1. Instantiate fresh nodes:
        // instantiate the sawtooth oscillator and set parameters
        this.triangleOscillatorNode = this.audioContext.createOscillator();
        this.triangleOscillatorNode.type = this.waveshape;
        this.triangleOscillatorNode.frequency.setValueAtTime(NoteSettings.defaultFrequency, this.audioContext.currentTime);

        // 2. Connect nodes between them:
        this.triangleOscillatorNode.connect(this.outputNode);

        /* Before starting all source nodes, we unmute the final output node, because it has been muted
        ** in the 'stop' and 'disconnect' phase */
        this.outputNode.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override startNodes(): void
    {
        // Start all audio sources, in this case only one oscillator
        this.triangleOscillatorNode.start(this.audioContext.currentTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override stopNodes(): void
    {
        /* Before stopping all nodes, we mute the final output node, just to make sure
        ** we don't hear any clicks when stopping all nodes */
        // this.outputNode.gain.linearRampToValueAtTime(0.0, stopTime); // not quite correct, needs adjustment

        this.triangleOscillatorNode.stop(this.audioContext.currentTime);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override disconnectNodes(): void
    {
        /* Before disconnecting all nodes, we mute the final output node, just to make sure
        ** we don't hear any clicks when disconnecting all nodes */
        // this.outputNode.gain.linearRampToValueAtTime(0.0, this.audioContext.currentTime); // necessary?

        // We disconnect nodes in the reverse order we connected them
        this.triangleOscillatorNode.disconnect(this.outputNode);
    }

    // Method inherited from interface 'FrequencyBasedSignal'
    public setFrequency(frequency: number): boolean
    {
        if (frequency >= 0.0)
        {
            SimpleOscillator.logger.debug(`setFrequency(${frequency})`);

            // set the frequency
            this.triangleOscillatorNode.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            SimpleOscillator.logger.warn(`setFrequency(${frequency}): parameter is outside bounds`);
            return false; // change was not succesfull
        }
    }
}