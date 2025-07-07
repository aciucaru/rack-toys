/* This class represents the concept of an receiver. A receiver is an audio node
* that procceses one single input (most of the times a sound).
* Because it requires an input, it has a method which returns an AudioNode through
* which the input passes and might be redirected to other internal AudioNodes
* of that class. */
export interface Receiver
{
    /* The main method of this class, this method should return the input node
    ** of a Receiver. */
    getInputNode(): AudioNode;
}