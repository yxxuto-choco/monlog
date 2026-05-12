export const COLORS = {
  paper: "#FAF7F0",
  surface: "#FFFFFF",

  navy: "#1E3A5F",
  teal: "#2A9D8F",

  text: "#1F2937",
  muted: "#64748B",
  slate: "#526984",

  line: "#D8DDD6",
  lineStrong: "#C9D2CD",
  cardLine: "rgba(30, 58, 95, 0.16)",

  tealPanel: "#E3F1EE",
  tealPanelSoft: "rgba(42, 157, 143, 0.07)",
  tealLine: "rgba(42, 157, 143, 0.18)",

  tagBg: "#E2F1EE",
  tagText: "#158B80",

  star: "#F4A261",
  starEmpty: "#D7D3C8",

  danger: "#DC2626",
  success: "#2A9D8F",
  softYellow: "#FBF8EF",
} as const

export const SHADOWS = {
  card: "0 4px 14px rgba(30, 58, 95, 0.08)",
  cardStrong: "0 4px 14px rgba(30, 58, 95, 0.10)",
  hover: "0 10px 26px rgba(30, 58, 95, 0.10)",
} as const

export const RADII = {
  sm: "12px",
  md: "14px",
  lg: "18px",
  xl: "22px",
  xxl: "26px",
  pill: "999px",
} as const

export const LAYOUT = {
  pageWidth: "min(980px, calc(100vw - 48px))",
  widePageWidth: "min(1200px, calc(100vw - 48px))",
} as const
