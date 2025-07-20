import { Settings } from "../../constants/settings";
import type { Emitter } from "./emitter";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import type { NoteUtils, Note } from "./note";

/* Enum-style structure, in TypeScript it's more recommended to use such pattern than to use true Enums.
** This 'enum-style' structure represents the possible states a synth voice could be in:
** - free: the voice is not playing any sound currently and is free and can be used to play a note
** - attack phase: the voice is not free anymore, it is playing a note and is in the 'attack phase', which
**                 corresponds to the 'noteOn' or 'keyOn' event
** - release phase: the voice is almost free, but it's still playing a sound; it's in the 'release phase', which
**                  corresponds to the 'noteOff' or 'keyOff' event */
export const VoiceState =
{
    Free: "Free",
    InAttackPhase: "InAttackPhase",
    InReleasePhase: "InReleasePhase",
} as const;
export type VoiceState = (typeof VoiceState)[keyof typeof VoiceState];

export abstract class SynthVoice<N extends Note> implements Emitter
{
    protected audioContext: AudioContext;

    private state: VoiceState = VoiceState.Free;
    private note: N | null = null;
    private attackTriggerTime: number = Number.MAX_VALUE;
    private releaseFinishTime: number = Number.MAX_VALUE;

    private _isActive: boolean = false;
    private _isReleasing: boolean = false;

    // The only abstract methods of this class
    protected abstract startSignal(note: N): void;
    // protected abstract releaseSignal(onReleaseFinshed: () => void): void;
    protected abstract releaseSignal(): void;
    protected abstract getReleaseDuration(): number;

