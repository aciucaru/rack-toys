import { Settings } from "../../../constants/settings";
import { audioContext } from "../../../constants/shareable-audio-nodes";

import type { Emitter } from "../../core/emitter";

import { Note12TET } from "../../note/note";

import { PolySynth, type MonoSynth } from "../../core/synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import { PulseOscillator } from "../../source-emitter/oscillator/melodic/pulse-oscillator";


export class TestMonoSynth implements MonoSynth
{
    private audioContext: AudioContext;

    private note: Note12TET;

    // the oscillators:
    private oscillator: PulseOscillator;

    // the final node
    private outputNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TestMonoSynth1", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        this.note = new Note12TET(4, 9);

        this.oscillator = new PulseOscillator(this.audioContext);

        // instantiate and set the final gain node
        this.outputNode = this.audioContext.createGain();
        // this.outputNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);
        this.outputNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);

        // the filtered oscillators are taken from the filter output
        this.oscillator.getOutputNode().connect(this.outputNode);
        this.oscillator.setFrequency(this.note.getFreq());
    }

    // Method inheritted from 'Emitter' interface
    public getOutputNode(): AudioNode
    {
        return this.outputNode;
    }

    // Method inherited from 'MonoSynth' interface
    public noteOn(octaves: number, semitones: number): void
    {
        TestMonoSynth.logger.debug(`noteOn(octaves = ${octaves}, semitones = ${semitones})`);

        this.note.setOctavesAndSemitones(octaves, semitones);

        // first, set the internal note (as octaves and semitones) for all melodic oscillators
        this.oscillator.setFrequency(this.note.getFreq()); // maybe should just set octaves and semitones?

        this.oscillator.startSource();
    }

    // Method inherited from 'MonoSynth' interface
    public noteOff(): void
    {
        TestMonoSynth.logger.debug(`noteOff()`);

        // stop the ADSR envelope for the voice
        // this.voiceAdsrEnvelope.stopSignal(0);
        this.oscillator.stopSource();
    }

    public getOscillator(): PulseOscillator { return this.oscillator; }
}

export class TestPolySynth extends PolySynth<TestMonoSynth> implements Emitter
{
    private audioContext: AudioContext;

    // the final node
    private outputNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TestPolySynth1", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext, polyphonyCount: number)
    {
        super();

        this.audioContext = audioContext;

        // Instantiate 'voices' (the monosynths)
        this.setVoices(polyphonyCount);

        // instantiate and set the final gain node
        this.outputNode = this.audioContext.createGain();
        // this.outputNode.gain.setValueAtTime(Settings.maxVoiceGain, this.audioContext.currentTime);
        this.outputNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);

        // connect individual voices to the final output node
        for (const voice of this.getVoices())
        {
            voice.getOutputNode().connect(this.outputNode);
        }

        this.outputNode.connect(this.audioContext.destination);
    }

    // Inherited from PolySynth abstract class
    protected createVoice(): TestMonoSynth
    {
        return new TestMonoSynth(this.audioContext);
    }

    // Inherited from Emitter interface
    getOutputNode(): AudioNode
    {
        return this.outputNode;
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