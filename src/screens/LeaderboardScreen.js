import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

const COLORS = {
  primary: "#000000",
  surface: "#F7F9FB",
  surfaceLowest: "#FFFFFF",
  surfaceLow: "#F2F4F6",
  surfaceContainer: "#ECEEF0",
  surfaceHigh: "#E6E8EA",
  outline: "#76777D",
  outlineVariant: "#C6C6CD",
  onSurface: "#191C1E",
  onSurfaceVariant: "#45464D",
  secondary: "#515F74",
  secondaryContainer: "#D5E3FD",
  tertiary: "#3980F4",
  tertiaryFixed: "#D8E2FF",
  tertiaryFixedDim: "#ADC6FF",
  error: "#BA1A1A",
  success: "#16A34A",
  white: "#FFFFFF",
};

export default function LeaderboardScreen() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (selectedAchievementId) {
      loadLeaderboard(selectedAchievementId);
    } else {
      setLeaderboard([]);
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
          achievementMap.set(item.id, {
            ...item,
            source_label: "Your achievement",
          });
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
              achievementMap.set(item.id, {
                ...item,
                source_label: "Connected achievement",
              });
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

    const { data, error } = await supabase.rpc("get_achievement_favorite_leaderboard", {
      p_achievement_id: achievementId,
    });

    if (error) {
      setLoadingBoard(false);
      Alert.alert("Leaderboard fetch failed", error.message);
      return;
    }

    setLeaderboard(data || []);
    setLoadingBoard(false);
  };

  const onRefresh = async () => {
    await loadPage();
    if (selectedAchievementId) {
      await loadLeaderboard(selectedAchievementId);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>LOADING RANKING...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.topLabelRow}>
          <Text style={styles.topIcon}>📊</Text>
          <Text style={styles.topLabel}>FAVORITE PERSON POINTS</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.title}>Ranking</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Ranking is calculated separately for each achievement. When a new
              achievement starts, the ranking starts fresh. Old achievement
              contribution history remains stored securely.
            </Text>
          </View>
        </View>

        <View style={styles.rulesSection}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeadingIcon}>⚖️</Text>
            <Text style={styles.sectionHeading}>Point Rules</Text>
          </View>

          <View style={styles.ruleGrid}>
            <View style={styles.ruleBox}>
              <Text style={styles.ruleLabel}>VERIFICATION</Text>
              <Text style={styles.ruleBody}>
                Points are awarded only after the favorite person views the proof
                and approves the submitted task.
              </Text>
            </View>

            <View style={[styles.ruleBox, styles.ruleBoxBlue]}>
              <Text style={[styles.ruleLabel, styles.ruleLabelBlue]}>TIME SENSITIVITY</Text>
              <Text style={styles.ruleBody}>
                Earlier completion earns more points. Late completion gives reduced
                points based on your selected formula.
              </Text>
            </View>
          </View>
        </View>

        {achievements.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No rankable achievements</Text>
            <Text style={styles.emptyText}>
              Create an achievement, connect favorite people, and complete Matrix
              proof approval to generate rankings.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.achievementSection}>
              <Text style={styles.smallSectionLabel}>SELECT ACHIEVEMENT</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.achievementCarousel}
              >
                {achievements.map((achievement) => {
                  const active = achievement.id === selectedAchievementId;

                  return (
                    <AchievementButton
                      key={achievement.id}
                      achievement={achievement}
                      active={active}
                      onPress={() => setSelectedAchievementId(achievement.id)}
                    />
                  );
                })}
              </ScrollView>
            </View>

            {selectedAchievement && (
              <View style={styles.activeDetailCard}>
                <Text style={styles.activeDetailLabel}>CURRENT RANKING FOR</Text>
                <Text style={styles.activeDetailTitle}>{selectedAchievement.title}</Text>

                <View style={styles.activeStatsRow}>
                  <View style={styles.activeStatBox}>
                    <Text style={styles.activeStatLabel}>STATUS</Text>
                    <Text style={styles.activeStatValue}>
                      {normalizeText(selectedAchievement.status)}
                    </Text>
                  </View>

                  <View style={styles.activeStatBox}>
                    <Text style={styles.activeStatLabel}>PROGRESS</Text>
                    <Text style={styles.activeStatValue}>
                      {selectedAchievement.progress || 0}%
                    </Text>
                  </View>

                  <View style={styles.activeStatBox}>
                    <Text style={styles.activeStatLabel}>DEADLINE</Text>
                    <Text style={styles.activeStatValue} numberOfLines={2}>
                      {formatDateTime(selectedAchievement.overall_deadline_at)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.leaderboardHeaderRow}>
              <Text style={styles.leaderboardTitle}>Leaderboard</Text>
              <Text style={styles.participantBadge}>{participantCountText}</Text>
            </View>

            {loadingBoard ? (
              <View style={styles.boardLoadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.boardLoadingText}>LOADING BOARD...</Text>
              </View>
            ) : leaderboard.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No participants yet</Text>
                <Text style={styles.emptyText}>
                  Connected favorite people will appear here. Points will update
                  after proof is viewed and approved.
                </Text>
              </View>
            ) : (
              <View style={styles.leaderboardList}>
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
  const deadlineOver = achievement.overall_deadline_at
    ? new Date(achievement.overall_deadline_at).getTime() < Date.now()
    : false;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[styles.achievementButton, active && styles.achievementButtonActive]}
      onPress={onPress}
    >
      <View style={styles.achievementButtonTopRow}>
        <Text
          style={[
            styles.achievementButtonTitle,
            active && styles.achievementButtonTitleActive,
          ]}
          numberOfLines={2}
        >
          {achievement.title || "Untitled"}
        </Text>
        <Text style={[styles.achievementStatusIcon, active && styles.achievementStatusIconActive]}>
          {progress >= 100 ? "✓" : "◷"}
        </Text>
      </View>

      <View style={styles.smallProgressTrack}>
        <View
          style={[
            styles.smallProgressFill,
            active && styles.smallProgressFillActive,
            { width: `${Math.min(progress, 100)}%` },
          ]}
        />
      </View>

      <Text style={[styles.achievementButtonMeta, active && styles.achievementButtonMetaActive]}>
        {normalizeText(achievement.status)} · {progress}%
      </Text>

      <Text style={[styles.achievementSourceText, active && styles.achievementButtonMetaActive]}>
        {deadlineOver ? "DEADLINE OVER" : achievement.source_label || "Achievement"}
      </Text>
    </TouchableOpacity>
  );
}

