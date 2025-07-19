// import React, { useEffect, useRef } from "react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./InvisibleKeyboard.module.css";

import { Settings } from "../../constants/settings";
import { TestPolySynth, testPolySynth } from "../../audio/synth/virtual-analog/test-synth";
// import { monoSynth } from "../../audio/synth/virtual-analog/analog-synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

interface KeyboardProps
{
    startOctave?: number;
}

const logger = new Logger({ name: "Keyboard", minLevel: Settings.minLogLevel });

export function InvisibleKeyboard({ startOctave = 2 }: KeyboardProps)
{
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    // track which physical keys are down
    const pressedKeys = useRef<Set<string>>(new Set());

    // QWERTY-to-(octave,semitone) mapping
    const keyMap: Record<string, [number, number]> =
    {
        a: [2, 0],  w: [2, 1],  s: [2, 2],  e: [2, 3],
        d: [2, 4],  f: [2, 5],  t: [2, 6],  g: [2, 7],
        y: [2, 8],  h: [2, 9],  u: [2, 10], j: [2, 11],
        k: [3, 0],  o: [3, 1],  l: [3, 2],
    };

    const unlockAudio = async () =>
    {
        try
        {
            //   await testPolySynth.resume();
            testPolySynth.resume();
            setAudioUnlocked(true);
            logger.info("Audio unlocked");
        }
        catch (error) { logger.error("Failed to unlock audio", error); }
    };

    const onKeyDown = (event: KeyboardEvent) =>
    {
        if (!audioUnlocked)
            return;

        const key = event.key.toLowerCase();
        if (!keyMap[key])
            return;

        // avoid retriggering same key, and cap to 4 concurrent notes
        if (pressedKeys.current.has(key) || pressedKeys.current.size >= 4)
            return;

        event.preventDefault();
        const [oct, semi] = keyMap[key];
        const midiNote = `${oct}${semi}`;
        logger.debug(`↓ key "${key}" → noteOn(${midiNote})`);
        testPolySynth.noteOn(midiNote, oct + startOctave, semi);

        pressedKeys.current.add(key);
    };

    const onKeyUp = (event: KeyboardEvent) =>
    {
        if (!audioUnlocked)
            return;
        const key = event.key.toLowerCase();

        if (!pressedKeys.current.has(key))
            return;

        event.preventDefault();
        const [oct, semi] = keyMap[key];
        const midiNote = `${oct}${semi}`;
        logger.debug(`↑ key "${key}" → noteOff(${midiNote})`);
        testPolySynth.noteOff(midiNote);

        pressedKeys.current.delete(key);
    };

    useEffect(() =>
    {
        if (!audioUnlocked) return;
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        };
    }, [audioUnlocked]);

    return (
        <>
            {!audioUnlocked && (
                <button onClick={unlockAudio}>
                    Click to Enable Audio
                </button>
            )}
        </>
    );
}

// export function InvisibleKeyboard({ startOctave = 2 }: KeyboardProps) {
//   const [audioUnlocked, setAudioUnlocked] = useState(false);

//   // Will hold our AudioContext + PolySynth once created
//   const synthRef = useRef<{
//     ctx: AudioContext;
//     poly: TestPolySynth;
//   } | null>(null);

//   // track which QWERTY keys are down
//   const pressedKeys = useRef<Set<string>>(new Set());

//   // QWERTY → [octave, semitone]
//   const keyMap: Record<string, [number, number]> = {
//     a: [2, 0],  w: [2, 1],  s: [2, 2],  e: [2, 3],
//     d: [2, 4],  f: [2, 5],  t: [2, 6],  g: [2, 7],
//     y: [2, 8],  h: [2, 9],  u: [2, 10], j: [2, 11],
//     k: [3, 0],  o: [3, 1],  l: [3, 2],
//   };

//   const unlockAudio = async () => {
//     // 1) create AudioContext in user gesture:
//     const ctx = new AudioContext();

//     // 2) instantiate your TestPolySynth with 5 voices:
//     const poly = new TestPolySynth(ctx, 5);

//     // 3) resume it (must be in gesture)
//     // await ctx.resume();
//     ctx.resume();
//     setAudioUnlocked(true);
//     synthRef.current = { ctx, poly };
//     logger.info("AudioContext created & resumed, PolySynth ready");
//   };

//   const onKeyDown = (ev: KeyboardEvent) =>
// {
//     if (!audioUnlocked) return;
//     const key = ev.key.toLowerCase();
//     if (!keyMap[key]) return;

//     // ignore repeats, cap at 4 voices
//     if (pressedKeys.current.has(key) || pressedKeys.current.size >= 4) {
//       return;
//     }

//     ev.preventDefault();
//     const [oct, semi] = keyMap[key];
//     // midi-note string can be anything unique per key
//     const midiNote = `${oct}${semi}`;
//     logger.debug(`keyDown "${key}" → noteOn ${midiNote}`);
//     synthRef.current!.poly.noteOn(midiNote, oct + startOctave, semi);

//     pressedKeys.current.add(key);
//   };

//   const onKeyUp = (ev: KeyboardEvent) => {
//     if (!audioUnlocked) return;
//     const key = ev.key.toLowerCase();
//     if (!pressedKeys.current.has(key)) return;

//     ev.preventDefault();
//     const [oct, semi] = keyMap[key];
//     const midiNote = `${oct}${semi}`;
//     logger.debug(`keyUp "${key}" → noteOff ${midiNote}`);
//     synthRef.current!.poly.noteOff(midiNote);

//     pressedKeys.current.delete(key);
//   };

//   useEffect(() => {
//     if (!audioUnlocked) return;
//     window.addEventListener("keydown", onKeyDown);
//     window.addEventListener("keyup", onKeyUp);
//     return () => {
//       window.removeEventListener("keydown", onKeyDown);
//       window.removeEventListener("keyup", onKeyUp);
//     };
//   }, [audioUnlocked]);

//   return (
//     <>
//       {!audioUnlocked && (
//         <button onClick={unlockAudio}>
//           Click to Enable Audio
//         </button>
//       )}
//     </>
//   );
// }