export class Settings
{
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

    // settings for BaseSource:
    public static readonly baseSourceDefaultGain = 1.0;

    // settings for oscillators: ********************************************************************
    public static readonly minOscGain = 0.0;
    public static readonly maxOscGain = 1.0;
    public static readonly defaultOscGain = 1.0;

    public static readonly minOscOctavesOffset = -2;
    public static readonly maxOscOctavesOffset = 2;
    public static readonly defaultOscOctavesOffset = 0;

    // limits for sequencer beats (steps)
    public static readonly minOscBeatOctavesOffset = -1; 
    public static readonly maxOscBeatOctavesOffset = 1;
    public static readonly defaultOscBeatOctavesOffset = 0;

    public static readonly minOscSemitonesOffset = -12; // 12 semitones = 1 octave
    public static readonly maxOscSemitonesOffset = 12;
    public static readonly defaultOscSemitonesOffset = 0;

    // limits for sequencer beats (steps)
    public static readonly minOscBeatSemitonesOffset = -12; // 12 semitones = 1 octave
    public static readonly maxOscBeatSemitonesOffset = 13;
    public static readonly defaultOscBeatSemitonesOffset = 0;

    public static readonly minOscCentsOffset = -100; // 100 cents = 1 semitone
    public static readonly maxOscCentsOffset = 100;
    public static readonly defaultOscCentsOffset = 0;

    // public static readonly oscUnisonCount = 7; // the number of unison oscillators (including the main one)
    public static readonly minOscUnisonCount = 1; // the minimum should always be 1 (1 means no unison, no extra detuned oscillators)
    public static readonly maxOscUnisonCount = 7;

    public static readonly minOscUnisonCentsDetune = 0;
    public static readonly maxOscUnisonCentsDetune = 100;
    public static readonly defaultOscUnisonCentsDetune = 0;

    public static readonly minOscUnisonBlend = 0.0; // 0.0 only the main oscillator is audible
    public static readonly maxOscUnisonBlend = 1.0; // only the unison oscillators are audible
    public static readonly defaultOscUnisonBlend = 0.0; // only main oscillator is audible

    public static readonly minOscPulseWidth = 0.0;
    public static readonly maxOscPulseWidth = 1.0;
    public static readonly defaultOscPulseWidth = 0.5; // 50%: square

    public static readonly minOscFreqModulation = -400.0; // -400 Hz
    public static readonly maxOscFreqModulation = 400.0; // 400 Hz
    public static readonly defaultOscFreqModulation = 0.0;

    // noise oscillator settings
    public static readonly minNoiseKeyTrackingLevel = 0; // 0%, no key tracking
    public static readonly maxNoiseKeyTrackingLevel = 0.8; // 80% max. key tracking (seems the best compromise)
    public static readonly defaultNoiseKeyTrackingLevel = 0; // default is no key tracking


    /* settings for InputOutputBaseAudioNode *****************************************************************/
    public static readonly inputGain = 1.0;
    public static readonly outputGain = 1.0;


    /* settings for oscillators mixer ****************************************************************
    ** these settings refere to the gain of a single oscillator that is part of the mixer */
    public static readonly minMixerOscGain = 0.0;
    public static readonly maxMixerOscGain = 1.0;
    public static readonly defaultMixerOscGain = 1.0;

    /* Each voice has the same number of oscillators, and the mixer stores those oscillators in an array.
    ** This is why we need the indexes coresponding to each oscillator. */
    public static readonly mixerOsc1Index = 0;
    public static readonly mixerOsc2Index = 1;
    public static readonly mixerSubOscIndex = 2;
    public static readonly mixerNoiseOscIndex = 3;


    // settings for the filter: **********************************************************************
    // cutoff frequency, in Hz
    public static readonly minFilterCutoffFreq = 100.0;
    public static readonly maxFilterCutoffFreq = 6000.0;
    public static readonly defaultFilterCutoffFreq = 6000.0;

