import { Constants } from "../../constants/constants";
import { Settings } from "../../constants/settings";
import type { Note } from "../core/note";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


// Freq
// 3.85846329106347
// 33488.0723584766

export class Note12TET implements Note
{
    // main parameters of a note: octaves and semitones
    private octaves: number = 4;
    private semitones: number = 0; // note C, the first note of an octave

    // offset parameters for oscillators:
    private octavesOffset: number = 0;
    private semitonesOffset: number = 0;
    private centsOffset: number = 0;

    // offset parameters for sequencer beats (steps)
    private octavesBeatOffset: number = 0;
    private semitonesBeatOffset: number = 0;

    // the final frequency of the note
    private freq: number = 440.0; // default value, corresponds to 4 'octaves' and 9 'semitones'

    private static readonly logger: Logger<ILogObj> = new Logger({name: "Note", minLevel: Settings.minLogLevel});

    public constructor(octaves: number, semitones: number)
    {
        if (Settings.minOctaves <= octaves && octaves <= Settings.maxOctaves)
            this.octaves = octaves;
        else
            Note12TET.logger.warn(`constructor(): 'octaves' argument of value ${octaves} is outside bounds`);

        if (Settings.minSemitones <= semitones && semitones <= Settings.maxSemitones)
            this.semitones = semitones;
        else
            Note12TET.logger.warn(`constructor(): 'semitones' argument of value ${semitones} is outside bounds`);

        this.recomputeFreq();
    }

    public getFrequency(): number { return this.freq; }

    public setNote(note: Note12TET): boolean
    {
        if (note)
        {
            Note12TET.logger.debug(`setNote(${note})`);

            this.octaves = note.octaves;
            this.semitones = note.semitones;
        
            this.octavesOffset = note.octavesOffset;
            this.semitonesOffset = note.semitonesOffset;
            this.centsOffset = note.centsOffset;

            return true; // change was succesfull
        }
        else
        {
            Note12TET.logger.warn(`setNote(): note is null or undefined`);
            return false; // change was not succesfull
        }
    }

    // sets the note by both octaves and semitones; it's the main method to set a note
    public setOctavesAndSemitones(octaves: number, semitones: number): boolean
    {
        Note12TET.logger.debug(`setNote(octaves = ${octaves}, semitones = ${semitones})`);

        const result1 = this.setOctaves(octaves);
        if (!result1)
            Note12TET.logger.warn(`setNote(): octaves outside bounds`);

        const result2 = this.setSemitones(semitones);
        if (!result2)
            Note12TET.logger.warn(`setNote(): semitones outside bounds`);

        return result1 && result2;
    }

