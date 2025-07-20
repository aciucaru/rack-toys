import { Settings } from "../../../constants/settings";
import { audioContext } from "../../../constants/shareable-audio-nodes";

import type { Emitter } from "../../core/emitter";

import { Note12TETUtils } from "../../note/note12tet";

import { TripleShapeOscillator } from "../../generator/oscillator/melodic/triple-shape-oscillator";
import { TripleNoiseOscillator } from "../../generator/oscillator/noise/triple-noise-oscillator";

import { AdditiveMixer } from "../../intermediate-emitter/mixer/additive-mixer";
import { OscFilter } from "../../intermediate-emitter/filter/lowpass-filter";

import { AdsrEnvelopeGenerator } from "../../generator/modulator/adsr-envelope-generator";

import type { SynthVoice } from "../../core/synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export class AnalogMonoSynth implements Emitter, SynthVoice
{
    private audioContext: AudioContext;

    private note: Note12TETUtils;

    // the oscillators:
    private multiShapeOscillator1: TripleShapeOscillator;
    private multiShapeOscillator2: TripleShapeOscillator;
    private noiseOscillator: TripleNoiseOscillator;

    // the oscillator mixer
    private oscillatorMixer: AdditiveMixer;

    // the filter and envelope:
    private filterNode: OscFilter;

    private voiceAdsrEnvelope: AdsrEnvelopeGenerator;
    private voiceAdsrGainNode: GainNode;

    // the final node
    private outputGainNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "AnalogMonoSynth", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        // if (audioContext !== undefined)
        //     this.audioContext = audioContext;
        // else
        // {
        //     Voice.logger.warn("constructor(): audioContext is null, separate audioContext was created");
        //     this.audioContext = new AudioContext();
        // }

        // if (audioContext === null)
        //     Voice.logger.warn("constructor(): audioContext is null, separate audioContext was created");

        this.note = new Note12TETUtils(4, 9);

        this.multiShapeOscillator1 = new TripleShapeOscillator(this.audioContext);
        this.multiShapeOscillator2 = new TripleShapeOscillator(this.audioContext);
        this.noiseOscillator = new TripleNoiseOscillator(this.audioContext, Settings.minOscGain);

        // instantiate and set the mixer
        this.oscillatorMixer = new AdditiveMixer(this.audioContext);

        // instantiate the filter
        this.filterNode = new OscFilter(this.audioContext);

        // instantiate and set the ADSR envelope
        this.voiceAdsrEnvelope = new AdsrEnvelopeGenerator(this.audioContext);
        this.voiceAdsrGainNode = this.audioContext.createGain();
        this.voiceAdsrGainNode.gain.setValueAtTime(Settings.adsrOffLevel, this.audioContext.currentTime);

        // instantiate and set the final gain node
        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);

        // add the oscillators to the mixer, in the exact order below
        this.oscillatorMixer.connectInput(this.multiShapeOscillator1.getOutputNode()); // osc 1 must be at index 0
        this.oscillatorMixer.connectInput(this.multiShapeOscillator2.getOutputNode()); // osc 2 must be at index 1
        this.oscillatorMixer.connectInput(this.noiseOscillator.getOutputNode()); // noise osc must be at index 3

        // connect the merged result of the oscillators that should be filtered, to the filter itself
        this.oscillatorMixer.getOutputNode().connect(this.filterNode.inputNode());

        // the filtered oscillators are taken from the filter output
        this.filterNode.outputNode().connect(this.voiceAdsrGainNode);
        
        /* Connect ADSR envelope with GainNode dedicated to ADSR envelope modulation.
        ** Important! this ADSR modulation gets ADDED to the current value of .gain parameter, it does not overwrite it!
        ** This is why the .gain parameter's value should be zero. */
        this.voiceAdsrEnvelope.getOutputNode().connect(this.voiceAdsrGainNode.gain);

        // finally, connect the output from the GainNode modulated by ADSR to the final output GainNode
        this.voiceAdsrGainNode.connect(this.outputGainNode);
    }

    public getOutputNode(): AudioNode
    {
        return this.outputGainNode;
    }

    // Method inherited from 'MonoSynth' interface
    public noteOn(octaves: number, semitones: number): void
    {
        AnalogMonoSynth.logger.debug(`noteOn(octaves = ${octaves}, semitones = ${semitones})`);

        this.note.setOctavesAndSemitones(octaves, semitones);

        // first, set the internal note (as octaves and semitones) for all melodic oscillators
        // this.multiShapeOscillator1.setNote(octaves, semitones);
        // this.multiShapeOscillator2.setNote(octaves, semitones);
        this.multiShapeOscillator1.setFrequency(this.note.getFreq()); // maybe should just set octaves and semitones?
        this.multiShapeOscillator2.setFrequency(this.note.getFreq());

        // then trigger the ADSR envelope for the voice
        this.voiceAdsrEnvelope.startSource(0);
        // and then trigger the ADSR envelopr for the filter as well
        this.filterNode.getAdsrEnvelope().startSource(0);
    }

    // Method inherited from 'MonoSynth' interface
    public noteOff(): void
    {
        AnalogMonoSynth.logger.debug(`noteOff()`);

        // stop the ADSR envelope for the voice
        this.voiceAdsrEnvelope.stopSource(0);
        // stop the ADSR envelope for rhe filter as well
        this.filterNode.getAdsrEnvelope().stopSource(0);
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
            AnalogMonoSynth.logger.debug(`setGain(${gain})`);

            const currentTime = this.audioContext.currentTime;

            // set the new value
            this.outputGainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.1);
        }
        else
            AnalogMonoSynth.logger.warn(`setGain(${gain}): value outside bounds`);
    }

    public outputNode(): GainNode { return this.outputGainNode; }

    public getMultiShapeOscillator1(): TripleShapeOscillator { return this.multiShapeOscillator1; }

    public getMultiShapeOscillator2(): TripleShapeOscillator { return this.multiShapeOscillator2; }

    public getNoiseOscillator(): TripleNoiseOscillator { return this.noiseOscillator; }

    public getMixer(): AdditiveMixer { return this.oscillatorMixer; }

    public getFilter(): OscFilter { return this.filterNode; }

    public getAdsrEnvelope(): AdsrEnvelopeGenerator { return this.voiceAdsrEnvelope; }

    public getAudioContext(): AudioContext { return this.audioContext; }

    // required for having permission to play the sound in the browser, after a user interaction
    public resume(): void
    {
        this.audioContext.resume();
    }
}

export const monoSynth = new AnalogMonoSynth(audioContext);