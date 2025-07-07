import { Settings } from "../../../../constants/settings";
import { PulseOscillator } from "./pulse-oscillator";
import { ToggleMixer } from "../../../intermediate-emitter/mixer/toggle-mixer";

import { RestartableSourceEmitter, type EndableNode } from "../../../core/emitter";
import type { FrequencyBasedSignal, PulseBasedSignal } from "../../../core/signal";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export class TripleShapeOscillator extends RestartableSourceEmitter implements FrequencyBasedSignal, PulseBasedSignal
{
    private audioContext: AudioContext;

    // The oscillator nodes:
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private triangleOscillatorNode!: OscillatorNode;
    private sawOscillatorNode!: OscillatorNode;
    private pulseOscillatorNode!: PulseOscillator;

    // The mixer that toggles on/off the oscillator nodes
    // Must be initialized somewere inside the constructor, in this case the initNodes() method
    private toggleMixer!: ToggleMixer;

    private endableNodes: Array<EndableNode> = new Array<EndableNode>();

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

        // Instantiate and connect all nodes and set their parameters
        this.initNodes();

        /* Set the array of 'EndableNodes' (nodes with 'onended' event) */
        this.setEndableNodes();
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    public override getOutputNode(): AudioNode { return this.outputNode; }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override getEndableNodes(): EndableNode[] { return this.endableNodes; }

    // Method inherited from 'ChildSourceEmitter' abstract class
    public setEndableNodes(): void
    {
        // Clear the array
        this.endableNodes.length = 0;

        // Add the required nodes
        this.endableNodes.push(this.triangleOscillatorNode);
        this.endableNodes.push(this.sawOscillatorNode);
        this.endableNodes.push(...this.pulseOscillatorNode.getEndableNodes()); // ? does not seem correct
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override initNodes(): void
    {
        // Instantiate all nodes:
        // instantiate sound oscillators
        this.triangleOscillatorNode = this.audioContext.createOscillator();
        this.triangleOscillatorNode.type = "triangle";

        this.sawOscillatorNode = this.audioContext.createOscillator();
        this.sawOscillatorNode.type = "sawtooth";

        this.pulseOscillatorNode = new PulseOscillator(this.audioContext);
        // this.pulseOscillatorNode.initNodes(); // seems to be not necessary

        // Instantiate the oscillators mixer, which toggles oscillator on/off
        this.toggleMixer = new ToggleMixer(this.audioContext);

        // Connect all nodes between them:
        this.toggleMixer.connectInput(this.triangleOscillatorNode);
        this.toggleMixer.connectInput(this.sawOscillatorNode);
        this.toggleMixer.connectInput(this.pulseOscillatorNode.getOutputNode());

        /* Toggle the oscillators on/off, the indexes must correspond to the order in wich these inputs
        ** where added to 'toggledInputsMixer' */
        this.toggleMixer.toggleInputOn(TripleShapeOscillator.TRIANGLE_OSC_INDEX);
        this.toggleMixer.toggleInputOff(TripleShapeOscillator.SAW_OSC_INDEX);
        this.toggleMixer.toggleInputOff(TripleShapeOscillator.PULSE_OSC_INDEX);

        // Connect the result (of mixing the 3 oscillators) to the output gain node
        this.toggleMixer.getOutputNode().connect(this.outputNode);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override startNodes(delayDuration: number): void
    {
        // Start all audio sources
        this.triangleOscillatorNode.start(this.audioContext.currentTime + delayDuration);
        this.sawOscillatorNode.start(this.audioContext.currentTime + delayDuration);
        this.pulseOscillatorNode.startNodes(delayDuration); // this is a custom compound node
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected stopNodes(delayDuration: number): void
    {
        this.triangleOscillatorNode.stop(this.audioContext.currentTime + delayDuration);
        this.sawOscillatorNode.stop(this.audioContext.currentTime + delayDuration);

        // This is a custom compound node and the 'stop()' method also disconencts its internal nodes.
        // The 'stop()' method is inherited from 'RestartableSourceEmitter' class
        this.pulseOscillatorNode.stopNodes(delayDuration);
    }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected disconnectNodes(): void
    {
        /* Toggle the oscillators off, the indexes must correspond to the order in wich these inputs
        ** where added to 'toggledInputsMixer' */
        this.toggleMixer.toggleInputOff(TripleShapeOscillator.TRIANGLE_OSC_INDEX);
        this.toggleMixer.toggleInputOff(TripleShapeOscillator.SAW_OSC_INDEX);
        this.toggleMixer.toggleInputOff(TripleShapeOscillator.PULSE_OSC_INDEX);

        // We disconnect nodes in the reverse order we connected them
        this.toggleMixer.getOutputNode().disconnect(this.outputNode);
        this.toggleMixer.disconnectAllInputs();
    }
    
    // Method inherited from 'FrequencyBasedSignal' interface
    public setFrequency(frequency: number): boolean
    {
        const currentTime = this.audioContext.currentTime;

        this.triangleOscillatorNode.frequency.setValueAtTime(frequency, currentTime);
        this.sawOscillatorNode.frequency.setValueAtTime(frequency, currentTime);
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