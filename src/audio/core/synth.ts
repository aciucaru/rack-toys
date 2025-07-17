import type { Emitter } from "./emitter";

export interface MonoSynth extends Emitter
{
    noteOn(octaves: number, semitones: number): void;

    noteOff(): void;

    // noteOnOff(octaves: number, semitones: number, duration: number): void;
}

export abstract class PolySynth<M extends MonoSynth> implements Emitter
{
    /** the pool of all voices */
    protected voices: M[] = [];

    /** which note is held by which voice */
    protected active: Map<string, M> = new Map<string, M>();

    constructor() { }
    
    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    /* Any subclass must implement this method and return a newly created MonoSynth */
    protected abstract createVoice(): M;

    public setVoices(polyphonyCount: number)
    {
        // clear the array
        this.voices.length = 0;

        for (let i = 0; i < polyphonyCount; i++)
        {
            this.voices.push(this.createVoice());
        }
    }

    public getVoices(): M[] { return this.voices; }

    // public noteOn(octaves: number, semitones: number): void;
    // public noteOff(octaves: number, semitones: number): void;

    /* Play one new note. Finds a free voice (or steals the oldest one),
    ** calls its noteOn(), and remembers the mapping so noteOff()
    ** can later turn *that* voice off. */
    public noteOn(midiNote: string, octaves: number, semitones: number)
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
        voice.noteOn(octaves, semitones);

        // Set the voice as being in use by the note
        this.active.set(midiNote, voice);
    }

    // Release exactly the voice that was playing this midiNote
    public noteOff(midiNote: string)
    {
        const voice = this.active.get(midiNote);

        if (!voice)
            return;

        voice.noteOff();
        this.active.delete(midiNote);
    }

    // Stop all currently playing notes
    public allNotesOff()
    {
        for (const [note, voice] of this.active.entries())
        {
            voice.noteOff();
        }

        this.active.clear();
    }

    /* (Optional)
    ** If its necessary to grow/shrink the polyphony dynamically, we can tear down old
    ** voices and remake the pool. */
    public setVoiceCount(n: number)
    {
        this.voices = [];
        for (let i = 0; i < n; i++) this.voices.push(this.createVoice());
    }

    // protected getFreeVoice(): M
    // {
    //     // Find a free voice
    //     let voice = this.voices.find(v => ![...this.active.values()].includes(v));

    //     // If no voice is free
    //     if (!voice)
    //     {
    //         // Then steal the oldest voice (the first voice according to insertion order)
    //         const [oldNote, oldestVoice] = this.active.entries().next().value!;

    //         oldestVoice.noteOff();
    //         this.active.delete(oldNote);

    //         voice = oldestVoice;
    //     }

    //     return voice;
    // }

    protected getFreeVoice(): M
    {
        // Try to find a voice not currently in use
        const usedVoices = new Set(this.active.values());
        let voice = this.voices.find(v => !usedVoices.has(v));

        if (voice)
            return voice;

        // If all voices are in use, attempt to steal the oldest one
        const oldestEntry = this.active.entries().next();

        if (oldestEntry.done || !oldestEntry.value)
            throw new Error("No available voices and no active voices to steal.");

        const [oldNote, oldestVoice] = oldestEntry.value;

        oldestVoice.noteOff();
        this.active.delete(oldNote);

        return oldestVoice;
    }
}
