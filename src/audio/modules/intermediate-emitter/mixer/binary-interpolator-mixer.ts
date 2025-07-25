import type { Emitter } from "../../../core/emitter";

export class BinaryInterpolatorMixer implements Emitter
{
    private audioContext: AudioContext;

    // the 2 inputs that will be interpolated
    private input1: AudioNode | null = null;
    private input2: AudioNode | null = null;

    // The node used to set the value which interpolates between the 2 inputs
    private interpolationValueNode: GainNode;

    // The nodes used for computing the weigths of the 2 inputs
    // These nodes act as multipliers, allowing to set the gain of each oscillator, but in a way
    // such that the sum of the two oscillators's weights is always 1
    private weight1Node: GainNode;
    private constantNode: ConstantSourceNode;
    private negationNode: GainNode;
    private weight2Node: GainNode;

    // The final output node
    private outputNode: GainNode;

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        // Instantiate interpolator and weight nodes
        this.interpolationValueNode = this.audioContext.createGain();
        this.weight1Node = this.audioContext.createGain();
        this.constantNode = this.audioContext.createConstantSource();
        this.negationNode = this.audioContext.createGain();
        this.weight2Node = this.audioContext.createGain();

        // Instantiate final output node
        this.outputNode = this.audioContext.createGain();

        // Set the values for the constant and negation node
        this.constantNode.offset.setValueAtTime(1.0, this.audioContext.currentTime);
        this.negationNode.gain.setValueAtTime(-1.0, this.audioContext.currentTime);

        // Connect the weigth-related nodes in order to obtain interpolation.
        // After the next lines, weight1.gain will be interpolationValue and weight2.gain will be (1 - interpolationValue).
        // Togheter, their sum will always be 1.

        // Connect the interpolation node directly to the gain of the weight of the 1st input
        this.interpolationValueNode.connect(this.weight1Node.gain);

        // Connect the interpolator node to the negation node, to obtain (-interpolationValue)
        this.interpolationValueNode.connect(this.negationNode);
        
        // Connect constant node and the negated node to obtain (1 - interpolationValue)
        this.constantNode.connect(this.weight2Node.gain);
        this.negationNode.connect(this.weight2Node.gain);

        // Connect both input results to the final output node
        this.weight1Node.connect(this.outputNode);
        this.weight2Node.connect(this.outputNode);

        // Don't forget to start the constant node
        this.constantNode.start();
    }

    /* Method inherited from 'IntermediateEmitter' interface */
    public getOutputNode(): AudioNode { return this.outputNode; }

    public connectInput1(input: AudioNode): void
    {
        // If no input is connected already
        if (this.input1 == null)
        {
            // Store the input reference
            this.input1 = input;

            // Connect the input to it's weight node
            this.input1.connect(this.weight1Node);
        }
        else // If there is already a connected input
        {
            // Disconect the current input
            this.input1.disconnect(this.weight1Node);

            // Store the new input reference
            this.input1 = input;

            // Connect the new input to it's weight node
            this.input1.connect(this.weight1Node);
        }
    }

    public connectInput2(input: AudioNode)
    {
        // If no input is connected already
        if (this.input2 == null)
        {
            // Store the input reference
            this.input2 = input;

            // Connect the input to it's weight node
            this.input2.connect(this.weight2Node);
        }
        else // If there is already a connected input
        {
            // Disconect the current input
            this.input2.disconnect(this.weight2Node);

            // Store the new input reference
            this.input2 = input;

            // Connect the new input to it's weight node
            this.input2.connect(this.weight2Node);
        }
    }

    public getInterpolatorNode(): GainNode { return this.interpolationValueNode; }
}