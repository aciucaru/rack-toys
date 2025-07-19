/* This is an interface used to symbolize any musical note system.
** Instances of implementations of this interface are bassically the actual notes,
** they contain the information required to describe a note, in a particular musicale note system.
** For example, for 12-TET musical note system, the NoteData would contain: octaves, semitones, cents. */
export interface Note
{
    equals(otherNote: Note): boolean;
}

export interface NoteUtils<N extends Note>
{
    // Computes and returns the frequency of the 'main note'
    getFrequency(mainNote: N): number;

    // Computes and returns the combined frequency of the 'main note' and another 'offset note'
    getFrequencyWithOffset(mainNote: N, offsetNote: N): number;

    // Computes and returns the MIDI number associated with the 'main note'
    getMidiNoteNumber(mainNote: N): number;
}