import type { Emitter } from "./emitter";
import type { Receiver } from "./receiver";

export interface EnvelopeMultiplier extends Emitter, Receiver
{
    // Must start the 'Attack' phase
    triggerAttack(): void;

    // Must start the 'Release' phase
    triggerRelease(): void;

    /* Must return the Web Audio API time when the 'Release' phase finishes completely (basically when there should be
    ** no more sound).
    ** This time should be computed right after the 'triggerRelease()' method of this interface. */
    getFinsihTime(): number;
}