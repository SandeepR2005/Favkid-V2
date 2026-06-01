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

export default function HomeScreen() {
  const coaches = [
    { name: "Maya K.", initial: "M", active: true },
    { name: "Jordan L.", initial: "J" },
    { name: "Ravi P.", initial: "R", active: true },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          eyebrow="Welcome back,"
          title="Sandeep"
          subtitle="Let's make today count."
          right={
            <View style={styles.iconRow}>
              <IconButton label="Notifications">🔔</IconButton>
              <IconButton label="Logout">↗</IconButton>
            </View>
          }
        />

        <View style={styles.section}>
          <Card style={homeStyles.statsCard}>
            <View style={homeStyles.statItem}>
              <View style={[homeStyles.statIcon, { backgroundColor: "#FFFBEB" }]}><Text>🔥</Text></View>
              <Text style={homeStyles.statValue}>12</Text>
              <Text style={homeStyles.statLabel}>Day streak</Text>
            </View>
            <View style={[homeStyles.statItem, homeStyles.statDivider]}>
              <View style={[homeStyles.statIcon, { backgroundColor: COLORS.brand50 }]}><Text>⚡</Text></View>
              <Text style={homeStyles.statValue}>1,240</Text>
              <Text style={homeStyles.statLabel}>Points</Text>
            </View>
            <View style={homeStyles.statItem}>
              <View style={[homeStyles.statIcon, { backgroundColor: COLORS.successBg }]}><Text>🏆</Text></View>
              <Text style={homeStyles.statValue}>#42</Text>
              <Text style={homeStyles.statLabel}>Rank</Text>
            </View>
            <View style={homeStyles.levelWrap}>
              <View style={homeStyles.levelHeader}>
                <Text style={homeStyles.levelTitle}>Level 7</Text>
                <Text style={homeStyles.levelSub}>760 points to Level 8</Text>
              </View>
              <ProgressBar value={62} />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your coaches</Text>
            <TouchableOpacity onPress={() => console.log("Manage coaches")}><Text style={homeStyles.link}>Manage →</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeStyles.coachScroll}>
            {coaches.map((coach) => (
              <View key={coach.name} style={homeStyles.coachItem}>
                <Avatar initial={coach.initial} size={56} active={coach.active} />
                <Text style={homeStyles.coachName} numberOfLines={1}>{coach.name}</Text>
              </View>
            ))}
            <TouchableOpacity style={homeStyles.coachItem} onPress={() => console.log("Add coach")} activeOpacity={0.8}>
              <View style={homeStyles.addCoachCircle}><Text style={homeStyles.addCoachPlus}>+</Text></View>
              <Text style={homeStyles.coachName}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active mission</Text>
            <Text style={styles.sectionMeta}>#MSN-0042</Text>
          </View>
          <Card style={homeStyles.missionCard}>
            <View style={homeStyles.missionTopRow}>
              <Badge label="In progress" tone="success" />
              <Text style={homeStyles.points}>💎 +250 pts</Text>
            </View>
            <Text style={homeStyles.missionTitle}>Build a landing page prototype</Text>
            <Text style={homeStyles.missionDescription}>Ship a clickable Figma flow with hero, pricing, and signup. Coach reviews before deadline.</Text>

            <View style={homeStyles.detailBlock}>
              <InfoRow label="Deadline" value="Fri, 29 May · 23:59" icon="🕒" />
              <InfoRow label="Assigned coach" value="Maya K." icon="👤" />
              <InfoRow label="Category" value="Design · Prototyping" icon="📁" />
            </View>

            <Text style={homeStyles.proofTitle}>Submit proof</Text>
            <TouchableOpacity style={homeStyles.uploadBox} onPress={() => console.log("Choose file")} activeOpacity={0.85}>
              <Text style={homeStyles.uploadIcon}>☁️</Text>
              <Text style={homeStyles.uploadTitle}>Choose a file or drag here</Text>
              <Text style={homeStyles.uploadSub}>PNG or JPG · up to 10 MB</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={() => console.log("Submit for review")} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Send proof for review</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
      <BottomNav active="home" />
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={homeStyles.infoRow}>
      <View style={homeStyles.infoLeft}><Text style={homeStyles.infoIcon}>{icon}</Text><Text style={homeStyles.infoLabel}>{label}</Text></View>
      <Text style={homeStyles.infoValue}>{value}</Text>
    </View>
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

const homeStyles = StyleSheet.create({
  statsCard: { padding: 16, flexDirection: "row", flexWrap: "wrap" },
  statItem: { flex: 1, minWidth: "33%", alignItems: "center", paddingHorizontal: 8 },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.ink200 },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { color: COLORS.ink900, fontSize: 18, fontWeight: "800" },
  statLabel: { color: COLORS.ink500, fontSize: 11, fontWeight: "600", marginTop: 4 },
  levelWrap: { width: "100%", marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.ink200 },
  levelHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  levelTitle: { color: COLORS.ink700, fontSize: 13, fontWeight: "800" },
  levelSub: { color: COLORS.ink500, fontSize: 12 },
  link: { color: COLORS.brand600, fontSize: 13, fontWeight: "700" },
  coachScroll: { paddingRight: 20 },
  coachItem: { width: 72, alignItems: "center", marginRight: 12 },
  coachName: { color: COLORS.ink700, fontSize: 11, fontWeight: "700", marginTop: 8, width: 72, textAlign: "center" },
  addCoachCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: "dashed", borderColor: COLORS.ink300, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.card },
  addCoachPlus: { color: COLORS.ink400, fontSize: 24, fontWeight: "700" },
  missionCard: { padding: 20 },
  missionTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  points: { color: COLORS.ink500, fontSize: 12, fontWeight: "700" },
  missionTitle: { color: COLORS.ink900, fontSize: 20, fontWeight: "800", lineHeight: 26, marginBottom: 8 },
  missionDescription: { color: COLORS.ink500, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  detailBlock: { borderTopWidth: 1, borderTopColor: COLORS.ink200, paddingTop: 14, marginBottom: 18 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  infoLeft: { flexDirection: "row", alignItems: "center" },
  infoIcon: { fontSize: 14, marginRight: 10 },
  infoLabel: { color: COLORS.ink500, fontSize: 13 },
  infoValue: { color: COLORS.ink900, fontSize: 13, fontWeight: "800" },
  proofTitle: { color: COLORS.ink700, fontSize: 13, fontWeight: "800", marginBottom: 10 },
  uploadBox: { borderWidth: 2, borderStyle: "dashed", borderColor: COLORS.ink300, borderRadius: 14, paddingVertical: 26, alignItems: "center", marginBottom: 14, backgroundColor: "#FFFFFF" },
  uploadIcon: { fontSize: 24, marginBottom: 6 },
  uploadTitle: { color: COLORS.ink900, fontSize: 13, fontWeight: "800" },
  uploadSub: { color: COLORS.ink500, fontSize: 11, marginTop: 4 },
});
