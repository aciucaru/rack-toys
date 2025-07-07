import { Settings } from "../../../constants/settings";
import { audioContext } from "../../../constants/shareable-audio-nodes";

import { AnalogMonoSynth } from "./analog-voice";


export class AnalogueSynth
{
    private audioContext: AudioContext;

    private voice: AnalogMonoSynth;

    // The output node of this synth
    private outputGainNode: GainNode;

    public constructor(audioContext: AudioContext)
    {
        this.audioContext = audioContext;

        this.voice = new AnalogMonoSynth(this.audioContext);

        // Instantiate and set the gain node
        this.outputGainNode = this.audioContext.createGain();
        this.outputGainNode.gain.setValueAtTime(Settings.maxOscGain, this.audioContext.currentTime);

        // Connect nodes between them
        this.voice.getOutputNode().connect(this.outputGainNode);
        this.outputGainNode.connect(this.audioContext.destination);
    }

    public getVoice(): AnalogMonoSynth { return this.voice; }
}

export const monoSynth = new AnalogueSynth(audioContext);