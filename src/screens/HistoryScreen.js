import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

const COLORS = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  brand50: "#EEF0FF",
  brand100: "#E0E4FF",
  brand500: "#6366F1",
  brand600: "#4F46E5",
  brand700: "#4338CA",
  ink900: "#0F172A",
  ink700: "#334155",
  ink500: "#64748B",
  ink400: "#94A3B8",
  ink300: "#CBD5E1",
  ink200: "#E5E7EB",
  ink100: "#F1F5F9",
  success: "#10B981",
  successBg: "#ECFDF5",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  danger: "#EF4444",
  dangerBg: "#FFF1F2",
};

const navItems = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "achieve", label: "Achieve", icon: "🏅" },
  { key: "mentor", label: "Mentor", icon: "▣" },
  { key: "matrix", label: "Matrix", icon: "🎲", center: true },
  { key: "history", label: "History", icon: "☑" },
  { key: "rank", label: "Rank", icon: "▥" },
  { key: "connect", label: "Connect", icon: "👥" },
];

function Header({ eyebrow, title, subtitle, right }) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      {right}
    </View>
  );
}

function IconButton({ label, children, onPress }) {
  return (
    <TouchableOpacity style={styles.iconButton} onPress={onPress} activeOpacity={0.8} accessibilityLabel={label}>
      <Text style={styles.iconButtonText}>{children}</Text>
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Badge({ label, tone = "neutral" }) {
  const config = {
    neutral: [COLORS.ink100, COLORS.ink700],
    brand: [COLORS.brand50, COLORS.brand700],
    success: [COLORS.successBg, "#047857"],
    warning: [COLORS.warningBg, "#B45309"],
    danger: [COLORS.dangerBg, "#BE123C"],
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: config[0] }]}>
      <Text style={[styles.badgeText, { color: config[1] }]}>{label}</Text>
    </View>
  );
}

function Avatar({ initial, size = 40, active = false, tone = "neutral" }) {
  const bg = tone === "brand" ? COLORS.brand50 : COLORS.ink100;
  const text = tone === "brand" ? COLORS.brand700 : COLORS.ink700;
  return (
    <View style={{ position: "relative" }}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
        <Text style={[styles.avatarText, { color: text, fontSize: size * 0.36 }]}>{initial}</Text>
      </View>
      {active && <View style={styles.onlineDot} />}
    </View>
  );
}

