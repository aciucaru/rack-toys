import React, { useEffect, useRef, useState } from "react";
import { Settings } from "../../constants/settings";
import { Logger } from "tslog";

import styles from "./Knob.module.css";

// type KnobProps =
interface KnobProps
{
    label?: string;
    minValue?: number;
    maxValue?: number;
    initialValue?: number;
    displayFactor?: number;
    step?: number;
    decimals?: number;
    knobWidth?: number;
    onValueChange: (newValue: number) => void;
}

// export const Knob: React.FC<KnobProps> = ({
//   label = "",
//   minValue = 0.0,
//   maxValue = 1.0,
//   initialValue = 0.5,
//   displayFactor = 1.0,
//   step = 0.1,
//   decimals = 2,
//   knobWidth = 50,
//   onValueChange,
// }) => {

export function Knob({
    label = "",
    minValue = 0.0,
    maxValue = 1.0,
    initialValue = 0.5,
    displayFactor = 1.0,
    step = 0.1,
    decimals = 2,
    knobWidth = 50,
    onValueChange,
    }: KnobProps)
{
    const logger = new Logger({ name: "Knob", minLevel: Settings.minLogLevel });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const WIDTH = knobWidth;
    const HEIGHT = knobWidth;

    const [absoluteValue, setAbsoluteValue] = useState(() =>
    {
        const value = Math.min(Math.max(initialValue, minValue), maxValue);
        return value;
    });

    const [newAbsoluteValue, setNewAbsoluteValue] = useState(absoluteValue);
    const [absoluteValueString, setAbsoluteValueString] = useState((displayFactor * absoluteValue).toFixed(decimals));

    const [showValue, setShowValue] = useState(false);
    const currentIncrementedStepsRef = useRef(0);
    const onMouseDownYRef = useRef(0);

    useEffect(() =>
    {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx)
        {
            contextRef.current = ctx;
            drawCanvas();
        }
    }, []);

    const onMouseDown = (event: React.MouseEvent) =>
    {
        onMouseDownYRef.current = event.clientY;

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (event: MouseEvent) =>
    {
        setShowValue(true);

        const STEP_COUNT = Math.floor((maxValue - minValue) / step) + 1;
        const MAX_MOUSE_MOVEMENT = 2 * HEIGHT;
        const PIXELS_PER_STEP = MAX_MOUSE_MOVEMENT / STEP_COUNT;
        const onMouseMoveY = event.clientY;
        const mouseYMovement = Math.abs(onMouseDownYRef.current - onMouseMoveY);

        let currentSteps = Math.floor(mouseYMovement / PIXELS_PER_STEP);
        currentIncrementedStepsRef.current = currentSteps;

        let value: number;

        if (onMouseMoveY < onMouseDownYRef.current)
            value = absoluteValue + currentSteps * step;
        else
            value = absoluteValue - currentSteps * step;

        value = Math.max(minValue, Math.min(maxValue, value));
        setNewAbsoluteValue(value);
        setAbsoluteValueString((displayFactor * value).toFixed(decimals));
        onValueChange(value);
        drawCanvas(value);
    };

    const onMouseUp = () =>
    {
        setShowValue(false);
        setAbsoluteValue(newAbsoluteValue);
        currentIncrementedStepsRef.current = 0;

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };

    const drawCanvas = (value = newAbsoluteValue) =>
    {
        const ctx = contextRef.current;
        if (!ctx) return;

        const POINTER_INNER_DIAM = 0.1 * WIDTH;
        const POINTER_OUTER_DIAM = 0.6 * WIDTH;
        const POINTER_WIDTH = POINTER_OUTER_DIAM / 2.0 - POINTER_INNER_DIAM / 2.0;
        const POINTER_HEIGHT = 0.06 * WIDTH;

        const POINTER_CENTER_RADIUS = (POINTER_INNER_DIAM + POINTER_OUTER_DIAM) / 4.0;

        const MARK_INNER_DIAM = 1.15 * POINTER_INNER_DIAM;
        const MARK_OUTER_DIAM = 0.85 * POINTER_OUTER_DIAM;
        const MARK_WIDTH = MARK_OUTER_DIAM / 2.0 - MARK_INNER_DIAM / 2.0;
        const MARK_HEIGHT = 0.4 * POINTER_HEIGHT;

        const startAngle = (120 * Math.PI) / 180.0;
        const endAngle = (420 * Math.PI) / 180.0;

        const normalizedValue = (value - minValue) / (maxValue - minValue);
        const pointerAngle = startAngle * (1.0 - normalizedValue) + endAngle * normalizedValue;
        const pointerCenterX = WIDTH / 2.0 + Math.cos(pointerAngle) * POINTER_CENTER_RADIUS;
        const pointerCenterY = HEIGHT / 2.0 + Math.sin(pointerAngle) * POINTER_CENTER_RADIUS;

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        ctx.translate(pointerCenterX, pointerCenterY);
        ctx.rotate(pointerAngle);

        ctx.fillStyle = `hsla(0, 0%, 10%, 0.8)`;
        ctx.fillRect(
            -POINTER_WIDTH / 2.0,
            -POINTER_HEIGHT / 2.0,
            POINTER_WIDTH,
            POINTER_HEIGHT
        );

        ctx.fillStyle = `hsl(0, 0%, 80%)`;
        ctx.fillRect(
            -MARK_WIDTH / 2.0,
            -MARK_HEIGHT / 2.0,
            MARK_WIDTH,
            MARK_HEIGHT
        );

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    return (
    <div className={styles.mainContainer} style={{ "--knob-width": `${knobWidth}px` } as React.CSSProperties}>
        <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onMouseDown={onMouseDown}
            className={`${styles.knobCanvas} ${styles.unselectable}`}
            // className={styles.knobCanvas}
        ></canvas>

        {label && (
        <div className={styles.unselectable}>
            {showValue ? (
            <div className={styles.numericValue}>{absoluteValueString}</div>
            ) : (
            <div className={styles.label}>{label}</div>
            )}
        </div>
        )}
    </div>
    );
}
