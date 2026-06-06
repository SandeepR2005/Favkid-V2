import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { COLORS, FONTS } from "../theme";
import Icon from "../components/Icon";
import {
  Bar,
  Btn,
  Card,
  Eyebrow,
  LoadingBox,
  MomentumGauge,
  Mono,
  PageTitle,
  Pill,
  Ring,
  SecTitle,
  Sheet,
  Sparkline,
  TopBar,
} from "../components/ui";

const DONE_TASK = ["approved", "completed"];
const PENDING_TASK = ["pending", "assigned", "submitted", "rejected", "in_review"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDue(value) {
  if (!value) return "no deadline";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "no deadline";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function HomeScreen({ profile, onLogout, go }) {
  const [achievements, setAchievements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState(false);

  const load = async (isRefresh) => {
    if (isRefresh) setRefreshing(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const user = userData.user;

    const { data: achievementData } = await supabase
      .from("achievements")
      .select("id, owner_id, title, category, status, progress, overall_deadline_at, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    const list = achievementData || [];
    setAchievements(list);

    const ids = list.map((a) => a.id);
    if (ids.length) {
      const { data: taskData } = await supabase
        .from("achievement_tasks")
        .select("id, achievement_id, title, status, deadline_at, created_at, updated_at")
        .in("achievement_id", ids)
        .order("deadline_at", { ascending: true });
      setTasks(taskData || []);
    } else {
      setTasks([]);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const norm = (s) => String(s || "").toLowerCase();
    const total = achievements.length;
    const completed = achievements.filter((a) => norm(a.status) === "completed").length;
    const active = total - completed;

    const doneTasks = tasks.filter((t) => DONE_TASK.includes(norm(t.status)));
    const totalTasks = tasks.length;
    const completionRatio = totalTasks ? doneTasks.length / totalTasks : 0;

    // Momentum index (credit-score style 300–850) derived from real completion data.
    const momentum = Math.round(300 + 550 * completionRatio);

    // Weekly activity — done tasks per day for the last 7 days.
    const today = startOfDay(new Date());
    const week = [];
    const weekLabels = [];
    let momentumDelta = 0;
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = doneTasks.filter((t) => {
        const ts = new Date(t.updated_at || t.created_at);
        return ts >= day && ts < next;
      }).length;
      week.push(count);
      weekLabels.push(DAY_LABELS[day.getDay()]);
      momentumDelta += count;
    }

    // Streak — consecutive days (ending today) with >= 1 done task.
    let streak = 0;
    for (let i = 0; i < 60; i += 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const has = doneTasks.some((t) => {
        const ts = new Date(t.updated_at || t.created_at);
        return ts >= day && ts < next;
      });
      if (has) streak += 1;
      else if (i > 0) break;
      else break;
    }

    // Up next — nearest pending task by deadline.
    const pending = tasks
      .filter((t) => PENDING_TASK.includes(norm(t.status)))
      .sort((a, b) => {
        const da = a.deadline_at ? new Date(a.deadline_at).getTime() : Infinity;
        const db = b.deadline_at ? new Date(b.deadline_at).getTime() : Infinity;
        return da - db;
      });
    const next = pending[0] || null;

    // Category breakdown (for insights).
    const catCounts = {};
    achievements.forEach((a) => {
      const key = String(a.category || "other").toLowerCase();
      catCounts[key] = (catCounts[key] || 0) + 1;
    });
    const categories = Object.entries(catCounts)
      .map(([name, n]) => ({ name, pct: total ? Math.round((n / total) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct);

    return {
      total,
      active,
      completed,
      momentum,
      momentumDelta,
      streak,
      week,
      weekLabels,
      next,
      approvalRate: Math.round(completionRatio * 100),
      categories,
      avgPerWeek: week.reduce((a, b) => a + b, 0),
    };
  }, [achievements, tasks]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: 20 }}>
          <TopBar onLogout={onLogout} />
        </View>
        <LoadingBox text="Loading your momentum…" />
      </SafeAreaView>
    );
  }

  const maxW = Math.max(1, ...stats.week);
  const todayIdx = stats.week.length - 1;
  const firstName = (profile?.full_name || "FavKid User").split(" ")[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.accent} />
        }
      >
        <TopBar onLogout={onLogout} />

        <Eyebrow color={COLORS.textMute}>Welcome back,</Eyebrow>
        <PageTitle>{firstName}</PageTitle>

        {/* Momentum hero */}
        <Card style={styles.hero}>
          <View style={styles.rowBetween}>
            <Eyebrow>Momentum Index</Eyebrow>
            <Pill bg={COLORS.positiveSoft} color={COLORS.positive} icon="arrowUp">
              +{stats.momentumDelta} this wk
            </Pill>
          </View>

          <MomentumGauge value={stats.momentum} />

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                <Icon name="flame" size={18} color={COLORS.warn} />
                <Text style={[styles.heroStatNum, { color: COLORS.warn }]}>{stats.streak}</Text>
              </View>
              <Text style={styles.heroStatLbl}>day streak</Text>
            </View>
            <TouchableOpacity style={styles.heroStat} onPress={() => setInsights(true)} activeOpacity={0.8}>
              <View style={styles.rowBetween}>
                <Icon name="trend" size={18} color={COLORS.text} />
                <Icon name="chevR" size={15} stroke={2.2} color={COLORS.text} />
              </View>
              <Text style={styles.heroStatLbl}>View insights</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Weekly activity */}
        <Card style={{ marginTop: 14 }}>
          <View style={[styles.rowBetween, { marginBottom: 14 }]}>
            <Text style={styles.cardHeading}>This week</Text>
            <Mono style={{ fontSize: 12, color: COLORS.textMute }}>
              {stats.week.reduce((a, b) => a + b, 0)} tasks
            </Mono>
          </View>
          <View style={styles.weekChart}>
            {stats.week.map((v, i) => (
              <View key={i} style={styles.weekCol}>
                <View
                  style={{
                    width: 14,
                    height: (v / maxW) * 52 + 6,
                    borderRadius: 7,
                    backgroundColor: i === todayIdx ? COLORS.accent : COLORS.surface3,
                  }}
                />
                <Mono style={{ fontSize: 10, color: i === todayIdx ? COLORS.accent : COLORS.textMute, fontWeight: "700" }}>
                  {stats.weekLabels[i]}
                </Mono>
              </View>
            ))}
          </View>
        </Card>

        {/* Up next */}
        {stats.next && (
          <>
            <SecTitle style={{ fontSize: 20, marginBottom: 10 }}>Up next</SecTitle>
            <Card style={styles.upNext}>
              <Ring value={40} size={56} stroke={6} color={COLORS.accent}>
                <Icon name="bolt" size={20} color={COLORS.text} />
              </Ring>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.upNextTitle} numberOfLines={1}>
                  {stats.next.title}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <Icon name="clock" size={13} color={COLORS.textMute} />
                  <Text style={styles.upNextSub}>Due {formatDue(stats.next.deadline_at)}</Text>
                </View>
              </View>
              <Btn title="Open" small onPress={() => go("achievements")} />
            </Card>
          </>
        )}

        {/* Grow your circle */}
        <Card style={styles.circle}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Icon name="handshake" size={20} stroke={2} color={COLORS.text} />
            <Text style={styles.circleTitle}>Grow your circle</Text>
          </View>
          <Text style={styles.circleText}>
            Connect with mentors, coaches, or friends who verify your wins and keep you honest.
          </Text>
          <Btn
            title="Find favorite people"
            variant="ink"
            iconRight="arrowR"
            onPress={() => go("connect")}
          />
        </Card>
      </ScrollView>

      <Sheet visible={insights} onClose={() => setInsights(false)}>
        <Eyebrow>Analytics</Eyebrow>
        <Text style={[styles.sheetTitle, { marginTop: 6 }]}>Your insights</Text>

        <Card style={[styles.hero, { marginTop: 16 }]}>
          <View style={styles.rowBetween}>
            <Mono style={styles.metaLabel}>MOMENTUM · THIS WEEK</Mono>
            <Pill bg={COLORS.positiveSoft} color={COLORS.positive} icon="arrowUp">
              +{stats.momentumDelta}
            </Pill>
          </View>
          <View style={{ marginTop: 12 }}>
            <Sparkline data={stats.week.length ? stats.week : [0, 0]} />
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <InsightStat icon="check" value={`${stats.approvalRate}%`} label="Approval rate" />
          <InsightStat icon="trophy" value={stats.completed} label="Completed" />
          <InsightStat icon="trend" value={stats.avgPerWeek} label="This week" />
        </View>

        {stats.categories.length > 0 && (
          <Card style={{ marginTop: 12 }}>
            <Text style={styles.cardHeading}>By category</Text>
            <View style={{ gap: 12, marginTop: 14 }}>
              {stats.categories.map((c) => (
                <View key={c.name}>
                  <View style={[styles.rowBetween, { marginBottom: 6 }]}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.text, textTransform: "capitalize" }}>
                      {c.name}
                    </Text>
                    <Mono style={{ fontSize: 12, color: COLORS.textMute }}>{c.pct}%</Mono>
                  </View>
                  <Bar value={c.pct} />
                </View>
              ))}
            </View>
          </Card>
        )}

        <Btn title="Close" variant="ghost" onPress={() => setInsights(false)} style={{ marginTop: 18 }} />
      </Sheet>
    </SafeAreaView>
  );
}