function ProgressBar({ value, color = COLORS.brand600 }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

function BottomNav({ active }) {
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = item.key === active;
        if (item.center) {
          return (
            <TouchableOpacity key={item.key} style={styles.navItem} activeOpacity={0.85} onPress={() => console.log("Open Matrix")}>
              <View style={[styles.matrixNavButton, isActive && styles.matrixNavButtonActive]}>
                <Text style={styles.matrixNavIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.navLabel, styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity key={item.key} style={styles.navItem} activeOpacity={0.85} onPress={() => console.log(`Navigate to ${item.label}`)}>
            <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{item.icon}</Text>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState("All");
  const chips = ["All", "Completed", "Expired", "This month"];
  const week = [
    { category: "Landing page", title: "Draft hero section copy", coach: "Maya K.", status: "Done", date: "May 22", type: "image" },
    { category: "Thesis", title: "Write 500 words on framing", coach: "Jordan L.", status: "Done", date: "May 21", type: "pdf" },
    { category: "Running", title: "Wednesday tempo run", coach: "Ravi P.", status: "Missed", date: "May 20", type: "missed" },
  ];
  const earlier = [
    { category: "Design", title: "Create pricing wireframe", coach: "Maya K.", status: "Done", date: "May 18", type: "image" },
    { category: "Writing", title: "Summarize chapter notes", coach: "Jordan L.", status: "Done", date: "May 16", type: "pdf" },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header eyebrow="Mission archive" title="History" subtitle="Every mission you've shipped or missed." />
        <View style={styles.section}>
          <Card style={historyStyles.statsStrip}>
            <HistoryStat value="38" label="Completed" />
            <HistoryStat value="6" label="Expired" divider />
            <HistoryStat value="86%" label="Success rate" />
          </Card>
        </View>
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {chips.map((chip) => (
              <TouchableOpacity key={chip} style={[historyStyles.chip, filter === chip && historyStyles.chipActive]} onPress={() => setFilter(chip)} activeOpacity={0.85}>
                <Text style={[historyStyles.chipText, filter === chip && historyStyles.chipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <HistoryGroup title="This week" items={week} />
        <HistoryGroup title="Earlier in May" items={earlier} />
      </ScrollView>
      <BottomNav active="history" />
    </SafeAreaView>
  );
}

function HistoryStat({ value, label, divider }) {
  return (
    <View style={[historyStyles.stat, divider && historyStyles.statDivider]}>
      <Text style={historyStyles.statValue}>{value}</Text>
      <Text style={historyStyles.statLabel}>{label}</Text>
    </View>
  );
}

function HistoryGroup({ title, items }) {
  return (
    <View style={styles.section}>
      <Text style={historyStyles.groupLabel}>{title}</Text>
      {items.map((item) => <HistoryItem key={item.title} item={item} />)}
    </View>
  );
}

function HistoryItem({ item }) {
  const missed = item.status === "Missed";
  const icon = item.type === "pdf" ? "PDF" : item.type === "missed" ? "✕" : "IMG";
  return (
    <Card style={[historyStyles.historyItem, missed && { opacity: 0.72 }]}>
      <View style={[historyStyles.thumbnail, missed && { backgroundColor: COLORS.dangerBg, borderColor: "#FFE4E6" }]}>
        <Text style={[historyStyles.thumbText, item.type === "pdf" && { color: COLORS.danger }]}>{icon}</Text>
      </View>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Badge label={item.category} tone={missed ? "danger" : item.category === "Thesis" ? "success" : "brand"} />
        <Text style={[historyStyles.itemTitle, missed && { textDecorationLine: "line-through", textDecorationColor: "#FDA4AF" }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[historyStyles.itemSub, missed && { color: COLORS.danger, fontWeight: "800" }]}>{missed ? "Mission expired" : `Guided by ${item.coach}`}</Text>
      </View>
      <View style={historyStyles.itemRight}>
        <Badge label={item.status} tone={missed ? "danger" : "success"} />
        <Text style={historyStyles.dateText}>{item.date}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 112 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, flexDirection: "row", alignItems: "flex-start" },
  eyebrow: { color: COLORS.ink500, fontSize: 14, fontWeight: "500" },
  headerTitle: { color: COLORS.ink900, fontSize: 26, fontWeight: "800", letterSpacing: -0.4, marginTop: 2 },
  headerSubtitle: { color: COLORS.ink500, fontSize: 13, marginTop: 4, lineHeight: 19 },
  iconRow: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.ink200, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  iconButtonText: { color: COLORS.ink700, fontSize: 16, fontWeight: "700" },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: COLORS.ink900, fontSize: 15, fontWeight: "700" },
  sectionMeta: { color: COLORS.ink500, fontSize: 12 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.ink200, borderRadius: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  badgeText: { fontSize: 10.5, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  avatar: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.ink200 },
  avatarText: { fontWeight: "800" },
  onlineDot: { position: "absolute", right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.card },
  progressTrack: { height: 7, borderRadius: 999, backgroundColor: COLORS.ink100, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.97)", borderTopWidth: 1, borderTopColor: COLORS.ink200, paddingTop: 8, paddingBottom: 12, paddingHorizontal: 6, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  navItem: { flex: 1, alignItems: "center", justifyContent: "flex-end", minHeight: 54, position: "relative" },
  navIcon: { fontSize: 16, color: COLORS.ink400 },
  navIconActive: { color: COLORS.brand600 },
  navLabel: { fontSize: 10, fontWeight: "700", color: COLORS.ink500, marginTop: 2 },
  navLabelActive: { color: COLORS.brand600 },
  activeDot: { position: "absolute", bottom: -4, width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.brand600 },
  matrixNavButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.brand600, alignItems: "center", justifyContent: "center", marginBottom: 2, shadowColor: COLORS.brand600, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  matrixNavButtonActive: { backgroundColor: COLORS.brand700 },
  matrixNavIcon: { fontSize: 20, color: "#FFFFFF" },
  input: { backgroundColor: COLORS.ink100, borderWidth: 1, borderColor: COLORS.ink200, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.ink900, fontSize: 14 },
  primaryButton: { backgroundColor: COLORS.brand600, borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  secondaryButton: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.ink200, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  secondaryButtonText: { color: COLORS.ink700, fontSize: 13, fontWeight: "800" },
});

const historyStyles = StyleSheet.create({
  statsStrip: { paddingVertical: 16, flexDirection: "row" },
  stat: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.ink200 },
  statValue: { color: COLORS.ink900, fontSize: 19, fontWeight: "900" },
  statLabel: { color: COLORS.ink500, fontSize: 11, fontWeight: "700", marginTop: 5 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: COLORS.ink200, backgroundColor: COLORS.card, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.ink900, borderColor: COLORS.ink900 },
  chipText: { color: COLORS.ink700, fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: "#FFFFFF" },
  groupLabel: { color: COLORS.ink500, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginLeft: 4 },
  historyItem: { padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  thumbnail: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.ink100, borderWidth: 1, borderColor: COLORS.ink200, alignItems: "center", justifyContent: "center" },
  thumbText: { color: COLORS.ink400, fontSize: 11, fontWeight: "900" },
  itemTitle: { color: COLORS.ink900, fontSize: 14, fontWeight: "800", marginTop: 6 },
  itemSub: { color: COLORS.ink500, fontSize: 11, marginTop: 3 },
  itemRight: { alignItems: "flex-end" },
  dateText: { color: COLORS.ink400, fontSize: 11, fontWeight: "700", marginTop: 8 },
});
