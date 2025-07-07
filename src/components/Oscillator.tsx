import { useSynthStore } from '../store/synthStore';

const Oscillator = () => {
  const frequency = useSynthStore((s) => s.frequency);
  const setFrequency = useSynthStore((s) => s.setFrequency);
  const waveform = useSynthStore((s) => s.waveform);
  const setWaveform = useSynthStore((s) => s.setWaveform);

  return (
    <div>
      <h2>Oscillator</h2>
      <label>Frequency: {frequency} Hz</label>
      <input
        type="range"
        min={100}
        max={2000}
        step={1}
        value={frequency}
        onChange={(e) => setFrequency(Number(e.target.value))}
      />

      <select value={waveform} onChange={(e) => setWaveform(e.target.value as OscillatorType)}>
        <option value="sine">Sine</option>
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
        <option value="sawtooth">Sawtooth</option>
      </select>
    </div>
  );
};

export default Oscillator;