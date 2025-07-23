import React, { useEffect, useRef, useState } from 'react';
import styles from './VerticalFader.module.css';

import { Logger } from 'tslog';
import { Settings } from '../../audio/settings/settings';



interface VerticalFaderProps
{
    label?: string; // the title above the knob
    minValue?: number; // the min. and max. absolute values the knob is supossed to set
    maxValue?: number; // the min. and max. absolute values the knob is supossed to set
    initialValue?: number; // the initial value the fader is set to
    displayFactor?: number; // a factor by which the stored value is multiplied; for display only
    step?: number; // the step with which the fader value increments/decrements
    decimals?: number; // how many decimals should the displayed value have
    showValue?: boolean; // if the numeric value should be displayed or not; default is true
    bidirectionalTrack?: boolean; // if the slider track is in one direction only or if it's bidirectional (symmetrical)
    onValueChange: (newValue: number) => void; // the event handler (callback) prop the knob will call when it's rotated this event receives the new value set by the knob
}

// export const VerticalFader: React.FC<VerticalFaderProps> = ({
//   label = '',
//   minValue = 0.0,
//   maxValue = 1.0,
//   initialValue = 0.5,
//   displayFactor = 1.0,
//   step = 0.1,
//   fineStep = 0.01,
//   decimals = 2,
//   showValue = true,
//   bidirectionalTrack = false,
//   onValueChange
// }) => {

export function VerticalFader({
    label = '',
    minValue = 0.0,
    maxValue = 1.0,
    initialValue = 0.5,
    displayFactor = 1.0,
    step = 0.1,
    decimals = 2,
    showValue = true,
    bidirectionalTrack = false,
    onValueChange
}: VerticalFaderProps)
{
    const logger = new Logger({ name: 'VerticalFader', minLevel: Settings.minLogLevel });

    const WIDTH = 40;
    const HEIGHT = 150;
    const THUMB_HEIGHT = 25;
    const PREFILL_MAX_HEIGHT = HEIGHT - THUMB_HEIGHT;

    const thumbRef = useRef<HTMLDivElement>(null);
    const prefillRef = useRef<HTMLDivElement>(null);

    const [absoluteValue, setAbsoluteValue] = useState(Math.min(Math.max(initialValue, minValue), maxValue));
    const [prefillHeight, setPrefillHeight] = useState(PREFILL_MAX_HEIGHT * (1.0 - (absoluteValue - minValue) / (maxValue - minValue)));
    const [absoluteValueString, setAbsoluteValueString] = useState((displayFactor * absoluteValue).toFixed(decimals));

    const currentIncrementedSteps = useRef(0);
    const onMouseDownY = useRef(0);
    const newAbsoluteValue = useRef(absoluteValue);
    const newPrefillHeight = useRef(prefillHeight);

    useEffect(() =>
    {
        if (prefillRef.current)
        {
            prefillRef.current.style.height = `${prefillHeight}px`;
        }
    }, [prefillHeight]);

    const onMouseDown = (event: React.MouseEvent) =>
    {
        onMouseDownY.current = event.clientY;

        const handleMouseMove = (e: MouseEvent) =>
        {
            const STEP_COUNT = Math.floor((maxValue - minValue) / step) + 1;
            const PIXELS_PER_STEP = PREFILL_MAX_HEIGHT / STEP_COUNT;
            const onMouseMoveY = e.clientY;
            const mouseYMovement = Math.abs(onMouseDownY.current - onMouseMoveY);
            currentIncrementedSteps.current = Math.floor(mouseYMovement / PIXELS_PER_STEP);

            if (onMouseMoveY < onMouseDownY.current)
            {
                newAbsoluteValue.current = absoluteValue + currentIncrementedSteps.current * step;
                newPrefillHeight.current = prefillHeight - mouseYMovement;
                if (newPrefillHeight.current < 0) newPrefillHeight.current = 0;
            }
            else
            {
                newAbsoluteValue.current = absoluteValue - currentIncrementedSteps.current * step;
                newPrefillHeight.current = prefillHeight + mouseYMovement;
                if (newPrefillHeight.current > PREFILL_MAX_HEIGHT) newPrefillHeight.current = PREFILL_MAX_HEIGHT;
            }

            if (newAbsoluteValue.current < minValue) newAbsoluteValue.current = minValue;
            if (newAbsoluteValue.current > maxValue) newAbsoluteValue.current = maxValue;

            setAbsoluteValueString((displayFactor * newAbsoluteValue.current).toFixed(decimals));
            if (prefillRef.current)
            {
                prefillRef.current.style.height = `${newPrefillHeight.current}px`;
            }
        };

        const handleMouseUp = () =>
        {
            setAbsoluteValue(newAbsoluteValue.current);
            onValueChange(newAbsoluteValue.current);
            setPrefillHeight(newPrefillHeight.current);

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
    <div className={styles.mainContainer}>
        {label && <div className={styles.label}>{label}</div>}

        <div className={styles.faderContainer}>
            <div
                className={`${styles.faderTrack} ${
                bidirectionalTrack ? styles.faderTrackBidirectional : styles.faderTrackUnidirectional
                }`}
            ></div>
            <div className={styles.thumbContainer}>
                <div ref={prefillRef} className={styles.thumbPrefill}></div>
                <div ref={thumbRef} className={styles.thumb} onMouseDown={onMouseDown}></div>
            </div>
        </div>

        {showValue && <div className={styles.numericValue}>{absoluteValueString}</div>}
    </div>
    );
}
