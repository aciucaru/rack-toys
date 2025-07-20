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
    onended: ((this: AudioScheduledSourceNode, event: Event) => any) | null;
}

export abstract class RestartableSourceGenerator implements Emitter
{
    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    /* This method must recreate the array of endable nodes, every time a new note is played */
    protected abstract setEndableNodes(): void;
    
    /* Must instantiate and connect all internal nodes, except for the node returned by 'getOutputNode()' */
    protected abstract initNodes(): void;

    /* Must return the internal source nodes which have the 'onended' event (e.g. 'endable nodes') */
    protected abstract getEndableNodes(): Array<EndableNode>;

    /* Must start all internal source nodes (e.g. the nodes that have a 'start()' method) */
    protected abstract startNodes(): void;

    /* Must stop all internal source nodes (e.g. the same nodes as above ) */
    protected abstract stopNodes(): void;

    /* Must disconnect all internal nodes */
    protected abstract disconnectNodes(): void;

    /* Reinstantiates and connects all internal nodes, , except for the node returned by 'getOutputNode()'.
    ** It also creates an array of nodes which have the 'onended' event. */
    public recreateSource(): void
    {
        this.initNodes();
        this.setEndableNodes();
    }

    // Starts the fresly created and connencted nodes obtained with 'recreateSource()'
    public startSource(): void
    {
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
    // Must re-instantiate and connect all internal nodes, but must NOT start them
    recreateInternalNodes(): void;

    // Must start the internal nodes
    startSignal(): void;

    // Must stop the internal nodes
    stopSignal(): void;
}

export abstract class ChildGenerator implements Emitter, ComposableGenerator
{
    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    // Main method of this abstract class, must be implemented by subclass
    protected abstract getRestartableGenerators(): Array<RestartableSourceGenerator>;

    // Inherited from 'ComposableGenerator' interface
    public recreateInternalNodes(): void
    {
        const restartableNodes = this.getRestartableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.recreateSource();
        }
    }

    // Inherited from 'ComposableGenerator' interface
    public startSignal(): void
    {
        const restartableNodes = this.getRestartableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.startSource();
        }
    }

    // Inherited from 'ComposableGenerator' interface
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

    // Inherited from 'ComposableGenerator' interface
    public recreateInternalNodes(): void
    {
        const restartableNodes = this.getComposableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.recreateInternalNodes();
        }
    }

    // Inherited from 'ComposableGenerator' interface
    public startSignal(): void
    {
        const restartableNodes = this.getComposableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.startSignal();
        }
    }

    // Inherited from 'ComposableGenerator' interface
    public stopSignal(): void
    {
        const restartableNodes = this.getComposableGenerators();
        for (const restartableNode of restartableNodes)
        {
            restartableNode.stopSignal();
        }
    }
}