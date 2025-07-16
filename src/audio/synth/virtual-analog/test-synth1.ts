import { Settings } from "../../../constants/settings";
import { audioContext } from "../../../constants/shareable-audio-nodes";

import type { Emitter } from "../../core/emitter";

import { Note12TET } from "../../note/note";

import type { MonoSynth } from "../../core/synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import { PulseOscillator } from "../../source-emitter/oscillator/melodic/pulse-oscillator";


export class TestSynth1 implements Emitter, MonoSynth
{
    private audioContext: AudioContext;

    private note: Note12TET;

    // the oscillators:
    private oscillator: PulseOscillator;

    // private voiceAdsrEnvelope: AdsrEnvelopeSource;
    // private voiceAdsrGainNode: GainNode;

    // the final node
    private outputGainNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TestSynth1", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        this.note = new Note12TET(4, 9);

        this.oscillator = new PulseOscillator(this.audioContext);

        // instantiate and set the final gain node
        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);

        // the filtered oscillators are taken from the filter output
        this.oscillator.getOutputNode().connect(this.outputGainNode);
        this.oscillator.setFrequency(this.note.getFreq());

        // finally, connect the output from the GainNode modulated by ADSR to the final output GainNode
        // this.voiceAdsrGainNode.connect(this.outputGainNode);
        this.outputGainNode.connect(this.audioContext.destination);
    }

    public getOutputNode(): AudioNode
    {
        return this.outputGainNode;
    }

    // Method inherited from 'MonoSynth' interface
    public noteOn(octaves: number, semitones: number): void
    {
        TestSynth1.logger.debug(`noteOn(octaves = ${octaves}, semitones = ${semitones})`);

        this.note.setOctavesAndSemitones(octaves, semitones);

        // first, set the internal note (as octaves and semitones) for all melodic oscillators
        this.oscillator.setFrequency(this.note.getFreq()); // maybe should just set octaves and semitones?

        // then trigger the ADSR envelope for the voice
        // this.voiceAdsrEnvelope.startSignal(0);

        this.oscillator.startSource();
    }

    // Method inherited from 'MonoSynth' interface
    public noteOff(): void
    {
        TestSynth1.logger.debug(`noteOff()`);

        // stop the ADSR envelope for the voice
        // this.voiceAdsrEnvelope.stopSignal(0);
        this.oscillator.stopSource();
    }

    public setMainGain(gain: number): void
    {
        if (Settings.minVoiceGain <= gain && gain <= Settings.maxVoiceGain)
        {
            TestSynth1.logger.debug(`setGain(${gain})`);

            const currentTime = this.audioContext.currentTime;

            // set the new value
            this.outputGainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.1);
        }
        else
            TestSynth1.logger.warn(`setGain(${gain}): value outside bounds`);
    }

    public outputNode(): GainNode { return this.outputGainNode; }

    public getOscillator(): PulseOscillator { return this.oscillator; }

    // public getAdsrEnvelope(): AdsrEnvelopeSource { return this.voiceAdsrEnvelope; }

    public getAudioContext(): AudioContext { return this.audioContext; }

    // required for having permission to play the sound in the browser, after a user interaction
    public resume(): void
    {
        this.audioContext.resume();
    }
}

export const testMonoSynth1 = new TestSynth1(audioContext);