import React from "react";
import styles from './AnalogSynth.module.css';

import { Settings } from "../../constants/settings";
import { testPolySynth1 } from "../../audio/synth/virtual-analog/test-synth1";
// import * as oscCallbacks from "../../../callbacks/oscillators-callbacks";
// import * as mixerCallbacks from "../../../callbacks/mixer-callbacks";

import { Knob } from "../control/Knob";
import { ToggleButton } from "../control/ToggleButton";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

export function AnalogSynth()
{
    const logger: Logger<ILogObj> = new Logger({name: "AnalogSynth", minLevel: Settings.minLogLevel });

    // oscillator 1 callbacks *********************************************************************
    const onOsc1TriangleSelect = (isToggled: boolean) =>
    {
        logger.debug("onTriangleSelect(): triangle shape selected");
        // monoSynth.getVoice().getMultiShapeOscillator1().toggleTriangleShape();
        // testMonoSynth1.getMultiShapeOscillator1().toggleTriangleShape();
    };

    const onOsc1SawSelect = (isToggled: boolean) =>
    {
        logger.debug("onSawSelect(): saw shape selected");
        // monoSynth.getVoice().getMultiShapeOscillator1().toggleSawShape();
    };

    const onOsc1PulseSelect = (isToggled: boolean) =>
    {
        logger.debug("onPulseSelect(): square shape selected");
        // monoSynth.getVoice().getMultiShapeOscillator1().togglePulseShape();
    };

    const onOsc1OctavesOffsetChange = (octavesOffset: number) =>
    {
        logger.debug(`onOctavesOffsetChange(): new value: ${octavesOffset}`);
        // monoSynth.getVoice().getMultiShapeOscillator1().setOctavesOffset(octavesOffset);
    };

    const onOsc1SemitonesOffsetChange = (semitonesOffset: number) =>
    {
        logger.debug(`onSemitonesOffsetChange(): new value: ${semitonesOffset}`);
        // monoSynth.getVoice().getMultiShapeOscillator1().setSemitonesOffset(semitonesOffset);
    };

    const onOsc1CentsOffsetChange = (centsOffset: number) =>
    {
        logger.debug(`onCentsOffsetChange(): new value: ${centsOffset}`);
        // monoSynth.getVoice().getMultiShapeOscillator1().setCentsOffset(centsOffset);
    };

    const onOsc1DetuneChange = (unisonCentsDetune: number) =>
    {
        logger.debug(`onDetuneChange(): new value: ${unisonCentsDetune}`);
        // monoSynth.getVoice().getMultiShapeOscillator1().setUnisonDetune(unisonCentsDetune); 
    };

    const onOsc1PulseWidthChange = (pulseWidth: number) =>
    {
        logger.debug(`onPulseWidthChange(): new value: ${pulseWidth}`);
        // testPolySynth1.getOscillator().setPulseWidth(pulseWidth);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.border} style={{ gridColumn: "1 / 6", gridRow: "1 / 8" }}></div>
            <div className={`${styles.title} ${styles.stretchedItem} ${styles.unselectable}`}
                style={{ gridColumn: "1 / 6", gridRow: "1 / 2" }}>
                OSC 1
            </div>

            <div style={{ gridColumn: "1 / 2", gridRow: "5 / 6" }}>
                <Knob
                    label="Octave"
                    minValue={Settings.minOscOctavesOffset}
                    maxValue={Settings.maxOscOctavesOffset}
                    initialValue={0}
                    step={1}
                    decimals={0}
                    onValueChange={onOsc1OctavesOffsetChange}
                />
            </div>

            <div style={{ gridColumn: "3 / 4", gridRow: "5 / 6" }}>
                <Knob
                    label="Semitones"
                    minValue={Settings.minOscSemitonesOffset}
                    maxValue={Settings.maxOscSemitonesOffset}
                    initialValue={0}
                    step={1}
                    decimals={0}
                    onValueChange={onOsc1SemitonesOffsetChange}
                />
            </div>

            <div style={{ gridColumn: "5 / 6", gridRow: "5 / 6" }}>
                <Knob
                    label="Cents"
                    minValue={Settings.minOscCentsOffset}
                    maxValue={Settings.maxOscCentsOffset}
                    initialValue={0}
                    step={1}
                    decimals={0}
                    onValueChange={onOsc1CentsOffsetChange}
                />
            </div>

            <div className={styles.toggleButtonsGroup} style={{ gridColumn: "1 / 2", gridRow: "7 / 8" }}>
                <div className={styles.waveformButtonIconGroup}>
                    <ToggleButton onToggleChange={onOsc1TriangleSelect} isToggled={true} />
                    <div className={`${styles.waveformIcon} ${styles.triangleIcon}`} />
                </div>
                <div className={styles.waveformButtonIconGroup}>
                    <ToggleButton onToggleChange={onOsc1SawSelect} />
                    <div className={`${styles.waveformIcon} ${styles.sawIcon}`} />
                </div>
                <div className={styles.waveformButtonIconGroup}>
                    <ToggleButton onToggleChange={onOsc1PulseSelect} />
                    <div className={`${styles.waveformIcon} ${styles.pulseIcon}`} />
                </div>
            </div>

            <div style={{ gridColumn: "3 / 4", gridRow: "7 / 8" }}>
                <Knob
                    label="PW"
                    minValue={Settings.minOscPulseWidth}
                    maxValue={Settings.maxOscPulseWidth}
                    initialValue={Settings.defaultOscPulseWidth}
                    displayFactor={100}
                    step={0.01}
                    decimals={0}
                    onValueChange={onOsc1PulseWidthChange}
                />
            </div>
        </div>
    );
}