    private static readonly abstractClassLogger: Logger<ILogObj> = new Logger({name: "abstract MonoSynth", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext, note: N)
    {
        this.audioContext = audioContext;
        this.note = note;
    }

    // Inherited from 'Emitter' interface
    public abstract getOutputNode(): AudioNode;

    // public isActive(): boolean { return this._isActive; }

    private reset(): void
    {
        this.state = VoiceState.Free;
        this.note = null;
        this.attackTriggerTime = Number.MAX_VALUE;
        this.releaseFinishTime = Number.MAX_VALUE;
    }

    public checkAndUpdateState(): VoiceState
    {
        // if (this.state === VoiceState.Free || this.state === VoiceState.InAttackPhase)
        //     return this.state;

        if (this.state === VoiceState.InReleasePhase)
        {
            const currentTime = this.audioContext.currentTime;

            // If the voice has finished playing its note
            if (currentTime > this.releaseFinishTime)
                // Then reset it
                this.reset(); // reset all relevant data (state, note, trigger times)
        }

        return this.state;
    }

    public triggerAttack(note: N): void
    {
        this.state = VoiceState.InAttackPhase;
        this.note = note;
        this.attackTriggerTime = this.audioContext.currentTime;
        this.releaseFinishTime = Number.MAX_VALUE;

        // this._isActive = true;
        // this._isReleasing = false;

        this.startSignal(note);
    }

    public triggerRelease(): void
    {
        // this._isActive = false;
        // this._isReleasing = true;
        // this._isReleasing = false;

        this.state = VoiceState.InReleasePhase;
        this.releaseFinishTime = this.audioContext.currentTime + this.getReleaseDuration();

        // this.releaseSignal(() => {this._isReleasing = false;});
        this.releaseSignal();
    }

    public getNote(): N | null { return this.note; }

    public getTriggerTime(): number { return this.attackTriggerTime; }
    // public getReleaseFinishTime(): number { return this.releaseFinishTime; }

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

    public toString(): string
    {
        return `triggerTime: ${this.attackTriggerTime}, isActive: ${this._isActive}, isReleasing: ${this._isReleasing}`;
    }
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
    public triggerAttack(note: N)
    {
        // First of all, update the state of all voices in this poly synth
        this.checkAndUpdateAllVoices();

        // Find if there is already a voice associated with the specified note
        const voice = this.findVoiceByNote(note);

        // If the voice was found, check if it's already active.
        // If the voice is already active, then we will use that very same voice for this new note,
        // because we don't want to hear the exact same note twice
        if (voice)
        {
            PolySynth.abstractClassLogger.debug(`triggerAttack(): ${voice?.getNote().toString()}`);

            // Check the voice state
            // const state = voice.checkAndUpdateState();
            voice.triggerAttack(note); // trigger the note on the very same voice that played it before

            // if (state === VoiceState.InAttackPhase || state === VoiceState.InReleasePhase)
            // {
            //     PolySynth.abstractClassLogger.warn(`triggerAttack(): requested note: ${note.toString()} already has active voice: ${voice.toString()}`);
                
            //     // Then stop the voice
            //     voice.triggerRelease(); // also sets the state
            // }
            // else
            //     PolySynth.abstractClassLogger.debug(`triggerAttack(): found inactive voice: ${voice.toString()} associated with note: ${note.toString()}`);
        
        }
        else // If there was no voice already playing the supplied note
        {
            // Then just get any free voice or, if no free voice available, then steal the oldest voice
            const freeVoice = this.getFreeVoiceOrStealOldest();

            if (freeVoice)
            {
                PolySynth.abstractClassLogger.warn(`noteOn(): free voice found or stolen: ${freeVoice.toString()}`);
                
                // Play note on that voice
                freeVoice.triggerAttack(note);
            }
            else
                PolySynth.abstractClassLogger.warn(`noteOn(): NO VOICE IS AVAILABLE`);
        }
    }

    // Release exactly the voice that was playing this midiNote
    public triggerRelease(note: N)
    {
        // First of all, update the state of all voices in this poly synth
        this.checkAndUpdateAllVoices();

        // Try to find the voice that is asociated with the supplied note and is also playing (is active) 
        // let voice = this.voices.find(voice => voice.getNote().equals(note) && voice.isActive());
        const voice = this.findVoiceByNote(note);

        // If the voice was found, then stop it
        if (voice)
        {
            PolySynth.abstractClassLogger.debug(`noteOff() voice found: ${voice.toString()} for note: ${note.toString()}`);

            // Check the voice state
            const state = voice.checkAndUpdateState();

            if (state === VoiceState.InAttackPhase || state === VoiceState.InReleasePhase)
                // Then stop the voice
                voice.triggerRelease();
        }
        else
            PolySynth.abstractClassLogger.warn(`noteOff() voice not found for note: ${note.toString()}`);
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
        return this.voices.find(voice => voice.getNote().equals(note));
    }

    private checkAndUpdateAllVoices(): void
    {
        for (const voice of this.voices)
        {
            voice.checkAndUpdateState();
        }
    }

    private getFreeVoice(): V | undefined
    {
        // Try to find a voice not currently in use
        let voice = this.voices.find(voice => voice.checkAndUpdateState() === VoiceState.Free);

        if (voice)
            PolySynth.abstractClassLogger.debug(`getFreeVoice(): free voice found: ${voice.toString()}`);
        else
            PolySynth.abstractClassLogger.debug(`getFreeVoice(): no free voice was found`);


        // Return the found voice (might be 'undefined')
        return voice;
    }

    private getOldestVoice(): V
    {
        // If no free voice was found, attempt to steal the oldest one
        // First we, find the oldest voice
        // const oldestVoice = this.voices.reduce( (oldVoice, currentVoice) =>
        // {
        //     if (currentVoice.getTriggerTime() < oldVoice.getTriggerTime())
        //         return currentVoice;
        //     else
        //         return oldVoice;
        // });

        let oldestVoice = this.voices[0];
        for (let i = 0; i < this.voices.length; i++)
        {
            // also update the state for each voice
            this.voices[i].checkAndUpdateState();

            if (oldestVoice.getTriggerTime() > this.voices[i].getTriggerTime())
                oldestVoice = this.voices[i];
        }

        PolySynth.abstractClassLogger.debug(`getOldestVoice(): oldest voice found: ${oldestVoice.toString()}`);

        return oldestVoice;
    }

    private getFreeVoiceOrStealOldest(): V
    {
        // Try te get a free voice first
        let voice = this.getFreeVoice();

        // If there was a free voice available, then return it
        if (voice)
            PolySynth.abstractClassLogger.debug(`getFreeVoiceOrStealOldest(): free voice found: ${voice.toString()}`);
        else
        {
            // Otherwise, try to steal the oldest voice and return that
            voice = this.getOldestVoice();

            PolySynth.abstractClassLogger.warn(`getFreeVoiceOrStealOldest(): no free voice was found, voice stolen is: ${voice.toString()}`);
        }

        return voice;
    }
}
