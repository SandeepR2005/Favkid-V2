import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  black: "#000000",
  white: "#FFFFFF",
  mint: "#A7F3D0",
  lemon: "#FEF08A",
  lilac: "#E9D5FF",
  sky: "#BAE6FD",
  red: "#EF4444",
  green: "#16A34A",
  gray: "#F3F4F6",
  darkGray: "#6B7280",
};

const ACTIVE_ASSIGNMENT_STATUSES = [
  "pending_assignment",
  "assigned",
  "submitted",
  "rejected",
];

const PROOF_BUCKET = "task-proofs";

export default function FavoriteMatrixAssignmentScreen() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [tasksByAssignmentId, setTasksByAssignmentId] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const visibleAssignments = useMemo(() => {
    return assignments.filter((item) =>
      ACTIVE_ASSIGNMENT_STATUSES.includes(item.status)
    );
  }, [assignments]);

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
        achievements(id, title)
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
      if (result.error) {
        taskMap[result.assignmentId] = {
          rows: [],
          error: result.error.message,
        };
      } else {
        taskMap[result.assignmentId] = {
          rows: result.data,
          error: null,
        };
      }
    });

    setTasksByAssignmentId(taskMap);
  };

  const assignTask = async (assignment, task) => {
    if (saving) return;

    const taskId = task.task_id || task.id;

    if (!taskId) {
      Alert.alert("Invalid task", "This subtask is missing its task id.");
      return;
    }

    if (!task.is_assignable) {
      Alert.alert(
        "Cannot assign this subtask",
        task.blocked_reason || "This subtask is not assignable."
      );
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc(
      "assign_matrix_current_achievement_task",
      {
        p_assignment_id: assignment.id,
        p_task_id: taskId,
      }
    );

    if (error) {
      setSaving(false);
      Alert.alert("Assign failed", error.message);
      return;
    }

    setSaving(false);
    Alert.alert(
      "Assigned",
      data?.message || "The subtask was assigned to the user."
    );
    await loadAssignments();
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
        "Please tap VIEW PROOF and review the uploaded proof before approving."
      );
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc(
      "approve_matrix_assignment_with_points",
      {
        p_assignment_id: assignment.id,
      }
    );

    if (error) {
      setSaving(false);
      Alert.alert("Approve failed", error.message);
      return;
    }

    const points = Number(data?.points_awarded || 0);
    const progress = Number(data?.achievement_progress || 0);

    setSaving(false);
    Alert.alert(
      "Approved",
      `The task was approved. Favorite person earned +${points} points. Achievement progress is now ${progress}%.`
    );
    await loadAssignments();
  };

  const rejectAssignment = async (assignment) => {
    if (saving) return;
    setSaving(true);

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
    Alert.alert("Rejected", "The user can submit again before the deadline.");
    await loadAssignments();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>LOADING ASSIGNMENTS...</Text>
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
            onRefresh={loadAssignments}
            tintColor={COLORS.black}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>FAVORITE PERSON</Text>
          <Text style={styles.title}>MATRIX ASSIGN</Text>
          <Text style={styles.subtitle}>
            Assign only from the user's current Matrix achievement. Subtasks
            from other achievements are intentionally hidden.
          </Text>
        </View>

        {visibleAssignments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>NO ACTIVE MATRIX REQUESTS</Text>
            <Text style={styles.emptyText}>
              When a user selects you from the Matrix, their assignment request
              will appear here.
            </Text>
          </View>
        ) : (
          visibleAssignments.map((assignment) => {
            const userProfile = profilesById[assignment.user_id];
            const taskState = tasksByAssignmentId[assignment.id] || {
              rows: [],
              error: null,
            };
            const taskVisibility = getTaskVisibility(taskState.rows);
            const availableTasks = taskVisibility.availableTasks;
            const achievementTitle =
              taskState.rows?.[0]?.achievement_title ||
              assignment.achievements?.title ||
              "Current Matrix Achievement";

            return (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentTopRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {getInitial(userProfile?.full_name || userProfile?.username)}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {userProfile?.full_name || "User"}
                    </Text>
                    <Text style={styles.userMeta}>
                      Iteration {assignment.matrix_rolls?.cycle_number || "-"} · Section{" "}
                      {assignment.matrix_rolls?.grid_cell || "-"}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {normalizeText(assignment.status)}
                    </Text>
                  </View>
                </View>

                {assignment.status === "pending_assignment" && (
                  <View style={styles.taskPickerBox}>
                    <Text style={styles.sectionTitle}>CURRENT ACHIEVEMENT</Text>
                    <Text style={styles.currentAchievementName}>
                      {achievementTitle}
                    </Text>

                    {taskState.error ? (
                      <Text style={styles.errorText}>{taskState.error}</Text>
                    ) : (
                      <>
                        <TaskVisibilityInfo taskVisibility={taskVisibility} />

                        <Text style={styles.sectionTitle}>
                          CHOOSE ONE SUBTASK FROM THIS ACHIEVEMENT
                        </Text>

                        {availableTasks.length === 0 ? (
                          <Text style={styles.emptySmallText}>
                            No assignable subtasks found inside this current
                            achievement. Check the reason list below.
                          </Text>
                        ) : (
                          availableTasks.map((task) => (
                            <TaskOption
                              key={task.task_id}
                              task={task}
                              saving={saving}
                              onAssign={() => assignTask(assignment, task)}
                            />
                          ))
                        )}

                        {taskVisibility.blockedTasks.length > 0 && (
                          <View style={styles.blockedListBox}>
                            <Text style={styles.blockedTitle}>
                              HIDDEN / BLOCKED SUBTASKS
                            </Text>

                            {taskVisibility.blockedTasks.map((task) => (
                              <BlockedTaskItem key={task.task_id} task={task} />
                            ))}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}

                {assignment.status !== "pending_assignment" && (
                  <View style={styles.assignedTaskBox}>
                    <Text style={styles.sectionTitle}>ASSIGNED SUBTASK</Text>
                    <Text style={styles.taskTitle}>
                      {assignment.achievement_tasks?.title || "Subtask"}
                    </Text>
                    <Text style={styles.taskMeta}>
                      Deadline:{" "}
                      {formatDateTime(assignment.achievement_tasks?.deadline_at)}
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
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => approveAssignment(assignment)}
                    >
                      <Text style={styles.actionButtonText}>
                        {saving ? "SAVING..." : "APPROVE"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => rejectAssignment(assignment)}
                    >
                      <Text style={styles.actionButtonText}>REJECT</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
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

    if (reason.includes("assigned") || reason.includes("review")) {
      alreadyAssignedCount += 1;
    } else if (reason.includes("completed") || reason.includes("approved")) {
      completedCount += 1;
    } else if (reason.includes("deadline")) {
      deadlineIssueCount += 1;
    }
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

function TaskVisibilityInfo({ taskVisibility }) {
  return (
    <View style={styles.taskVisibilityBox}>
      <Text style={styles.taskVisibilityText}>
        Total subtasks in current achievement: {taskVisibility.totalTasks}
      </Text>
      <Text style={styles.taskVisibilityText}>
        Available to assign: {taskVisibility.availableTasks.length}
      </Text>
      <Text style={styles.taskVisibilityText}>
        Already assigned/under review: {taskVisibility.alreadyAssignedCount}
      </Text>
      <Text style={styles.taskVisibilityText}>
        Completed/approved: {taskVisibility.completedCount}
      </Text>
      <Text style={styles.taskVisibilityText}>
        Deadline over/missing: {taskVisibility.deadlineIssueCount}
      </Text>
    </View>
  );
}

function BlockedTaskItem({ task }) {
  return (
    <View style={styles.blockedTaskItem}>
      <View style={styles.blockedTaskTextBox}>
        <Text style={styles.blockedTaskTitle}>{task.title}</Text>
        <Text style={styles.blockedTaskReason}>
          {task.blocked_reason || "Not assignable"}
        </Text>
      </View>
    </View>
  );
}

function ProofCard({ proof, proofViewedAt, pointsAwardedValue, onOpen }) {
  return (
    <View style={styles.proofCard}>
      <View style={styles.proofInfo}>
        <Text style={styles.sectionTitle}>UPLOADED PROOF</Text>
        <Text style={styles.proofName}>{proof.file_name || "Proof file"}</Text>
        <Text style={styles.proofMeta}>
          {proof.mime_type || "File"}{" "}
          {proof.size_bytes ? `· ${formatBytes(proof.size_bytes)}` : ""}
        </Text>
        <Text style={styles.proofMeta}>
          Uploaded: {formatDateTime(proof.uploaded_at || proof.created_at)}
        </Text>

        {proofViewedAt ? (
          <Text style={styles.proofViewedText}>
            VIEWED: {formatDateTime(proofViewedAt)}
          </Text>
        ) : (
          <Text style={styles.proofNotViewedText}>NOT VIEWED YET</Text>
        )}

        {Number(pointsAwardedValue || 0) > 0 && (
          <Text style={styles.pointsAwardedText}>
            POINTS AWARDED: +{pointsAwardedValue}
          </Text>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.viewProofButton}
        onPress={onOpen}
        accessibilityRole="button"
      >
        <Text style={styles.viewProofButtonText}>VIEW PROOF</Text>
      </TouchableOpacity>
    </View>
  );
}

function TaskOption({ task, saving, onAssign }) {
  return (
    <View style={styles.taskOption}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskMeta}>
          Deadline: {formatDateTime(task.deadline_at)}
        </Text>
        <Text style={styles.taskMeta}>
          Estimated: {task.estimated_minutes || 0} minutes
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.assignButton}
        onPress={onAssign}
      >
        <Text style={styles.assignButtonText}>{saving ? "..." : "ASSIGN"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function getProofFromAssignment(assignment) {
  const proofs = assignment?.matrix_task_proofs;
  if (Array.isArray(proofs)) return proofs[0] || null;
  return proofs || null;
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitial(value) {
  if (!value) return "U";
  return String(value).trim().charAt(0).toUpperCase();
}

function normalizeText(value) {
  if (!value) return "";
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
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.black,
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: 2,
  },
  title: {
    marginTop: 6,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: COLORS.black,
  },
  subtitle: {
    marginTop: 10,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.black,
    paddingLeft: 12,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    color: COLORS.black,
  },
  emptyCard: {
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 18,
    shadowColor: COLORS.black,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    color: COLORS.black,
  },
  assignmentCard: {
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 28,
    shadowColor: COLORS.black,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
  },
  assignmentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.lilac,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.black,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.black,
  },
  userMeta: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  statusBadge: {
    borderWidth: 2,
    borderColor: COLORS.black,
    backgroundColor: COLORS.lemon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 100,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.black,
  },
  taskPickerBox: {
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.sky,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 10,
  },
  currentAchievementName: {
    borderWidth: 2,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 12,
  },
  emptySmallText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    color: COLORS.black,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    color: COLORS.red,
  },
  taskOption: {
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.black,
  },
  taskMeta: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  assignButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  assignButtonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
  assignedTaskBox: {
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.mint,
    padding: 12,
  },
  taskVisibilityBox: {
    borderWidth: 2,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 10,
    marginBottom: 12,
  },
  taskVisibilityText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  blockedListBox: {
    borderTopWidth: 2,
    borderTopColor: COLORS.black,
    marginTop: 12,
    paddingTop: 12,
  },
  blockedTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 8,
  },
  blockedTaskItem: {
    borderWidth: 2,
    borderColor: COLORS.black,
    backgroundColor: COLORS.gray,
    padding: 8,
    marginBottom: 8,
  },
  blockedTaskTextBox: {
    flex: 1,
  },
  blockedTaskTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    color: COLORS.black,
  },
  blockedTaskReason: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  proofCard: {
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.lemon,
    padding: 12,
    marginTop: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  proofInfo: {
    marginBottom: 12,
  },
  proofName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    color: COLORS.black,
  },
  proofMeta: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  proofViewedText: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    color: COLORS.green,
  },
  proofNotViewedText: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    color: COLORS.red,
  },
  pointsAwardedText: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    color: COLORS.black,
  },
  viewProofButton: {
    backgroundColor: COLORS.black,
    borderWidth: 3,
    borderColor: COLORS.black,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  viewProofButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.black,
  },
  approveButton: {
    backgroundColor: COLORS.green,
  },
  rejectButton: {
    backgroundColor: COLORS.red,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },
});