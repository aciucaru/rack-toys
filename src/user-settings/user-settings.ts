export class UserSettings
{
    // setting for oscillators and audio output:
    public static readonly sampleRate = 48000; // = 2^7 * 3 * 5^3
    public static readonly inversesampleRate = 1.0 / UserSettings.sampleRate;
    public static readonly samplePeriod = 1.0 / UserSettings.sampleRate;
    public static readonly audioFramesPerBuffer = 64; // paFramesPerBufferUnspecified used instead
    public static readonly playSeconds = 5;
    public static readonly additiveSineOscillatorCount = 16;

    // settings for drawing oscilloscope:
    // frame rate of oscilloscope
    public static readonly guiFps = 25;

    // the total number of sound samples a single GUI Oscilloscope frame has
    public static readonly samplesPerGuiFrame = UserSettings.sampleRate / UserSettings.guiFps; // = 2^7 * 3 * 5
    
    // the number of audio buffers that need to be processed before drawing one GUI frame
    // a single audio buffer has audioFramesPerBuffer elements
    public static readonly audioBuffersPerGuiFrame =
                            UserSettings.samplesPerGuiFrame / UserSettings.audioFramesPerBuffer; // = 2 * 3 * 5 = 30
}