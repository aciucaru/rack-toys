import { Settings } from "../../constants/settings";
import type { Emitter } from "./emitter";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import type { NoteUtils, Note } from "./note";

export abstract class SynthVoice<N extends Note> implements Emitter
{
    private note: N;
    private noteTriggerTime: number = Number.MAX_VALUE;
    private _isActive: boolean = false;
    private _isReleasing: boolean = false;

    // The only abstract methods of this class
    protected abstract startSignal(note: N): void;
    protected abstract releaseSignal(onReleaseFinshed: () => void): void;

    private static readonly abstractClassLogger: Logger<ILogObj> = new Logger({name: "abstract MonoSynth", minLevel: Settings.minLogLevel });

    constructor(note: N)
    {
        this.note = note;
    }

    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    public isActive(): boolean { return this._isActive; }

    public noteOn(note: N): void
    {
        this.note = note;

        this._isActive = true;
        this._isReleasing = false;

        this.startSignal(note);
    }

    public noteOff(): void
    {
        this._isActive = false;
        // this._isReleasing = true;
        this._isReleasing = false;

        this.releaseSignal(() => {this._isReleasing = false;});
    }

    public getNoteData(): N { return this.note; }

    public getTriggerTime(): number { return this.noteTriggerTime; }

    // Example releaseSignal()
    // protected releaseSignal(onReleaseFinshed: () => void)
    // {
    //     const now = this.ctx.currentTime;
    //     this.gainNode.gain.cancelScheduledValues(now);
    //     this.gainNode.gain.setTargetAtTime(0, now, 0.5); // example 500 milisec release time

    //     // Use setTimeout to simulate when the release will have faded out
    //     setTimeout(() => {
    //     onReleaseFinshed();
    //     }, 500); // Match the release time 500 milisec
    // }
}

export abstract class PolySynth<N extends Note, V extends SynthVoice<N>> implements Emitter
{
    protected audioContext: AudioContext;

    /** The pool of all voices (a voice is bassically a monophonic synthesizer). */
    protected voices: Array<V>;

    private static readonly abstractClassLogger: Logger<ILogObj> = new Logger({name: "abstract PolySynth", minLevel: Settings.minLogLevel });
    
    constructor(audioContext: AudioContext, numberOfVoices: number = 1)
    {
        this.audioContext = audioContext;

        this.voices = new Array<V>();

        this.setVoices(numberOfVoices);
    }
    
    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    /* Any subclass must implement this method and return a newly created MonoSynth */
    protected abstract createVoice(audioContext: AudioContext): V;

    public setVoices(numberOfVoices: number)
    {
        PolySynth.abstractClassLogger.debug(`setVoices(${numberOfVoices})`);

        // clear the array
        this.voices.length = 0;
        PolySynth.abstractClassLogger.debug(`setVoices(${numberOfVoices}) after clear: ${this.voices}`);

        for (let i = 0; i < numberOfVoices; i++)
        {
            this.voices.push(this.createVoice(this.audioContext));
        }

        PolySynth.abstractClassLogger.debug(`setVoices(${numberOfVoices}) after recreation: ${this.voices.length}`);
    }

    public getVoices(): Array<V> { return this.voices; }

    // public noteOn(octaves: number, semitones: number): void;
    // public noteOff(octaves: number, semitones: number): void;

    /* Play one new note. Finds a free voice (or steals the oldest one),
    ** calls its noteOn(), and remembers the mapping so noteOff()
    ** can later turn *that* voice off. */
    public noteOn(note: N)
    {
        PolySynth.abstractClassLogger.debug("noteOn()");

        // Find the voice associated with the specified note
        const voice = this.findVoiceByNote(note);

        // If the voice was found, check if it's already active and then stop is
        if (voice)
        {
            if (voice.isActive())
            {
                // Then stop the voice
                voice.noteOff();

                PolySynth.abstractClassLogger.warn(`noteOn(): found active voice associated with note: ${voice?.getNoteData().toString()}`);
            }
            else
                PolySynth.abstractClassLogger.debug(`noteOn(): found inactive voice associated with note: ${voice?.getNoteData().toString()}`);
        }

        // Now we can try to get a free voice to play the supplied note
        // Find a free voice (or steal one if no free voice is available)
        const freeVoice = this.getFreeVoiceOrStealOldest();

        if (!freeVoice)
            PolySynth.abstractClassLogger.warn(`noteOn(): NO VOICE IS AVAILABLE`);

        // Play note on that voice
        freeVoice.noteOn(note);
    }

    // Release exactly the voice that was playing this midiNote
    public noteOff(note: N)
    {
        // Try to find the voice that is asociated with the supplied note and is also playing (is active) 
        // let voice = this.voices.find(voice => voice.getNote().equals(note) && voice.isActive());
        const voice = this.findVoiceByNote(note);

        PolySynth.abstractClassLogger.debug(`noteOff() note found: ${voice?.getNoteData().toString()}`);

        // If the voice was found, then stop it
        if (voice)
        {
            if (voice.isActive())
                // Then stop the voice
                voice.noteOff();
        }
        // else
        //     throw new Error("noteOff(): no voice found");
    }

    /* 
    ** If its necessary to grow/shrink the polyphony dynamically, we can tear down old
    ** voices and remake the pool. */
    public setVoiceCount(n: number)
    {
        this.voices = [];
        for (let i = 0; i < n; i++) this.voices.push(this.createVoice(this.audioContext));
    }

    private findVoiceByNote(note: N): V | undefined
    {
        return this.voices.find(voice => voice.getNoteData().equals(note));
    }

    private getFreeVoice(): V | undefined
    {
        // Try to find a voice not currently in use
        let voice = this.voices.find(voice => !voice.isActive());

        // If a free (inactive) voice was found, then return it
        return voice;
    }

    private getOldestVoice(): V
    {
        // If no free voice was found, attempt to steal the oldest one
        // First we, find the oldest voice
        const oldestVoice = this.voices.reduce( (oldVoice, currentVoice) =>
        {
            if (currentVoice.getTriggerTime() < oldVoice.getTriggerTime())
                return currentVoice;
            else
                return oldVoice;
        });

        return oldestVoice;
    }

    private getFreeVoiceOrStealOldest(): V
    {
        // Try te get a free voice first
        let voice = this.getFreeVoice();

        // If there was a free voice available, then return it
        if (voice)
            PolySynth.abstractClassLogger.debug(`getFreeVoiceOrStealOldest(): free voice found`);
        else
        {
            // Otherwise, try to steal the oldest voice and return that
            voice = this.getOldestVoice();

            PolySynth.abstractClassLogger.warn(`getFreeVoiceOrStealOldest(): no free voice was found, voice stolen is: ${voice}`);
        }

        return voice;
    }
}
