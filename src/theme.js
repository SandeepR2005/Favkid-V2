/* FavKid — light "fintech" design tokens.
   Light surfaces with an indigo accent. A few "ink" feature cards stay dark for contrast. */
import { Platform } from "react-native";

export const COLORS = {
  // base surfaces
  bg: "#F4F5F7",
  bgGrad: "#E9EAEF",
  surface: "#FFFFFF",
  surface2: "#F6F7F9",
  surface3: "#ECEEF2",
  border: "#E1E4EA",
  borderSoft: "#EBEDF1",
  ink: "#1F2430", // dark feature cards / ink buttons

  // text
  text: "#1B1F2A",
  textDim: "#5A616E",
  textMute: "#8A909C",
  onInk: "#F4F5F7", // text on dark "ink" surfaces

  // accent — indigo
  accent: "#4F46E5",
  accentPress: "#4338CA",
  accentSoft: "rgba(79,70,229,0.12)",
  accentInk: "#FFFFFF", // text/icons on accent

  // semantic (tuned for readability on light surfaces)
  positive: "#16A34A",
  positiveSoft: "rgba(22,163,74,0.13)",
  info: "#2563EB",
  infoSoft: "rgba(37,99,235,0.12)",
  warn: "#D97706",
  warnSoft: "rgba(217,119,6,0.14)",
  danger: "#DC2626",
  dangerSoft: "rgba(220,38,38,0.12)",

  white: "#FFFFFF",
};

export const RADIUS = {
  lg: 22,
  md: 14,
  sm: 10,
  pill: 999,
};

export const FONTS = {
  // RN can't load the web display font without bundling files; approximate with
  // system fonts + heavy weights. `mono` keeps the technical eyebrow/label feel.
  display: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
};

/* Category accent mapping (mirrors CAT_HUE in screens-track.jsx) */
const CATEGORY = {
  skill: { solid: "#65A30D", soft: "rgba(101,163,13,0.14)" },
  career: { solid: "#2563EB", soft: "rgba(37,99,235,0.12)" },
  study: { solid: "#D97706", soft: "rgba(217,119,6,0.14)" },
  fitness: { solid: "#DC2626", soft: "rgba(220,38,38,0.12)" },
  personal: { solid: "#7C3AED", soft: "rgba(124,58,237,0.12)" },
};

export function categoryColor(category) {
  const key = String(category || "").toLowerCase();
  return CATEGORY[key] || { solid: COLORS.accent, soft: COLORS.accentSoft };
}

/* Deterministic avatar color palette (for favorite people / participants) */
const AVATAR_PALETTE = [
  { solid: "#2563EB", soft: "rgba(37,99,235,0.14)" },
  { solid: "#16A34A", soft: "rgba(22,163,74,0.14)" },
  { solid: "#D97706", soft: "rgba(217,119,6,0.16)" },
  { solid: "#7C3AED", soft: "rgba(124,58,237,0.14)" },
  { solid: "#DC2626", soft: "rgba(220,38,38,0.14)" },
  { solid: "#0891B2", soft: "rgba(8,145,178,0.14)" },
];

export function avatarColor(seed) {
  const str = String(seed || "");
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export function initialOf(name) {
  const s = String(name || "").trim();
  return s ? s[0].toUpperCase() : "?";
}
