import { Settings } from "../../../../constants/settings";
import { NoiseOscillator } from "./noise-oscillator";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export class WhiteNoiseOscillator extends NoiseOscillator
{
    private static readonly noiseLogger: Logger<ILogObj> = new Logger({name: "WhiteNoiseOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        super(audioContext);
    }

    public override fillNoiseBuffer(bufferData: Float32Array): void
    {
        WhiteNoiseOscillator.noiseLogger.debug("fillNoiseBuffer()");

        // for (let i = 0; i < this.noiseBuffer.length; i++)
        for (let i = 0; i < bufferData.length; i++)
        {
            bufferData[i] = Math.random() * 2 - 1;
        }
    }
}