export const ButtonIcon = {
  WAVE_SINE: "WAVE_SINE",
  WAVE_PULSE: "WAVE_PULSE",
  WAVE_SAW: "WAVE_SAW",
  WAVE_TRIANGLE: "WAVE_TRIANGLE",
} as const;

export type ButtonIcon = (typeof ButtonIcon)[keyof typeof ButtonIcon];
