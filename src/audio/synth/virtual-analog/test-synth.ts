import { Settings } from "../../settings/settings";
import { audioContext } from "../../../constants/shareable-audio-nodes";

import { Note12TETUtils, Note12TET } from "../../note/note12tet";

import { PolySynth, SynthVoice } from "../../core/synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";
import { PulseOscillator } from "../../generator/oscillator/melodic/pulse-oscillator";
import type { EnvelopeMultiplier } from "../../core/envelope-multiplier";
import { AdsrEnvelopeMultiplier } from "../../intermediate-emitter/envelope/adsr-envelope-multiplier";


export class TestMonoSynth extends SynthVoice<Note12TET>
{
    private noteUtils: Note12TETUtils;
    private oscNoteOffset: Note12TET;

    // The oscillators (in this case only one):
    private oscillator: PulseOscillator;

    private adsrEnvelopeMultiplier: AdsrEnvelopeMultiplier;

    // The final node
    private outputNode: GainNode;

    private static readonly logger: Logger<ILogObj> = new Logger({name: "TestMonoSynth", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext)
    {
        super(audioContext);

        this.noteUtils = new Note12TETUtils();
        this.oscNoteOffset = new Note12TET(0, 0, 0);

        this.oscillator = new PulseOscillator(this.getAudioContext());

        this.adsrEnvelopeMultiplier = new AdsrEnvelopeMultiplier(this.getAudioContext());

        // instantiate and set the final gain node
        this.outputNode = this.getAudioContext().createGain();

        // connect the oscillator to the destination (built-into the base class)
        this.oscillator.getOutputNode().connect(this.adsrEnvelopeMultiplier.getInputNode());

        // connect the ADSR envelope with the final output
        this.adsrEnvelopeMultiplier.getOutputNode().connect(this.outputNode);

        this.adsrEnvelopeMultiplier.setParams(1.0, 1.0, 1.0, 1.0);
    }

    // Method inheritted from 'Emitter' interface
    public getOutputNode(): AudioNode { return this.outputNode; }

    // Method inheritted from 'MonoSynth<>' abstract class
    protected startSignal(note: Note12TET): void
    {
        TestMonoSynth.logger.debug(`startSignal({${note.octaves}, ${note.semitones}, ${note.cents}})`);

        // first, set the internal frequency for all melodic oscillators
        const oscFreq = this.noteUtils.getFrequencyWithOffset(note, this.oscNoteOffset);

        this.oscillator.recreateSource();
        this.oscillator.setFrequency(oscFreq);
        this.oscillator.startSource();
        this.adsrEnvelopeMultiplier.triggerAttack();
    }

    // Method inheritted from 'MonoSynth<>' abstract class
    protected releaseSignal(): void
    {
        this.oscillator.stopSource();
        this.adsrEnvelopeMultiplier.triggerRelease();
    }

    // Method inheritted from 'MonoSynth<>' abstract class
    protected getEstimatedReleaseDuration(): number
    {
        return this.adsrEnvelopeMultiplier.getFinsihTime();
    }

    // Method inheritted from 'MonoSynth<>' abstract class
    protected getEnvelopeMultiplier(): EnvelopeMultiplier { return this.adsrEnvelopeMultiplier; }

    public getOscillator(): PulseOscillator { return this.oscillator; }
}

export class TestPolySynth extends PolySynth<Note12TET, TestMonoSynth>
{
    private static readonly logger: Logger<ILogObj> = new Logger({name: "TestPolySynth", minLevel: Settings.minLogLevel});

    constructor(audioContext: AudioContext, numberOfVoices: number)
    {
        super(audioContext, numberOfVoices);

        this.getOutputNode().connect(this.getAudioContext().destination);
    }

    // Inherited from PolySynth abstract class
    protected createVoice(): TestMonoSynth
    {
        return new TestMonoSynth(this.getAudioContext());
    }

    // Required for having permission to play the sound in the browser, after a user interaction
    public resume(): void
    {
        this.getAudioContext().resume();
    }
}

export const testPolySynth = new TestPolySynth(audioContext, 5);