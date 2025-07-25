import { OscillatorSettings, Settings } from "../../../core/settings";
import { type EndableNode, RestartableGenerator, ChildGenerator } from "../../../core/emitter";
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

export class TripleNoiseOscillator extends ChildGenerator
{
    private audioContext: AudioContext;

    // Must be initialized somewere inside the constructor, in this case the createNodes() method
    private whiteNoiseOscNode!: WhiteNoiseOscillator;
    private pinkNoiseOscNode!: PinkNoiseOscillator;
    private brownNoiseOscNode!: BrownNoiseOscillator;

    private restartableNodes: Array<RestartableGenerator>;

    // The mixer that toggles on/off the oscillator nodes
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private toggleMixer: ToggleMixer;

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

        if (OscillatorSettings.minGain <= initialGain && initialGain <= OscillatorSettings.maxGain)
            this.outputNode.gain.setValueAtTime(initialGain, this.audioContext.currentTime);
        else
        {
            TripleNoiseOscillator.logger.warn(`constructor(): 'initialGain' of value ${initialGain} is outside bounds and will be ignored`);

            if (initialGain < OscillatorSettings.minGain)
                this.outputNode.gain.setValueAtTime(OscillatorSettings.minGain, this.audioContext.currentTime);
            
            if (initialGain > OscillatorSettings.maxGain)
                this.outputNode.gain.setValueAtTime(OscillatorSettings.maxGain, this.audioContext.currentTime);
        }

        // Instantiate and connect all nodes and set their parameters
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

        // Set correct gain level for individual noise oscillators
        this.setNoiseType(NoiseType.White);

        /* Set the array of 'EndableNodes' (nodes with 'onended' event) */
        // this.setEndableNodes();

        this.restartableNodes = new Array<RestartableGenerator>();
        this.restartableNodes.push(this.whiteNoiseOscNode);
        this.restartableNodes.push(this.pinkNoiseOscNode);
        this.restartableNodes.push(this.brownNoiseOscNode);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    public override getOutputNode(): AudioNode { return this.outputNode; }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected getRestartableGenerators(): RestartableGenerator[]
    {
        return this.restartableNodes;
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
        if (OscillatorSettings.minGain <= gain && gain <= OscillatorSettings.maxGain)
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