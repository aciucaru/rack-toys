// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import React, { useState } from "react";

import Oscillator from './components/Oscillator';
import { Knob } from './components/control/Knob';
import { VerticalFader } from "./components/control/VerticalFader";
import MyComponent from "./components/control/MyComponent";
import { RadioGroup } from "./components/control/RadioGroup";
import { ToggleButton } from "./components/control/ToggleButton";
import { ButtonIcon } from "./types/ButtonIcon";
import { AnalogSynth } from "./components/synth/AnalogSynth";
import { InvisibleKeyboard } from "./components/control/InvisibleKeyboard";

// const App = () =>
function App()
{
    const [knobValue, setKnobValue] = useState<number>(0.5);
    const handleKnobChange = (newValue: number) => { setKnobValue(newValue); };

    const [value, setValue] = useState(0.5);
    const handleFaderChange = (newValue: number) =>
    {
        console.log('Fader changed to:', newValue);
        setValue(newValue);
    };

    const handleSelection = (selected: string) => { console.log('Selected option:', selected); };

    const [toggleState, setToggleState] = useState(false);
    const handleToggleChange = (newState: boolean) =>
    {
        console.log("Toggled:", newState);
        setToggleState(newState);
    };

    return (
    <div style={{ padding: '2rem' }}>
        <h1>React 19 + Zustand Synth</h1>
        <AnalogSynth></AnalogSynth>

        <RadioGroup options={['Option A', 'Option B', 'Option C']} onSelect={handleSelection} />

        <InvisibleKeyboard startOctave={2}></InvisibleKeyboard>

        <MyComponent customStyle={{ backgroundColor: 'gray' }} />
    </div>
    );
}

export default App;

