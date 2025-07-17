// import React, { useEffect, useRef } from "react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./InvisibleKeyboard.module.css";

import { Settings } from "../../constants/settings";
import { testPolySynth } from "../../audio/synth/virtual-analog/test-synth";
// import { monoSynth } from "../../audio/synth/virtual-analog/analog-synth";

import { Logger } from "tslog";
import type { ILogObj } from "tslog";

interface KeyboardProps
{
    startOctave?: number;
}

// const Keyboard: React.FC<KeyboardProps> = ({ startOctave = 2 }) => {
//   const logger: Logger<ILogObj> = new Logger({
//     name: "Keyboard5",
//     minLevel: Settings.minLogLevel,
//   });

//   const isMousePressed = useRef(false);
//   const isKeyPressed = useRef(false);

//   const onClick = (event: Event) => {
//     const target = event.target as HTMLElement;
//     const noteString = target.classList[0];

//     if (noteString && !isMousePressed.current) {
//       const [_, octaveStr, semitoneStr] = noteString.split("-");
//       const octave = parseInt(octaveStr);
//       const semitone = parseInt(semitoneStr);

//       logger.debug(
//         `onClick(): pressed note: ${noteString}, octave = ${octave}, semitone = ${semitone}`
//       );

//       monoSynth.getVoice().resume();
//       const duration = 0.05;
//       monoSynth.getVoice().playNote(octave + startOctave, semitone, duration);
//     }
//   };

//   const onMouseDown = (event: Event) => {
//     const target = event.target as HTMLElement;
//     const noteString = target.classList[0];

//     if (noteString && !isMousePressed.current) {
//       isMousePressed.current = true;

//       const [_, octaveStr, semitoneStr] = noteString.split("-");
//       const octave = parseInt(octaveStr);
//       const semitone = parseInt(semitoneStr);

//       logger.debug(
//         `onMouseDown(): pressed note: ${noteString}, octave = ${octave}, semitone = ${semitone}`
//       );

//       target.addEventListener("mouseup", onMouseUp);
//       window.addEventListener("mouseup", onMouseUp);

//       monoSynth.getVoice().resume();
//       monoSynth.getVoice().noteOn(octave + startOctave, semitone);
//     }
//   };

//   const onMouseUp = (event: Event) => {
//     logger.debug("onMouseUp(): released note");

//     if (isMousePressed.current) {
//       isMousePressed.current = false;
//       const target = event.target as HTMLElement;

//       monoSynth.getVoice().noteOff();

//       target.removeEventListener("mouseup", onMouseUp);
//       window.removeEventListener("mouseup", onMouseUp);
//     }
//   };

//   const startNote = (octave: number, semitone: number) => {
//     logger.debug(`startNote(): octave = ${octave}, semitone = ${semitone}`);
//     isKeyPressed.current = true;
//     monoSynth.getVoice().resume();
//     monoSynth.getVoice().noteOn(octave + startOctave, semitone);
//   };

//   const onKeyDown = (event: KeyboardEvent) => {
//     if (event.key && !isKeyPressed.current) {
//       const map: Record<string, [number, number]> = {
//         a: [2, 0],
//         w: [2, 1],
//         s: [2, 2],
//         e: [2, 3],
//         d: [2, 4],
//         f: [2, 5],
//         t: [2, 6],
//         g: [2, 7],
//         y: [2, 8],
//         h: [2, 9],
//         u: [2, 10],
//         j: [2, 11],
//         k: [3, 0],
//         o: [3, 1],
//         l: [3, 2],
//       };

//       const key = event.key.toLowerCase();
//       if (map[key]) {
//         const [octave, semitone] = map[key];
//         startNote(octave, semitone);
//       }
//     }
//   };

//   const onKeyUp = () => {
//     logger.debug("onKeyUp(): released key");
//     if (isKeyPressed.current) {
//       isKeyPressed.current = false;
//       monoSynth.getVoice().noteOff();
//     }
//   };

