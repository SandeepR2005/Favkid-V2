import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { COLORS, FONTS, avatarColor, initialOf } from "../theme";
import Icon from "../components/Icon";
import {
  Bar,
  Card,
  Eyebrow,
  LoadingBox,
  Mono,
  PageSub,
  PageTitle,
  SecTitle,
  TopBar,
} from "../components/ui";

export default function LeaderboardScreen({ onLogout }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [weeklyRecap, setWeeklyRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (selectedAchievementId) {
      loadLeaderboard(selectedAchievementId);
      loadWeeklyRecap(selectedAchievementId);
    } else {
      setLeaderboard([]);
      setWeeklyRecap(null);
    }
  }, [selectedAchievementId]);

  const selectedAchievement = useMemo(() => {
    return achievements.find((item) => item.id === selectedAchievementId) || null;
  }, [achievements, selectedAchievementId]);

  const participantCountText = `${leaderboard.length} PARTICIPANT${
    leaderboard.length === 1 ? "" : "S"
  }`;

  const loadPage = async () => {
    const firstLoad = loading;
    if (!firstLoad) setRefreshing(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Login required", "Please login again.");
      return;
    }

    const user = userData.user;
    setCurrentUserId(user.id);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, account_type, points")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Profile fetch failed", profileError.message);
      return;
    }

    setProfile(profileData);

    const rankableAchievements = await loadRankableAchievements(user.id, profileData);
    setAchievements(rankableAchievements);

    if (rankableAchievements.length > 0) {
      const alreadySelected = rankableAchievements.some(
        (item) => item.id === selectedAchievementId
      );

      setSelectedAchievementId(
        alreadySelected ? selectedAchievementId : rankableAchievements[0].id
      );
    } else {
      setSelectedAchievementId(null);
      setLeaderboard([]);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const loadRankableAchievements = async (userId, profileData) => {
    const achievementMap = new Map();
    const accountType = profileData?.account_type;

    if (accountType === "user" || accountType === "both") {
      const { data, error } = await supabase
        .from("achievements")
        .select("id, owner_id, title, status, progress, overall_deadline_at, created_at")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        Alert.alert("Achievement fetch failed", error.message);
      } else {
        (data || []).forEach((item) => {
          achievementMap.set(item.id, { ...item, source_label: "Your achievement" });
        });
      }
    }

    if (accountType === "favorite_person" || accountType === "both") {
      const { data: connectionData, error: connectionError } = await supabase
        .from("connections")
        .select("requester_id")
        .eq("receiver_id", userId)
        .eq("status", "accepted");

      if (connectionError) {
        Alert.alert("Connection fetch failed", connectionError.message);
      } else {
        const ownerIds = [...new Set((connectionData || []).map((item) => item.requester_id))];

        if (ownerIds.length > 0) {
          const { data: connectedAchievements, error: achievementError } = await supabase
            .from("achievements")
            .select("id, owner_id, title, status, progress, overall_deadline_at, created_at")
            .in("owner_id", ownerIds)
            .order("created_at", { ascending: false });

          if (achievementError) {
            Alert.alert("Connected achievements fetch failed", achievementError.message);
          } else {
            (connectedAchievements || []).forEach((item) => {
              achievementMap.set(item.id, { ...item, source_label: "Connected achievement" });
            });
          }
        }
      }

      const { data: assignedData, error: assignedError } = await supabase
        .from("matrix_task_assignments")
        .select(
          `
          achievement_id,
          achievements(id, owner_id, title, status, progress, overall_deadline_at, created_at)
        `
        )
        .eq("favorite_person_id", userId)
        .not("achievement_id", "is", null)
        .order("created_at", { ascending: false });

      if (!assignedError) {
        (assignedData || []).forEach((item) => {
          const achievement = Array.isArray(item.achievements)
            ? item.achievements[0]
            : item.achievements;

          if (achievement?.id) {
            achievementMap.set(achievement.id, {
              ...achievement,
              source_label: "Assigned through Matrix",
            });
          }
        });
      }
    }

    return Array.from(achievementMap.values()).sort((a, b) => {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const loadLeaderboard = async (achievementId) => {
    setLoadingBoard(true);

    const improvedResult = await supabase.rpc("get_achievement_favorite_leaderboard_v2", {
      p_achievement_id: achievementId,
    });

    if (!improvedResult.error) {
      setLeaderboard(improvedResult.data || []);
      setLoadingBoard(false);
      return;
    }

    const { data, error } = await supabase.rpc("get_achievement_favorite_leaderboard", {
      p_achievement_id: achievementId,
    });

    if (error) {
      setLoadingBoard(false);
      Alert.alert("Leaderboard fetch failed", improvedResult.error?.message || error.message);
      return;
    }

    setLeaderboard(data || []);
    setLoadingBoard(false);
  };

  const loadWeeklyRecap = async (achievementId) => {
    const { data, error } = await supabase.rpc("get_achievement_weekly_recap", {
      p_achievement_id: achievementId,
    });

    if (error) {
      setWeeklyRecap(null);
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setWeeklyRecap(row || null);
  };

  const onRefresh = async () => {
    await loadPage();
    if (selectedAchievementId) {
      await loadLeaderboard(selectedAchievementId);
      await loadWeeklyRecap(selectedAchievementId);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: 20 }}>
          <TopBar brand="FAVORITE PERSON POINTS" onLogout={onLogout} />
        </View>
        <LoadingBox text="Loading ranking…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >
        <TopBar brand="FAVORITE PERSON POINTS" onLogout={onLogout} />

        <PageTitle>Ranking</PageTitle>
        <PageSub>
          Calculated separately for each achievement. A new achievement starts the ranking fresh;
          old history stays stored.
        </PageSub>

        <SecTitle style={{ fontSize: 20 }}>Point rules</SecTitle>
        <View style={{ gap: 10 }}>
          <Card style={[styles.ruleCard, { borderLeftColor: COLORS.info }]}>
            <View style={styles.ruleHead}>
              <Icon name="eye" size={17} color={COLORS.info} />
              <Mono style={[styles.ruleKicker, { color: COLORS.info }]}>VERIFICATION</Mono>
            </View>
            <Text style={styles.ruleBody}>
              Points are awarded only after the favorite person views the proof and approves the
              submitted task.
            </Text>
          </Card>
          <Card style={[styles.ruleCard, { borderLeftColor: COLORS.warn }]}>
            <View style={styles.ruleHead}>
              <Icon name="clock" size={17} color={COLORS.warn} />
              <Mono style={[styles.ruleKicker, { color: COLORS.warn }]}>TIME SENSITIVITY</Mono>
            </View>
            <Text style={styles.ruleBody}>
              Earlier completion earns more points. Late completion gives reduced points based on
              your selected formula.
            </Text>
          </Card>
          <Card style={[styles.ruleCard, { borderLeftColor: COLORS.accent }]}>
            <View style={styles.ruleHead}>
              <Icon name="trophy" size={17} color={COLORS.accent} />
              <Mono style={[styles.ruleKicker, { color: COLORS.accent }]}>QUALITY SCORE</Mono>
            </View>
            <Text style={styles.ruleBody}>
              Ranking now considers assigned tasks, approvals, prediction accuracy, feedback quality, and support consistency.
            </Text>
          </Card>
        </View>

        {achievements.length === 0 ? (
          <Card style={{ marginTop: 18, borderStyle: "dashed" }}>
            <Text style={styles.emptyTitle}>No rankable achievements</Text>
            <Text style={styles.emptyText}>
              Create an achievement, connect favorite people, and complete Matrix proof approval to
              generate rankings.
            </Text>
          </Card>
        ) : (
          <>
            <SecTitle style={{ fontSize: 20 }}>Select achievement</SecTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 11, paddingRight: 8, paddingVertical: 2 }}
            >
              {achievements.map((achievement) => (
                <AchievementButton
                  key={achievement.id}
                  achievement={achievement}
                  active={achievement.id === selectedAchievementId}
                  onPress={() => setSelectedAchievementId(achievement.id)}
                />
              ))}
            </ScrollView>

            {selectedAchievement && (
              <Card style={styles.activeCard}>
                <Eyebrow>Current ranking for</Eyebrow>
                <Text style={styles.activeTitle}>{selectedAchievement.title}</Text>
                <View style={styles.activeStatsRow}>
                  <ActiveStat label="STATUS" value={normalizeText(selectedAchievement.status)} />
                  <ActiveStat label="PROGRESS" value={`${selectedAchievement.progress || 0}%`} />
                  <ActiveStat
                    label="DEADLINE"
                    value={formatShortDate(selectedAchievement.overall_deadline_at)}
                  />
                </View>
              </Card>
            )}

            <WeeklyRecapCard recap={weeklyRecap} />

            <View style={styles.boardHeader}>
              <SecTitle style={{ marginTop: 0, marginBottom: 0, fontSize: 24 }}>Leaderboard</SecTitle>
              <Mono style={styles.participantBadge}>{participantCountText}</Mono>
            </View>

            {loadingBoard ? (
              <Card style={{ alignItems: "center", paddingVertical: 24 }}>
                <LoadingBox text="Loading board…" />
              </Card>
            ) : leaderboard.length === 0 ? (
              <Card style={{ borderStyle: "dashed" }}>
                <Text style={styles.emptyTitle}>No participants yet</Text>
                <Text style={styles.emptyText}>
                  Connected favorite people will appear here. Points update after proof is viewed and
                  approved.
                </Text>
              </Card>
            ) : (
              <View style={{ gap: 10 }}>
                {leaderboard.map((person) => (
                  <LeaderboardRow key={person.favorite_person_id} person={person} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AchievementButton({ achievement, active, onPress }) {
  const progress = Number(achievement.progress || 0);
  const done = String(achievement.status || "").toLowerCase() === "completed" || progress >= 100;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.achBtn, active && styles.achBtnActive]}
      onPress={onPress}
    >
      <View style={styles.achTopRow}>
        <Text style={[styles.achTitle, active && { color: COLORS.accent }]} numberOfLines={1}>
          {achievement.title || "Untitled"}
        </Text>
        {active && <Icon name="check" size={16} stroke={2.4} color={COLORS.accent} />}
      </View>
      <View style={{ marginVertical: 12 }}>
        <View style={styles.miniTrack}>
          <View
            style={[
              styles.miniFill,
              { width: `${Math.min(progress, 100)}%`, backgroundColor: done ? COLORS.text : COLORS.accent },
            ]}
          />
        </View>
      </View>
      <Mono style={styles.achMeta}>
        {normalizeText(achievement.status)} · {progress}%
      </Mono>
    </TouchableOpacity>
  );
}

function ActiveStat({ label, value }) {
  return (
    <View style={{ flex: 1 }}>
      <Mono style={styles.activeStatLabel}>{label}</Mono>
      <Text style={styles.activeStatValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function LeaderboardRow({ person }) {
  const isFirst = Number(person.rank_number) === 1;
  const ac = avatarColor(person.favorite_person_id || person.full_name);
  const qualityScore = Math.round(Number(person.quality_score || 0));
  const predictionAccuracy = Math.round(Number(person.prediction_accuracy || 0));
  const supportStreak = Number(person.support_streak || person.approved_tasks || 0);

  return (
    <Card style={[styles.row, isFirst && styles.rowTop]}>
      <Text style={[styles.rankNum, { color: isFirst ? COLORS.accent : COLORS.textMute }]}>#{person.rank_number}</Text>
      <View style={[styles.rowAvatar, { backgroundColor: ac.soft }]}>
        <Text style={[styles.rowAvatarText, { color: ac.solid }]}>          
          {initialOf(person.full_name || person.username)}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.personName}>{person.full_name || "Favorite Person"}</Text>
        <Text style={styles.personEmail} numberOfLines={1}>{person.username || person.account_type}</Text>
        <Text style={styles.approvedText}>
          {person.approved_tasks || 0} approved · {person.tasks_assigned || 0} assigned · streak {supportStreak}
        </Text>
        <View style={styles.qualityBarRow}>
          <View style={styles.qualityTrack}>
            <View style={[styles.qualityFill, { width: `${Math.min(qualityScore, 100)}%` }]} />
          </View>
          <Mono style={styles.qualityText}>{qualityScore}% quality</Mono>
        </View>
        <Mono style={styles.qualityMeta}>Prediction accuracy: {predictionAccuracy}%</Mono>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.pointsNum, { color: isFirst ? COLORS.accent : COLORS.text }]}>          
          {person.total_points || 0}
        </Text>
        <Mono style={styles.pointsLabel}>POINTS</Mono>
      </View>
    </Card>
  );
}

function WeeklyRecapCard({ recap }) {
  if (!recap) {
    return (
      <Card style={styles.weeklyCard}>
        <View style={styles.ruleHead}>
          <Icon name="cal" size={17} color={COLORS.accent} />
          <Mono style={[styles.ruleKicker, { color: COLORS.accent }]}>WEEKLY RECAP</Mono>
        </View>
        <Text style={styles.ruleBody}>No activity recorded for this achievement this week yet.</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.weeklyCard}>
      <View style={styles.ruleHead}>
        <Icon name="cal" size={17} color={COLORS.accent} />
        <Mono style={[styles.ruleKicker, { color: COLORS.accent }]}>WEEKLY RECAP</Mono>
      </View>
      <View style={styles.weeklyGrid}>
        <WeeklyMetric label="Completed" value={recap.tasks_completed || 0} />
        <WeeklyMetric label="Proofs approved" value={recap.proofs_approved || 0} />
        <WeeklyMetric label="Points" value={recap.points_awarded || 0} />
      </View>
      <View style={styles.weeklyLine}>
        <Text style={styles.weeklyLabel}>Top supporter</Text>
        <Text style={styles.weeklyValue}>{recap.top_supporter_name || "Not available"}</Text>
      </View>
      <View style={styles.weeklyLine}>
        <Text style={styles.weeklyLabel}>Most accurate predictor</Text>
        <Text style={styles.weeklyValue}>{recap.most_accurate_predictor_name || "Not available"}</Text>
      </View>
    </Card>
  );
}

function WeeklyMetric({ label, value }) {
  return (
    <View style={styles.weeklyMetric}>
      <Text style={styles.weeklyMetricValue}>{value}</Text>
      <Text style={styles.weeklyMetricLabel}>{label}</Text>
    </View>
  );
}

function normalizeText(value) {
  if (!value) return "UNKNOWN";
  return String(value).replace(/_/g, " ").toUpperCase();
}

function formatShortDate(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  ruleCard: { borderLeftWidth: 3 },
  ruleHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  ruleKicker: { fontSize: 11, letterSpacing: 1, fontWeight: "700" },
  ruleBody: { color: COLORS.textDim, fontSize: 13.5, lineHeight: 19 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  emptyText: { marginTop: 7, color: COLORS.textMute, fontSize: 13.5, lineHeight: 20 },
  achBtn: {
    minWidth: 168,
    maxWidth: 220,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderSoft,
    borderRadius: 18,
    padding: 16,
  },
  achBtnActive: { borderColor: COLORS.accent },
  achTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  achTitle: { fontFamily: FONTS.display, fontSize: 16, fontWeight: "800", color: COLORS.text, flex: 1 },
  miniTrack: { height: 7, borderRadius: 99, backgroundColor: COLORS.surface3, overflow: "hidden" },
  miniFill: { height: "100%", borderRadius: 99 },
  achMeta: { fontSize: 10.5, letterSpacing: 0.6, color: COLORS.textMute, textTransform: "uppercase" },
  activeCard: { marginTop: 14, backgroundColor: COLORS.ink, borderColor: COLORS.borderSoft },
  activeTitle: { fontFamily: FONTS.display, fontSize: 30, fontWeight: "800", color: COLORS.onInk, marginTop: 8, marginBottom: 16 },
  activeStatsRow: { flexDirection: "row", gap: 8 },
  activeStatLabel: { fontSize: 10, letterSpacing: 0.8, color: COLORS.textMute },
  activeStatValue: { fontWeight: "700", fontSize: 14, color: COLORS.onInk, marginTop: 5 },
  boardHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 26, marginBottom: 12 },
  participantBadge: { fontSize: 11.5, color: COLORS.textMute },

  weeklyCard: { marginTop: 14, backgroundColor: COLORS.surface, borderColor: COLORS.borderSoft },
  weeklyGrid: { flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 10 },
  weeklyMetric: { flex: 1, backgroundColor: COLORS.surface2, borderRadius: 14, padding: 10 },
  weeklyMetricValue: { fontFamily: FONTS.display, fontSize: 21, fontWeight: "800", color: COLORS.accent },
  weeklyMetricLabel: { marginTop: 2, fontSize: 10.5, color: COLORS.textMute, fontWeight: "700" },
  weeklyLine: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingTop: 8 },
  weeklyLabel: { color: COLORS.textMute, fontSize: 12.5, fontWeight: "700" },
  weeklyValue: { flex: 1, textAlign: "right", color: COLORS.text, fontSize: 12.5, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 13, padding: 15 },
  rowTop: { backgroundColor: COLORS.accentSoft, borderColor: "transparent" },
  rankNum: { fontFamily: FONTS.display, fontSize: 22, fontWeight: "800", width: 22 },
  rowAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  rowAvatarText: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 18 },
  personName: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
  personEmail: { color: COLORS.textMute, fontSize: 11.5, marginTop: 1 },
  approvedText: { color: COLORS.info, fontSize: 11, fontWeight: "700", marginTop: 3 },

  qualityBarRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 7 },
  qualityTrack: { flex: 1, height: 6, backgroundColor: COLORS.surface3, borderRadius: 99, overflow: "hidden" },
  qualityFill: { height: "100%", backgroundColor: COLORS.accent, borderRadius: 99 },
  qualityText: { fontSize: 9.5, color: COLORS.accent, fontWeight: "700" },
  qualityMeta: { fontSize: 9.5, color: COLORS.textMute, marginTop: 4 },
  pointsNum: { fontFamily: FONTS.display, fontSize: 26, fontWeight: "800" },
  pointsLabel: { fontSize: 9.5, letterSpacing: 1, color: COLORS.textMute },
});
