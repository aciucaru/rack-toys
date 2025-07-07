export class Constants
{
    // constants for MIDI notes and frequencies:

    // the MIDI note number corresponding to A4 note
    public static readonly a4MidiNoteNumber: number = 69;

    // the octave corresponding to A4 note
    public static readonly a4Octaves: number = 4;

    // the number of semitones (added to the previous 'octave) corresponding to A4 note
    public static readonly a4Semitones: number = 9;

    // the frequency corresponding to A4 note; usualy it's 440 Hz, but may also have other values (443 Hz)
    public static readonly a4Freq: number = 440;

    public static readonly c4MidiNoteNumber: number = 60;
}