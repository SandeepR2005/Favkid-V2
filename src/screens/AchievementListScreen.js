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
import { COLORS, FONTS, RADIUS, categoryColor, initialOf } from "../theme";
import Icon from "../components/Icon";
import {
  Bar,
  Card,
  DangerSmBtn,
  Eyebrow,
  LoadingBox,
  Mono,
  PageSub,
  PageTitle,
  Pill,
  Ring,
  SecTitle,
  StatBox,
  StatusPill,
  TopBar,
} from "../components/ui";

const FILTERS = ["All", "Active", "Completed"];

const PRIORITY_COLOR = { high: COLORS.danger, medium: COLORS.info, low: COLORS.textMute };

const SUB_STATE = {
  approved: { icon: "check", color: COLORS.positive, bg: COLORS.positiveSoft, label: "Approved" },
  completed: { icon: "check", color: COLORS.positive, bg: COLORS.positiveSoft, label: "Completed" },
  submitted: { icon: "clock", color: COLORS.info, bg: COLORS.infoSoft, label: "In review" },
  in_review: { icon: "clock", color: COLORS.info, bg: COLORS.infoSoft, label: "In review" },
  pending: { icon: "clock", color: COLORS.warn, bg: COLORS.warnSoft, label: "Pending" },
  assigned: { icon: "bolt", color: COLORS.warn, bg: COLORS.warnSoft, label: "Assigned" },
  rejected: { icon: "trash", color: COLORS.danger, bg: COLORS.dangerSoft, label: "Rejected" },
  locked: { icon: "lock", color: COLORS.textMute, bg: COLORS.surface3, label: "Locked" },
};

