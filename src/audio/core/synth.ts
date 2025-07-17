export interface MonoSynth
{
    noteOn(octaves: number, semitones: number): void;

    noteOff(): void;

    // noteOnOff(octaves: number, semitones: number, duration: number): void;
}

type NoteId = string;

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

    /* Any subclass *must* implement this and return a fresh, disconnected MonoSynth */
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

        // find a free voice
        let voice = this.voices.find(v => ![...this.active.values()].includes(v));
        // if none free, steal the first one in insertion order
        if (!voice)
        {
            const [oldNote, oldestVoice] = this.active.entries().next().value!;
            oldestVoice.noteOff();
            this.active.delete(oldNote);
            voice = oldestVoice;
        }

        voice.noteOn(midiNote, velocity);
        this.active.set(midiNote, voice);
    }

    /**
     * Release exactly the voice that was playing this midiNote.
     */
    noteOff(midiNote: number)
    {
        const voice = this.active.get(midiNote);
        if (!voice) return;
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
        // 1) Try to find an unused voice
        const inUse = new Set(this.active.values());
        for (const v of this.voices)
        {
            if (!inUse.has(v))
                return v;
        }

        // 2) All voices busy, so steal one (e.g. the first in Map iteration order)
        const [oldestId, oldestVoice] = this.active.entries().next().value as [NoteId, M];
        this.active.delete(oldestId);
        oldestVoice.noteOff();

        return oldestVoice;
    }
}
