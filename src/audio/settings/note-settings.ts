import { Constants } from "./constants";

export class NoteSettings
{
    // the minimum and maximum absolute frequencies possible, that the 'Note' class can describe
    // these will be initialized in the below static block
    public static minFrequency: number;
    public static maxFrequency: number;
    public static defaultFrequency: number = Constants.a4Freq;

    // settings for note: ***************************************************************************
    public static readonly minMidiNote = 0;
    public static readonly maxMidiNote = 127;

    /* a keyboard usually has at most 7 octave, plus a small incomplete octave at the beggining
    ** and maybe a small icomplete (one-note) octave at the end;
    ** but here we keep it simple and use complete octaves only, whic are from 1 to 7 */
    public static readonly minOctaves = 1;
    public static readonly maxOctaves = 7;

    /* in an octave there are 12 semitones (12 notes); for simplicity, the semitones start at zero,
    ** so 'octave 4, semitone 0' would mean 'the first note/semitone of the 4th octave' (which is C4)
    ** and 'octave 4, semitone 1' would mean 'the second note/semitone of the 4th octave' or 'the
    ** first semitone of the 4th octave + one more semitone'; */
    public static readonly minSemitones = 0;
    public static readonly maxSemitones = 11;

    public static readonly noteDefaultOctaves = 4;
    public static readonly noteDefaultSemitones = 9;

    static
    {
        // const minNote = new Note12TET(3, 0);
        // minNote.setOctavesOffset(Settings.minOscOctavesOffset);
        // minNote.setSemitonesOffset(Settings.minOscSemitonesOffset);
        // minNote.setCentsOffset(Settings.minOscCentsOffset);
        // NoteSettings.minFrequency = minNote.getFreq();
        NoteSettings.minFrequency = 0.01;

        // const maxNote = new Note12TET(6, 11);
        // maxNote.setOctavesOffset(Settings.maxOscOctavesOffset);
        // maxNote.setSemitonesOffset(Settings.maxOscSemitonesOffset);
        // maxNote.setCentsOffset(Settings.maxOscCentsOffset);
        // NoteSettings.maxFrequency = maxNote.getFreq();
        NoteSettings.maxFrequency = 100000.0;
    }
}

