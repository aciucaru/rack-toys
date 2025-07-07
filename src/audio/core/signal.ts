import type { Note12TET } from "../note/note";

/* Represents the concept of a signal which has a frequency. */
export interface FrequencyBasedSignal
{
    /* Because an oscillator class that extends this abstract class could be arbitrarily complex, a call
    ** to this class-specific method is needed, whenever the frequency changes.
    **
    ** This method sets the frequency of the oscillator. If the oscillator is made of multiple oscillators,
    ** then the implementation of this method could update the frequency of all its oscillators. */
    setFrequency(frequency: number): boolean;
}

/* Represents the concept of a signal which has a pulse width (such as a square wave). */
export interface NoteBasedSignal
{
    /* this method is specific to every type of oscillator class that extends this class, because an oscillator
    ** class that extends this abstract class could be arbitrarily complex, a call to this class-specific method
    ** is needed, whenever the note changes;
    **
    ** this method sets the note of a signal (most of the time the signal is an oscillator) */
    setNote(note: Note12TET): boolean;
}

/* Represents the concept of a signal which has a pulse width (such as a square wave). */
export interface PulseBasedSignal
{
    /* this method is specific to every type of oscillator class that extends this class, because an oscillator
    ** class that extends this abstract class could be arbitrarily complex, a call to this class-specific method
    ** is needed, whenever the pulse width changes;
    **
    ** this meethod sets the pulse width of the internal pulse oscillator (it is assumed that the extending class
    ** is a pulse-style oscillator or contains a pulse-style oscillator internally) */
    setPulseWidth(pulseWidth: number): boolean;
}