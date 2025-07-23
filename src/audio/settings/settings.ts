export class OscillatorSettings
{
    // settings for oscillators: ********************************************************************
    public static readonly minGain = 0.0;
    public static readonly maxGain = 1.0;
    public static readonly defaultGain = 1.0;

    public static readonly minOctavesOffset = -2;
    public static readonly maxOctavesOffset = 2;
    public static readonly defaultOctavesOffset = 0;

    // public static readonly oscUnisonCount = 7; // the number of unison oscillators (including the main one)
    public static readonly minUnisonCount = 1; // the minimum should always be 1 (1 means no unison, no extra detuned oscillators)
    public static readonly maxUnisonCount = 7;

    public static readonly minUnisonCentsDetune = 0;
    public static readonly maxUnisonCentsDetune = 100;
    public static readonly defaultUnisonCentsDetune = 0;

    public static readonly minUnisonBlend = 0.0; // 0.0 only the main oscillator is audible
    public static readonly maxUnisonBlend = 1.0; // only the unison oscillators are audible
    public static readonly defaultUnisonBlend = 0.0; // only main oscillator is audible

    public static readonly minPulseWidth = 0.0;
    public static readonly maxPulseWidth = 1.0;
    public static readonly defaultPulseWidth = 0.5; // 50%: square

    public static readonly minFreqModulation = -400.0; // -400 Hz
    public static readonly maxFreqModulation = 400.0; // 400 Hz
    public static readonly defaultFreqModulation = 0.0;

    // noise oscillator settings
    public static readonly minNoiseKeyTrackingLevel = 0; // 0%, no key tracking
    public static readonly maxNoiseKeyTrackingLevel = 0.8; // 80% max. key tracking (seems the best compromise)
    public static readonly defaultNoiseKeyTrackingLevel = 0; // default is no key tracking


    // limits for sequencer beats (steps)
    public static readonly minBeatOctavesOffset = -1; 
    public static readonly maxBeatOctavesOffset = 1;
    public static readonly defaultBeatOctavesOffset = 0;

    public static readonly minSemitonesOffset = -12; // 12 semitones = 1 octave
    public static readonly maxSemitonesOffset = 12;
    public static readonly defaultSemitonesOffset = 0;

    // limits for sequencer beats (steps)
    public static readonly minBeatSemitonesOffset = -12; // 12 semitones = 1 octave
    public static readonly maxBeatSemitonesOffset = 13;
    public static readonly defaultBeatSemitonesOffset = 0;

    public static readonly minCentsOffset = -100; // 100 cents = 1 semitone
    public static readonly maxCentsOffset = 100;
    public static readonly defaultCentsOffset = 0;
}

export class MixerSettings
{
    /* settings for oscillators mixer ****************************************************************
    ** these settings refere to the gain of a single oscillator that is part of the mixer */
    public static readonly minOscGain = 0.0;
    public static readonly maxOscGain = 1.0;
    public static readonly defaultOscGain = 1.0;
}

export class FilterSettings
{
    // settings for the filter: **********************************************************************
    // cutoff frequency, in Hz
    public static readonly minCutoffFreq = 100.0;
    public static readonly maxCutoffFreq = 6000.0;
    public static readonly defaultCutoffFreq = 6000.0;

    // resonance
    // the resonance is obtained through the Q factor, so it has the same limits as Q factor below
    public static readonly minResonance = 0.0001;
    public static readonly maxResonance = 50.0;
    public static readonly defaultResonance = 1.0;

    /* envelope amount: the envelope amount is not a percentage, it's an absolute value of the same unit type
    ** as the cuttof frequency (Hz);
    ** the envelope will get added to the cutoff frequency, but the envelope amount can also have negative values, in
    ** this case the envelope is upside down, and reduces the cutoff frequency while modulating; */
    public static readonly minEnvelopeAmount = -4800; // -4800 cents = -4 octaves
    public static readonly maxEnvelopeAmount = 4800; // 4800 cents = 4 octaves
    public static readonly defaultEnvelopeAmount = 0.0;

    public static readonly minLfoAmount = -2400; // -2400 cents = -2 octaves
    public static readonly maxLfoAmount = 2400; // 2400 cents = 2 octaves
    public static readonly defaultLfoAmount = 0.0;

    // key tracking amount
    public static readonly minKeyTrackingAmount = 0.0;
    public static readonly maxKeyTrackingAmount = 100.0;
    public static readonly defaultKeyTrackingAmount = 0.0;

    // frequency detune, in cents
    public static readonly minDetune = -100;
    public static readonly maxDetune = 100; // 100 cents = 1 semitone
    public static readonly defaultDetune = 0;

    // Q factor, no units
    public static readonly minQFactor = 0.0001;
    public static readonly maxQFactor = 50;
    public static readonly defaultQFactor = 1.0;

    // gain, in dB
    public static readonly minGain = -40.0;
    public static readonly maxGain = 40.0;
    public static readonly defaultGain = 0.0;

}

