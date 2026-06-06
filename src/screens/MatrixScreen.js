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
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { supabase } from "../lib/supabase";
import { COLORS, FONTS, initialOf } from "../theme";
import Icon from "../components/Icon";
import {
  Bar,
  Btn,
  Card,
  DangerSmBtn,
  Eyebrow,
  LoadingBox,
  Mono,
  PageSub,
  PageTitle,
  Pill,
  SecTitle,
  StatBox,
} from "../components/ui";

const MATRIX_CELLS = Array.from({ length: 9 }, (_, index) => index + 1);

const ACTIVE_LOCK_STATUSES = ["pending_assignment", "assigned", "submitted", "rejected"];

const PROOF_BUCKET = "task-proofs";
const MAX_PROOF_SIZE_BYTES = 10 * 1024 * 1024;

export default function MatrixScreen({ onLogout }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [favoritePeople, setFavoritePeople] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievementId, setSelectedAchievementId] = useState(null);
  const [rolls, setRolls] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [selectedCell, setSelectedCell] = useState(null);
  const [lastSelected, setLastSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMatrixData();
  }, []);

  const activeLock = useMemo(() => findBlockingAssignment(assignments), [assignments]);

  const selectedAchievement = useMemo(() => {
    if (!selectedAchievementId) return null;
    return achievements.find((item) => item.id === selectedAchievementId) || null;
  }, [achievements, selectedAchievementId]);

  const currentAchievementRolls = useMemo(() => {
    return rolls.filter((item) => {
      const rollAchievementId = item.achievement_id || item.metadata?.achievement_id;
      return (
        item.cycle_number === currentCycle &&
        (!selectedAchievementId || rollAchievementId === selectedAchievementId)
      );
    });
  }, [rolls, currentCycle, selectedAchievementId]);

  const selectedIdsThisCycle = useMemo(() => {
    return new Set(currentAchievementRolls.map((item) => item.selected_favorite_person_id));
  }, [currentAchievementRolls]);

  const availableFavoritePeople = useMemo(() => {
    return favoritePeople.filter((person) => !selectedIdsThisCycle.has(person.id));
  }, [favoritePeople, selectedIdsThisCycle]);

  const isCycleComplete = favoritePeople.length > 0 && availableFavoritePeople.length === 0;

  const cycleProgress =
    favoritePeople.length === 0
      ? 0
      : Math.round(
          ((favoritePeople.length - availableFavoritePeople.length) / favoritePeople.length) * 100
        );

  const refreshMatrixAssignmentExpiry = async () => {
    const { error } = await supabase.rpc("refresh_matrix_expired_or_unassignable_assignments");

    if (error && !isMissingRpcError(error)) {
      // Do not block the screen for an expiry refresh issue. The next fetch can still continue.
      console.warn("Matrix expiry refresh failed:", error.message);
    }
  };

  const loadMatrixSelectableAchievements = async (userId) => {
    const { data, error } = await supabase.rpc("get_user_matrix_selectable_achievements");

    if (!error) {
      return data || [];
    }

    if (!isMissingRpcError(error)) {
      Alert.alert("Achievement eligibility failed", error.message);
      return [];
    }

    // Fallback keeps the app usable if the SQL update has not been applied yet.
    const { data: achievementData, error: achievementError } = await supabase
      .from("achievements")
      .select(
        "id, title, description, category, priority, status, progress, overall_deadline_at, created_at"
      )
      .eq("owner_id", userId)
      .in("status", ["active", "pending", "in_progress"])
      .order("overall_deadline_at", { ascending: true, nullsFirst: false });

    if (achievementError) {
      Alert.alert("Achievement fetch failed", achievementError.message);
      return [];
    }

    const now = Date.now();
    const activeAchievements = (achievementData || []).filter((achievement) => {
      if (!achievement.overall_deadline_at) return true;
      return new Date(achievement.overall_deadline_at).getTime() > now;
    });

    const achievementIds = activeAchievements.map((item) => item.id);

    if (achievementIds.length === 0) return [];

    const { data: taskData, error: taskError } = await supabase
      .from("achievement_tasks")
      .select("id, achievement_id, status, deadline_at")
      .in("achievement_id", achievementIds);

    if (taskError) {
      Alert.alert("Subtask eligibility failed", taskError.message);
      return [];
    }

    const tasksByAchievement = {};
    (taskData || []).forEach((task) => {
      if (!tasksByAchievement[task.achievement_id]) tasksByAchievement[task.achievement_id] = [];
      tasksByAchievement[task.achievement_id].push(task);
    });

    return activeAchievements
      .map((achievement) => {
        const tasks = tasksByAchievement[achievement.id] || [];
        const assignableTasks = tasks.filter(isTaskAssignableForMatrix);
        return {
          ...achievement,
          total_subtasks: tasks.length,
          assignable_subtasks: assignableTasks.length,
        };
      })
      .filter((achievement) => Number(achievement.assignable_subtasks || 0) > 0);
  };

  const verifySelectedAchievementAssignable = async () => {
    const latestAchievements = await loadMatrixSelectableAchievements(currentUserId);
    setAchievements(latestAchievements);

    const matched = latestAchievements.find((item) => item.id === selectedAchievementId);

    if (!matched || Number(matched.assignable_subtasks || 0) <= 0) {
      const nextId = latestAchievements[0]?.id || null;
      setSelectedAchievementId(nextId);

      return {
        ok: false,
        message:
          latestAchievements.length === 0
            ? "All subtasks are completed, assigned, or their deadlines are over. Create a new achievement or add a future-deadline subtask before using Matrix."
            : "The selected achievement has no assignable subtasks now. I moved you to the next available achievement.",
      };
    }

    return { ok: true, achievement: matched };
  };

  const loadMatrixData = async () => {
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

    await refreshMatrixAssignmentExpiry();

    const { data: stateData, error: stateError } = await supabase
      .from("matrix_state")
      .select("active_cycle_number")
      .eq("user_id", user.id)
      .maybeSingle();

    if (stateError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Matrix state error", stateError.message);
      return;
    }

    const activeCycleNumber = stateData?.active_cycle_number || 1;
    setCurrentCycle(activeCycleNumber);

    const achievementRows = await loadMatrixSelectableAchievements(user.id);

    const { data: connectionData, error: connectionError } = await supabase
      .from("connections")
      .select("receiver_id")
      .eq("requester_id", user.id)
      .eq("status", "accepted")
      .eq("connection_type", "favorite_person");

    if (connectionError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Connection fetch failed", connectionError.message);
      return;
    }

    const favoriteIds = (connectionData || []).map((item) => item.receiver_id);
    let favoriteProfiles = [];

    if (favoriteIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, username, account_type, favkid_code")
        .in("id", favoriteIds);

      if (profileError) {
        setLoading(false);
        setRefreshing(false);
        Alert.alert("Favorite people fetch failed", profileError.message);
        return;
      }

      favoriteProfiles = profileData || [];
    }

    setFavoritePeople(favoriteProfiles);

    const { data: rollData, error: rollError } = await supabase
      .from("matrix_rolls")
      .select(
        "id, user_id, selected_favorite_person_id, grid_cell, cycle_number, achievement_id, available_count_before_roll, selected_from_count, metadata, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (rollError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Matrix history fetch failed", rollError.message);
      return;
    }

    setRolls(rollData || []);

    const { data: assignmentData, error: assignmentError } = await supabase
      .from("matrix_task_assignments")
      .select(
        `
        id,
        matrix_roll_id,
        user_id,
        favorite_person_id,
        achievement_id,
        achievement_task_id,
        status,
        assigned_at,
        submitted_at,
        approved_at,
        rejected_at,
        expired_at,
        created_at,
        updated_at,
        matrix_rolls(grid_cell, cycle_number, created_at, achievement_id, metadata),
        achievements(id, title, overall_deadline_at),
        achievement_tasks(id, title, deadline_at, estimated_minutes, status, achievement_id),
        matrix_task_proofs(id, storage_bucket, file_path, file_name, mime_type, size_bytes, created_at, uploaded_at),
        profiles!matrix_task_assignments_favorite_person_id_fkey(id, full_name, username)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (assignmentError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Assignment fetch failed", assignmentError.message);
      return;
    }

    const releasedAssignments = await releaseExpiredAssignments(assignmentData || []);
    const enrichedAssignments = await attachFeedbackToAssignments(releasedAssignments);
    setAssignments(enrichedAssignments);

    const lock = findBlockingAssignment(enrichedAssignments);
    const displayAchievementRows = [...achievementRows];

    if (lock?.achievement_id && lock?.achievements) {
      const lockAchievement = Array.isArray(lock.achievements)
        ? lock.achievements[0]
        : lock.achievements;

      if (lockAchievement?.id && !displayAchievementRows.some((item) => item.id === lockAchievement.id)) {
        displayAchievementRows.unshift({
          ...lockAchievement,
          assignable_subtasks: 0,
          total_subtasks: null,
        });
      }
    }

    setAchievements(displayAchievementRows);

    const selectedStillValid = displayAchievementRows.some((item) => item.id === selectedAchievementId);
    const nextAchievementId =
      lock?.achievement_id || (selectedStillValid ? selectedAchievementId : displayAchievementRows[0]?.id || null);

    setSelectedAchievementId(nextAchievementId);

    setLoading(false);
    setRefreshing(false);
  };

  const releaseExpiredAssignments = async (rows) => {
    const now = Date.now();

    const tasklessPendingRows = (rows || []).filter((assignment) => {
      if (assignment.status !== "pending_assignment") return false;

      const achievementDeadline = assignment.achievements?.overall_deadline_at;

      if (achievementDeadline && new Date(achievementDeadline).getTime() <= now) return true;

      return false;
    });

    const expiredRows = (rows || []).filter((assignment) => {
      if (!ACTIVE_LOCK_STATUSES.includes(assignment.status)) return false;

      const taskDeadline = assignment.achievement_tasks?.deadline_at;
      const achievementDeadline = assignment.achievements?.overall_deadline_at;
      const deadline = taskDeadline || achievementDeadline;

      if (!deadline) return false;
      return new Date(deadline).getTime() <= now;
    });

    const expiredIds = [...new Set([...tasklessPendingRows, ...expiredRows].map((item) => item.id))];

    if (expiredIds.length === 0) return rows;

    const nowIso = new Date().toISOString();

    const { error } = await supabase
      .from("matrix_task_assignments")
      .update({
        status: "expired",
        expired_at: nowIso,
        updated_at: nowIso,
      })
      .in("id", expiredIds);

    if (error) {
      Alert.alert("Expiry update failed", error.message);
      return rows;
    }

    return rows.map((item) =>
      expiredIds.includes(item.id)
        ? {
            ...item,
            status: "expired",
            expired_at: nowIso,
          }
        : item
    );
  };

  const attachFeedbackToAssignments = async (rows) => {
    const assignmentIds = (rows || []).map((item) => item.id).filter(Boolean);

    if (assignmentIds.length === 0) return rows || [];

    const { data, error } = await supabase
      .from("matrix_task_feedback")
      .select("id, assignment_id, reaction_key, reaction_label, reaction_emoji, comment, decision, feedback_quality_score, created_at, updated_at")
      .in("assignment_id", assignmentIds);

    if (error) {
      // Engagement tables may not exist until the SQL update is applied. Keep core Matrix working.
      return rows || [];
    }

    const feedbackMap = {};
    (data || []).forEach((item) => {
      feedbackMap[item.assignment_id] = item;
    });

    return (rows || []).map((item) => ({
      ...item,
      matrix_task_feedback: feedbackMap[item.id] || null,
    }));
  };

  const rollMatrix = async (cellNumber) => {
    if (rolling) return;

    if (!currentUserId) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    if (activeLock) {
      Alert.alert("Matrix locked", getLockMessage(activeLock));
      return;
    }

    if (!selectedAchievementId) {
      Alert.alert(
        "Select achievement",
        "Create or select an achievement that still has at least one future-deadline subtask."
      );
      return;
    }

    const eligibility = await verifySelectedAchievementAssignable();

    if (!eligibility.ok) {
      Alert.alert("No assignable subtasks", eligibility.message);
      await loadMatrixData();
      return;
    }

    const verifiedAchievement = eligibility.achievement;

    if (favoritePeople.length === 0) {
      Alert.alert(
        "No favorite people",
        "Connect with at least one favorite person before using the Matrix."
      );
      return;
    }

    if (availableFavoritePeople.length === 0) {
      Alert.alert(
        "Iteration completed",
        "All favorite people were already selected for this achievement iteration. Start the next iteration."
      );
      return;
    }

    setRolling(true);
    setSelectedCell(cellNumber);

    const { data: freshRollData, error: freshRollError } = await supabase
      .from("matrix_rolls")
      .select("selected_favorite_person_id")
      .eq("user_id", currentUserId)
      .eq("cycle_number", currentCycle)
      .eq("achievement_id", selectedAchievementId);

    if (freshRollError) {
      setRolling(false);
      Alert.alert("Matrix refresh failed", freshRollError.message);
      await loadMatrixData();
      return;
    }

    const freshSelectedIds = new Set(
      (freshRollData || []).map((item) => item.selected_favorite_person_id)
    );
    const freshAvailablePeople = favoritePeople.filter(
      (person) => !freshSelectedIds.has(person.id)
    );

    if (freshAvailablePeople.length === 0) {
      setRolling(false);
      Alert.alert(
        "Iteration completed",
        "All favorite people are already selected for this achievement iteration. Start the next iteration."
      );
      await loadMatrixData();
      return;
    }

    const randomIndex = Math.floor(Math.random() * freshAvailablePeople.length);
    const selectedPerson = freshAvailablePeople[randomIndex];
    const nowIso = new Date().toISOString();

    const { error: stateError } = await supabase.from("matrix_state").upsert({
      user_id: currentUserId,
      active_cycle_number: currentCycle,
      updated_at: nowIso,
    });

    if (stateError) {
      setRolling(false);
      Alert.alert("State update failed", stateError.message);
      return;
    }

    const { data: rollData, error: rollError } = await supabase
      .from("matrix_rolls")
      .insert({
        user_id: currentUserId,
        selected_favorite_person_id: selectedPerson.id,
        grid_cell: cellNumber,
        cycle_number: currentCycle,
        achievement_id: selectedAchievementId,
        available_count_before_roll: freshAvailablePeople.length,
        selected_from_count: favoritePeople.length,
        metadata: {
          method: "random_from_available_favorite_people",
          selected_section: cellNumber,
          achievement_id: selectedAchievementId,
          achievement_title: verifiedAchievement?.title || selectedAchievement?.title || null,
          screen: "MatrixScreen",
          next_selection_rule: "locked_until_subtask_deadline_or_approved_completion",
          created_at: nowIso,
        },
      })
      .select("id")
      .single();

    if (rollError) {
      setRolling(false);

      if (isDuplicateMatrixSelectionError(rollError)) {
        Alert.alert(
          "Selection already used",
          "This favorite person was already selected in this achievement iteration. I refreshed the Matrix. Please try again or start the next iteration."
        );
      } else {
        Alert.alert("Matrix roll failed", rollError.message);
      }

      await loadMatrixData();
      return;
    }

    const { error: assignmentError } = await supabase.from("matrix_task_assignments").insert({
      matrix_roll_id: rollData.id,
      user_id: currentUserId,
      favorite_person_id: selectedPerson.id,
      achievement_id: selectedAchievementId,
      status: "pending_assignment",
      created_at: nowIso,
      updated_at: nowIso,
    });

    setRolling(false);

    if (assignmentError) {
      await supabase.from("matrix_rolls").delete().eq("id", rollData.id);
      Alert.alert("Assignment lock failed", assignmentError.message);
      await loadMatrixData();
      return;
    }

    setLastSelected(selectedPerson);

    Alert.alert(
      "Favorite person selected",
      `${selectedPerson.full_name || selectedPerson.username} was selected for ${
        selectedAchievement?.title || "this achievement"
      }. Matrix is locked until the assigned subtask is approved or the deadline passes.`
    );

    await loadMatrixData();
  };

  const spinMatrix = () => {
    if (rolling) return;
    const openCells = new Set(currentAchievementRolls.map((item) => item.grid_cell));
    const freeCells = MATRIX_CELLS.filter((cell) => !openCells.has(cell));
    const pool = freeCells.length ? freeCells : MATRIX_CELLS;
    const cell = pool[Math.floor(Math.random() * pool.length)];
    rollMatrix(cell);
  };

  const submitAssignedTask = async (assignment) => {
    if (submitting) return;

    const deadline = assignment.achievement_tasks?.deadline_at;

    if (!deadline) {
      Alert.alert("No deadline", "This assigned subtask does not have a deadline.");
      return;
    }

    if (new Date(deadline).getTime() < Date.now()) {
      Alert.alert(
        "Deadline completed",
        "The subtask deadline has already passed. The Matrix will unlock after refresh."
      );
      await loadMatrixData();
      return;
    }

    try {
      setSubmitting(true);

      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (pickerResult.canceled || pickerResult.cancelled) {
        setSubmitting(false);
        return;
      }

      const pickedAsset = pickerResult.assets?.[0] || pickerResult;

      if (!pickedAsset?.uri) {
        setSubmitting(false);
        Alert.alert("No file selected", "Please select a proof file to submit.");
        return;
      }

      if (pickedAsset.size && pickedAsset.size > MAX_PROOF_SIZE_BYTES) {
        setSubmitting(false);
        Alert.alert("File too large", "Please upload a proof file smaller than 10 MB.");
        return;
      }

      const safeFileName = sanitizeFileName(pickedAsset.name || `proof-${Date.now()}`);
      const contentType = pickedAsset.mimeType || "application/octet-stream";
      const storagePath = `${currentUserId}/${assignment.id}/${Date.now()}-${safeFileName}`;
      const fileBuffer = await readPickedFileAsArrayBuffer(pickedAsset.uri);

      const { error: uploadError } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        setSubmitting(false);
        Alert.alert("Proof upload failed", uploadError.message);
        return;
      }

      const nowIso = new Date().toISOString();

      const { error: proofError } = await supabase.from("matrix_task_proofs").upsert(
        {
          assignment_id: assignment.id,
          user_id: currentUserId,
          favorite_person_id: assignment.favorite_person_id,
          achievement_id: assignment.achievement_id,
          achievement_task_id: assignment.achievement_task_id,
          storage_bucket: PROOF_BUCKET,
          file_path: storagePath,
          file_name: safeFileName,
          mime_type: contentType,
          size_bytes: pickedAsset.size || null,
          uploaded_at: nowIso,
          updated_at: nowIso,
        },
        { onConflict: "assignment_id" }
      );

      if (proofError) {
        setSubmitting(false);
        Alert.alert("Proof save failed", proofError.message);
        return;
      }

      const { error: assignmentError } = await supabase
        .from("matrix_task_assignments")
        .update({
          status: "submitted",
          submitted_at: nowIso,
          proof_viewed_at: null,
          updated_at: nowIso,
        })
        .eq("id", assignment.id)
        .eq("user_id", currentUserId)
        .in("status", ["assigned", "rejected"]);

      if (assignmentError) {
        setSubmitting(false);
        Alert.alert("Submit failed", assignmentError.message);
        return;
      }

      await supabase
        .from("achievement_tasks")
        .update({
          status: "submitted",
          updated_at: nowIso,
        })
        .eq("id", assignment.achievement_task_id)
        .eq("owner_id", currentUserId);

      setSubmitting(false);
      Alert.alert(
        "Proof submitted",
        "Your proof was uploaded and sent to the selected favorite person for approval."
      );
      await loadMatrixData();
    } catch (error) {
      setSubmitting(false);
      Alert.alert("Submit failed", error.message || "Could not submit proof.");
    }
  };

  const startNextIteration = async () => {
    if (!currentUserId) return;

    if (activeLock) {
      Alert.alert("Matrix locked", getLockMessage(activeLock));
      return;
    }

    const nextCycle = currentCycle + 1;
    const { error } = await supabase.from("matrix_state").upsert({
      user_id: currentUserId,
      active_cycle_number: nextCycle,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      Alert.alert("Iteration update failed", error.message);
      return;
    }

    setCurrentCycle(nextCycle);
    setSelectedCell(null);
    setLastSelected(null);
    Alert.alert("New iteration", "Matrix selection has been reset for a fresh cycle.");
    await loadMatrixData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: 20 }}>
          <TopBar onLogout={onLogout} />
        </View>
        <LoadingBox text="Loading Matrix…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadMatrixData} tintColor={COLORS.accent} />
        }
      >
        <TopBar onLogout={onLogout} />

        <Eyebrow>Locked selection</Eyebrow>
        <PageTitle>The Matrix</PageTitle>
        <PageSub>
          Spin to randomly pick a section. The favorite person behind it assigns your next subtask.
        </PageSub>

        {selectedAchievement && (
          <Card style={styles.currentCard}>
            <Mono style={styles.metaLabel}>CURRENT ACHIEVEMENT</Mono>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.currentTitle} numberOfLines={1}>
                  {selectedAchievement.title}
                </Text>
                <Text style={styles.currentSub} numberOfLines={1}>
                  {selectedAchievement.description || "Active achievement"}
                </Text>
              </View>
              <Icon name="cal" size={20} stroke={1.8} color={COLORS.textMute} />
            </View>
          </Card>
        )}

        <AchievementSelector
          achievements={achievements}
          selectedAchievementId={selectedAchievementId}
          locked={!!activeLock}
          onSelect={setSelectedAchievementId}
        />

        <View style={styles.statsRow}>
          <StatBox num={currentCycle} label="Iteration" hl />
          <StatBox num={favoritePeople.length} label="Connected" />
          <StatBox num={availableFavoritePeople.length} label="Remaining" />
        </View>

        <Card style={{ marginTop: 12 }}>
          <View style={[styles.rowBetween, { marginBottom: 11 }]}>
            <Text style={styles.cardHeading}>Cycle progress</Text>
            <Mono style={{ fontWeight: "700", color: COLORS.accent }}>{cycleProgress}%</Mono>
          </View>
          <Bar value={cycleProgress} />
        </Card>

        <Btn
          title={rolling ? "Spinning…" : "Spin the matrix"}
          icon="dice"
          onPress={spinMatrix}
          disabled={rolling || !!activeLock || !selectedAchievementId || achievements.length === 0}
          style={{ marginTop: 14 }}
        />

        {activeLock && (
          <ActiveLockCard
            assignment={activeLock}
            submitting={submitting}
            onSubmit={() => submitAssignedTask(activeLock)}
          />
        )}

        {!activeLock && isCycleComplete && (
          <Btn
            title="Start next iteration"
            variant="ink"
            iconRight="arrowR"
            onPress={startNextIteration}
            style={{ marginTop: 14 }}
          />
        )}

        {/* grid */}
        <Card style={{ marginTop: 14 }}>
          <View style={[styles.rowBetween, { marginBottom: 14 }]}>
            <Text style={styles.panelTitle}>Closed grid</Text>
            <Mono style={{ fontSize: 11.5, color: COLORS.textMute }}>
              {activeLock ? "Locked" : "9 sections"}
            </Mono>
          </View>

          <View style={styles.grid}>
            {MATRIX_CELLS.map((cellNumber) => {
              const roll = currentAchievementRolls.find((item) => item.grid_cell === cellNumber);
              const selectedPerson = roll
                ? favoritePeople.find((person) => person.id === roll.selected_favorite_person_id)
                : null;
              const isSelected = selectedCell === cellNumber;
              const isOpen = !!roll;

              return (
                <TouchableOpacity
                  key={cellNumber}
                  activeOpacity={0.8}
                  style={[
                    styles.gridCell,
                    isSelected && styles.gridCellSelected,
                    isOpen && styles.gridCellOpen,
                    activeLock && !isOpen && styles.gridCellLocked,
                  ]}
                  onPress={() => rollMatrix(cellNumber)}
                >
                  <Text style={[styles.gridNumber, isOpen && styles.gridNumberOpen, isSelected && { color: COLORS.accent }]}>
                    {isOpen
                      ? initialOf(selectedPerson?.full_name || selectedPerson?.username)
                      : cellNumber}
                  </Text>
                  <Text
                    style={[styles.gridLabel, isOpen && styles.gridLabelOpen]}
                    numberOfLines={1}
                  >
                    {isOpen
                      ? selectedPerson?.full_name || selectedPerson?.username || "Selected"
                      : activeLock
                      ? "LOCKED"
                      : "CLOSED"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {lastSelected && (
          <Card style={styles.resultCard}>
            <Mono style={[styles.metaLabel, { color: COLORS.accent }]}>LAST SELECTED</Mono>
            <Text style={styles.resultName}>{lastSelected.full_name || lastSelected.username}</Text>
          </Card>
        )}

        <SecTitle>Selection history</SecTitle>
        {currentAchievementRolls.length === 0 ? (
          <Card style={{ borderStyle: "dashed" }}>
            <Text style={styles.emptyText}>No Matrix selections yet for this achievement.</Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {currentAchievementRolls.map((roll) => {
              const person = favoritePeople.find(
                (item) => item.id === roll.selected_favorite_person_id
              );
              return (
                <Card key={roll.id} style={styles.historyRow}>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeText}>{roll.grid_cell}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>
                      {person?.full_name || person?.username || "Favorite person"}
                    </Text>
                    <Text style={styles.historyMeta}>
                      Section {roll.grid_cell} · {formatDateTime(roll.created_at)}
                    </Text>
                  </View>
                  <Icon name="chevR" size={16} color={COLORS.textMute} />
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TopBar({ onLogout }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Icon name="spark" size={20} stroke={2.2} color={COLORS.accentInk} />
        </View>
        <Text style={styles.brandText}>FAVKID</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pill bg={COLORS.accentSoft} color={COLORS.accent} icon="dice">
          Matrix
        </Pill>
        {onLogout ? <DangerSmBtn onPress={onLogout} /> : null}
      </View>
    </View>
  );
}

function AchievementSelector({ achievements, selectedAchievementId, locked, onSelect }) {
  if (achievements.length === 0) {
    return (
      <Card style={styles.noAchievementCard}>
        <Text style={styles.noAchievementTitle}>No Matrix-ready achievements</Text>
        <Text style={styles.noAchievementText}>
          Matrix needs at least one achievement with a future-deadline subtask. If all subtask deadlines are over, create a new achievement or add a new future subtask.
        </Text>
      </Card>
    );
  }

  return (
    <View style={{ marginTop: 14 }}>
      <View style={[styles.rowBetween, { marginBottom: 10 }]}>
        <Text style={styles.cardHeading}>Choose achievement</Text>
        {locked && <Text style={styles.lockedText}>Locked</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 11, paddingRight: 8 }}>
        {achievements.map((achievement) => {
          const active = achievement.id === selectedAchievementId;
          return (
            <TouchableOpacity
              key={achievement.id}
              activeOpacity={0.85}
              disabled={locked}
              style={[styles.achPill, active && styles.achPillActive]}
              onPress={() => onSelect(achievement.id)}
            >
              <Text style={[styles.achPillTitle, active && { color: COLORS.accent }]} numberOfLines={1}>
                {achievement.title || "Untitled"}
              </Text>
              <Mono style={styles.achPillMeta}>{formatShortDate(achievement.overall_deadline_at)}</Mono>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ActiveLockCard({ assignment, submitting, onSubmit }) {
  const favoriteName =
    assignment.profiles?.full_name || assignment.profiles?.username || "Favorite person";
  const taskTitle = assignment.achievement_tasks?.title;
  const status = String(assignment.status || "").toUpperCase().replace(/_/g, " ");
  const proof = getProofFromAssignment(assignment);

  return (
    <Card style={styles.lockCard}>
      <Mono style={styles.lockKicker}>MATRIX LOCKED</Mono>
      <Text style={styles.lockTitle}>{status}</Text>
      <Text style={styles.lockText}>{getLockMessage(assignment)}</Text>

      <View style={styles.lockMetaBox}>
        <Mono style={styles.metaLabel}>FAVORITE PERSON</Mono>
        <Text style={styles.lockMetaValue}>{favoriteName}</Text>
      </View>

      {!!taskTitle && (
        <View style={styles.lockMetaBox}>
          <Mono style={styles.metaLabel}>ASSIGNED SUBTASK</Mono>
          <Text style={styles.lockMetaValue}>{taskTitle}</Text>
          <Text style={styles.lockMetaSmall}>
            Deadline: {formatDateTime(assignment.achievement_tasks?.deadline_at)}
          </Text>
        </View>
      )}

      {proof && (
        <View style={styles.proofBox}>
          <Mono style={[styles.metaLabel, { color: COLORS.info }]}>PROOF SUBMITTED</Mono>
          <Text style={styles.proofText}>{proof.file_name || "Proof file"}</Text>
        </View>
      )}

      {getFeedbackFromAssignment(assignment) && (
        <FeedbackPreview feedback={getFeedbackFromAssignment(assignment)} />
      )}

      {(assignment.status === "assigned" || assignment.status === "rejected") && (
        <Btn
          title={submitting ? "Submitting…" : assignment.status === "rejected" ? "Resubmit proof" : "Upload proof"}
          icon="file"
          onPress={onSubmit}
          loading={submitting}
          style={{ marginTop: 14 }}
        />
      )}
    </Card>
  );
}


function FeedbackPreview({ feedback }) {
  return (
    <View style={styles.feedbackPreviewBox}>
      <Mono style={[styles.metaLabel, { color: COLORS.accent }]}>FAVORITE PERSON FEEDBACK</Mono>
      <View style={styles.feedbackPreviewHead}>
        <Text style={styles.feedbackEmoji}>{feedback.reaction_emoji || "💬"}</Text>
        <Text style={styles.feedbackReaction}>{feedback.reaction_label || normalizeDecision(feedback.decision)}</Text>
      </View>
      {!!feedback.comment && <Text style={styles.feedbackComment}>{feedback.comment}</Text>}
    </View>
  );
}

/* ---------------- backend helpers ---------------- */
function isTaskAssignableForMatrix(task) {
  const status = String(task?.status || "").toLowerCase();
  const deadlineTime = new Date(task?.deadline_at).getTime();

  if (["approved", "completed"].includes(status)) return false;
  if (!task?.deadline_at || Number.isNaN(deadlineTime)) return false;

  return deadlineTime > Date.now();
}

function isMissingRpcError(error) {
  const message = [error?.code, error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    error?.code === "42883" ||
    message.includes("function") && message.includes("does not exist") ||
    message.includes("could not find the function")
  );
}

function findBlockingAssignment(rows) {
  return (rows || []).find((item) => ACTIVE_LOCK_STATUSES.includes(item.status)) || null;
}

function getLockMessage(assignment) {
  if (!assignment) return "Matrix is available.";
  const favoriteName =
    assignment.profiles?.full_name || assignment.profiles?.username || "favorite person";

  if (assignment.status === "pending_assignment") {
    return `${favoriteName} must assign one subtask from the selected achievement.`;
  }
  if (assignment.status === "assigned") {
    return "Complete the assigned subtask and upload proof before the deadline.";
  }
  if (assignment.status === "submitted") {
    return "Proof submitted. Wait for the favorite person to view and approve it.";
  }
  if (assignment.status === "rejected") {
    return "Proof was rejected. Upload improved proof before the deadline.";
  }
  return "Matrix is locked for this assignment.";
}

function isDuplicateMatrixSelectionError(error) {
  const message = [error?.code, error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    error?.code === "23505" ||
    message.includes("duplicate key") ||
    message.includes("unique_matrix_selection_per_cycle") ||
    message.includes("unique_matrix_selection_per_achievement_cycle")
  );
}

function getFeedbackFromAssignment(assignment) {
  const feedback = assignment?.matrix_task_feedback;
  if (Array.isArray(feedback)) return feedback[0] || null;
  return feedback || null;
}

function normalizeDecision(value) {
  if (!value) return "Feedback";
  return String(value).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function getProofFromAssignment(assignment) {
  const proofs = assignment?.matrix_task_proofs;
  if (Array.isArray(proofs)) return proofs[0] || null;
  return proofs || null;
}

async function readPickedFileAsArrayBuffer(uri) {
  try {
    const file = new File(uri);
    return await file.arrayBuffer();
  } catch (fileError) {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error("The selected proof file could not be read. Please pick the file again.");
    }
    return await response.arrayBuffer();
  }
}

function sanitizeFileName(value) {
  return String(value || "proof-file")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function formatDateTime(value) {
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

function formatShortDate(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  brandText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", letterSpacing: 0.8, color: COLORS.textDim },
  metaLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.textMute },
  currentCard: { marginTop: 16, backgroundColor: COLORS.ink, borderColor: COLORS.borderSoft },
  currentTitle: { fontFamily: FONTS.display, fontSize: 24, fontWeight: "800", color: COLORS.onInk },
  currentSub: { color: COLORS.textDim, fontSize: 13, marginTop: 2 },
  cardHeading: { fontWeight: "700", fontSize: 14.5, color: COLORS.text },
  lockedText: { color: COLORS.danger, fontSize: 11, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  panelTitle: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 18, color: COLORS.text },
  noAchievementCard: { marginTop: 14, backgroundColor: COLORS.dangerSoft, borderColor: "transparent" },
  noAchievementTitle: { color: COLORS.danger, fontSize: 16, fontWeight: "800" },
  noAchievementText: { marginTop: 6, color: COLORS.textDim, fontSize: 13, lineHeight: 19 },
  achPill: {
    minWidth: 168,
    maxWidth: 230,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderSoft,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  achPillActive: { borderColor: COLORS.accent },
  achPillTitle: { fontFamily: FONTS.display, fontSize: 16, fontWeight: "800", color: COLORS.text },
  achPillMeta: { marginTop: 8, fontSize: 10.5, color: COLORS.textMute, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCell: {
    width: "30.8%",
    aspectRatio: 1,
    backgroundColor: COLORS.surface2,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: 6,
  },
  gridCellSelected: { borderColor: COLORS.accent },
  gridCellOpen: { backgroundColor: COLORS.ink },
  gridCellLocked: { opacity: 0.55 },
  gridNumber: { fontFamily: FONTS.display, fontSize: 24, fontWeight: "800", color: COLORS.textMute },
  gridNumberOpen: { color: COLORS.onInk },
  gridLabel: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.textMute, letterSpacing: 0.4 },
  gridLabelOpen: { color: COLORS.textDim },
  resultCard: { marginTop: 14, backgroundColor: COLORS.accentSoft, borderColor: "transparent" },
  resultName: { fontFamily: FONTS.display, fontSize: 18, fontWeight: "800", color: COLORS.text, marginTop: 3 },
  emptyText: { color: COLORS.textMute, fontSize: 13, lineHeight: 18 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 13, padding: 15 },
  historyBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface3, alignItems: "center", justifyContent: "center" },
  historyBadgeText: { fontFamily: FONTS.display, color: COLORS.textDim, fontSize: 15, fontWeight: "800" },
  historyTitle: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
  historyMeta: { color: COLORS.textMute, fontSize: 12, marginTop: 2 },
  lockCard: { marginTop: 14, backgroundColor: COLORS.warnSoft, borderColor: "transparent" },
  lockKicker: { color: COLORS.warn, fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  lockTitle: { fontFamily: FONTS.display, color: COLORS.text, fontSize: 22, fontWeight: "800", marginTop: 5 },
  lockText: { color: COLORS.textDim, fontSize: 13, lineHeight: 19, marginTop: 6 },
  lockMetaBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, marginTop: 12 },
  lockMetaValue: { color: COLORS.text, fontSize: 14, fontWeight: "700", marginTop: 4 },
  lockMetaSmall: { color: COLORS.textMute, fontSize: 12, marginTop: 4 },

  feedbackPreviewBox: { backgroundColor: COLORS.accentSoft, borderRadius: 14, padding: 12, marginTop: 12 },
  feedbackPreviewHead: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  feedbackEmoji: { fontSize: 20 },
  feedbackReaction: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  feedbackComment: { marginTop: 7, color: COLORS.textDim, fontSize: 13, lineHeight: 18 },
  proofBox: { backgroundColor: COLORS.infoSoft, borderRadius: 14, padding: 12, marginTop: 12 },
  proofText: { color: COLORS.textDim, fontSize: 12, marginTop: 3 },
});
