const C = {
  background:      "#F6FBF8",
  surface:         "#FFFFFF",
  surfaceElevated: "#EDF4F0",
  primary:         "#2F6F68",
  primaryGlow:     "rgba(47,111,104,0.20)",
  accent:          "#8FCB9B",
  accentGlow:      "rgba(143,203,155,0.22)",
  secondary:       "#4F8EF7",
  text:            "#17313A",
  textMuted:       "#6E7F86",
  textDim:         "#A0B5BB",
  success:         "#5FC98D",
  successGlow:     "rgba(95,201,141,0.20)",
  warning:         "#E8A15B",
  warningGlow:     "rgba(232,161,91,0.20)",
  border:          "rgba(47,111,104,0.13)",
  overlay:         "rgba(23,49,58,0.70)",
};

export default {
  light: {
    text: C.text,
    background: C.background,
    tint: C.primary,
    tabIconDefault: C.textMuted,
    tabIconSelected: C.primary,
  },
  ...C,
};

export { C };
