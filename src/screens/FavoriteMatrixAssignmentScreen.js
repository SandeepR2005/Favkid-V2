import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { COLORS, FONTS, initialOf } from "../theme";
import Icon from "../components/Icon";
import {
  Btn,
  Card,
  DangerSmBtn,
  Eyebrow,
  LoadingBox,
  Mono,
  PageSub,
  PageTitle,
  Pill,
  StatBox,
} from "../components/ui";

const ACTIVE_ASSIGNMENT_STATUSES = ["pending_assignment", "assigned", "submitted", "rejected"];
const OTHER_PREDICTION_STATUSES = ["assigned"];

const PROOF_BUCKET = "task-proofs";

const REACTION_OPTIONS = [
  { key: "great_work", label: "Great work", emoji: "🔥" },
  { key: "good_effort", label: "Good effort", emoji: "👏" },
  { key: "verified", label: "Verified", emoji: "✅" },
  { key: "keep_going", label: "Keep going", emoji: "💪" },
];

const DEFAULT_PREDICTED_YES_PERCENT = "70";

export default function FavoriteMatrixAssignmentScreen({ onLogout }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [tasksByAssignmentId, setTasksByAssignmentId] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [predictionDraft, setPredictionDraft] = useState(null);
  const [predictionAnswer, setPredictionAnswer] = useState("yes");
  const [predictedYesPercent, setPredictedYesPercent] = useState(DEFAULT_PREDICTED_YES_PERCENT);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [predictionRequests, setPredictionRequests] = useState([]);
  const [predictionRequestDrafts, setPredictionRequestDrafts] = useState({});
  const [predictionSavingId, setPredictionSavingId] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const visibleAssignments = useMemo(() => {
    return assignments.filter((item) => ACTIVE_ASSIGNMENT_STATUSES.includes(item.status));
  }, [assignments]);

  const stats = useMemo(() => {
    return {
      requests: visibleAssignments.length,
      toAssign: visibleAssignments.filter((item) => item.status === "pending_assignment").length,
      toReview: visibleAssignments.filter((item) => item.status === "submitted").length,
      predictions: predictionRequests.length,
    };
  }, [visibleAssignments, predictionRequests.length]);

  const refreshMatrixAssignmentExpiry = async () => {
    const { error } = await supabase.rpc("refresh_matrix_expired_or_unassignable_assignments");

    if (error && !isMissingRpcError(error)) {
      console.warn("Matrix expiry refresh failed:", error.message);
    }
  };

  const loadAssignments = async () => {
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
        proof_viewed_at,
        points_awarded,
        points_awarded_value,
        points_awarded_at,
        matrix_rolls(grid_cell, cycle_number, created_at),
        achievement_tasks(id, title, deadline_at, estimated_minutes, status, achievement_id),
        matrix_task_proofs(id, storage_bucket, file_path, file_name, mime_type, size_bytes, created_at, uploaded_at),
        achievements(id, title, overall_deadline_at)
      `
      )
      .eq("favorite_person_id", user.id)
      .order("created_at", { ascending: false });

    if (assignmentError) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Assignment fetch failed", assignmentError.message);
      return;
    }

    const assignmentRows = assignmentData || [];
    setAssignments(assignmentRows);

    const userIds = [...new Set(assignmentRows.map((item) => item.user_id))];

    if (userIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", userIds);

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
    } else {
      setProfilesById({});
    }

    await loadCurrentAchievementTasksForAssignments(assignmentRows);
    await loadEngagementRows(assignmentRows);
    await loadPredictionRequests();

    setLoading(false);
    setRefreshing(false);
  };

  const loadCurrentAchievementTasksForAssignments = async (assignmentRows) => {
    const pendingRows = (assignmentRows || []).filter(
      (assignment) => assignment.status === "pending_assignment"
    );

    if (pendingRows.length === 0) {
      setTasksByAssignmentId({});
      return;
    }

    const results = await Promise.all(
      pendingRows.map(async (assignment) => {
        const { data, error } = await supabase.rpc(
          "get_matrix_assignment_current_achievement_tasks",
          {
            p_assignment_id: assignment.id,
          }
        );

        return {
          assignmentId: assignment.id,
          data: data || [],
          error,
        };
      })
    );

    const taskMap = {};

    results.forEach((result) => {
      taskMap[result.assignmentId] = {
        rows: result.error ? [] : result.data,
        error: result.error ? result.error.message : null,
      };
    });

    setTasksByAssignmentId(taskMap);
  };

  const loadEngagementRows = async (assignmentRows) => {
    const assignmentIds = (assignmentRows || []).map((item) => item.id).filter(Boolean);

    if (assignmentIds.length === 0) {
      setFeedbackDrafts({});
      return;
    }

    const { data: feedbackRows, error: feedbackError } = await supabase
      .from("matrix_task_feedback")
      .select(
        "id, assignment_id, reaction_key, reaction_label, comment, decision, feedback_quality_score, created_at, updated_at"
      )
      .in("assignment_id", assignmentIds);

    if (feedbackError) {
      // If SQL is not applied yet, the main assignment flow should still load.
      setFeedbackDrafts({});
      return;
    }

    const nextDrafts = {};
    (feedbackRows || []).forEach((row) => {
      nextDrafts[row.assignment_id] = {
        reactionKey: row.reaction_key || "",
        comment: row.comment || "",
        savedDecision: row.decision || null,
      };
    });

    setFeedbackDrafts(nextDrafts);
  };

  const loadPredictionRequests = async () => {
    const { data, error } = await supabase.rpc("get_prediction_requests_for_favorite_person");

    if (error) {
      // If the latest SQL is not applied yet, keep the assignment screen usable.
      if (!isMissingRpcError(error)) {
        console.warn("Prediction requests fetch failed:", error.message);
      }
      setPredictionRequests([]);
      return;
    }

    const rows = (data || []).filter((item) =>
      OTHER_PREDICTION_STATUSES.includes(String(item.assignment_status || "").toLowerCase())
    );

    setPredictionRequests(rows);

    setPredictionRequestDrafts((prev) => {
      const next = { ...prev };
      rows.forEach((request) => {
        if (!next[request.assignment_id]) {
          next[request.assignment_id] = {
            answer: "yes",
            percent: DEFAULT_PREDICTED_YES_PERCENT,
          };
        }
      });
      return next;
    });
  };

  const updateFeedbackDraft = (assignmentId, updates) => {
    setFeedbackDrafts((prev) => ({
      ...prev,
      [assignmentId]: {
        reactionKey: "",
        comment: "",
        ...(prev[assignmentId] || {}),
        ...updates,
      },
    }));
  };

  const updatePredictionRequestDraft = (assignmentId, updates) => {
    setPredictionRequestDrafts((prev) => ({
      ...prev,
      [assignmentId]: {
        answer: "yes",
        percent: DEFAULT_PREDICTED_YES_PERCENT,
        ...(prev[assignmentId] || {}),
        ...updates,
      },
    }));
  };

  const savePredictionForAssignment = async ({ assignmentId, answer, percent }) => {
    const cleanPercent = clampPercent(percent);

    if (cleanPercent === null) {
      return { error: { message: "Enter a percentage from 0 to 100." } };
    }

    return await supabase.rpc("submit_task_completion_prediction", {
      p_assignment_id: assignmentId,
      p_prediction_answer: answer,
      p_predicted_yes_percentage: cleanPercent,
    });
  };

  const startPrediction = (assignment, task) => {
    if (!task?.is_assignable) {
      Alert.alert("Cannot assign this subtask", task?.blocked_reason || "This subtask is not assignable.");
      return;
    }

    setPredictionDraft({ assignmentId: assignment.id, task });
    setPredictionAnswer("yes");
    setPredictedYesPercent(DEFAULT_PREDICTED_YES_PERCENT);
  };

  const assignTask = async (assignment, task) => {
    if (saving) return;

    const taskId = task.task_id || task.id;

    if (!taskId) {
      Alert.alert("Invalid task", "This subtask is missing its task id.");
      return;
    }

    if (!task.is_assignable) {
      Alert.alert("Cannot assign this subtask", task.blocked_reason || "This subtask is not assignable.");
      return;
    }

    const percent = clampPercent(predictedYesPercent);

    if (percent === null) {
      Alert.alert("Prediction needed", "Enter a percentage from 0 to 100.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc("assign_matrix_current_achievement_task", {
      p_assignment_id: assignment.id,
      p_task_id: taskId,
    });

    if (error) {
      setSaving(false);
      Alert.alert("Assign failed", error.message);
      return;
    }

    const { error: predictionError } = await savePredictionForAssignment({
      assignmentId: assignment.id,
      answer: predictionAnswer,
      percent,
    });

    if (predictionError) {
      setSaving(false);
      Alert.alert(
        "Prediction save failed",
        `The task was assigned, but the prediction was not saved: ${predictionError.message}`
      );
      setPredictionDraft(null);
      await loadAssignments();
      return;
    }

    setSaving(false);
    setPredictionDraft(null);
    Alert.alert(
      "Assigned",
      data?.message || "The subtask was assigned with your completion prediction."
    );
    await loadAssignments();
  };

  const submitOtherPrediction = async (request) => {
    if (predictionSavingId) return;

    const draft = predictionRequestDrafts[request.assignment_id] || {
      answer: "yes",
      percent: DEFAULT_PREDICTED_YES_PERCENT,
    };

    const percent = clampPercent(draft.percent);

    if (percent === null) {
      Alert.alert("Prediction needed", "Enter a percentage from 0 to 100.");
      return;
    }

    setPredictionSavingId(request.assignment_id);

    const { error } = await savePredictionForAssignment({
      assignmentId: request.assignment_id,
      answer: draft.answer,
      percent,
    });

    setPredictionSavingId(null);

    if (error) {
      Alert.alert("Prediction save failed", error.message);
      return;
    }

    setPredictionRequests((prev) =>
      prev.filter((item) => item.assignment_id !== request.assignment_id)
    );

    Alert.alert("Prediction saved", "Your completion prediction was recorded.");
    await loadAssignments();
  };

  const saveFeedback = async (assignment, decision) => {
    const draft = feedbackDrafts[assignment.id] || {};
    const reaction = REACTION_OPTIONS.find((item) => item.key === draft.reactionKey);
    const comment = String(draft.comment || "").trim();
    const quality = calculateFeedbackQuality(reaction?.key, comment);

    const { error } = await supabase.from("matrix_task_feedback").upsert(
      {
        assignment_id: assignment.id,
        user_id: assignment.user_id,
        favorite_person_id: currentUserId,
        achievement_id: assignment.achievement_id,
        achievement_task_id: assignment.achievement_task_id,
        reaction_key: reaction?.key || null,
        reaction_label: reaction?.label || null,
        reaction_emoji: reaction?.emoji || null,
        comment: comment || null,
        decision,
        feedback_quality_score: quality,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assignment_id" }
    );

    return error;
  };

  const markPredictionOutcome = async (assignment, completed) => {
    await supabase
      .from("task_completion_predictions")
      .update({
        actual_completed: completed,
        outcome_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("assignment_id", assignment.id);
  };

  const openProof = async (assignment) => {
    const proof = getProofFromAssignment(assignment);

    if (!proof?.file_path) {
      Alert.alert("No proof uploaded", "The user has not uploaded proof yet.");
      return;
    }

    const { data, error } = await supabase.storage
      .from(proof.storage_bucket || PROOF_BUCKET)
      .createSignedUrl(proof.file_path, 60 * 5);

    if (error || !data?.signedUrl) {
      Alert.alert("Could not open proof", error?.message || "Signed URL failed.");
      return;
    }

    const now = new Date().toISOString();

    const { error: viewError } = await supabase
      .from("matrix_task_assignments")
      .update({
        proof_viewed_at: now,
        updated_at: now,
      })
      .eq("id", assignment.id)
      .eq("favorite_person_id", currentUserId);

    if (viewError) {
      Alert.alert("Proof view update failed", viewError.message);
      return;
    }

    await Linking.openURL(data.signedUrl);
    await loadAssignments();
  };

  const approveAssignment = async (assignment) => {
    if (saving) return;

    const proof = getProofFromAssignment(assignment);

    if (!proof?.file_path) {
      Alert.alert(
        "Proof required",
        "You can approve only after the user uploads proof. No proof is available for this submission."
      );
      return;
    }

    if (!assignment.proof_viewed_at) {
      Alert.alert(
        "View proof first",
        "Please tap View Proof and review the uploaded proof before approving."
      );
      return;
    }

    setSaving(true);

    const feedbackError = await saveFeedback(assignment, "approved");

    if (feedbackError) {
      setSaving(false);
      Alert.alert("Feedback save failed", feedbackError.message);
      return;
    }

    const { data, error } = await supabase.rpc("approve_matrix_assignment_with_points", {
      p_assignment_id: assignment.id,
    });

    if (error) {
      setSaving(false);
      Alert.alert("Approve failed", error.message);
      return;
    }

    await markPredictionOutcome(assignment, true);

    const points = Number(data?.points_awarded || 0);
    const progress = Number(data?.achievement_progress || 0);

    setSaving(false);
    Alert.alert(
      "Approved",
      `The task was approved. You earned +${points} points. Achievement progress is now ${progress}%.`
    );
    await loadAssignments();
  };

  const rejectAssignment = async (assignment) => {
    if (saving) return;
    setSaving(true);

    const feedbackError = await saveFeedback(assignment, "rejected");

    if (feedbackError) {
      setSaving(false);
      Alert.alert("Feedback save failed", feedbackError.message);
      return;
    }

    const { error } = await supabase
      .from("matrix_task_assignments")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignment.id)
      .eq("favorite_person_id", currentUserId)
      .eq("status", "submitted");

    if (error) {
      setSaving(false);
      Alert.alert("Reject failed", error.message);
      return;
    }

    await supabase
      .from("achievement_tasks")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignment.achievement_task_id);

    setSaving(false);
    Alert.alert("Rejected", "The user can submit proof again before the deadline.");
    await loadAssignments();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: 20 }}>
          <TopBar onLogout={onLogout} />
        </View>
        <LoadingBox text="Loading assignments…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadAssignments} tintColor={COLORS.accent} />
        }
      >
        <TopBar onLogout={onLogout} />

        <Eyebrow>Favorite person</Eyebrow>
        <PageTitle>Matrix Assign</PageTitle>
        <PageSub>
          Assign a subtask from the current Matrix achievement, then verify the user's uploaded proof.
        </PageSub>

        <View style={styles.statsRow}>
          <StatBox num={stats.requests} label="Requests" hl />
          <StatBox num={stats.toAssign} label="To assign" />
          <StatBox num={stats.toReview} label="To review" />
        </View>

        {predictionRequests.length > 0 && (
          <PredictionRequestsSection
            requests={predictionRequests}
            drafts={predictionRequestDrafts}
            savingId={predictionSavingId}
            onDraftChange={updatePredictionRequestDraft}
            onSubmit={submitOtherPrediction}
          />
        )}

        {visibleAssignments.length === 0 ? (
          <Card style={{ borderStyle: "dashed", alignItems: "center", paddingVertical: 28 }}>
            <View style={styles.emptyIcon}>
              <Icon name="check" size={22} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyTitle}>No active Matrix requests</Text>
            <Text style={styles.emptyText}>
              When a user selects you from the Matrix, the assignment request will appear here.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 14 }}>
            {visibleAssignments.map((assignment) => {
              const userProfile = profilesById[assignment.user_id];
              const taskState = tasksByAssignmentId[assignment.id] || { rows: [], error: null };
              const taskVisibility = getTaskVisibility(taskState.rows);
              const availableTasks = taskVisibility.availableTasks;
              const achievementTitle =
                taskState.rows?.[0]?.achievement_title ||
                assignment.achievements?.title ||
                "Current Matrix Achievement";

              return (
                <Card key={assignment.id} style={{ padding: 16 }}>
                  <View style={styles.topRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {initialOf(userProfile?.full_name || userProfile?.username)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>
                        {userProfile?.full_name || userProfile?.username || "User"}
                      </Text>
                      <Text style={styles.userMeta}>
                        Iteration {assignment.matrix_rolls?.cycle_number || "-"} · Section{" "}
                        {assignment.matrix_rolls?.grid_cell || "-"}
                      </Text>
                    </View>
                    <StatusBadge status={assignment.status} />
                  </View>

                  {assignment.status === "pending_assignment" && (
                    <View style={styles.innerCard}>
                      <Mono style={styles.sectionEyebrow}>CURRENT ACHIEVEMENT</Mono>
                      <Text style={styles.achName}>{achievementTitle}</Text>

                      {taskState.error ? (
                        <Text style={styles.errorText}>{taskState.error}</Text>
                      ) : (
                        <>
                          <View style={styles.metricRow}>
                            <MiniMetric label="Total" value={taskVisibility.totalTasks} />
                            <MiniMetric label="Available" value={availableTasks.length} accent />
                            <MiniMetric label="Blocked" value={taskVisibility.blockedTasks.length} />
                          </View>

                          <Text style={styles.chooseTitle}>Choose one subtask</Text>

                          {availableTasks.length === 0 ? (
                            <Text style={styles.smallMuted}>
                              No assignable subtasks found inside this achievement.
                            </Text>
                          ) : (
                            <View style={{ gap: 10 }}>
                              {availableTasks.map((task) => (
                                <TaskOption
                                  key={task.task_id}
                                  task={task}
                                  saving={saving}
                                  onAssign={() => startPrediction(assignment, task)}
                                />
                              ))}
                            </View>
                          )}

                          {predictionDraft?.assignmentId === assignment.id && (
                            <PredictionPanel
                              task={predictionDraft.task}
                              answer={predictionAnswer}
                              percent={predictedYesPercent}
                              saving={saving}
                              onAnswer={setPredictionAnswer}
                              onPercent={setPredictedYesPercent}
                              onCancel={() => setPredictionDraft(null)}
                              onConfirm={() => assignTask(assignment, predictionDraft.task)}
                            />
                          )}

                          {taskVisibility.blockedTasks.length > 0 && (
                            <View style={styles.blockedBox}>
                              <Mono style={styles.blockedTitle}>BLOCKED SUBTASKS</Mono>
                              {taskVisibility.blockedTasks.map((task) => (
                                <View key={task.task_id} style={styles.blockedItem}>
                                  <Text style={styles.blockedItemTitle}>{task.title}</Text>
                                  <Text style={styles.blockedItemReason}>
                                    {task.blocked_reason || "Not assignable"}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}

                  {assignment.status !== "pending_assignment" && (
                    <View style={styles.assignedBox}>
                      <Mono style={styles.sectionEyebrow}>ASSIGNED SUBTASK</Mono>
                      <Text style={styles.assignedTitle}>
                        {assignment.achievement_tasks?.title || "Subtask"}
                      </Text>
                      <Text style={styles.assignedMeta}>
                        Deadline: {formatDateTime(assignment.achievement_tasks?.deadline_at)}
                      </Text>
                    </View>
                  )}

                  {getProofFromAssignment(assignment) && (
                    <ProofCard
                      proof={getProofFromAssignment(assignment)}
                      proofViewedAt={assignment.proof_viewed_at}
                      pointsAwardedValue={assignment.points_awarded_value}
                      onOpen={() => openProof(assignment)}
                    />
                  )}

                  {assignment.status === "submitted" && (
                    <FeedbackComposer
                      draft={feedbackDrafts[assignment.id] || { reactionKey: "", comment: "" }}
                      onChange={(updates) => updateFeedbackDraft(assignment.id, updates)}
                    />
                  )}

                  {assignment.status === "submitted" && (
                    <View style={styles.actionRow}>
                      <Btn
                        title={saving ? "Saving…" : "Approve"}
                        icon="check"
                        onPress={() => approveAssignment(assignment)}
                        style={{ flex: 1 }}
                      />
                      <Btn
                        title="Reject"
                        variant="ghost"
                        onPress={() => rejectAssignment(assignment)}
                        style={{ flex: 1, borderColor: COLORS.dangerSoft }}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PredictionRequestsSection({ requests, drafts, savingId, onDraftChange, onSubmit }) {
  return (
    <View style={styles.predictionRequestSection}>
      <View style={styles.predictionRequestHead}>
        <View style={styles.predictionRequestIcon}>
          <Icon name="eye" size={18} color={COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.predictionRequestTitle}>Prediction requests</Text>
          <Text style={styles.predictionRequestSub}>
            You are connected to these users. Predict whether they will complete the assigned task before the result is known.
          </Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        {requests.map((request) => {
          const draft = drafts[request.assignment_id] || {
            answer: "yes",
            percent: DEFAULT_PREDICTED_YES_PERCENT,
          };

          return (
            <PredictionRequestCard
              key={request.assignment_id}
              request={request}
              draft={draft}
              saving={savingId === request.assignment_id}
              onDraftChange={(updates) => onDraftChange(request.assignment_id, updates)}
              onSubmit={() => onSubmit(request)}
            />
          );
        })}
      </View>
    </View>
  );
}

function PredictionRequestCard({ request, draft, saving, onDraftChange, onSubmit }) {
  return (
    <Card style={styles.predictionRequestCard}>
      <View style={styles.predictionRequestTop}>
        <View style={styles.smallAvatar}>
          <Text style={styles.smallAvatarText}>{initialOf(request.user_name || request.username)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.predictionRequestUser}>{request.user_name || request.username || "User"}</Text>
          <Text style={styles.predictionRequestMeta}>
            Assigned by {request.selected_favorite_name || "selected favorite"}
          </Text>
        </View>
      </View>

      <View style={styles.predictionTaskBox}>
        <Mono style={styles.sectionEyebrow}>TASK TO PREDICT</Mono>
        <Text style={styles.predictionTaskTitle}>{request.task_title || "Assigned task"}</Text>
        <Text style={styles.predictionTaskMeta}>{request.achievement_title || "Achievement"}</Text>
        <Text style={styles.predictionTaskMeta}>Deadline: {formatDateTime(request.task_deadline_at)}</Text>
      </View>

      <Text style={styles.predictionQuestion}>Do you think this user will complete the task before deadline?</Text>
      <View style={styles.choiceRow}>
        {["yes", "no"].map((item) => (
          <TouchableOpacity
            key={item}
            activeOpacity={0.85}
            style={[styles.choiceBtn, draft.answer === item && styles.choiceBtnActive]}
            onPress={() => onDraftChange({ answer: item })}
          >
            <Text style={[styles.choiceText, draft.answer === item && styles.choiceTextActive]}>
              {item === "yes" ? "Yes" : "No"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.predictionQuestion}>What percentage of other favorite persons will say YES?</Text>
      <View style={styles.percentRow}>
        <TextInput
          value={String(draft.percent ?? DEFAULT_PREDICTED_YES_PERCENT)}
          onChangeText={(value) =>
            onDraftChange({ percent: value.replace(/[^0-9]/g, "").slice(0, 3) })
          }
          keyboardType="numeric"
          placeholder="70"
          placeholderTextColor={COLORS.textMute}
          style={styles.percentInput}
        />
        <Text style={styles.percentSymbol}>%</Text>
      </View>

      <Btn
        title={saving ? "Saving…" : "Submit prediction"}
        icon="check"
        onPress={onSubmit}
        style={{ marginTop: 12 }}
      />
    </Card>
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
        <Pill bg={COLORS.accentSoft} color={COLORS.accent} icon="star">
          Favorite
        </Pill>
        {onLogout ? <DangerSmBtn onPress={onLogout} /> : null}
      </View>
    </View>
  );
}

function StatusBadge({ status }) {
  const c = getStatusColor(status);
  return (
    <Pill bg={c.bg} color={c.text} dotColor={c.dot}>
      {normalizeText(status)}
    </Pill>
  );
}

function MiniMetric({ label, value, accent }) {
  return (
    <View style={[styles.miniMetric, accent && styles.miniMetricAccent]}>
      <Text style={[styles.miniMetricValue, accent && { color: COLORS.accent }]}>{value}</Text>
      <Text style={styles.miniMetricLabel}>{label}</Text>
    </View>
  );
}

function TaskOption({ task, saving, onAssign }) {
  return (
    <View style={styles.taskOption}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskMeta}>Deadline: {formatDateTime(task.deadline_at)}</Text>
        <Text style={styles.taskMeta}>Estimated: {task.estimated_minutes || 0} minutes</Text>
      </View>
      <Btn title={saving ? "…" : "Predict"} small onPress={onAssign} />
    </View>
  );
}


function PredictionPanel({ task, answer, percent, saving, onAnswer, onPercent, onCancel, onConfirm }) {
  return (
    <View style={styles.predictionBox}>
      <Mono style={[styles.sectionEyebrow, { color: COLORS.accent }]}>PREDICTION BEFORE ASSIGNMENT</Mono>
      <Text style={styles.predictionTitle}>{task?.title || "Selected subtask"}</Text>
      <Text style={styles.predictionQuestion}>Do you think the user will complete this before the deadline?</Text>

      <View style={styles.choiceRow}>
        {["yes", "no"].map((item) => (
          <TouchableOpacity
            key={item}
            activeOpacity={0.85}
            style={[styles.choiceBtn, answer === item && styles.choiceBtnActive]}
            onPress={() => onAnswer(item)}
          >
            <Text style={[styles.choiceText, answer === item && styles.choiceTextActive]}>
              {item === "yes" ? "Yes" : "No"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.predictionQuestion}>What percentage of other favorite persons will say YES?</Text>
      <View style={styles.percentRow}>
        <TextInput
          value={percent}
          onChangeText={(value) => onPercent(value.replace(/[^0-9]/g, "").slice(0, 3))}
          keyboardType="numeric"
          placeholder="70"
          placeholderTextColor={COLORS.textMute}
          style={styles.percentInput}
        />
        <Text style={styles.percentSymbol}>%</Text>
      </View>

      <View style={styles.actionRow}>
        <Btn title="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
        <Btn title={saving ? "Saving…" : "Confirm assign"} onPress={onConfirm} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

function FeedbackComposer({ draft, onChange }) {
  return (
    <View style={styles.feedbackBox}>
      <Mono style={[styles.sectionEyebrow, { color: COLORS.accent }]}>REACTION & FEEDBACK</Mono>
      <Text style={styles.feedbackHelp}>Choose a reaction and add a short comment before approving or rejecting.</Text>

      <View style={styles.reactionGrid}>
        {REACTION_OPTIONS.map((reaction) => {
          const active = draft.reactionKey === reaction.key;
          return (
            <TouchableOpacity
              key={reaction.key}
              activeOpacity={0.85}
              style={[styles.reactionBtn, active && styles.reactionBtnActive]}
              onPress={() => onChange({ reactionKey: reaction.key })}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={[styles.reactionLabel, active && { color: COLORS.accent }]}>{reaction.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        value={draft.comment || ""}
        onChangeText={(value) => onChange({ comment: value })}
        placeholder="Example: Good work, continue the next subtask."
        placeholderTextColor={COLORS.textMute}
        multiline
        style={styles.feedbackInput}
      />
    </View>
  );
}

function ProofCard({ proof, proofViewedAt, pointsAwardedValue, onOpen }) {
  return (
    <View style={styles.proofCard}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View style={styles.proofIcon}>
          <Icon name="file" size={18} color={COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Mono style={styles.sectionEyebrow}>UPLOADED PROOF</Mono>
          <Text style={styles.proofName}>{proof.file_name || "Proof file"}</Text>
          <Text style={styles.proofMeta}>
            {proof.mime_type || "File"}
            {proof.size_bytes ? ` · ${formatBytes(proof.size_bytes)}` : ""}
          </Text>
          <Text style={styles.proofMeta}>
            Uploaded: {formatDateTime(proof.uploaded_at || proof.created_at)}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 12, marginBottom: 12 }}>
        <Text style={proofViewedAt ? styles.proofViewed : styles.proofNotViewed}>
          {proofViewedAt ? `Viewed: ${formatDateTime(proofViewedAt)}` : "Not viewed yet"}
        </Text>
        {Number(pointsAwardedValue || 0) > 0 && (
          <Text style={styles.pointsAwarded}>+{pointsAwardedValue} points</Text>
        )}
      </View>

      <Btn title="View proof" variant="ink" iconRight="arrowR" onPress={onOpen} />
    </View>
  );
}

/* ---------------- helpers (unchanged backend logic) ---------------- */
function isMissingRpcError(error) {
  const message = [error?.code, error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    error?.code === "42883" ||
    (message.includes("function") && message.includes("does not exist")) ||
    message.includes("could not find the function")
  );
}

function getTaskVisibility(tasks) {
  const availableTasks = [];
  const blockedTasks = [];
  let alreadyAssignedCount = 0;
  let completedCount = 0;
  let deadlineIssueCount = 0;

  (tasks || []).forEach((task) => {
    if (task.is_assignable) {
      availableTasks.push(task);
      return;
    }
    blockedTasks.push(task);
    const reason = String(task.blocked_reason || "").toLowerCase();
    if (reason.includes("assigned") || reason.includes("review")) alreadyAssignedCount += 1;
    else if (reason.includes("completed") || reason.includes("approved")) completedCount += 1;
    else if (reason.includes("deadline")) deadlineIssueCount += 1;
  });

  return {
    totalTasks: tasks?.length || 0,
    availableTasks,
    blockedTasks,
    alreadyAssignedCount,
    completedCount,
    deadlineIssueCount,
  };
}

function getProofFromAssignment(assignment) {
  const proofs = assignment?.matrix_task_proofs;
  if (Array.isArray(proofs)) return proofs[0] || null;
  return proofs || null;
}

function getStatusColor(status) {
  const value = String(status || "").toLowerCase();
  if (value === "submitted") return { bg: COLORS.warnSoft, dot: COLORS.warn, text: COLORS.warn };
  if (value === "assigned") return { bg: COLORS.infoSoft, dot: COLORS.info, text: COLORS.info };
  if (value === "rejected") return { bg: COLORS.dangerSoft, dot: COLORS.danger, text: COLORS.danger };
  return { bg: COLORS.accentSoft, dot: COLORS.accent, text: COLORS.accent };
}


function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (number < 0 || number > 100) return null;
  return Math.round(number);
}

function calculateFeedbackQuality(reactionKey, comment) {
  let score = 0;
  if (reactionKey) score += 0.45;
  if (String(comment || "").trim().length >= 10) score += 0.55;
  return Math.min(1, Number(score.toFixed(2)));
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeText(value) {
  if (!value) return "";
  return String(value).replace(/_/g, " ").toUpperCase();
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  brandText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: "700", letterSpacing: 0.8, color: COLORS.textDim },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18, marginBottom: 18 },
  predictionRequestSection: { marginBottom: 18 },
  predictionRequestHead: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  predictionRequestIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: COLORS.accentSoft, alignItems: "center", justifyContent: "center" },
  predictionRequestTitle: { fontFamily: FONTS.display, fontSize: 22, fontWeight: "800", color: COLORS.text },
  predictionRequestSub: { marginTop: 4, fontSize: 12.5, lineHeight: 18, color: COLORS.textMute },
  predictionRequestCard: { padding: 14, borderColor: COLORS.accentSoft },
  predictionRequestTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  smallAvatar: { width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.accentSoft, alignItems: "center", justifyContent: "center" },
  smallAvatarText: { fontFamily: FONTS.display, fontSize: 15, fontWeight: "800", color: COLORS.accent },
  predictionRequestUser: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  predictionRequestMeta: { marginTop: 3, fontSize: 11.5, color: COLORS.textMute },
  predictionTaskBox: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 14, padding: 12 },
  predictionTaskTitle: { fontFamily: FONTS.display, fontSize: 17, fontWeight: "800", color: COLORS.text, marginTop: 5 },
  predictionTaskMeta: { marginTop: 4, fontSize: 12, color: COLORS.textMute },
  emptyIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.accentSoft, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  emptyText: { marginTop: 8, fontSize: 13.5, lineHeight: 20, color: COLORS.textMute, textAlign: "center" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  avatarBox: { width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.ink, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: FONTS.display, fontSize: 18, fontWeight: "800", color: COLORS.onInk },
  userName: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  userMeta: { marginTop: 3, fontSize: 12, color: COLORS.textMute },
  innerCard: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 18, padding: 14 },
  sectionEyebrow: { fontSize: 10.5, letterSpacing: 1, color: COLORS.accent },
  achName: { fontFamily: FONTS.display, fontSize: 19, fontWeight: "800", color: COLORS.text, marginTop: 6, marginBottom: 12 },
  errorText: { fontSize: 13, lineHeight: 18, fontWeight: "700", color: COLORS.danger },
  metricRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  miniMetric: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 12, padding: 10 },
  miniMetricAccent: { backgroundColor: COLORS.accentSoft, borderColor: "transparent" },
  miniMetricValue: { fontFamily: FONTS.display, fontSize: 19, fontWeight: "800", color: COLORS.text },
  miniMetricLabel: { marginTop: 2, fontSize: 10, fontWeight: "700", color: COLORS.textMute },
  chooseTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginBottom: 10 },
  smallMuted: { fontSize: 13, color: COLORS.textMute },
  taskOption: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center" },
  taskTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  taskMeta: { marginTop: 4, fontSize: 12, color: COLORS.textMute },
  blockedBox: { borderTopWidth: 1, borderTopColor: COLORS.borderSoft, marginTop: 12, paddingTop: 12 },
  blockedTitle: { fontSize: 10.5, letterSpacing: 1, color: COLORS.textDim, marginBottom: 8 },
  blockedItem: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 12, padding: 10, marginBottom: 8 },
  blockedItemTitle: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  blockedItemReason: { marginTop: 3, fontSize: 11, color: COLORS.textMute },
  assignedBox: { backgroundColor: COLORS.accentSoft, borderRadius: 18, padding: 14 },
  assignedTitle: { fontFamily: FONTS.display, fontSize: 18, fontWeight: "800", color: COLORS.text, marginTop: 6 },
  assignedMeta: { marginTop: 6, fontSize: 12, fontWeight: "600", color: COLORS.textDim },

  predictionBox: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.accentSoft, borderRadius: 16, padding: 14, marginTop: 12 },
  predictionTitle: { fontFamily: FONTS.display, fontSize: 17, fontWeight: "800", color: COLORS.text, marginTop: 6 },
  predictionQuestion: { marginTop: 12, fontSize: 12.5, lineHeight: 18, color: COLORS.textDim, fontWeight: "600" },
  choiceRow: { flexDirection: "row", gap: 8, marginTop: 9 },
  choiceBtn: { flex: 1, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 13, paddingVertical: 11, alignItems: "center" },
  choiceBtnActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  choiceText: { fontWeight: "800", color: COLORS.textMute },
  choiceTextActive: { color: COLORS.accent },
  percentRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  percentInput: { width: 92, backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 11, fontFamily: FONTS.display, fontSize: 18, fontWeight: "800", color: COLORS.text },
  percentSymbol: { fontFamily: FONTS.display, fontSize: 19, fontWeight: "800", color: COLORS.textDim },
  feedbackBox: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 18, padding: 14, marginTop: 12 },
  feedbackHelp: { marginTop: 6, fontSize: 12.5, lineHeight: 18, color: COLORS.textMute },
  reactionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  reactionBtn: { width: "48%", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 14, padding: 10 },
  reactionBtnActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  reactionEmoji: { fontSize: 18 },
  reactionLabel: { marginTop: 4, fontSize: 11.5, fontWeight: "800", color: COLORS.textDim },
  feedbackInput: { minHeight: 84, marginTop: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, color: COLORS.text, fontSize: 13.5, textAlignVertical: "top" },
  proofCard: { backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.borderSoft, borderRadius: 18, padding: 14, marginTop: 12 },
  proofIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.accentSoft, alignItems: "center", justifyContent: "center" },
  proofName: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginTop: 4 },
  proofMeta: { marginTop: 3, fontSize: 11, color: COLORS.textMute },
  proofViewed: { fontSize: 12, fontWeight: "700", color: COLORS.positive },
  proofNotViewed: { fontSize: 12, fontWeight: "700", color: COLORS.danger },
  pointsAwarded: { marginTop: 5, fontSize: 12, fontWeight: "800", color: COLORS.text },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
});
