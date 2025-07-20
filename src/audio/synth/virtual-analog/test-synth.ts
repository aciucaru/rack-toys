import { Settings } from "../../../constants/settings";
import { audioContext } from "../../../constants/shareable-audio-nodes";

import { Note12TETUtils, Note12TET } from "../../note/note12tet";

import { PolySynth, SynthVoice } from "../../core/synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import { PulseOscillator } from "../../generator/oscillator/melodic/pulse-oscillator";


export class TestMonoSynth extends SynthVoice<Note12TET>
{
    private noteUtils: Note12TETUtils;
    private oscNoteOffset: Note12TET;

    // the oscillators:
    private oscillator: PulseOscillator;

    // the final node
    private outputNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TestMonoSynth", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        super(audioContext);

        this.noteUtils = new Note12TETUtils();
        this.oscNoteOffset = new Note12TET(0, 0, 0);

        this.audioContext = audioContext;

        this.oscillator = new PulseOscillator(this.audioContext);

        // instantiate and set the final gain node
        this.outputNode = this.audioContext.createGain();

        // connect teh oscillator to the destination (built-into the base class)
        this.oscillator.getOutputNode().connect(this.outputNode);
    }

    // Method inheritted from 'Emitter' interface
    public getOutputNode(): AudioNode { return this.outputNode; }

    // Method inheritted from 'MonoSynth<>' abstract class
    protected startSignal(note: Note12TET): void
    {
        TestMonoSynth.logger.debug(`startSignal({${note.octaves}, ${note.semitones}, ${note.cents}})`);

        // first, set the internal frequency for all melodic oscillators
        const oscFreq = this.noteUtils.getFrequencyWithOffset(note, this.oscNoteOffset);

        // const currentTime = this.audioContext.currentTime;
        // this.outputNode.gain.setTargetAtTime(Settings.maxOscGain, currentTime, 2); // example 500 milisec release time
        
        this.oscillator.recreateSource();
        this.oscillator.setFrequency(oscFreq);
        this.oscillator.startSource();
    }

    // Method inheritted from 'MonoSynth<>' abstract class
    // protected releaseSignal(onReleaseFinshed: () => void): void
    // {
    //     const currentTime = this.audioContext.currentTime;

    //     this.outputNode.gain.cancelScheduledValues(currentTime);
    //     this.outputNode.gain.setTargetAtTime(0, currentTime, 0.5); // example 500 milisec release time

    //     // Use setTimeout to simulate when the release will have faded out
    //     setTimeout(() => { onReleaseFinshed(); }, 500); // Match the release time 500 milisec
    // }

    protected releaseSignal(): void
    {
        const currentTime = this.audioContext.currentTime;

        // this.outputNode.gain.cancelScheduledValues(currentTime);
        // this.outputNode.gain.setTargetAtTime(Settings.minOscGain, currentTime, 2); // example 500 milisec release time
        this.oscillator.stopSource();
    }

    protected getReleaseDuration(): number
    {
        return 0.5;
    }

    public getOscillator(): PulseOscillator { return this.oscillator; }
}

export class TestPolySynth extends PolySynth<Note12TET, TestMonoSynth>
{
    private static readonly logger: Logger<ILogObj> = new Logger({name: "TestPolySynth", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext, numberOfVoices: number)
    {
        super(audioContext, numberOfVoices);

        this.outputNode.connect(this.audioContext.destination);
    }

    // Inherited from PolySynth abstract class
    protected createVoice(): TestMonoSynth
    {
        return new TestMonoSynth(this.audioContext);
    }

    public setMainGain(gain: number): void
    {
        if (Settings.minVoiceGain <= gain && gain <= Settings.maxVoiceGain)
        {
            TestPolySynth.logger.debug(`setGain(${gain})`);

            const currentTime = this.audioContext.currentTime;

            // set the new value
            this.outputNode.gain.linearRampToValueAtTime(gain, currentTime + 0.1);
        }
        else
            TestPolySynth.logger.warn(`setGain(${gain}): value outside bounds`);
    }

    public getAudioContext(): AudioContext { return this.audioContext; }

    // required for having permission to play the sound in the browser, after a user interaction
    public resume(): void
    {
        this.audioContext.resume();
    }
}

export const testPolySynth = new TestPolySynth(audioContext, 5);