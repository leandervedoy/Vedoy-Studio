import type { CSSProperties } from "react";
import type { BookingTheme } from "../types.js";
import { defaultTheme } from "../defaults.js";

export function themeVariables(theme?: BookingTheme): CSSProperties {
  const value = { ...defaultTheme, ...theme };
  return {
    "--vb-accent": value.accent,
    "--vb-accent-contrast": value.accentContrast,
    "--vb-surface": value.surface,
    "--vb-surface-elevated": value.surfaceElevated,
    "--vb-text": value.text,
    "--vb-muted": value.muted,
    "--vb-border": value.border,
    "--vb-danger": value.danger,
    "--vb-success": value.success,
    "--vb-radius": value.radius,
    "--vb-font": value.fontFamily,
    "--vb-shadow": value.shadow
  } as CSSProperties;
}
