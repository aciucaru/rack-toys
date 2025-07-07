export interface EndableNode
{
    stop(time: number): void;
    // onended: (() => void) | null;
    onended: ((this: AudioScheduledSourceNode, event: Event) => any) | null;
}

/* This class represents the concept of an emitter which is also the starting point of a signal path.
** Unlike the 'IntermediateEmitter', the 'ChildSourceEmitter' will never have any inputs, it is the first
** source of a signal.
** Because it's the original source of a signal in the audio graph, it can be stopped with the 'stop()' method.
**
** But in Web Audio API, when a source node is stopped, it can never be restarted again.
** This is why we use this class.
** This class can be started and stopped as many times as we want, and every time it starts, new audio nodes
** are created and then connected to the original destination of this emitter. */
export interface ComposableSourceEmitter
{
    /* Must return the single “output” node. */
    getOutputNode(): AudioNode;

    /* Must return every EndableNode */
    getEndableNodes(): EndableNode[];

    /* This method must recreate the array of endable nodes, every time a new note is played */
    setEndableNodes(): void;

    /* When implemented, this method must do 3 things:
    ** - instantiate the internal audio nodes
    ** - connect the internal audio nodes between them
    ** - connect the internal audio nodes to the same node which is the result of getOutputNode() method */
    initNodes(): void;

    /* When implemented, this method must start the internal audio nodes that have a start() method
    ** (the AudioScheduledSourceNode instances), every time a new note is played. */
    startNodes(delayDuration: number): void;

    /* Stops all internal audio source nodes, every time a new note is played.
    ** This needs to be a separate method because the order in which the nodes are stopped might matter in
    ** some situations (it dependes on the complexitiy of the subgraph). In this way, the implementer of this
    ** method can choose the most suitable order of stopping the internal audio nodes.
    ** This also needs to be a separate method because all nodes should be stopped first, before disconencting
    ** and this way stopping and disconnecting are two separate operations.
    **
    ** It is recommended to fade first (if applicable/possible), then stop in reverse order (from last node
    ** to first node), every time a new note is played. */
    stopNodes(delayDuration: number): void;

    /* Disconencts all internal audio nodes, every time a new note is played.
    ** This needs to be a separate method because the order in which the nodes are disconnected might matter in
    ** some situations (it dependes on the complexitiy of the subgraph). In this way, the implementer of this
    ** method can choose the most suitable order of disconnecting the internal audio nodes. */
    disconnectNodes(): void;
}

export abstract class RestartableSourceEmitter
{
    /* Methods inherited from 'ChildSourceEmitter' interface */
    public abstract getOutputNode(): AudioNode;

    protected abstract getEndableNodes(): EndableNode[];
    /* This method must recreate the array of endable nodes, every time a new note is played */
    protected abstract setEndableNodes(): void;
    
    protected abstract initNodes(): void;
    protected abstract startNodes(delayDuration: number): void;
    protected abstract stopNodes(delayDuration: number): void;
    protected abstract disconnectNodes(): void;


    /** Subclass must return every SourceNode */
    // public abstract getChildSourceNodes(): ChildSourceEmitter[];

    public startSignal(delayDuration: number): void
    {
        // const childNodes = this.getChildSourceNodes();
        // for (const node of childNodes)
        // {
        //     node.reconnectNodes();
        // }

        // for (const node of childNodes)
        // {
        //     node.startNodes(time);
        // }

        this.initNodes();
        this.setEndableNodes();
        this.startNodes(delayDuration);
    }

    /* Method that uses the 'stopNodes()' and 'disconnectNodes()' methods to stop the audio/signal from
    ** this node.
    ** This method is public and already implemented and should be called by the user himself, every time new note
    ** is stopped. */
    public stopSignal(delayDuration: number): void
    {
        const endableNodes = this.getEndableNodes();
        let remaining = endableNodes.length;

        if (remaining === 0)
        {
            this.disconnectNodes();
            return;
        }

        this.stopNodes(delayDuration);

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

/* This class represents the concept of an emitter. An emitter is an audio node
** that generates an ouput (most of the times a sound).
** We can get access to the output signal of the emitter through the getOutputNode() method. */
export interface IntermediateEmitter
{
    /* The main method of this class, this method should return the final output node
    ** of an Emitter. */
    getOutputNode(): AudioNode;
}