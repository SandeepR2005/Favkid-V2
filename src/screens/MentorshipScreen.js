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

export default function MentorshipScreen() {
  const [tab, setTab] = useState("verify");
  const requests = [
    { initial: "S", name: "Sandeep K.", title: "Morning workout · 5 km run", time: "Submitted 14 min ago", proof: "Image proof attached" },
    { initial: "A", name: "Anika S.", title: "Write 500 words · chapter draft", time: "Submitted 1 h ago", proof: "chapter-1-draft.pdf · 312 KB" },
  ];
  const trainees = [
    { initial: "S", name: "Sandeep K.", focus: "Startup landing page", last: "Last mission completed yesterday" },
    { initial: "A", name: "Anika S.", focus: "Writing consistency", last: "Needs a new task today" },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header eyebrow="Coach view" title="Mentorship" subtitle="Review proofs and assign missions to your trainees." />

        <View style={styles.section}>
          <View style={mentorStyles.segmentWrap}>
            <SegmentButton active={tab === "verify"} label="Verify" count="2" onPress={() => setTab("verify")} />
            <SegmentButton active={tab === "assign"} label="Assign" onPress={() => setTab("assign")} />
          </View>
        </View>

        {tab === "verify" ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Awaiting verification</Text>
              <Text style={styles.sectionMeta}>2 pending</Text>
            </View>
            {requests.map((item) => <VerifyCard key={item.title} item={item} />)}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trainees waiting</Text>
              <Text style={styles.sectionMeta}>2 students</Text>
            </View>
            {trainees.map((item) => <AssignCard key={item.name} item={item} />)}
          </View>
        )}
      </ScrollView>
      <BottomNav active="mentor" />
    </SafeAreaView>
  );
}

function SegmentButton({ active, label, count, onPress }) {
  return (
    <TouchableOpacity style={[mentorStyles.segmentButton, active && mentorStyles.segmentButtonActive]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[mentorStyles.segmentText, active && mentorStyles.segmentTextActive]}>{label}</Text>
      {count && <View style={mentorStyles.countBadge}><Text style={mentorStyles.countText}>{count}</Text></View>}
    </TouchableOpacity>
  );
}

function VerifyCard({ item }) {
  return (
    <Card style={mentorStyles.verifyCard}>
      <View style={mentorStyles.verifyHeader}>
        <Avatar initial={item.initial} size={42} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={mentorStyles.personName}>{item.name}</Text>
          <Text style={mentorStyles.verifyTitle}>{item.title}</Text>
          <Text style={mentorStyles.timeText}>{item.time}</Text>
        </View>
        <Badge label="Review" tone="warning" />
      </View>
      <TouchableOpacity style={mentorStyles.proofPreview} onPress={() => console.log("Open proof")} activeOpacity={0.85}>
        <View style={mentorStyles.proofIcon}><Text style={mentorStyles.proofIconText}>{item.proof.includes("pdf") ? "PDF" : "IMG"}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={mentorStyles.proofTitle}>{item.proof}</Text>
          <Text style={mentorStyles.proofSub}>Tap to review submitted proof</Text>
        </View>
        <Text style={mentorStyles.openIcon}>↗</Text>
      </TouchableOpacity>
      <View style={mentorStyles.actionRow}>
        <TouchableOpacity style={[styles.secondaryButton, mentorStyles.actionButton]} onPress={() => console.log("Reject")}> 
          <Text style={styles.secondaryButtonText}>✕ Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[mentorStyles.approveButton, mentorStyles.actionButton]} onPress={() => console.log("Approve")}> 
          <Text style={mentorStyles.approveText}>✓ Approve</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function AssignCard({ item }) {
  return (
    <Card style={mentorStyles.assignCard}>
      <View style={mentorStyles.verifyHeader}>
        <Avatar initial={item.initial} size={42} tone="brand" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={mentorStyles.assignName}>{item.name}</Text>
          <Text style={mentorStyles.timeText}>{item.last}</Text>
        </View>
      </View>
      <Text style={mentorStyles.fieldLabel}>Suggested mission</Text>
      <TextInput placeholder={item.focus} placeholderTextColor={COLORS.ink500} style={styles.input} />
      <View style={mentorStyles.assignFooter}>
        <TouchableOpacity style={mentorStyles.templateButton}><Text style={mentorStyles.templateButtonText}>Use template</Text></TouchableOpacity>
        <TouchableOpacity style={mentorStyles.assignButton}><Text style={mentorStyles.assignButtonText}>Assign</Text></TouchableOpacity>
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

const mentorStyles = StyleSheet.create({
  segmentWrap: { backgroundColor: COLORS.ink100, borderRadius: 14, padding: 4, flexDirection: "row" },
  segmentButton: { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  segmentButtonActive: { backgroundColor: COLORS.card, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  segmentText: { color: COLORS.ink500, fontSize: 13, fontWeight: "800" },
  segmentTextActive: { color: COLORS.ink900 },
  countBadge: { backgroundColor: "#FEF3C7", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  countText: { color: "#B45309", fontSize: 10, fontWeight: "900" },
  verifyCard: { padding: 20, marginBottom: 12 },
  verifyHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  personName: { color: COLORS.ink500, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  verifyTitle: { color: COLORS.ink900, fontSize: 15, fontWeight: "800", lineHeight: 20, marginTop: 2 },
  timeText: { color: COLORS.ink500, fontSize: 12, marginTop: 4 },
  proofPreview: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.ink100, borderWidth: 1, borderColor: COLORS.ink200, borderRadius: 14, padding: 12, marginBottom: 14 },
  proofIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.ink200, alignItems: "center", justifyContent: "center", marginRight: 12 },
  proofIconText: { color: COLORS.danger, fontSize: 11, fontWeight: "900" },
  proofTitle: { color: COLORS.ink900, fontSize: 13, fontWeight: "800" },
  proofSub: { color: COLORS.ink500, fontSize: 11, marginTop: 3 },
  openIcon: { color: COLORS.ink400, fontSize: 18, fontWeight: "700" },
  actionRow: { flexDirection: "row" },
  actionButton: { flex: 1, marginRight: 8 },
  approveButton: { backgroundColor: COLORS.success, borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", flex: 1 },
  approveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  assignCard: { padding: 20, marginBottom: 12 },
  assignName: { color: COLORS.ink900, fontSize: 15, fontWeight: "800" },
  fieldLabel: { color: COLORS.ink500, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 },
  assignFooter: { flexDirection: "row", marginTop: 12 },
  templateButton: { flex: 1, borderWidth: 1, borderColor: COLORS.ink200, borderRadius: 12, paddingVertical: 11, alignItems: "center", marginRight: 8, backgroundColor: COLORS.card },
  templateButtonText: { color: COLORS.ink700, fontSize: 13, fontWeight: "800" },
  assignButton: { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: "center", backgroundColor: COLORS.brand600 },
  assignButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