    // resonance
    // the resonance is obtained through the Q factor, so it has the same limits as Q factor below
    public static readonly minFilterResonance = 0.0001;
    public static readonly maxFilterResonance = 50.0;
    public static readonly defaultFilterResonance = 1.0;

    /* envelope amount: the envelope amount is not a percentage, it's an absolute value of the same unit type
    ** as the cuttof frequency (Hz);
    ** the envelope will get added to the cutoff frequency, but the envelope amount can also have negative values, in
    ** this case the envelope is upside down, and reduces the cutoff frequency while modulating; */
    public static readonly minFilterEnvelopeAmount = -4800; // -4800 cents = -4 octaves
    public static readonly maxFilterEnvelopeAmount = 4800; // 4800 cents = 4 octaves
    public static readonly defaultFilterEnvelopeAmount = 0.0;

    public static readonly minFilterLfoAmount = -2400; // -2400 cents = -2 octaves
    public static readonly maxFilterLfoAmount = 2400; // 2400 cents = 2 octaves
    public static readonly defaultFilterLfoAmount = 0.0;

    // key tracking amount
    public static readonly minFilterKeyTrackingAmount = 0.0;
    public static readonly maxFilterKeyTrackingAmount = 100.0;
    public static readonly defaultFilterKeyTrackingAmount = 0.0;

    // frequency detune, in cents
    public static readonly minFilterDetune = -100;
    public static readonly maxFilterDetune = 100; // 100 cents = 1 semitone
    public static readonly defaultFilterDetune = 0;

    // Q factor, no units
    public static readonly minFilterQFactor = 0.0001;
    public static readonly maxFilterQFactor = 50;
    public static readonly defaultFilterQFactor = 1.0;

    // gain, in dB
    public static readonly minFilterGain = -40.0;
    public static readonly maxFilterGain = 40.0;
    public static readonly defaultFilterGain = 0.0;


    // settings for ADSR envelope: *******************************************************************
    /* the time settings (attack, decay, release) and the sustain level are all the same,
    ** regardless what parameter the ADSR envelope is suposed to modulate */
    public static readonly minAdsrAttackDuration = 0.0; // 0 seconds
    public static readonly maxAdsrAttackDuration = 8.0; // 8 seconds
    public static readonly defaultAdsrAttackDuration = 0.01; // 10 miliseconds
    
    public static readonly minAdsrDecayDuration = 0.0; // 0 seconds
    public static readonly maxAdsrDecayDuration = 8.0; // 8 seconds
    public static readonly defaultAdsrDecayDuration = 0.3; // 300 miliseconds

    public static readonly minAdsrSustainLevel = 0.0001; // almost 0%, exponential ramp does not allow 0
    public static readonly maxAdsrSustainLevel = 1.0; // 100%, the full value of the modulated parameter
    public static readonly defaultAdsrSustainLevel = 0.5; // 50%

    public static readonly adsrSafetyDuration = 0.01; // 10 milisec

    public static readonly minAdsrReleaseDuration = Settings.adsrSafetyDuration + 0.01; // 10 + 10 miliseconds
    public static readonly maxAdsrReleaseDuration = 8.0; // 8 seconds
    public static readonly defaultAdsrReleaseDuration = 1.0; // 1 second

    public static readonly adsrOffLevel = 0.0; // 0%, should completely turn off the ADSR envelope
    public static readonly adsrOnLevel = 1.0; // 100%, the full value of the modulated parameter

    // ADSR defaults for cutoff filter:
    public static readonly defaultAdsrFilterAttackDuration = 0.0; // 0 seconds
    public static readonly defaultAdsrFilterDecayDuration = 0.0; // 0 seconds
    public static readonly defaultAdsrFilterSustainLevel = 1.0; // 100%
    public static readonly defaultAdsrFilterReleaseDuration = 0.0; // 0 seconds

