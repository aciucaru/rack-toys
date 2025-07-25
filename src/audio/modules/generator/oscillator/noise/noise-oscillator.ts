import { Settings } from "../../../../core/settings";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import { type EndableNode, RestartableGenerator } from "../../../../core/emitter";


/* Base abstract class for all custom noise oscillators.
** This class contains most of the code for implemnting a noise oscillator, but has one abstract method:
** fillNoiseBuffer()
** The 'fillNoiseBuffer()' method must be implemented by a concrete class and must fill a bufer with the actual noise,
** which will differ depending on the noise type (white, pink, brown, etc.). */
export abstract class NoiseOscillator extends RestartableGenerator
{
    private audioContext: AudioContext;

    // Must be initialized somewere inside the constructor, in this case the initBuffer() method
    private noiseOsc!: AudioBufferSourceNode;

    // Must be initialized somewere inside the constructor, in this case the initBuffer() method
    private noiseBuffer!: AudioBuffer; // this is created for every instance! needs improvement
    // private bufferData: Float32Array;

    private endableNodes: Array<EndableNode> = new Array<EndableNode>();

    private outputNode: GainNode;

    private static readonly NOISE_DURATION = 2; // the duration of the noise, in seconds

    private static readonly logger: Logger<ILogObj> = new Logger({name: "NoiseOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        super();

        this.audioContext = audioContext;

        // Initialize the buffer (it does not actually fill with the implementation-specific noise signal)
        this.initBuffer();

        // Instantiate the final output node separately, and before the other nodes
        this.outputNode = this.audioContext.createGain();

        // Instantiate and connect all nodes and set their parameters
        this.initNodes();

        /* Set the array of 'EndableNodes' (nodes with 'onended' event) */
        this.setEndableNodes();
    }

    // Method inherited from interface 'RestartableSourceEmitter'
    public override getOutputNode(): AudioNode { return this.outputNode; }

    // Method inherited from interface 'RestartableSourceEmitter'
    protected override getEndableNodes(): EndableNode[] { return this.endableNodes; }

    // Method inherited from 'RestartableSourceEmitter' abstract class
    protected override setEndableNodes(): void
    {
        // Clear the array
        this.endableNodes.length = 0;

        // Add the required nodes
        this.endableNodes.push(this.noiseOsc);
    }

    // Method inherited from interface 'RestartableSourceEmitter'
    protected override initNodes(): void
    {
        this.noiseOsc = this.audioContext.createBufferSource();

        this.noiseOsc.buffer = this.noiseBuffer;
        this.noiseOsc.loop = true;

        this.noiseOsc.connect(this.outputNode);
    }

    // Method inherited from interface 'RestartableSourceEmitter'
    protected override startNodes(): void
    {
        this.noiseOsc.start(this.audioContext.currentTime);
    }

    // Method inherited from interface 'RestartableSourceEmitter'
    protected override stopNodes(): void
    {
        this.noiseOsc.stop(this.audioContext.currentTime);
    }

    // Method inherited from interface 'RestartableSourceEmitter'
    protected disconnectNodes(): void
    {
        // Disconnect nodes in the reverse order they were connected in
        this.noiseOsc.disconnect(this.outputNode);
    }

    /* This method is supposed to fill the buffer with a specific noise (white, pink or brown);
    ** This method should be overriden by the extending class that implements a specific type of noise;
    ** This method is called inside the 'start()' method, which should be called by the user in order to
    ** fill the noise buffer with custom noise and also start the noise oscillator */
    protected abstract fillNoiseBuffer(bufferData: Float32Array): void;

    /* This method makes sure that the noise buffer has am amplitude of 1.0, it basicaly scales values up or down
    ** so that the noise buffer overall has an amplitude of 1.0;
    ** It's useful to make shure that any type of noise has the same gain level; */
    private normalizeNoiseBuffer(): void
    {
        const bufferData = this.noiseBuffer.getChannelData(0);

        const min = Math.min(...bufferData);
        const max = Math.max(...bufferData);

        // the real maximum is the maximum between the absolute values of 'min' and 'max'
        const absoluteMax = Math.max(Math.abs(min), Math.abs(max));

        // the scale factor is in such a way that it turns the maximum value into 1.0 (or -1.0)
        const scaleFactor = Math.abs(1.0 / absoluteMax - Number.EPSILON);

        NoiseOscillator.logger.warn(`normalizeNoiseBuffer(): absoluteMax=${absoluteMax}, scaleFactor=${scaleFactor}`);

        // apply normalization to all values of the noise buffer
        for (let i = 0; i < this.noiseBuffer.length; i++)
        {
            bufferData[i] *= scaleFactor;
        }
    }

    private initBuffer(): void
    {
        NoiseOscillator.logger.debug("init()");

        const bufferSize = NoiseOscillator.NOISE_DURATION * this.audioContext.sampleRate;
        this.noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);

        const bufferData = this.noiseBuffer.getChannelData(0);
        this.fillNoiseBuffer(bufferData); // use abstract method to fill buffer with implementation-specific noise
        this.normalizeNoiseBuffer();
    }
}