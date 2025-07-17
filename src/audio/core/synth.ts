export interface MonoSynth
{
    noteOn(octaves: number, semitones: number): void;

    noteOff(): void;

    // noteOnOff(octaves: number, semitones: number, duration: number): void;
}


abstract class PolySynth<M extends MonoSynth>
{
    /** the pool of all voices */
    protected voices: M[] = [];

    /** which note is held by which voice */
    protected active: Map<number, M> = new Map();

    /**
     * @param voiceCount how many simultaneous notes the synth has
     */
    constructor(voiceCount: number)
    {
        for (let i = 0; i < voiceCount; i++)
        {
            this.voices.push(this.createVoice());
        }
    }

    /* Any subclass must implement this method and return a newly created MonoSynth */
    protected abstract createVoice(): M;

    // public noteOn(octaves: number, semitones: number): void;
    // public noteOff(octaves: number, semitones: number): void;

    /* Play one new note.  Finds a free voice (or steals the oldest one),
    ** calls its noteOn(), and remembers the mapping so noteOff()
    ** can later turn *that* voice off.*/
    noteOn(midiNote: number, velocity = 1)
    {
        // if this note is already down, release it first
        if (this.active.has(midiNote))
        {
            this.active.get(midiNote)!.noteOff();
            this.active.delete(midiNote);
        }

        // Find a free voice (or steal one if no free voice is available)
        let voice = this.getFreeVoice();

        // Play note on that voice
        voice.noteOn(midiNote, velocity);

        // Set the voice as being in use by the note
        this.active.set(midiNote, voice);
    }

    /**
     * Release exactly the voice that was playing this midiNote.
     */
    noteOff(midiNote: number)
    {
        const voice = this.active.get(midiNote);

        if (!voice)
            return;

        voice.noteOff();
        this.active.delete(midiNote);
    }

    /** stop all currently playing notes */
    allNotesOff()
    {
        for (const [note, voice] of this.active.entries())
        {
            voice.noteOff();
        }

        this.active.clear();
    }

    /**
     * (Optional)
     * If you ever need to grow/shrink your polyphony dynamically,
     * you can tear down old voices and remake the pool.
     */
    setVoiceCount(n: number)
    {
        this.voices = [];
        for (let i = 0; i < n; i++) this.voices.push(this.createVoice());
    }

    protected getFreeVoice(): M
    {
        // Find a free voice
        let voice = this.voices.find(v => ![...this.active.values()].includes(v));

        // If no voice is free
        if (!voice)
        {
            // Then steal the oldest voice (the first voice according to insertion order)
            const [oldNote, oldestVoice] = this.active.entries().next().value!;

            oldestVoice.noteOff();
            this.active.delete(oldNote);

            voice = oldestVoice;
        }

        return voice;
    }
}