function LeaderboardRow({ person }) {
  const isFirst = Number(person.rank_number) === 1;
  const initial = getInitial(person.full_name || person.username);

  return (
    <View style={[styles.leaderboardRow, isFirst && styles.leaderboardRowTop]}>
      <View style={styles.rankNumberWrapper}>
        <Text style={[styles.rankNumber, isFirst && styles.rankNumberTop]}>
          {person.rank_number}
        </Text>
      </View>

      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.personInfo}>
        <Text style={styles.personName}>{person.full_name || "Favorite Person"}</Text>
        <Text style={styles.personEmail}>{person.username || person.account_type}</Text>
        <Text style={styles.approvedTasksText}>
          {person.approved_tasks || 0} APPROVED TASKS
        </Text>
      </View>

      <View style={styles.pointsBox}>
        <Text style={styles.pointsNumber}>{person.total_points || 0}</Text>
        <Text style={styles.pointsLabel}>POINTS</Text>
      </View>
    </View>
  );
}

function getInitial(value) {
  if (!value) return "F";
  return String(value).trim().charAt(0).toUpperCase();
}

function normalizeText(value) {
  if (!value) return "UNKNOWN";
  return String(value).replace(/_/g, " ").toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "NO DEADLINE";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "INVALID DATE";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 120,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 14,
    color: COLORS.onSurface,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  topLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingRight: 82,
  },
  topIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  topLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroSection: {
    marginBottom: 34,
  },
  title: {
    color: COLORS.primary,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    padding: 20,
  },
  infoText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },
  rulesSection: {
    marginBottom: 34,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionHeadingIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionHeading: {
    color: COLORS.onSurface,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
  },
  ruleGrid: {
    flexDirection: "column",
  },
  ruleBox: {
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  ruleBoxBlue: {
    backgroundColor: COLORS.secondaryContainer,
  },
  ruleLabel: {
    color: COLORS.tertiary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  ruleLabelBlue: {
    color: COLORS.secondary,
  },
  ruleBody: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
  achievementSection: {
    marginBottom: 28,
  },
  smallSectionLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 14,
  },
  achievementCarousel: {
    paddingRight: 24,
    paddingBottom: 4,
  },
  achievementButton: {
    width: 240,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    padding: 18,
    marginRight: 14,
  },
  achievementButtonActive: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLowest,
  },
  achievementButtonTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  achievementButtonTitle: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    paddingRight: 8,
  },
  achievementButtonTitleActive: {
    color: COLORS.primary,
  },
  achievementStatusIcon: {
    color: COLORS.outline,
    fontSize: 20,
    fontWeight: "800",
  },
  achievementStatusIconActive: {
    color: COLORS.tertiary,
  },
  smallProgressTrack: {
    width: "100%",
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceHigh,
    overflow: "hidden",
  },
  smallProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.outlineVariant,
  },
  smallProgressFillActive: {
    backgroundColor: COLORS.primary,
  },
  achievementButtonMeta: {
    marginTop: 9,
    color: COLORS.outline,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  achievementButtonMetaActive: {
    color: COLORS.onSurfaceVariant,
  },
  achievementSourceText: {
    marginTop: 5,
    color: COLORS.outline,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  activeDetailCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 18,
    padding: 24,
    marginBottom: 34,
  },
  activeDetailLabel: {
    color: COLORS.tertiaryFixedDim,
    opacity: 0.9,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  activeDetailTitle: {
    color: COLORS.white,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 22,
  },
  activeStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  activeStatBox: {
    width: "33.33%",
    paddingRight: 8,
    marginBottom: 8,
  },
  activeStatLabel: {
    color: COLORS.white,
    opacity: 0.55,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  activeStatValue: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  leaderboardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  leaderboardTitle: {
    color: COLORS.onSurface,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
  },
  participantBadge: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  boardLoadingBox: {
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  boardLoadingText: {
    marginTop: 10,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  emptyCard: {
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    padding: 20,
  },
  emptyTitle: {
    color: COLORS.onSurface,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  leaderboardList: {
    paddingBottom: 8,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  leaderboardRowTop: {
    backgroundColor: COLORS.tertiaryFixed,
  },
  rankNumberWrapper: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankNumber: {
    color: COLORS.onSurfaceVariant,
    fontSize: 22,
    lineHeight: 25,
    fontWeight: "800",
  },
  rankNumberTop: {
    color: COLORS.primary,
    fontSize: 26,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
  },
  personInfo: {
    flex: 1,
    paddingRight: 8,
  },
  personName: {
    color: COLORS.primary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  personEmail: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
    marginTop: 2,
  },
  approvedTasksText: {
    color: COLORS.tertiary,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 4,
  },
  pointsBox: {
    minWidth: 64,
    alignItems: "flex-end",
  },
  pointsNumber: {
    color: COLORS.primary,
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "800",
  },
  pointsLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