    // sets octaves only, rarely used
    public setOctaves(octaves: number): boolean
    {
        if (Settings.minOctaves <= octaves && octaves <= Settings.maxOctaves)
        {
            Note12TET.logger.debug(`setOctaves(${octaves})`);

            this.octaves = octaves;
            
            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setOctaves(): could not set 'octaves' to ${octaves}` +
                                    ` because value is outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    // sets semitones only, rarely used
    public setSemitones(semitones: number): boolean
    {
        if (Settings.minSemitones <= semitones && semitones <= Settings.maxSemitones)
        {
            Note12TET.logger.debug(`setSemitones(${semitones})`);

            this.semitones = semitones;

            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setSemitones(): could not set 'semitones' to ${semitones}` +
                                    ` because value is outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    public setOctavesOffset(octavesOffset: number): boolean
    {
        if (Settings.minOscOctavesOffset <= octavesOffset && octavesOffset <= Settings.maxOscOctavesOffset)
        {
            Note12TET.logger.debug(`setOctavesOffset(${octavesOffset})`);

            // set the new value
            this.octavesOffset = octavesOffset;

            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setOctavesOffset(): could not set octaves offset to ${octavesOffset}` +
                            ` because it's outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    public setSemitonesOffset(semitonesOffset: number): boolean
    {
        if (Settings.minOscSemitonesOffset <= semitonesOffset && semitonesOffset <= Settings.maxOscSemitonesOffset)
        {
            Note12TET.logger.debug(`setSemitonesOffset(${semitonesOffset})`);

            // set the new value
            this.semitonesOffset = semitonesOffset;

            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setSemitonesOffset(): could not set semitones offset to ${semitonesOffset}` +
                            ` because it's outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    public setCentsOffset(centsOffset: number): boolean
    {
        if (Settings.minOscCentsOffset <= centsOffset && centsOffset <= Settings.maxOscCentsOffset)
        {
            Note12TET.logger.debug(`setCentsOffset(${centsOffset})`);

            // set the new value
            this.centsOffset = centsOffset;

            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setCentsOffset(): could not set cents offset to ${centsOffset}` +
            ` because it's outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    // offset method for sequencer steps (beats) octave offset
    public setBeatOctavesOffset(beatOctavesOffset: number): boolean
    {
        if (Settings.minOscBeatOctavesOffset <= beatOctavesOffset && beatOctavesOffset <= Settings.maxOscBeatOctavesOffset)
        {
            Note12TET.logger.debug(`setBeatOctavesOffset(${beatOctavesOffset})`);

            // set the new value
            this.octavesBeatOffset = beatOctavesOffset;

            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setBeatOctavesOffset(): could not set octaves offset to ${beatOctavesOffset}` +
                            ` because it's outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    public setBeatSemitonesOffset(beatSemitonesOffset: number): boolean
    {
        if (Settings.minOscBeatSemitonesOffset <= beatSemitonesOffset && beatSemitonesOffset <= Settings.maxOscBeatSemitonesOffset)
        {
            Note12TET.logger.debug(`setBeatSemitonesOffset(${beatSemitonesOffset})`);

            // set the new value
            this.semitonesBeatOffset = beatSemitonesOffset;

            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setBeatSemitonesOffset(): could not set semitones offset to ${beatSemitonesOffset}` +
                            ` because it's outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    public setFromMidiNoteNumber(midiNoteNumber: number): boolean
    {
        if (Settings.minMidiNote <= midiNoteNumber && midiNoteNumber <= Settings.maxMidiNote)
        {
            Note12TET.logger.debug(`setFromMidiNoteNumber(${midiNoteNumber})`);

            // compute octaves and semitones based on MIDI note number
            this.octaves = Math.floor(midiNoteNumber / 12) - 1;
            this.semitones = Math.floor(midiNoteNumber % 12);

            // a note value has changed, so recompute the internal frequency
            this.recomputeFreq();

            // the change was succesfull
            return true;
        }
        else
        {
            Note12TET.logger.warn(`setMidiNoteNumber(): could not set note number to ${midiNoteNumber}` +
                                    ` because value is outside bounds`);

            // the change was unsuccesfull
            return false;
        }
    }

    // converts 'octaves' and 'semitones' to a MIDI note number
    // does not take into account octave offset, semitone offset, cents offset, hertz offset
    public toMidiNoteNumber(): number
    {
        return (Constants.a4MidiNoteNumber - 9) - this.octaves * 12 + this.semitones;
    }

    // recalculate frequency based on octaves, semitones and all offsets
    private recomputeFreq(): void
    {
        // compute the number of offset semitones relative to A4 note
        const semitonesOffset: number = (this.octaves + this.octavesOffset + this.octavesBeatOffset - Constants.a4Octaves) * 12 +
                                        this.semitones + this.semitonesOffset + this.semitonesBeatOffset - Constants.a4Semitones +
                                        this.centsOffset / 100.0;

        // recompute frequency based on semitones offset from A4 note
        this.freq = Constants.a4Freq * 2.0**(semitonesOffset / 12.0);

        Note12TET.logger.debug(`recomputeFreq(): oct: ${this.octaves} oct offset: ${this.octavesOffset} st: ${this.semitones} st offset: ${this.semitonesOffset}` +
                            ` new freq: ${this.freq}`);
    }

    public getOctaves(): number { return this.octaves; }

    public getSemitones(): number { return this.semitones; }

    public getCents(): number { return this.centsOffset; }

    public getFreq(): number { return this.freq; }
}