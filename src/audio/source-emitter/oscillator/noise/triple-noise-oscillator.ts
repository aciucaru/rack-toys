import { Settings } from "../../../../constants/settings";
import { type EndableNode, RestartableSourceEmitter } from "../../../core/emitter";
import { WhiteNoiseOscillator } from "./white-noise";
import { PinkNoiseOscillator } from "./pink-noise";
import { BrownNoiseOscillator } from "./brown-noise";
import { ToggleMixer } from "../../../intermediate-emitter/mixer/toggle-mixer";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


// export enum NoiseType
// {
//     White = "White",
//     Pink = "Pink",
//     Brown = "Brown",
// }

export const NoiseType =
{
    White: "White",
    Pink: "Pink",
    Brown: "Brown",
} as const;

export type NoiseType = (typeof NoiseType)[keyof typeof NoiseType];

export class TripleNoiseOscillator extends RestartableSourceEmitter
{
    private audioContext: AudioContext;

    // Must be initialized somewere inside the constructor, in this case the createNodes() method
    private whiteNoiseOscNode!: WhiteNoiseOscillator;
    private pinkNoiseOscNode!: PinkNoiseOscillator;
    private brownNoiseOscNode!: BrownNoiseOscillator;

    // Gain nodes for noise oscillators
    // Must be initialized somewere inside the constructor, in this case the createNodes() method
    private whiteNoiseGainNode!: GainNode;
    private pinkNoiseGainNode!: GainNode;
    private brownNoiseGainNode!: GainNode;

    // The mixer that toggles on/off the oscillator nodes
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private toggleMixer!: ToggleMixer;

    private endableNodes: Array<EndableNode> = new Array<EndableNode>();

    private outputNode: GainNode;

    // The ToggleMixer class allows acces to its inputs through their index, so we store these indexes as static fields
    private static readonly WHITE_NOISE_INDEX = 0;
    private static readonly PINK_NOISE_INDEX = 1;
    private static readonly BROWN_NOISE_INDEX = 2;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TripleNoiseOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, initialGain: number)
    {
        super();

        this.audioContext = audioContext;

        // Instantiate the final output node separately, and before the other nodes
        this.outputNode = this.audioContext.createGain();

        if (Settings.minOscGain <= initialGain && initialGain <= Settings.maxOscGain)
            this.outputNode.gain.setValueAtTime(initialGain, this.audioContext.currentTime);
        else
        {
            TripleNoiseOscillator.logger.warn(`constructor(): 'initialGain' of value ${initialGain} is outside bounds and will be ignored`);

            if (initialGain < Settings.minOscGain)
                this.outputNode.gain.setValueAtTime(Settings.minOscGain, this.audioContext.currentTime);
            
            if (initialGain > Settings.maxOscGain)
                this.outputNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);
        }

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

        // Recreate the array by adding the required nodes
        this.endableNodes.push(...this.whiteNoiseOscNode.getEndableNodes()); // ? does not seem correct
        this.endableNodes.push(...this.pinkNoiseOscNode.getEndableNodes()); // ? does not seem correct
        this.endableNodes.push(...this.brownNoiseOscNode.getEndableNodes()); // ? does not seem correct
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override initNodes(): void
    {
        // Instantiate individual noise oscillator nodes
        this.whiteNoiseOscNode = new WhiteNoiseOscillator(this.audioContext);
        this.pinkNoiseOscNode = new PinkNoiseOscillator(this.audioContext);
        this.brownNoiseOscNode = new BrownNoiseOscillator(this.audioContext);

        // Instantiate the oscillators mixer, which toggles oscillator on/off
        this.toggleMixer = new ToggleMixer(this.audioContext);

        // Connect all nodes between them:
        // add the oscillators to the mixer
        this.toggleMixer.connectInput(this.whiteNoiseOscNode.getOutputNode());
        this.toggleMixer.connectInput(this.pinkNoiseOscNode.getOutputNode());
        this.toggleMixer.connectInput(this.brownNoiseOscNode.getOutputNode());

        // connect the result (of mixing the 3 oscillators) to the output gain node
        this.toggleMixer.getOutputNode().connect(this.outputNode);

        // Cet correct gain level for individual noise oscillators
        this.setNoiseType(NoiseType.White);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override startNodes(delayDuration: number): void
    {
        // start noise oscillators
        this.whiteNoiseOscNode.startNodes(delayDuration);
        this.pinkNoiseOscNode.startNodes(delayDuration);
        this.brownNoiseOscNode.startNodes(delayDuration);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected stopNodes(delayDuration: number): void
    {
        this.whiteNoiseOscNode.stopNodes(delayDuration);
        this.pinkNoiseOscNode.stopNodes(delayDuration);
        this.brownNoiseOscNode.stopNodes(delayDuration);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected disconnectNodes(): void
    {
        this.whiteNoiseGainNode.disconnect(this.outputNode);
        this.pinkNoiseGainNode.disconnect(this.outputNode);
        this.brownNoiseGainNode.disconnect(this.outputNode);

        this.whiteNoiseOscNode.getOutputNode().disconnect(this.whiteNoiseGainNode);
        this.pinkNoiseOscNode.getOutputNode().disconnect(this.pinkNoiseGainNode);
        this.brownNoiseOscNode.getOutputNode().disconnect(this.brownNoiseGainNode);

        // Necessary?
        this.whiteNoiseOscNode.disconnectNodes();
        this.pinkNoiseOscNode.disconnectNodes();
        this.brownNoiseOscNode.disconnectNodes();
    }

    public setNoiseType(noiseType: NoiseType): void
    {
        TripleNoiseOscillator.logger.debug(`setNoiseType(${noiseType})`);

        switch (noiseType)
        {
            case NoiseType.White:
                this.toggleMixer.toggleInputOn(TripleNoiseOscillator.WHITE_NOISE_INDEX);
                this.toggleMixer.toggleInputOff(TripleNoiseOscillator.PINK_NOISE_INDEX);
                this.toggleMixer.toggleInputOff(TripleNoiseOscillator.BROWN_NOISE_INDEX);
                break;

            case NoiseType.Brown:
                this.toggleMixer.toggleInputOff(TripleNoiseOscillator.WHITE_NOISE_INDEX);
                this.toggleMixer.toggleInputOff(TripleNoiseOscillator.PINK_NOISE_INDEX);
                this.toggleMixer.toggleInputOn(TripleNoiseOscillator.BROWN_NOISE_INDEX);
                break;

            case NoiseType.Pink:
                this.toggleMixer.toggleInputOff(TripleNoiseOscillator.WHITE_NOISE_INDEX);
                this.toggleMixer.toggleInputOn(TripleNoiseOscillator.PINK_NOISE_INDEX);
                this.toggleMixer.toggleInputOff(TripleNoiseOscillator.BROWN_NOISE_INDEX);
                break;
            
            default:
                TripleNoiseOscillator.logger.warn(`setNoiseType(${noiseType}): 'noiseType' value is outside enum values`);
                break;
        }
    }

    // This method sets the gain of this class's output
    public setOutputGain(gain: number): boolean
    {
        if (Settings.minOscGain <= gain && gain <= Settings.maxOscGain)
        {
            TripleNoiseOscillator.logger.debug(`setOutputGain(${gain})`);

            this.outputNode.gain.setValueAtTime(gain, this.audioContext.currentTime);

            return true; // change was succesfull
        }
        else
        {
            TripleNoiseOscillator.logger.warn(`setOutputGain(${gain}): value outside bounds`);
            return false; // change was not succesfull
        }
    }
}