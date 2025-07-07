export interface MonoSynth
{
    noteOn(octaves: number, semitones: number): void;

    noteOff(): void;

    // noteOnOff(octaves: number, semitones: number, duration: number): void;
}