//   useEffect(() => {
//     window.addEventListener("keydown", onKeyDown);
//     window.addEventListener("keyup", onKeyUp);

//     return () => {
//       window.removeEventListener("keydown", onKeyDown);
//       window.removeEventListener("keyup", onKeyUp);
//     };
//   }, []);

//   return <div className={styles.mainContainer}></div>;
// };

// export default Keyboard;


// export function InvisibleKeyboard({ startOctave = 2 }: KeyboardProps)
// {
//     const logger: Logger<ILogObj> = new Logger({ name: "InvisibleKeyboard", minLevel: Settings.minLogLevel });

//     const isKeyPressed = useRef(false);

//     const startNote = (octave: number, semitone: number) =>
//     {
//         logger.debug(`startNote(): octave = ${octave}, semitone = ${semitone}`);
//         isKeyPressed.current = true;

//         // required for browser compliance so the audio is resumed after an user interaction
//         testMonoSynth1.resume();

//         // play the note
//         testMonoSynth1.noteOn(octave + startOctave, semitone);
//     };

//     const onKeyDown = (event: KeyboardEvent) =>
//     {
//         event.preventDefault();

//         if (event.key && !isKeyPressed.current)
//         {
//             const key = event.key.toLowerCase();
//             const map: Record<string, [number, number]> =
//             {
//                 a: [2, 0],
//                 w: [2, 1],
//                 s: [2, 2],
//                 e: [2, 3],
//                 d: [2, 4],
//                 f: [2, 5],
//                 t: [2, 6],
//                 g: [2, 7],
//                 y: [2, 8],
//                 h: [2, 9],
//                 u: [2, 10],
//                 j: [2, 11],
//                 k: [3, 0],
//                 o: [3, 1],
//                 l: [3, 2]
//             };

//             if (map[key])
//             {
//                 const [octave, semitone] = map[key];

//                 startNote(octave, semitone);
//             }
//         }
//     };

//     const onKeyUp = (event: KeyboardEvent) =>
//     {
//         event.preventDefault();
//         logger.debug("onKeyUp(): released key");

//         if (isKeyPressed.current)
//         {
//             isKeyPressed.current = false;
//             testMonoSynth1.noteOff();
//         }
//     };

//     useEffect(() =>
//     {
//         window.addEventListener("keydown", onKeyDown);
//         window.addEventListener("keyup", onKeyUp);

//         return () =>
//         {
//             window.removeEventListener("keydown", onKeyDown);
//             window.removeEventListener("keyup", onKeyUp);
//         };
//     }, []);

// //   return null; // Invisible controller
//     return <div className={styles.mainContainer}></div>;
// };

// import React, { useEffect, useRef, useState } from "react";
// import { monoSynth } from "../model/audio/synth";
// import { Logger } from "tslog";
// import { Settings } from "../constants/settings";

// interface KeyboardProps {
//   startOctave?: number;
// }

// export default Keyboard;

const logger = new Logger({ name: "Keyboard", minLevel: Settings.minLogLevel });

// export function InvisibleKeyboard({ startOctave = 2 }: KeyboardProps)
// {
//     const [audioUnlocked, setAudioUnlocked] = useState(false);
//     const isKeyPressed = useRef(false);

//     const startNote = (octave: number, semitone: number) =>
//     {
//         logger.debug(`startNote(): octave = ${octave}, semitone = ${semitone}`);
//         isKeyPressed.current = true;

//         const midiNote = `${octave}${semitone}`;
//         testPolySynth.noteOn(midiNote, octave + startOctave, semitone);
//     };

//     const onKeyDown = (event: KeyboardEvent) =>
//     {
//         if (!audioUnlocked) return;

