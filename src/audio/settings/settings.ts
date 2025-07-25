export class ArpegiatorSettings
{
    // settings for arpegiator **************************************************************************
    public static readonly minKeys = 1;
    public static readonly maxKeys = 4;
    public static readonly defaultKeys = 1;

    public static readonly minTempo = 20;
    public static readonly maxTempo = 300;
    public static readonly defaultTempo = 120;

    /* the clock represents how long a note lasts, a clock of 1 means the note lasts 1 beat (1 step),
    ** a clock of 1/2 means a note last half of 1 beat, meaning that there will be 2 notes in 1 step,
    ** a clock of 2 means it takes 2 beats (2 steps) to play a single note;
    ** the clock is expressed as a factor and the factor is always a power of 2, so it's expressed as
    ** exponents, for example:
    ** - clock exponent value = 2: 2^2 = 4, the duration of a note is 4 beats (4 steps), so it takes 4 beats to
    **   hear one note
    ** - clock exponent value = -2: 2^(-2) = 1/4, the duration of a note is 1/4 beats, so there will be 4 notes in
    **   every single beat
    ** - clock exponent value = 0: 2^0 = 1/1, the duration of a note is axactly one beat, so there will be 1 note every beat  */
    public static readonly minClockExponent = -6; // 2^(-6) = 1/64
    public static readonly maxClockExponent = 3; // 2^3 = 8
    public static readonly defaultClockExponent = 0; // 2^0 = 1

    public static readonly minOctaves = 1;
    public static readonly maxOctaves = 4;
    public static readonly defaultOctaves = 1;
}

export class SequencerSettings
{
    // settings for sequencer ****************************************************************************
    public static readonly minSteps = 0;
    public static readonly maxSteps = 16;
    public static readonly defaultSteps = 16;

    public static readonly notesPerSequencerStep = 2 * 12 + 1; // 2 octaves
    /* the note (semitone), between 0 and 'notesPerSequencerStep', which is considered to represent zero offset
    ** (e.g the middle note). Above this note, the semitone offset is positive and, below this note, the offset is negative. */
    public static readonly middleSemitone = 12;

    public static readonly minTempo = 20;
    public static readonly maxTempo = 200;
    public static readonly defaultTempo = 120;

    /* Settings for the multiplier/divider of the tempo;
    ** The multiplier/divider of the tempo is expressed as exponents, where the base is 2.
    ** For example:
    ** - an exponent of 0 means a multiplier of 2^0 = 1 (no multiplication/change of the tempo)
    ** - an exponent of -1 means a multiplier of 2^(-1) = 0.5, so it's actually a divider and the tempo
    **   will be half as samll
    ** - an exponent of 1 means amultiplier of 2^1 = 2, so the tempo is doubled */ 
    public static readonly minTempoMultiplierExponent = -3;
    public static readonly maxTempoMultiplierExponent = 3;
    public static readonly defaultTempoMultiplierExponent = 0;

    public static readonly minOctaves = 0;
    public static readonly maxOctaves = 2;
    public static readonly defaultOctaves = 0;
}

export class EffectSettings
{
    // general settings for effects ************************************************************************
    public static readonly minOnOffGain = 0.0; // 0% - off
    public static readonly maxOnOffGain = 1.0; // 100% - on
    public static readonly defaultOnOffGain = 0.0; // 0% - off

    public static readonly minWetDryGain = 0.0; // 0% - no effect (dry)
    public static readonly maxWetDryGain = 1.0; // 100% - full effect (wet)
    public static readonly defaultWetDryGain = 0.5; // 50% - the effect is contributing by 50% to the sound
}

export class DelayEffectSettings
{
    // settings for delay effect ***************************************************************************
    public static readonly minTime = 0.0; // 0 seconds
    public static readonly maxTime = 2.0; // 2 seconds
    public static readonly defaultTime = 0.0; // 0 seconds

    public static readonly minFeedback = 0.0; // 0%
    public static readonly maxFeedback = 0.9; // 90%
    public static readonly defaultFeedback = 0.0; // 0%
}

export class DistortionEffectSettings
{
    // settings for distortion effect ***********************************************************************
    // public static readonly minDistortionAmount = 0.0;
    // public static readonly maxDistortionAmount = 400.0;
    // public static readonly defaultDistortionAmount = 50.0;

    public static readonly defaultInputGain = 1.0; // the input is audible 100%
    public static readonly defaultEffectGain = 0.0; // the effect is not audible at all

    public static readonly minAmount = 0.0;
    public static readonly maxAmount = 20.0;
    public static readonly defaultAmount = 10.0;

    public static readonly minCurveAngle = 1.0; // 1 deg
    public static readonly maxCurveAngle = 90.0; // 90 deg
    public static readonly defaultCurveAngle = 20.0; // 20 deg

    // public static readonly minDistortionCurveConstantValue = 0.0;
    // public static readonly maxDistortionCurveConstantValue = 20.0;
    // public static readonly defaultDistortionCurveConstantValue = Math.PI;

    public static readonly minCurveConstantValue = 0.01;
    public static readonly maxCurveConstantValue = Math.PI / 4.0;
    public static readonly defaultCurveConstantValue = 0.01;
}

export class CompresssorEffectSettings
{
    // settings for compressor effect ***********************************************************************
    public static readonly minThreshold = -100.0;
    public static readonly maxThreshold = 0.0;
    public static readonly defaultThreshold = -24.0;

    public static readonly minKnee = 0.0;
    public static readonly maxKnee = 40.0;
    public static readonly defaultKnee = 30.0;

    public static readonly minRatio = 1.0;
    public static readonly maxRatio = 20.0;
    public static readonly defaultRatio = 12.0;

    public static readonly minAttack = 0.0;
    public static readonly maxAttack = 1.0;
    public static readonly defaultAttack = 0.003;

    public static readonly minRelease = 0.0;
    public static readonly maxRelease = 1.0;
    public static readonly defaultRelease = 0.25;
}

export class ReverbEffectSettings
{
    // settings for reverb effect ***********************************************************************
    public static readonly minDecayRate = 0.0;
    public static readonly maxDecayRate = 4.0;
    public static readonly defaultDecayRate = 1.0;
}