export class AdsrSettings
{
    // settings for ADSR envelope: *******************************************************************
    /* the time settings (attack, decay, release) and the sustain level are all the same,
    ** regardless what parameter the ADSR envelope is suposed to modulate */
    public static readonly minAttackDuration = 0.0; // 0 seconds
    public static readonly maxAttackDuration = 8.0; // 8 seconds
    public static readonly defaultAttackDuration = 0.01; // 10 miliseconds
    
    public static readonly minDecayDuration = 0.0; // 0 seconds
    public static readonly maxDecayDuration = 8.0; // 8 seconds
    public static readonly defaultDecayDuration = 0.3; // 300 miliseconds

    public static readonly minSustainLevel = 0.0001; // almost 0%, exponential ramp does not allow 0
    public static readonly maxSustainLevel = 1.0; // 100%, the full value of the modulated parameter
    public static readonly defaultSustainLevel = 0.5; // 50%

    public static readonly safetyDuration = 0.01; // 10 milisec

    public static readonly minReleaseDuration = AdsrSettings.safetyDuration + 0.01; // 10 + 10 miliseconds
    public static readonly maxReleaseDuration = 8.0; // 8 seconds
    public static readonly defaultReleaseDuration = 1.0; // 1 second

    public static readonly offLevel = 0.0; // 0%, should completely turn off the ADSR envelope
    public static readonly onLevel = 1.0; // 100%, the full value of the modulated parameter

    // ADSR defaults for cutoff filter:
    public static readonly defaultFilterAttackDuration = 0.0; // 0 seconds
    public static readonly defaultFilterDecayDuration = 0.0; // 0 seconds
    public static readonly defaultFilterSustainLevel = 1.0; // 100%
    public static readonly defaultFilterReleaseDuration = 0.0; // 0 seconds

    // ADSR defaults for voice:
    public static readonly defaultVoiceAttackDuration = 0.01; // 10 miliseconds
    public static readonly defaultVoiceDecayDuration = 1.0; // 1 second
    public static readonly defaultVoiceSustainLevel = 0.8; // 80%
    public static readonly defaultVoiceReleaseDuration = 1.0; // 1 second
}

export class LfoSettings
{
    // settings for LFO: *******************************************************************************
    /* the LFO oscillator plus ConstantNode will give values in range (0, 2), so the min. gain is 0 and 
    ** the max gain is 0.5, in order to obtain values in the range (0, 1) */
    public static readonly gainChangeTimeOffset = 0.02; // 20 milisec

    public static readonly minGain = 0.0;
    public static readonly maxGain = 1; 
    public static readonly defaultGain = 0.0;

    public static readonly minLowAbsoluteFrequency = 0.1;
    public static readonly maxLowAbsoluteFrequency = 5.0;
    public static readonly defaultLowAbsoluteFrequency = 1.0;

    public static readonly minMidAbsoluteFrequency = 5.0;
    public static readonly maxMidAbsoluteFrequency = 50.0;
    public static readonly defaultMidAbsoluteFrequency = 5.0;

    public static readonly minHighAbsoluteFrequency = 50.0;
    public static readonly maxHighAbsoluteFrequency = 2000.0;
    public static readonly defaultHighAbsoluteFrequency = 50.0;

    // settings for shareable LFO
    public static readonly shareableDisabledGain = 0.0;
    public static readonly shareableEnabledGain = 1.0; 

    // settings for LFO Array: **************************************************************************
    // the total number of LFOs for one single voice of the synth
    public static readonly generalUseLfoPerVoiceCount = 5;

    public static readonly fmRingModulationLfoPerVoiceCount = 3;
    // the maximum number of simultaneos LFOs that can modulate a parameter
    // public static readonly lfoArrayModulatorsCount = 5;


    // settings for LFO manager: **************************************************************************
    public static readonly minLfoManagerModulationAmount = -1.0; // -100%
    public static readonly maxLfoManagerModulationAmount = 1.0; // 100%
    public static readonly defaultLfoManagerModulationAmount = 0.0; // 0%, no modulation

    public static readonly lfoManagerFreqLowerFixedRange = 400; // 400 Hz
    public static readonly lfoManagerFreqUpperFixedRange = 400; // 400 Hz
}

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

export class Settings
{
    // settings for BaseSource:
    public static readonly baseSourceDefaultGain = 1.0;

    /* settings for InputOutputBaseAudioNode *****************************************************************/
    public static readonly inputGain = 1.0;
    public static readonly outputGain = 1.0;

    // settings for MulltipleInputsNode: *******************************************************************************
    public static readonly multipleInputsMinGain = 0.0;
    public static readonly multipleInputsMaxGain = 1.0;
    public static readonly multipleInputsDefaultGain = 0.0;

    // settings for voice *******************************************************************************
    public static readonly minVoiceGain = 0.0;
    public static readonly maxVoiceGain = 1.0;
    public static readonly defaultVoiceGain = 0.5;

    // settings for logging
    public static readonly minLogLevel = 0; // 0: log everything; 7: log nothing (max level is 6)
}