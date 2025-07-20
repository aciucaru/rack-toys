import type { Emitter } from "./emitter";
import type { Receiver } from "./receiver";

export interface EnvelopeMultiplier extends Emitter, Receiver
{
    // Must start the 'Attack' phase
    triggerAttack(): void;

    // Must start the 'Release' phase
    triggerRelease(): void;

    // Must return the duration of the 'Release' phase (not the time at which it ends, but just teh duration).
    // This duration should be computed right after the 'triggerRelease()' method
    getEstimatedReleaseDuration(): number;
}