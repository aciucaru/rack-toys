import { Settings } from "../../../../constants/settings";
import { NoiseOscillator } from "./noise-oscillator";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";


export class BrownNoiseOscillator extends NoiseOscillator
{
    private static readonly noiseLogger: Logger<ILogObj> = new Logger({name: "BrownNoiseOscillator", minLevel: Settings.minLogLevel });

    constructor(audioContext: AudioContext)
    {
        super(audioContext);
    }

    public override fillNoiseBuffer(bufferData: Float32Array): void
    {
        BrownNoiseOscillator.noiseLogger.debug("fillNoiseBuffer()");

        let lastOut = 0.0;
        // for (let i = 0; i < this.noiseBuffer.length; i++)
        for (let i = 0; i < bufferData.length; i++)
        {
            const white = Math.random() * 2 - 1;

            bufferData[i] = (lastOut + 0.02 * white) / 1.02;

            lastOut = bufferData[i];
            
            bufferData[i] *= 3.5;
        }
    }
}