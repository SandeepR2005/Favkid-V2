/* FavKid — shared UI primitives (RN port of favkid_screens components + CSS). */
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import Icon from "./Icon";
import { COLORS, RADIUS, FONTS, initialOf } from "../theme";

/* ---------------- Text helpers ---------------- */
export function Eyebrow({ children, color = COLORS.accent, style }) {
  return <Text style={[styles.eyebrow, { color }, style]}>{children}</Text>;
}
export function PageTitle({ children, style }) {
  return <Text style={[styles.pageTitle, style]}>{children}</Text>;
}
export function PageSub({ children, style }) {
  return <Text style={[styles.pageSub, style]}>{children}</Text>;
}
export function SecTitle({ children, style }) {
  return <Text style={[styles.secTitle, style]}>{children}</Text>;
}
export function Display({ children, style }) {
  return <Text style={[styles.display, style]}>{children}</Text>;
}
export function Mono({ children, style }) {
  return <Text style={[styles.mono, style]}>{children}</Text>;
}

/* ---------------- Card ---------------- */
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ---------------- Buttons ---------------- */
export function Btn({
  title,
  onPress,
  variant = "primary",
  icon,
  iconRight,
  disabled,
  small,
  style,
  loading,
}) {
  const bg =
    variant === "primary"
      ? COLORS.accent
      : variant === "ink"
      ? COLORS.ink
      : COLORS.surface2;
  const fg =
    variant === "primary"
      ? COLORS.accentInk
      : variant === "ink"
      ? COLORS.onInk
      : COLORS.text;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        small && styles.btnSm,
        { backgroundColor: bg, opacity: disabled || loading ? 0.55 : 1 },
        variant === "ghost" && { borderWidth: 1, borderColor: COLORS.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={small ? 16 : 18} stroke={2.1} color={fg} /> : null}
          <Text style={[styles.btnText, small && { fontSize: 13 }, { color: fg }]}>{title}</Text>
          {iconRight ? <Icon name={iconRight} size={small ? 16 : 18} stroke={2.2} color={fg} /> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

export function DangerSmBtn({ title = "Logout", onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.dangerSm}>
      <Text style={styles.dangerSmText}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ---------------- Chip ---------------- */
export function Chip({ label, on, onPress, icon, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, on && styles.chipOn, style]}
    >
      {icon ? (
        <Icon name={icon} size={14} stroke={2} color={on ? COLORS.accentInk : COLORS.textDim} />
      ) : null}
      <Text style={[styles.chipText, { color: on ? COLORS.accentInk : COLORS.textDim }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------------- Pill ---------------- */
export function Pill({ children, bg = COLORS.surface2, color = COLORS.textDim, dotColor, icon, style }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      {icon ? <Icon name={icon} size={13} color={color} /> : null}
      <Text style={[styles.pillText, { color }]}>{children}</Text>
    </View>
  );
}

export function StatusPill({ status }) {
  const active = String(status).toLowerCase() === "active";
  return (
    <Pill
      bg={active ? COLORS.positiveSoft : COLORS.surface3}
      color={active ? COLORS.positive : COLORS.textDim}
      dotColor={active ? COLORS.positive : COLORS.textMute}
    >
      {status}
    </Pill>
  );
}

/* ---------------- StatBox triplet ---------------- */
export function StatBox({ num, label, hl }) {
  return (
    <View style={[styles.stat, hl && styles.statHl]}>
      <Text style={[styles.statNum, hl && { color: COLORS.accent }]}>{num}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

/* ---------------- Progress bar ---------------- */
export function Bar({ value = 0, done }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, {
      toValue: Math.max(0, Math.min(100, value)),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value]);
  const width = w.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  return (
    <View style={styles.bar}>
      <Animated.View
        style={[styles.barFill, { width, backgroundColor: done ? COLORS.text : COLORS.accent }]}
      />
    </View>
  );
}

/* ---------------- Progress ring ---------------- */
export function Ring({ value = 0, size = 92, stroke = 9, color = COLORS.positive, track = COLORS.surface3, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}

/* ---------------- Momentum gauge (semi-circle, credit-score style) ---------------- */
export function MomentumGauge({ value = 0, min = 300, max = 850 }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const W = 240, H = 130, cx = W / 2, cy = 118, r = 96, sw = 14;
  const arc = Math.PI * r;
  const label = value >= 740 ? "Excellent" : value >= 670 ? "Strong" : value >= 580 ? "Building" : "Getting started";
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ maxWidth: 260 }}>
        <Defs>
          <LinearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={COLORS.info} />
            <Stop offset="0.55" stopColor={COLORS.accent} />
            <Stop offset="1" stopColor={COLORS.positive} />
          </LinearGradient>
        </Defs>
        <Path d={d} fill="none" stroke={COLORS.surface3} strokeWidth={sw} strokeLinecap="round" />
        <Path
          d={d}
          fill="none"
          stroke="url(#gauge)"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={arc}
          strokeDashoffset={arc - pct * arc}
        />
      </Svg>
      <View style={{ position: "absolute", top: 30, alignItems: "center" }}>
        <Text style={[styles.display, { fontSize: 52, color: COLORS.onInk }]}>{value}</Text>
        <Text style={[styles.mono, { fontSize: 11, letterSpacing: 1.4, color: COLORS.accent, marginTop: 4, textTransform: "uppercase" }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Sparkline ---------------- */
export function Sparkline({ data = [], color = COLORS.accent, height = 64 }) {
  if (!data.length) return <View style={{ height }} />;
  const w = 300;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((dv, i) => [
    (i / (data.length - 1 || 1)) * w,
    h - ((dv - min) / span) * (h - 10) - 5,
  ]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <Svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.28" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#spark)" />
      <Path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r="3.4" fill={color} />
    </Svg>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({ label, color, soft, round, ink, size = 44 }) {
  const bg = ink ? COLORS.ink : soft || COLORS.surface3;
  const fg = ink ? COLORS.onInk : color || COLORS.textDim;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: round ? size / 2 : 13,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontFamily: FONTS.display, fontWeight: "800", fontSize: size * 0.4, color: fg }}>
        {initialOf(label)}
      </Text>
    </View>
  );
}

/* ---------------- Form field ---------------- */
export function Field({ label, children }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

export function Input(props) {
  return (
    <TextInput
      placeholderTextColor={COLORS.textMute}
      {...props}
      style={[styles.input, props.multiline && styles.textarea, props.style]}
    />
  );
}

/* ---------------- Top bar ---------------- */
export function TopBar({ brand = "FAVKID", onLogout, right }) {
  return (
    <View style={styles.topbar}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={styles.brandMark}>
          <Icon name="spark" size={20} stroke={2.2} color={COLORS.accentInk} />
        </View>
        <Text style={styles.brandText}>{brand}</Text>
      </View>
      {right || (onLogout ? <DangerSmBtn onPress={onLogout} /> : null)}
    </View>
  );
}

/* ---------------- Bottom sheet ---------------- */
export function Sheet({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetWrap}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grip} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- Loading ---------------- */
export function LoadingBox({ text = "Loading…" }) {
  return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontFamily: FONTS.display,
    fontWeight: "800",
    fontSize: 35,
    letterSpacing: -1,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 6,
  },
  pageSub: { color: COLORS.textDim, fontSize: 14.5, lineHeight: 21 },
  secTitle: {
    fontFamily: FONTS.display,
    fontWeight: "800",
    fontSize: 24,
    letterSpacing: -0.5,
    color: COLORS.text,
    marginTop: 26,
    marginBottom: 12,
  },
  display: { fontFamily: FONTS.display, fontWeight: "800", letterSpacing: -0.4, color: COLORS.text },
  mono: { fontFamily: FONTS.mono, color: COLORS.text },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    padding: 18,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    paddingHorizontal: 18,
    width: "100%",
  },
  btnSm: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 11, width: undefined },
  btnText: { fontWeight: "700", fontSize: 15 },
  dangerSm: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.pill,
    paddingVertical: 9,
    paddingHorizontal: 17,
  },
  dangerSmText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  chipOn: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 13, fontWeight: "600" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: RADIUS.pill,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 11.5, fontWeight: "700" },
  dot: { width: 7, height: 7, borderRadius: 4 },
  stat: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 13,
  },
  statHl: { backgroundColor: COLORS.accentSoft, borderColor: "transparent" },
  statNum: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 30, color: COLORS.text },
  statLbl: { fontSize: 12, color: COLORS.textDim, marginTop: 6, fontWeight: "600" },
  bar: { height: 9, borderRadius: 99, backgroundColor: COLORS.surface3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99 },
  field: { marginTop: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: 7, color: COLORS.text },
  input: {
    width: "100%",
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  textarea: { minHeight: 92, textAlignVertical: "top", lineHeight: 22 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 14,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", letterSpacing: 0.8, color: COLORS.textDim },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: "86%",
  },
  grip: { width: 42, height: 5, borderRadius: 99, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 16 },
  loadingBox: { paddingVertical: 40, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, fontSize: 13, fontWeight: "700", color: COLORS.textMute },
});

export { Icon, COLORS, RADIUS, FONTS };