    // ADSR defaults for voice:
    public static readonly defaultAdsrVoiceAttackDuration = 0.01; // 10 miliseconds
    public static readonly defaultAdsrVoiceDecayDuration = 1.0; // 1 second
    public static readonly defaultAdsrVoiceSustainLevel = 0.8; // 80%
    public static readonly defaultAdsrVoiceReleaseDuration = 1.0; // 1 second


    // settings for MulltipleInputsNode: *******************************************************************************
    public static readonly multipleInputsMinGain = 0.0;
    public static readonly multipleInputsMaxGain = 1.0;
    public static readonly multipleInputsDefaultGain = 0.0;


    // settings for LFO: *******************************************************************************
    /* the LFO oscillator plus ConstantNode will give values in range (0, 2), so the min. gain is 0 and 
    ** the max gain is 0.5, in order to obtain values in the range (0, 1) */
    public static readonly lfoGainChangeTimeOffset = 0.02; // 20 milisec

    public static readonly minLfoGain = 0.0;
    public static readonly maxLfoGain = 1; 
    public static readonly defaultLfoGain = 0.0;

    public static readonly minLfoLowAbsoluteFrequency = 0.1;
    public static readonly maxLfoLowAbsoluteFrequency = 5.0;
    public static readonly defaultLfoLowAbsoluteFrequency = 1.0;

    public static readonly minLfoMidAbsoluteFrequency = 5.0;
    public static readonly maxLfoMidAbsoluteFrequency = 50.0;
    public static readonly defaultLfoMidAbsoluteFrequency = 5.0;

    public static readonly minLfoHighAbsoluteFrequency = 50.0;
    public static readonly maxLfoHighAbsoluteFrequency = 2000.0;
    public static readonly defaultLfoHighAbsoluteFrequency = 50.0;

    // settings for shareable LFO
    public static readonly shareableLfoDisabledGain = 0.0;
    public static readonly shareableLfoEnabledGain = 1.0; 

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

    // settings for voice *******************************************************************************
    public static readonly minVoiceGain = 0.0;
    public static readonly maxVoiceGain = 1.0;
    public static readonly defaultVoiceGain = 0.5;


    // settings for arpegiator **************************************************************************
    public static readonly minArpegiatorKeys = 1;
    public static readonly maxArpegiatorKeys = 4;
    public static readonly defaultArpegiatorKeys = 1;

    public static readonly minArpegiatorTempo = 20;
    public static readonly maxArpegiatorTempo = 300;
    public static readonly defaultArpegiatorTempo = 120;

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
    public static readonly minArpegiatorClockExponent = -6; // 2^(-6) = 1/64
    public static readonly maxArpegiatorClockExponent = 3; // 2^3 = 8
    public static readonly defaultArpegiatorClockExponent = 0; // 2^0 = 1

    public static readonly minArpegiatorOctaves = 1;
    public static readonly maxArpegiatorOctaves = 4;
    public static readonly defaultArpegiatorOctaves = 1;


    // settings for sequencer ****************************************************************************
    public static readonly minSequencerSteps = 0;
    public static readonly maxSequencerSteps = 16;
    public static readonly defaultSequencerSteps = 16;

    public static readonly notesPerSequencerStep = 2 * 12 + 1; // 2 octaves
    /* the note (semitone), between 0 and 'notesPerSequencerStep', which is considered to represent zero offset
    ** (e.g the middle note). Above this note, the semitone offset is positive and, below this note, the offset is negative. */
    public static readonly middleSemitone = 12;

    public static readonly minSequencerTempo = 20;
    public static readonly maxSequencerTempo = 200;
    public static readonly defaultSequencerTempo = 120;

    /* Settings for the multiplier/divider of the tempo;
    ** The multiplier/divider of the tempo is expressed as exponents, where the base is 2.
    ** For example:
    ** - an exponent of 0 means a multiplier of 2^0 = 1 (no multiplication/change of the tempo)
    ** - an exponent of -1 means a multiplier of 2^(-1) = 0.5, so it's actually a divider and the tempo
    **   will be half as samll
    ** - an exponent of 1 means amultiplier of 2^1 = 2, so the tempo is doubled */ 
    public static readonly minSequencerTempoMultiplierExponent = -3;
    public static readonly maxSequencerTempoMultiplierExponent = 3;
    public static readonly defaultSequencerTempoMultiplierExponent = 0;

