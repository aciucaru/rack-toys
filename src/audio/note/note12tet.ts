import { Constants } from "../settings/constants";
import { Settings } from "../settings/settings";
import type { NoteUtils, Note } from "../core/note";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


// Freq
// 3.85846329106347
// 33488.0723584766

export class Note12TET implements Note
{
    public octaves: number;
    public semitones: number;
    public cents: number;

    constructor(octaves: number, semitones: number, cents: number)
    {
        this.octaves = octaves;
        this.semitones = semitones;
        this.cents = cents;
    }

    public equals(otherNote: Note): boolean
    {
        if (!(otherNote instanceof Note12TET))
            return false;

        // Two 12-TET notes are considered equal if their octaves, semitones and cents values match
        return (this.octaves === otherNote.octaves &&
                this.semitones === otherNote.semitones &&
                this.cents === otherNote.cents)
    };

    public toString(): string
    {
        return `note{${this.octaves}, ${this.semitones}, ${this.cents}}`;
    }
}

export class Note12TETUtils implements NoteUtils<Note12TET>
{
    private static readonly logger: Logger<ILogObj> = new Logger({name: "Note12TET", minLevel: Settings.minLogLevel});

    public constructor()
    { }

    // Method inherited from Note<> generic interface
    // public setNoteData(noteData: Note12TETData): void
    // {
    //     this.mainNote = noteData;
    // }

    // Method inherited from Note<> generic interface
    public getFrequency(mainNote: Note12TET): number
    {
        // compute the number of offset semitones relative to A4 note
        const semitonesOffset: number = (mainNote.octaves - Constants.a4Octaves) * 12 +
                                        mainNote.semitones - Constants.a4Semitones +
                                        mainNote.cents / 100.0;

        // recompute frequency based on semitones offset from A4 note
        const freq = Constants.a4Freq * 2.0**(semitonesOffset / 12.0);

        Note12TETUtils.logger.debug(`getFrequency(${mainNote.toString()}), freq: ${freq}`);

        return freq;
    }

    // Method inherited from Note<> generic interface
    getFrequencyWithOffset(mainNote: Note12TET, offsetNote: Note12TET): number
    {
        // compute the number of offset semitones relative to A4 note
        const semitonesOffset: number = (mainNote.octaves + offsetNote.octaves - Constants.a4Octaves) * 12 +
                                        mainNote.semitones + offsetNote.semitones - Constants.a4Semitones +
                                        (mainNote.cents + offsetNote.cents) / 100.0;

        // recompute frequency based on semitones offset from A4 note
        const freq = Constants.a4Freq * 2.0**(semitonesOffset / 12.0);

        Note12TETUtils.logger.debug(`getFrequencyWithOffset(${mainNote.toString()}, ${offsetNote.toString()}): freq: ${freq}`);

        return freq;
    }

    // Method inherited from Note<> generic interface
    // converts 12-TET note to a MIDI note number
    public getMidiNoteNumber(mainNote: Note12TET): number
    {
        return (Constants.a4MidiNoteNumber - 9) - mainNote.octaves * 12 + mainNote.semitones;
    }

    // Extra method, not found in Note<> generic interface, it's added in case it might be usefull
    public setFromMidiNoteNumber(mainNote: Note12TET, midiNoteNumber: number): boolean
    {
        if (Settings.minMidiNote <= midiNoteNumber && midiNoteNumber <= Settings.maxMidiNote)
        {
            Note12TETUtils.logger.debug(`setFromMidiNoteNumber(${midiNoteNumber})`);

            // compute octaves and semitones based on MIDI note number
            mainNote.octaves = Math.floor(midiNoteNumber / 12) - 1;
            mainNote.semitones = Math.floor(midiNoteNumber % 12);

            // a note value has changed, so recompute the internal frequency
            // this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TETUtils.logger.warn(`setFromMidiNoteNumber(): could not set note number to ${midiNoteNumber}` +
                                    ` because value is outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }
}