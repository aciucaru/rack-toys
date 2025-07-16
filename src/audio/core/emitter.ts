/* This class represents the concept of an emitter. An emitter is an audio node
** that generates an ouput (most of the times a sound).
** We can get access to the output signal of the emitter through the getOutputNode() method. */
export interface Emitter
{
    /* The main method of this class, this method should return the final output node
    ** of an Emitter. */
    getOutputNode(): AudioNode;
}

export interface EndableNode
{
    stop(time: number): void;
    // onended: (() => void) | null;
    onended: ((this: AudioScheduledSourceNode, event: Event) => any) | null;
}

export abstract class RestartableSourceGenerator implements Emitter
{
    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    protected abstract getEndableNodes(): Array<EndableNode>;
    /* This method must recreate the array of endable nodes, every time a new note is played */
    protected abstract setEndableNodes(): void;
    
    protected abstract initNodes(): void;
    protected abstract startNodes(): void;
    protected abstract stopNodes(): void;
    protected abstract disconnectNodes(): void;

    public startSource(): void
    {
        this.initNodes();
        this.setEndableNodes();
        this.startNodes();
    }

    /* Method that uses the 'stopNodes()' and 'disconnectNodes()' methods to stop the audio/signal from
    ** this node.
    ** This method is public and already implemented and should be called by the user himself, every time new note
    ** is stopped. */
    public stopSource(): void
    {
        const endableNodes = this.getEndableNodes();
        let remaining = endableNodes.length;

        if (remaining === 0)
        {
            this.disconnectNodes();
            return;
        }

        this.stopNodes();

        /* We want to disconnect the internal audio nodes AFTER they have completely stopped,
        ** but we can't know for sure when they will stop, so this is why we use the 'onended' event
        ** of a AudioScheduledSourceNode.
        ** Here, we add an event handler to the 'oneneded' event of each internal node (not just the
        ** AudioScheduledSourceNodes) and in that event handler we disconnect all nodes at once only if ALL
        ** the internal audio nodes have stopped. Ths way, disconnecting does not cause glitches. */
        for (const node of endableNodes)
        {
            node.onended = () =>
            {
                // Decrement counter:
                --remaining;

                // Only when the last one finishes do we disconnect all internal audio nodes
                if (remaining === 0)
                    this.disconnectNodes(); // disconnect all internal audio nodes
            };
        }
    }
}

export interface ComposableGenerator
{
    startSignal(): void;
    stopSignal(): void;
}

export abstract class ChildGenerator implements Emitter, ComposableGenerator
{
    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    // Main method of this abstract class, must be implemented by subclass
    protected abstract getRestartableGenerators(): Array<RestartableSourceGenerator>;

    // Inherited from 'Generator' interface
    public startSignal(): void
    {
        const restartableNodes = this.getRestartableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.startSource();
        }
    }

    // Inherited from 'Generator' interface
    public stopSignal(): void
    {
        const restartableNodes = this.getRestartableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.stopSource();
        }
    }
}

export abstract class CompositeGenerator implements ComposableGenerator
{
    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    // Main method of this abstract class, must be implemented by subclass
    protected abstract getComposableGenerators(): Array<ComposableGenerator>;

    // Inherited from 'Generator' interface
    public startSignal(): void
    {
        const restartableNodes = this.getComposableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.startSignal();
        }
    }

    // Inherited from 'Generator' interface
    public stopSignal(): void
    {
        const restartableNodes = this.getComposableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.stopSignal();
        }
    }
}