//         event.preventDefault();
//         if (event.key && !isKeyPressed.current)
//         {
//             const map: Record<string, [number, number]> =
//             {
//                 a: [2, 0],
//                 w: [2, 1],
//                 s: [2, 2],
//                 e: [2, 3],
//                 d: [2, 4],
//                 f: [2, 5],
//                 t: [2, 6],
//                 g: [2, 7],
//                 y: [2, 8],
//                 h: [2, 9],
//                 u: [2, 10],
//                 j: [2, 11],
//                 k: [3, 0],
//                 o: [3, 1],
//                 l: [3, 2],
//                 };

//                 const key = event.key.toLowerCase();
//                 if (map[key]) {
//                 const [octave, semitone] = map[key];
//                 startNote(octave, semitone);
//             }
//         }
//     };

//     const onKeyUp = (event: KeyboardEvent) =>
//     {
//         if (!audioUnlocked) return;

//         event.preventDefault();
//         logger.debug("onKeyUp(): released key");
//         if (isKeyPressed.current)
//         {
//             isKeyPressed.current = false;
//             const midiNote = ""; // actual implemntation is missing, this is just a dummy string
//             testPolySynth.noteOff(midiNote);
//         }
//     };

//     const unlockAudio = async () =>
//     {
//         try
//         {
//         //   await testMonoSynth1.resume(); // This should succeed due to the click
//             testPolySynth.resume(); // This should succeed due to the click
//             setAudioUnlocked(true);
//             logger.info("Audio unlocked");
//         }
//         catch (error) { logger.error("Failed to unlock audio", error); }
//     };

//     useEffect(() =>
//     {
//         if (audioUnlocked)
//         {
//             window.addEventListener("keydown", onKeyDown);
//             window.addEventListener("keyup", onKeyUp);
            
//             return () =>
//             {
//                 window.removeEventListener("keydown", onKeyDown);
//                 window.removeEventListener("keyup", onKeyUp);
//             };
//         }
//     }, [audioUnlocked]);

//   return (
//     <>
//       {!audioUnlocked && (
//         <button onClick={unlockAudio}>Click to Enable Audio</button>
//       )}
//     </>
//   );
// };


export function InvisibleKeyboard({ startOctave = 2 }: KeyboardProps) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // track which physical keys are down
  const pressedKeys = useRef<Set<string>>(new Set());

  // QWERTY-to-(octave,semitone) mapping
  const keyMap: Record<string, [number, number]> = {
    a: [2, 0],  w: [2, 1],  s: [2, 2],  e: [2, 3],
    d: [2, 4],  f: [2, 5],  t: [2, 6],  g: [2, 7],
    y: [2, 8],  h: [2, 9],  u: [2, 10], j: [2, 11],
    k: [3, 0],  o: [3, 1],  l: [3, 2],
  };

  const unlockAudio = async () => {
    try {
      await testPolySynth.resume();
      setAudioUnlocked(true);
      logger.info("Audio unlocked");
    } catch (error) {
      logger.error("Failed to unlock audio", error);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!audioUnlocked) return;
    const key = event.key.toLowerCase();
    if (!keyMap[key]) return;

    // avoid retriggering same key, and cap to 4 concurrent notes
    if (pressedKeys.current.has(key) || pressedKeys.current.size >= 4) {
      return;
    }

    event.preventDefault();
    const [oct, semi] = keyMap[key];
    const midiNote = `${oct}${semi}`;
    logger.debug(`↓ key "${key}" → noteOn(${midiNote})`);
    testPolySynth.noteOn(midiNote, oct + startOctave, semi);

    pressedKeys.current.add(key);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (!audioUnlocked) return;
    const key = event.key.toLowerCase();
    if (!pressedKeys.current.has(key)) return;

    event.preventDefault();
    const [oct, semi] = keyMap[key];
    const midiNote = `${oct}${semi}`;
    logger.debug(`↑ key "${key}" → noteOff(${midiNote})`);
    testPolySynth.noteOff(midiNote);

    pressedKeys.current.delete(key);
  };

  useEffect(() => {
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


