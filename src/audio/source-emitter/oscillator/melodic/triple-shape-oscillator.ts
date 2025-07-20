import { Settings } from "../../../../constants/settings";
import { PulseOscillator } from "./pulse-oscillator";
import { ToggleMixer } from "../../../intermediate-emitter/mixer/toggle-mixer";

import { RestartableSourceGenerator, ChildGenerator } from "../../../core/emitter";
import type { FrequencyBasedSignal, PulseBasedSignal } from "../../../core/signal";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import { SimpleOscillator, SimpleWaveshape } from "./simple-oscillator";

export class TripleShapeOscillator extends ChildGenerator implements FrequencyBasedSignal, PulseBasedSignal
{
    private audioContext: AudioContext;

    // The oscillator nodes:
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private triangleOscillatorNode: SimpleOscillator;
    private sawOscillatorNode: SimpleOscillator;
    private pulseOscillatorNode: PulseOscillator;

    private restartableNodes: Array<RestartableSourceGenerator>;

    // The mixer that toggles on/off the oscillator nodes
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private toggleMixer: ToggleMixer;

    // The final output of this class
    private outputNode: GainNode;

    // The ToggleMixer class allows acces to its inputs through their index, so we store these indexes as static fields
    private static readonly TRIANGLE_OSC_INDEX = 0;
    private static readonly SAW_OSC_INDEX = 1;
    private static readonly PULSE_OSC_INDEX = 2;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TripleShapeOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        super(); // call 'RestartableSourceEmitter' constructor

        this.audioContext = audioContext;

        // Instantiate the final output node separately, and before the other nodes
        this.outputNode = this.audioContext.createGain();

        // Instantiate all nodes:
        // instantiate sound oscillators
        this.triangleOscillatorNode = new SimpleOscillator(this.audioContext, SimpleWaveshape.TRIANGLE);

        this.sawOscillatorNode = new SimpleOscillator(this.audioContext, SimpleWaveshape.SAWTOOTH);

        this.pulseOscillatorNode = new PulseOscillator(this.audioContext);

        // Instantiate the oscillators mixer, which toggles oscillator on/off
        this.toggleMixer = new ToggleMixer(this.audioContext);

        // Connect all nodes between them:
        this.toggleMixer.connectInput(this.triangleOscillatorNode.getOutputNode());
        this.toggleMixer.connectInput(this.sawOscillatorNode.getOutputNode());
        this.toggleMixer.connectInput(this.pulseOscillatorNode.getOutputNode());

        /* Toggle the oscillators on/off, the indexes must correspond to the order in wich these inputs
        ** where added to 'toggledInputsMixer' */
        this.toggleMixer.toggleInputOn(TripleShapeOscillator.TRIANGLE_OSC_INDEX);
        this.toggleMixer.toggleInputOff(TripleShapeOscillator.SAW_OSC_INDEX);
        this.toggleMixer.toggleInputOff(TripleShapeOscillator.PULSE_OSC_INDEX);

        // Connect the result (of mixing the 3 oscillators) to the output gain node
        this.toggleMixer.getOutputNode().connect(this.outputNode);

        this.restartableNodes = new Array<RestartableSourceGenerator>();
        this.restartableNodes.push(this.sawOscillatorNode);
        this.restartableNodes.push(this.triangleOscillatorNode);
        this.restartableNodes.push(this.pulseOscillatorNode);
    }

    // Method inherited from 'SourceEmitter' abstract class
    public override getOutputNode(): AudioNode { return this.outputNode; }

    // Method inherited from 'SourceEmitter' abstract class
    protected override getRestartableGenerators(): RestartableSourceGenerator[]
    {
        return this.restartableNodes;
    }
    
    // Method inherited from 'FrequencyBasedSignal' interface
    public setFrequency(frequency: number): boolean
    {
        this.triangleOscillatorNode.setFrequency(frequency);
        this.sawOscillatorNode.setFrequency(frequency);
        this.pulseOscillatorNode.setFrequency(frequency);

        return true;
    }

    // Method inherited from 'PulseBasedSignal' interface
    public setPulseWidth(pulseWidth: number): boolean
    {
        const isChangeSuccsefull = this.pulseOscillatorNode.setPulseWidth(pulseWidth);

        if (isChangeSuccsefull)
        {
            TripleShapeOscillator.logger.debug(`setPulseWidth(${pulseWidth})`);

            this.pulseOscillatorNode.setPulseWidth(pulseWidth);

            return true; // change was successfull
        }
        else
        {
            TripleShapeOscillator.logger.warn(`setPulseWidth(${pulseWidth}): value is outside bounds`);
            return false; // change was not successfull
        }
    }

    public toggleTriangleShape(): void
    {
        this.toggleMixer.toggleInput(TripleShapeOscillator.TRIANGLE_OSC_INDEX);
    }

    public toggleSawShape(): void
    {
        this.toggleMixer.toggleInput(TripleShapeOscillator.SAW_OSC_INDEX);
    }

    public togglePulseShape(): void
    {
        this.toggleMixer.toggleInput(TripleShapeOscillator.PULSE_OSC_INDEX);
    }

    // public enableTriangleShape(): void
    // {
    //     TripleShapeOscillator.logger.debug("enableTriangleShape()");

    //     this.toggleMixer.toggleInputOn(TripleShapeOscillator.TRIANGLE_OSC_INDEX);
    // }

    // public disableTriangleShape(): void
    // {
    //     TripleShapeOscillator.logger.debug("disableTriangleShape()");

    //     this.toggleMixer.toggleInputOff(TripleShapeOscillator.TRIANGLE_OSC_INDEX);
    // }

    // public enableSawShape(): void
    // {
    //     TripleShapeOscillator.logger.debug("enableSawShape()");

    //     this.toggleMixer.toggleInputOn(TripleShapeOscillator.SAW_OSC_INDEX);
    // }

    // public disableSawShape(): void
    // {
    //     TripleShapeOscillator.logger.debug("disableSawShape()");

    //     this.toggleMixer.toggleInputOff(TripleShapeOscillator.SAW_OSC_INDEX);
    // }

    // public enablePulseShape(): void
    // {
    //     TripleShapeOscillator.logger.debug("enablePulseShape()");

    //     this.toggleMixer.toggleInputOn(TripleShapeOscillator.PULSE_OSC_INDEX);
    // }

    // public disablePulseShape(): void
    // {
    //     TripleShapeOscillator.logger.debug("disablePulseShape()");

    //     this.toggleMixer.toggleInputOff(TripleShapeOscillator.PULSE_OSC_INDEX);
    // }
}