    public static readonly minSequencerOctaves = 0;
    public static readonly maxSequencerOctaves = 2;
    public static readonly defaultSequencerOctaves = 0;


    // general settings for effects ************************************************************************
    public static readonly minEffectOnOffGain = 0.0; // 0% - off
    public static readonly maxEffectOnOffGain = 1.0; // 100% - on
    public static readonly defaultEffectOnOffGain = 0.0; // 0% - off

    public static readonly minEffectWetDryGain = 0.0; // 0% - no effect (dry)
    public static readonly maxEffectWetDryGain = 1.0; // 100% - full effect (wet)
    public static readonly defaultEffectWetDryGain = 0.5; // 50% - the effect is contributing by 50% to the sound

    // settings for delay effect ***************************************************************************
    public static readonly minDelayTime = 0.0; // 0 seconds
    public static readonly maxDelayTime = 2.0; // 2 seconds
    public static readonly defaultDelayTime = 0.0; // 0 seconds

    public static readonly minDelayFeedback = 0.0; // 0%
    public static readonly maxDelayFeedback = 0.9; // 90%
    public static readonly defaultDelayFeedback = 0.0; // 0%

    // settings for distortion effect ***********************************************************************
    // public static readonly minDistortionAmount = 0.0;
    // public static readonly maxDistortionAmount = 400.0;
    // public static readonly defaultDistortionAmount = 50.0;

    public static readonly defaultDistortionInputGain = 1.0; // the input is audible 100%
    public static readonly defaultDistortionEffectGain = 0.0; // the effect is not audible at all

    public static readonly minDistortionAmount = 0.0;
    public static readonly maxDistortionAmount = 20.0;
    public static readonly defaultDistortionAmount = 10.0;

    public static readonly minDistortionCurveAngle = 1.0; // 1 deg
    public static readonly maxDistortionCurveAngle = 90.0; // 90 deg
    public static readonly defaultDistortionCurveAngle = 20.0; // 20 deg

    // public static readonly minDistortionCurveConstantValue = 0.0;
    // public static readonly maxDistortionCurveConstantValue = 20.0;
    // public static readonly defaultDistortionCurveConstantValue = Math.PI;

    public static readonly minDistortionCurveConstantValue = 0.01;
    public static readonly maxDistortionCurveConstantValue = Math.PI / 4.0;
    public static readonly defaultDistortionCurveConstantValue = 0.01;

    // settings for reverb effect ***********************************************************************
    public static readonly minReverbDecayRate = 0.0;
    public static readonly maxReverbDecayRate = 4.0;
    public static readonly defaultReverbDecayRate = 1.0;

    // settings for compressor effect ***********************************************************************
    public static readonly minCompressorThreshold = -100.0;
    public static readonly maxCompressorThreshold = 0.0;
    public static readonly defaultCompressorThreshold = -24.0;

    public static readonly minCompressorKnee = 0.0;
    public static readonly maxCompressorKnee = 40.0;
    public static readonly defaultCompressorKnee = 30.0;

    public static readonly minCompressorRatio = 1.0;
    public static readonly maxCompressorRatio = 20.0;
    public static readonly defaultCompressorRatio = 12.0;

    public static readonly minCompressorAttack = 0.0;
    public static readonly maxCompressorAttack = 1.0;
    public static readonly defaultCompressorAttack = 0.003;

    public static readonly minCompressorRelease = 0.0;
    public static readonly maxCompressorRelease = 1.0;
    public static readonly defaultCompressorRelease = 0.25;

    // settings for logging
    public static readonly minLogLevel = 0; // 0: log everything; 7: log nothing (max level is 6)
}