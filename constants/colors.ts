const C = {
  background: "#0B1020",
  surface: "#121A2B",
  surfaceElevated: "#1A2540",
  primary: "#FF751F",
  primaryGlow: "rgba(255,117,31,0.35)",
  accent: "#C8A96B",
  accentGlow: "rgba(200,169,107,0.25)",
  secondary: "#2D8CFF",
  text: "#F7F4EE",
  textMuted: "#98A2B3",
  textDim: "#4A5568",
  success: "#5FCB8B",
  successGlow: "rgba(95,203,139,0.2)",
  warning: "#F08A5D",
  warningGlow: "rgba(240,138,93,0.2)",
  border: "rgba(255,255,255,0.07)",
  overlay: "rgba(11,16,32,0.85)",
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
