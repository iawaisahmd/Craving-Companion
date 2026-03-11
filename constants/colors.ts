export const LIGHT_COLORS = {
  background:      "#F6FBF8",
  surface:         "#FFFFFF",
  surfaceElevated: "#EDF4F0",
  primary:         "#7DBB78",
  primaryGlow:     "rgba(125,187,120,0.22)",
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
  border:          "rgba(125,187,120,0.20)",
  overlay:         "rgba(23,49,58,0.70)",
  onPrimary:       "#FFFFFF",
  gradStart:       "#96CC91",
  gradEnd:         "#7DBB78",
};

export const DARK_COLORS = {
  background:      "#0D1B12",
  surface:         "#142019",
  surfaceElevated: "#1C2E21",
  primary:         "#7DBB78",
  primaryGlow:     "rgba(125,187,120,0.28)",
  accent:          "#8FCB9B",
  accentGlow:      "rgba(143,203,155,0.22)",
  secondary:       "#4F8EF7",
  text:            "#EFF7EE",
  textMuted:       "#7A9B82",
  textDim:         "#4A6B52",
  success:         "#5FC98D",
  successGlow:     "rgba(95,201,141,0.22)",
  warning:         "#E8A15B",
  warningGlow:     "rgba(232,161,91,0.20)",
  border:          "rgba(125,187,120,0.16)",
  overlay:         "rgba(13,27,18,0.88)",
  onPrimary:       "#FFFFFF",
  gradStart:       "#96CC91",
  gradEnd:         "#7DBB78",
};

export type ColorTheme = typeof LIGHT_COLORS;

// Fallback static export (overridden at runtime via ThemeContext)
export const C = LIGHT_COLORS;

export default {
  light: {
    text: LIGHT_COLORS.text,
    background: LIGHT_COLORS.background,
    tint: LIGHT_COLORS.primary,
    tabIconDefault: LIGHT_COLORS.textMuted,
    tabIconSelected: LIGHT_COLORS.primary,
  },
  ...LIGHT_COLORS,
};
