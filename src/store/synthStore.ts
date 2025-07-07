import { create } from 'zustand';

type SynthState =
{
  frequency: number;
  waveform: OscillatorType;
  isPlaying: boolean;
  setFrequency: (freq: number) => void;
  setWaveform: (wave: OscillatorType) => void;
  togglePlay: () => void;
};

export const useSynthStore = create<SynthState>((set, get) => ({
  frequency: 440,
  waveform: 'sine',
  isPlaying: false,
  setFrequency: (freq) => set({ frequency: freq }),
  setWaveform: (wave) => set({ waveform: wave }),
  togglePlay: () => set({ isPlaying: !get().isPlaying }),
}));