export default function AchievementListScreen({ onLogout }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [tasksByAchievement, setTasksByAchievement] = useState({});
  const [profilesById, setProfilesById] = useState({});
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const selectedAchievement = useMemo(() => {
    if (!selectedAchievementId) return null;
    return achievements.find((item) => item.id === selectedAchievementId) || null;
  }, [achievements, selectedAchievementId]);

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const status = normalizeStatus(item.status);
      if (filter === "Active") return status !== "completed";
      if (filter === "Completed") return status === "completed";
      return true;
    });
  }, [achievements, filter]);

  const stats = useMemo(() => {
    const total = achievements.length;
    const completed = achievements.filter(
      (item) => normalizeStatus(item.status) === "completed"
    ).length;
    return {
      total,
      active: Math.max(0, total - completed),
      completed,
    };
  }, [achievements]);

  const loadAchievements = async () => {
    const firstLoad = loading;
    if (!firstLoad) setRefreshing(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Login required", "Please login again.");
      return;
    }

    const userId = userData.user.id;
    setCurrentUserId(userId);

    const { data: achievementData, error: achievementError } = await supabase
      .from("achievements")
      .select(
        "id, owner_id, title, description, category, priority, status, progress, overall_deadline_at, reminder_at, proof_type_required, success_criteria, notes, metadata, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (achievementError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Achievement fetch failed", achievementError.message);
      return;
    }

    const achievementRows = achievementData || [];
    setAchievements(achievementRows);

    if (achievementRows.length === 0) {
      setTasksByAchievement({});
      setProfilesById({});
      setSelectedAchievementId(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const achievementIds = achievementRows.map((item) => item.id);
    const ownerIds = [...new Set(achievementRows.map((item) => item.owner_id))];

    const { data: taskData, error: taskError } = await supabase
      .from("achievement_tasks")
      .select(
        "id, achievement_id, owner_id, order_number, title, status, deadline_at, estimated_minutes, metadata, created_at, updated_at"
      )
      .in("achievement_id", achievementIds)
      .order("order_number", { ascending: true });

    if (taskError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Subtask fetch failed", taskError.message);
      return;
    }

    const groupedTasks = {};
    (taskData || []).forEach((task) => {
      if (!groupedTasks[task.achievement_id]) groupedTasks[task.achievement_id] = [];
      groupedTasks[task.achievement_id].push(task);
    });
    setTasksByAchievement(groupedTasks);

    if (ownerIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, username, account_type")
        .in("id", ownerIds);

      if (profileError) {
        setLoading(false);
        setRefreshing(false);
        Alert.alert("Profile fetch failed", profileError.message);
        return;
      }

      const profileMap = {};
      (profileData || []).forEach((profile) => {
        profileMap[profile.id] = profile;
      });
      setProfilesById(profileMap);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const deleteAchievement = async (achievement) => {
    if (!achievement || deletingId) return;

    if (achievement.owner_id !== currentUserId) {
      Alert.alert(
        "Not allowed",
        "Only the user who created this achievement can delete it. Favorite persons can only view shared achievements."
      );
      return;
    }

    Alert.alert(
      "Delete achievement?",
      "This will permanently delete the achievement and all subtasks inside it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(achievement.id);

            const { error: taskDeleteError } = await supabase
              .from("achievement_tasks")
              .delete()
              .eq("achievement_id", achievement.id)
              .eq("owner_id", currentUserId);

            if (taskDeleteError) {
              setDeletingId(null);
              Alert.alert("Subtask delete failed", taskDeleteError.message);
              return;
            }

            const { error: achievementDeleteError } = await supabase
              .from("achievements")
              .delete()
              .eq("id", achievement.id)
              .eq("owner_id", currentUserId);

            if (achievementDeleteError) {
              setDeletingId(null);
              Alert.alert("Achievement delete failed", achievementDeleteError.message);
              return;
            }

            setSelectedAchievementId(null);
            setAchievements((prev) => prev.filter((item) => item.id !== achievement.id));
            setTasksByAchievement((prev) => {
              const updated = { ...prev };
              delete updated[achievement.id];
              return updated;
            });
            setDeletingId(null);
            Alert.alert("Deleted", "Achievement deleted successfully.");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: 20 }}>
          <TopBar onLogout={onLogout} />
        </View>
        <LoadingBox text="Loading achievements…" />
      </SafeAreaView>
    );
  }

  if (selectedAchievement) {
    return (
      <AchievementDetail
        achievement={selectedAchievement}
        tasks={tasksByAchievement[selectedAchievement.id] || []}
        owner={profilesById[selectedAchievement.owner_id]}
        isOwnAchievement={selectedAchievement.owner_id === currentUserId}
        onBack={() => setSelectedAchievementId(null)}
        onDelete={deleteAchievement}
        onLogout={onLogout}
        deleting={deletingId === selectedAchievement.id}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadAchievements} tintColor={COLORS.accent} />
        }
      >
        <TopBar onLogout={onLogout} />

        <Eyebrow>Your progress</Eyebrow>
        <PageTitle>Achievements</PageTitle>
        <PageSub>Goals you created and achievements shared by connected users.</PageSub>

        <View style={styles.statsRow}>
          <StatBox num={stats.total} label="Total" hl />
          <StatBox num={stats.active} label="Active" />
          <StatBox num={stats.completed} label="Completed" />
        </View>

        <View style={styles.segment}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[styles.segmentBtn, filter === item && styles.segmentBtnActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.segmentText, filter === item && styles.segmentTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredAchievements.length === 0 ? (
          <Card style={{ borderStyle: "dashed", alignItems: "center", paddingVertical: 28 }}>
            <Text style={styles.emptyTitle}>No achievements found</Text>
            <Text style={styles.emptyText}>
              Create one from the Add tab. Shared achievements appear here once a connection is
              accepted.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                owner={profilesById[achievement.owner_id]}
                tasks={tasksByAchievement[achievement.id] || []}
                isOwnAchievement={achievement.owner_id === currentUserId}
                onOpen={() => setSelectedAchievementId(achievement.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AchievementCard({ achievement, owner, tasks, isOwnAchievement, onOpen }) {
  const cat = categoryColor(achievement.category);
  const progress = getProgressFromTasks(achievement, tasks);
  const completedTasks = tasks.filter((task) => isTaskDone(task.status)).length;
  const done = normalizeStatus(achievement.status) === "completed";
  const ownerLabel = isOwnAchievement
    ? "You"
    : owner?.full_name || owner?.username || "Connected user";

  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.card} onPress={onOpen}>
      <View style={styles.cardTop}>
        <View style={{ flexDirection: "row", gap: 12, flex: 1 }}>
          <View style={[styles.avatar, { backgroundColor: cat.soft }]}>
            <Text style={[styles.avatarText, { color: cat.solid }]}>
              {initialOf(achievement.title)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {achievement.title || "Untitled achievement"}
            </Text>
            <Text style={styles.cardOwner} numberOfLines={1}>
              {ownerLabel} · {prettyText(achievement.category || "General")}
            </Text>
          </View>
        </View>
        <StatusPill status={done ? "Completed" : "Active"} />
      </View>

      {!!achievement.description && (
        <Text style={styles.cardDesc} numberOfLines={2}>
          {achievement.description}
        </Text>
      )}

      <View style={styles.chipRow}>
        <Pill dotColor={PRIORITY_COLOR[normalizeStatus(achievement.priority)] || COLORS.info}>
          {prettyText(achievement.priority || "Medium")}
        </Pill>
        <Pill icon="cal">{formatDeadline(achievement.overall_deadline_at)}</Pill>
      </View>

      <View style={[styles.rowBetween, { marginTop: 14, marginBottom: 7 }]}>
        <Mono style={{ fontSize: 12, color: COLORS.textMute }}>
          {completedTasks}/{tasks.length} subtasks
        </Mono>
        <Mono style={{ fontSize: 13, fontWeight: "700", color: done ? COLORS.text : COLORS.accent }}>
          {progress}%
        </Mono>
      </View>
      <Bar value={progress} done={done} />
    </TouchableOpacity>
  );
}

function AchievementDetail({ achievement, tasks, owner, isOwnAchievement, onBack, onDelete, onLogout, deleting }) {
  const progress = getProgressFromTasks(achievement, tasks);
  const completedTasks = tasks.filter((task) => isTaskDone(task.status)).length;
  const status = normalizeStatus(achievement.status);
  const done = status === "completed";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailTopBar}>
          <TouchableOpacity activeOpacity={0.8} style={styles.backChip} onPress={onBack}>
            <Icon name="chevL" size={16} stroke={2.2} color={COLORS.textDim} />
            <Text style={styles.backChipText}>Achievements</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {isOwnAchievement && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.trashChip}
                disabled={deleting}
                onPress={() => onDelete(achievement)}
              >
                <Icon name="trash" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            )}
            {onLogout ? <DangerSmBtn onPress={onLogout} /> : null}
          </View>
        </View>

        <Card>
          <StatusPill status={done ? "Completed" : "Active"} />
          <Text style={styles.detailTitle}>{achievement.title || "Untitled achievement"}</Text>

          <View style={styles.ownerRow}>
            <View style={styles.avatarInk}>
              <Text style={styles.avatarInkText}>
                {isOwnAchievement ? "Y" : initialOf(owner?.full_name || owner?.username)}
              </Text>
            </View>
            <View>
              <Text style={styles.ownerName}>
                {isOwnAchievement ? "You" : owner?.full_name || owner?.username || "Connected user"}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Icon name="eye" size={13} color={COLORS.textMute} />
                <Text style={styles.ownerMeta}>
                  {isOwnAchievement ? "Visible to accepted favorite people" : "Shared connection"}
                </Text>
              </View>
            </View>
          </View>

          {!!achievement.description && <Text style={styles.detailDesc}>{achievement.description}</Text>}

          <View style={styles.metaGrid}>
            <MetaCell label="Category" value={prettyText(achievement.category || "General")} />
            <MetaCell label="Priority" value={prettyText(achievement.priority || "Medium")} />
            <MetaCell label="Deadline" value={formatDeadline(achievement.overall_deadline_at)} />
            <MetaCell label="Subtasks" value={`${completedTasks} of ${tasks.length}`} />
          </View>

          <View style={styles.progressCard}>
            <Ring value={progress} size={84} stroke={9} color={done ? COLORS.positive : COLORS.accent}>
              <Text style={styles.ringText}>{progress}%</Text>
            </Ring>
            <View style={{ flex: 1 }}>
              <Mono style={styles.metaCellLabel}>OVERALL PROGRESS</Mono>
              <Text style={styles.progressTitle}>
                {done ? "Goal complete" : progress >= 30 ? "On track" : "Getting started"}
              </Text>
              <Text style={styles.progressSmall}>
                {completedTasks} of {tasks.length} subtasks approved
              </Text>
            </View>
          </View>
        </Card>

        <SecTitle>Subtasks</SecTitle>
        {tasks.length === 0 ? (
          <Card style={{ borderStyle: "dashed" }}>
            <Text style={styles.emptyText}>No subtasks saved for this achievement.</Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {tasks.map((task) => (
              <SubtaskRow key={task.id} task={task} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaCell({ label, value }) {
  return (
    <View style={styles.metaCell}>
      <Mono style={styles.metaCellLabel}>{String(label).toUpperCase()}</Mono>
      <Text style={styles.metaCellValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function SubtaskRow({ task }) {
  const st = SUB_STATE[normalizeStatus(task.status)] || SUB_STATE.locked;
  return (
    <Card style={styles.subtaskRow}>
      <View style={[styles.subtaskIcon, { backgroundColor: st.bg }]}>
        <Icon name={st.icon} size={19} stroke={2.2} color={st.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.subtaskTitle}>{task.title || "Untitled subtask"}</Text>
        <Text style={styles.subtaskMeta}>
          {st.label} · {formatDeadline(task.deadline_at)}
        </Text>
      </View>
    </Card>
  );
}

/* ---------------- helpers (unchanged backend logic) ---------------- */
function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}
function isTaskDone(status) {
  const value = normalizeStatus(status);
  return value === "approved" || value === "completed";
}
function getProgressFromTasks(achievement, tasks) {
  const storedProgress = Number(achievement?.progress || 0);
  if (!tasks || tasks.length === 0) return Math.max(0, Math.min(100, storedProgress));
  const done = tasks.filter((task) => isTaskDone(task.status)).length;
  return Math.round((done / tasks.length) * 100);
}
function prettyText(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
function formatDeadline(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  segment: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    marginBottom: 16,
    backgroundColor: COLORS.surface2,
    padding: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  segmentBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  segmentBtnActive: { backgroundColor: COLORS.accent },
  segmentText: { color: COLORS.textDim, fontSize: 13.5, fontWeight: "700" },
  segmentTextActive: { color: COLORS.accentInk },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: "800" },
  emptyText: { marginTop: 7, color: COLORS.textMute, fontSize: 13, lineHeight: 19, textAlign: "center" },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    padding: 18,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: FONTS.display, fontSize: 18, fontWeight: "800" },
  cardTitle: { fontFamily: FONTS.display, color: COLORS.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  cardOwner: { marginTop: 2, color: COLORS.textMute, fontSize: 12.5, fontWeight: "600" },
  cardDesc: { marginTop: 12, color: COLORS.textDim, fontSize: 13.5, lineHeight: 19 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  detailTopBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, marginTop: 4 },
  backChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: 9,
    paddingLeft: 11,
    paddingRight: 14,
  },
  backChipText: { color: COLORS.textDim, fontSize: 13, fontWeight: "600" },
  trashChip: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTitle: {
    fontFamily: FONTS.display,
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 12,
    marginBottom: 14,
  },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarInk: { width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.ink, alignItems: "center", justifyContent: "center" },
  avatarInkText: { color: COLORS.onInk, fontFamily: FONTS.display, fontWeight: "800", fontSize: 18 },
  ownerName: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
  ownerMeta: { color: COLORS.textMute, fontSize: 12.5 },
  detailDesc: { marginTop: 15, color: COLORS.textDim, fontSize: 14, lineHeight: 20 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  metaCell: { width: "47%", flexGrow: 1, backgroundColor: COLORS.surface2, borderRadius: 14, padding: 13 },
  metaCellLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.textMute },
  metaCellValue: { color: COLORS.text, fontSize: 14.5, fontWeight: "700", marginTop: 5 },
  progressCard: { marginTop: 14, backgroundColor: COLORS.ink, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 18 },
  ringText: { fontFamily: FONTS.display, fontSize: 20, fontWeight: "800", color: COLORS.onInk },
  progressTitle: { fontFamily: FONTS.display, fontSize: 22, fontWeight: "800", color: COLORS.onInk, marginTop: 4 },
  progressSmall: { color: COLORS.textDim, fontSize: 13, marginTop: 3 },
  subtaskRow: { flexDirection: "row", alignItems: "center", gap: 13, padding: 15 },
  subtaskIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  subtaskTitle: { color: COLORS.text, fontWeight: "700", fontSize: 14.5 },
  subtaskMeta: { color: COLORS.textMute, fontSize: 12, marginTop: 2 },
});
