import { Settings } from "../../../constants/settings";
import { audioContext } from "../../../constants/shareable-audio-nodes";

import type { IntermediateEmitter } from "../../core/emitter";

import { Note12TET } from "../../note/note";

import { TripleShapeOscillator } from "../../source-emitter/oscillator/melodic/triple-shape-oscillator";
import { TripleNoiseOscillator } from "../../source-emitter/oscillator/noise/triple-noise-oscillator";

import { AdditiveMixer } from "../../intermediate-emitter/mixer/additive-mixer";
import { OscFilter } from "../../intermediate-emitter/filter/lowpass-filter";

import { AdsrEnvelopeSource } from "../../source-emitter/modulator/adsr-envelope";

import type { MonoSynth } from "../../core/synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import { PulseOscillator } from "../../source-emitter/oscillator/melodic/pulse-oscillator";


export class TestSynth1 implements IntermediateEmitter, MonoSynth
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

        // instantiate and set the ADSR envelope
        // this.voiceAdsrEnvelope = new AdsrEnvelopeSource(this.audioContext);
        // this.voiceAdsrGainNode = this.audioContext.createGain();
        // this.voiceAdsrGainNode.gain.setValueAtTime(Settings.adsrOffLevel, this.audioContext.currentTime);

        // instantiate and set the final gain node
        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);

        // the filtered oscillators are taken from the filter output
        this.oscillator.getOutputNode().connect(this.outputGainNode);
        
        /* Connect ADSR envelope with GainNode dedicated to ADSR envelope modulation.
        ** Important! this ADSR modulation gets ADDED to the current value of .gain parameter, it does not overwrite it!
        ** This is why the .gain parameter's value should be zero. */
        // this.voiceAdsrEnvelope.getOutputNode().connect(this.voiceAdsrGainNode.gain);

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

        this.oscillator.startNodes(0);
    }

    // Method inherited from 'MonoSynth' interface
    public noteOff(): void
    {
        TestSynth1.logger.debug(`noteOff()`);

        // stop the ADSR envelope for the voice
        // this.voiceAdsrEnvelope.stopSignal(0);
        this.oscillator.stopNodes(0);
    }

    // Method inherited from 'MonoSynth' interface
    // noteOnOff(octaves: number, semitones: number, duration: number): void
    // {
    //     VirtualAnalogMonoVoice.logger.debug(`noteOn(octaves = ${octaves}, semitones = ${semitones})`);

    //     this.note.setOctavesAndSemitones(octaves, semitones);

    //     // first, set the internal note (as octaves and semitones) for all melodic oscillators
    //     // this.multiShapeOscillator1.setNote(octaves, semitones);
    //     // this.multiShapeOscillator2.setNote(octaves, semitones);
    //     this.multiShapeOscillator1.setFrequency(this.note.getFreq()); // maybe should just set octaves and semitones?
    //     this.multiShapeOscillator2.setFrequency(this.note.getFreq());

    //     // then trigger the ADSR envelope for the voice
    //     this.voiceAdsrEnvelope.startSignal(0);
    //     // and then trigger the ADSR envelopr for the filter as well
    //     this.filterNode.getAdsrEnvelope().startBeat(duration);
    // }

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