function InsightStat({ icon, value, label }) {
  return (
    <Card style={{ flex: 1, padding: 14 }}>
      <Icon name={icon} size={17} color={COLORS.accent} />
      <Text style={[styles.insightNum]}>{value}</Text>
      <Text style={styles.insightLbl}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hero: { marginTop: 16, backgroundColor: COLORS.ink, borderColor: COLORS.borderSoft, overflow: "hidden" },
  heroStatsRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  heroStat: { flex: 1, backgroundColor: COLORS.surface2, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 },
  heroStatNum: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 24 },
  heroStatLbl: { fontSize: 12, color: COLORS.textDim, marginTop: 7, fontWeight: "600" },
  cardHeading: { fontWeight: "700", fontSize: 15, color: COLORS.text },
  weekChart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 70 },
  weekCol: { flex: 1, alignItems: "center", gap: 8 },
  upNext: { flexDirection: "row", gap: 14, alignItems: "center" },
  upNextTitle: { fontWeight: "700", fontSize: 15.5, color: COLORS.text },
  upNextSub: { color: COLORS.textMute, fontSize: 12.5 },
  circle: { marginTop: 14, backgroundColor: COLORS.accentSoft, borderColor: "transparent" },
  circleTitle: { fontWeight: "800", fontSize: 15.5, fontFamily: FONTS.display, color: COLORS.text },
  circleText: { color: COLORS.textDim, fontSize: 13.5, lineHeight: 20, marginTop: 8, marginBottom: 14 },
  sheetTitle: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 28, color: COLORS.text },
  metaLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.textMute },
  insightNum: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 24, color: COLORS.text, marginTop: 8 },
  insightLbl: { fontSize: 11, color: COLORS.textDim, marginTop: 2, fontWeight: "600" },
});
