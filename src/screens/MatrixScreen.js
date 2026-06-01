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
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { supabase } from "../lib/supabase";

const COLORS = {
  black: "#000000",
  white: "#FFFFFF",
  mint: "#A7F3D0",
  lemon: "#FEF08A",
  lilac: "#E9D5FF",
  sky: "#BAE6FD",
  red: "#EF4444",
  gray: "#F3F4F6",
  darkGray: "#6B7280",
  green: "#16A34A",
};

const MATRIX_CELLS = Array.from({ length: 9 }, (_, index) => ({
  number: index + 1,
}));

const ACTIVE_LOCK_STATUSES = [
  "pending_assignment",
  "assigned",
  "submitted",
  "rejected",
];

const PROOF_BUCKET = "task-proofs";
const MAX_PROOF_SIZE_BYTES = 10 * 1024 * 1024;

export default function MatrixScreen() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [favoritePeople, setFavoritePeople] = useState([]);
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

  const selectedIdsThisCycle = useMemo(() => {
    return new Set(
      rolls
        .filter((item) => item.cycle_number === currentCycle)
        .map((item) => item.selected_favorite_person_id)
    );
  }, [rolls, currentCycle]);

  const availableFavoritePeople = useMemo(() => {
    return favoritePeople.filter((person) => !selectedIdsThisCycle.has(person.id));
  }, [favoritePeople, selectedIdsThisCycle]);

  const currentCycleRolls = useMemo(() => {
    return rolls.filter((item) => item.cycle_number === currentCycle);
  }, [rolls, currentCycle]);

  const activeLock = useMemo(() => {
    return findBlockingAssignment(assignments);
  }, [assignments]);

  const isCycleComplete =
    favoritePeople.length > 0 && availableFavoritePeople.length === 0;

  const cycleProgress =
    favoritePeople.length === 0
      ? 0
      : Math.round(
        ((favoritePeople.length - availableFavoritePeople.length) /
          favoritePeople.length) *
        100
      );

  const loadMatrixData = async () => {
    const firstLoad = loading;

    if (!firstLoad) {
      setRefreshing(true);
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Login required", "Please login again.");
      return;
    }

    const user = userData.user;
    setCurrentUserId(user.id);

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
        "id, user_id, selected_favorite_person_id, grid_cell, cycle_number, available_count_before_roll, selected_from_count, metadata, created_at"
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
        matrix_rolls(grid_cell, cycle_number, created_at),
        achievement_tasks(id, title, deadline_at, estimated_minutes, status, achievement_id),
        matrix_task_proofs(id, storage_bucket, file_path, file_name, mime_type, size_bytes, created_at),
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
    setAssignments(releasedAssignments);

    setLoading(false);
    setRefreshing(false);
  };

  const releaseExpiredAssignments = async (rows) => {
    const now = Date.now();
    const expiredRows = rows.filter((assignment) => {
      if (!ACTIVE_LOCK_STATUSES.includes(assignment.status)) return false;
      const deadline = assignment.achievement_tasks?.deadline_at;
      if (!deadline) return false;
      return new Date(deadline).getTime() <= now;
    });

    if (expiredRows.length === 0) return rows;

    const expiredIds = expiredRows.map((item) => item.id);

    const { error } = await supabase
      .from("matrix_task_assignments")
      .update({
        status: "expired",
        expired_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
          expired_at: new Date().toISOString(),
        }
        : item
    );
  };

  const rollMatrix = async (cellNumber) => {
    if (rolling) return;

    if (!currentUserId) {
      Alert.alert("Login required", "Please login again.");
      return;
    }

    if (activeLock) {
      Alert.alert(
        "Matrix locked",
        getLockMessage(activeLock)
      );
      return;
    }

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
        "All favorite people were already selected in this iteration. Start the next iteration."
      );
      return;
    }

    setRolling(true);
    setSelectedCell(cellNumber);

    const randomIndex = Math.floor(Math.random() * availableFavoritePeople.length);
    const selectedPerson = availableFavoritePeople[randomIndex];

    const { error: stateError } = await supabase.from("matrix_state").upsert({
      user_id: currentUserId,
      active_cycle_number: currentCycle,
      updated_at: new Date().toISOString(),
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
        available_count_before_roll: availableFavoritePeople.length,
        selected_from_count: favoritePeople.length,
        metadata: {
          method: "random_from_available_favorite_people",
          selected_section: cellNumber,
          screen: "MatrixScreen",
          next_selection_rule:
            "locked_until_subtask_deadline_or_approved_completion",
          created_at: new Date().toISOString(),
        },
      })
      .select("id")
      .single();

    if (rollError) {
      setRolling(false);
      Alert.alert("Matrix roll failed", rollError.message);
      await loadMatrixData();
      return;
    }

    const { error: assignmentError } = await supabase
      .from("matrix_task_assignments")
      .insert({
        matrix_roll_id: rollData.id,
        user_id: currentUserId,
        favorite_person_id: selectedPerson.id,
        status: "pending_assignment",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
      `${selectedPerson.full_name || selectedPerson.username} was selected. Matrix is now locked until they assign a subtask and the unlock condition is completed.`
    );

    await loadMatrixData();
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
        Alert.alert(
          "File too large",
          "Please upload a proof file smaller than 10 MB."
        );
        return;
      }

      const safeFileName = sanitizeFileName(
        pickedAsset.name || `proof-${Date.now()}`
      );
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

      const { error: proofError } = await supabase
        .from("matrix_task_proofs")
        .upsert(
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
            uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
          updated_at: new Date().toISOString(),
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

    if (favoritePeople.length === 0) {
      Alert.alert(
        "No favorite people",
        "Connect with favorite people before starting an iteration."
      );
      return;
    }

    const nextCycle = currentCycle + 1;

    const { error } = await supabase.from("matrix_state").upsert({
      user_id: currentUserId,
      active_cycle_number: nextCycle,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      Alert.alert("Could not start next iteration", error.message);
      return;
    }

    setCurrentCycle(nextCycle);
    setSelectedCell(null);
    setLastSelected(null);
    await loadMatrixData();

    Alert.alert("New iteration started", `Iteration ${nextCycle} is now active.`);
  };

  const getSelectedProfile = (personId) => {
    return favoritePeople.find((person) => person.id === personId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>LOADING MATRIX...</Text>
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
            onRefresh={loadMatrixData}
            tintColor={COLORS.black}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>LOCKED SELECTION</Text>
          <Text style={styles.title}>THE MATRIX</Text>
          <Text style={styles.subtitle}>
            Pick a closed section. One favorite person is selected randomly. The
            next selection stays locked until the assigned subtask deadline is
            over or the submitted task is approved.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{currentCycle}</Text>
            <Text style={styles.summaryLabel}>ITERATION</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{favoritePeople.length}</Text>
            <Text style={styles.summaryLabel}>CONNECTED</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {activeLock ? "LOCK" : availableFavoritePeople.length}
            </Text>
            <Text style={styles.summaryLabel}>
              {activeLock ? "ACTIVE" : "REMAINING"}
            </Text>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressLabel}>CYCLE PROGRESS</Text>
            <Text style={styles.progressLabel}>{cycleProgress}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${cycleProgress}%` }]} />
          </View>
        </View>

        {favoritePeople.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>NO FAVORITE PEOPLE CONNECTED</Text>
            <Text style={styles.emptyText}>
              Go to the Connect tab, connect with favorite people, and accept the
              request before using the Matrix.
            </Text>
          </View>
        ) : (
          <>
            {activeLock && (
              <ActiveLockCard
                assignment={activeLock}
                onSubmit={() => submitAssignedTask(activeLock)}
                submitting={submitting}
              />
            )}

            {lastSelected && !activeLock && (
              <View style={styles.selectedCard}>
                <Text style={styles.selectedLabel}>LAST SELECTED</Text>
                <Text style={styles.selectedName}>
                  {lastSelected.full_name || lastSelected.username}
                </Text>
                <Text style={styles.selectedMeta}>Section {selectedCell}</Text>
              </View>
            )}

            {isCycleComplete && !activeLock && (
              <View style={styles.completeCard}>
                <Text style={styles.completeTitle}>ITERATION COMPLETED</Text>
                <Text style={styles.completeText}>
                  Every favorite person has been selected once in this iteration.
                  Start the next iteration to include everyone again.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.nextButton}
                  onPress={startNextIteration}
                >
                  <Text style={styles.nextButtonText}>START NEXT ITERATION</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.matrixShadow}>
              <View style={styles.matrixCard}>
                <View style={styles.matrixHeaderRow}>
                  <Text style={styles.matrixTitle}>CLOSED GRID MATRIX</Text>
                  <Text style={styles.matrixHint}>
                    {activeLock
                      ? "LOCKED"
                      : rolling
                        ? "ROLLING..."
                        : "TAP A SECTION"}
                  </Text>
                </View>

                <View style={styles.grid}>
                  {MATRIX_CELLS.map((cell) => {
                    const isSelected = selectedCell === cell.number;
                    const disabled = rolling || isCycleComplete || !!activeLock;

                    return (
                      <TouchableOpacity
                        key={cell.number}
                        activeOpacity={0.75}
                        disabled={disabled}
                        style={[
                          styles.gridCell,
                          isSelected && styles.gridCellSelected,
                          disabled && styles.gridCellDisabled,
                        ]}
                        onPress={() => rollMatrix(cell.number)}
                      >
                        <Text style={styles.gridCellNumber}>{cell.number}</Text>
                        <Text style={styles.gridCellText}>
                          {disabled ? "LOCKED" : "CLOSED"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>FAVORITE PEOPLE IN ITERATION</Text>

              {favoritePeople.map((person) => {
                const alreadySelected = selectedIdsThisCycle.has(person.id);

                return (
                  <View
                    key={person.id}
                    style={[
                      styles.personRow,
                      alreadySelected && styles.personRowDisabled,
                    ]}
                  >
                    <View style={styles.personAvatar}>
                      <Text style={styles.personAvatarText}>
                        {getInitial(person.full_name || person.username)}
                      </Text>
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>
                        {person.full_name || "Favorite Person"}
                      </Text>
                      <Text style={styles.personEmail}>{person.username}</Text>
                    </View>

                    <View
                      style={[
                        styles.personStatus,
                        alreadySelected
                          ? styles.statusExcluded
                          : styles.statusAvailable,
                      ]}
                    >
                      <Text style={styles.personStatusText}>
                        {alreadySelected ? "USED" : "READY"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>CURRENT ITERATION HISTORY</Text>

              {currentCycleRolls.length === 0 ? (
                <Text style={styles.emptySmallText}>
                  No selections in this iteration yet.
                </Text>
              ) : (
                currentCycleRolls.map((roll, index) => {
                  const person = getSelectedProfile(
                    roll.selected_favorite_person_id
                  );

                  return (
                    <View key={roll.id} style={styles.historyRow}>
                      <View style={styles.historyNumber}>
                        <Text style={styles.historyNumberText}>
                          {currentCycleRolls.length - index}
                        </Text>
                      </View>

                      <View style={styles.historyInfo}>
                        <Text style={styles.historyName}>
                          {person?.full_name || "Favorite Person"}
                        </Text>
                        <Text style={styles.historyMeta}>
                          Section {roll.grid_cell} ·{" "}
                          {formatDateTime(roll.created_at)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActiveLockCard({ assignment, onSubmit, submitting }) {
  const favoritePerson = assignment.profiles;
  const task = assignment.achievement_tasks;
  const proof = getProofFromAssignment(assignment);
  const status = normalizeText(assignment.status);
  const hasTask = !!task;
  const isAssigned = ["assigned", "rejected"].includes(assignment.status);
  const isSubmitted = assignment.status === "submitted";

  return (
    <View style={styles.lockCard}>
      <Text style={styles.lockLabel}>MATRIX LOCKED</Text>
      <Text style={styles.lockTitle}>
        {favoritePerson?.full_name || favoritePerson?.username || "Favorite person"}
      </Text>
      <Text style={styles.lockText}>{getLockMessage(assignment)}</Text>

      <View style={styles.lockTaskBox}>
        <Text style={styles.lockTaskLabel}>ASSIGNED SUBTASK</Text>
        <Text style={styles.lockTaskTitle}>
          {hasTask ? task.title : "Waiting for favorite person to assign a subtask"}
        </Text>
        {hasTask && (
          <Text style={styles.lockTaskMeta}>
            Deadline: {formatDateTime(task.deadline_at)}
          </Text>
        )}
        <Text style={styles.lockTaskStatus}>Status: {status}</Text>
      </View>

      {proof && (
        <View style={styles.proofBox}>
          <Text style={styles.proofLabel}>UPLOADED PROOF</Text>
          <Text style={styles.proofName}>{proof.file_name || "Proof file"}</Text>
          <Text style={styles.proofMeta}>
            {proof.mime_type || "File"} {proof.size_bytes ? `· ${formatBytes(proof.size_bytes)}` : ""}
          </Text>
        </View>
      )}

      {isAssigned && hasTask && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.submitButton}
          onPress={onSubmit}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "UPLOADING..." : "UPLOAD PROOF & SUBMIT"}
          </Text>
        </TouchableOpacity>
      )}

      {isSubmitted && (
        <Text style={styles.waitingText}>
          Proof uploaded. Waiting for approval. If approval does not happen, the Matrix unlocks
          when the subtask deadline is over.
        </Text>
      )}
    </View>
  );
}

function getProofFromAssignment(assignment) {
  const proofs = assignment?.matrix_task_proofs;
  if (Array.isArray(proofs)) return proofs[0] || null;
  return proofs || null;
}

function sanitizeFileName(name) {
  return String(name || "proof-file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 90);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function findBlockingAssignment(rows) {
  const now = Date.now();

  return (rows || []).find((assignment) => {
    if (!ACTIVE_LOCK_STATUSES.includes(assignment.status)) return false;

    if (assignment.status === "pending_assignment") return true;

    const deadline = assignment.achievement_tasks?.deadline_at;
    if (!deadline) return true;

    return new Date(deadline).getTime() > now;
  });
}

function getLockMessage(assignment) {
  if (!assignment) return "";

  const favoriteName =
    assignment.profiles?.full_name || assignment.profiles?.username || "favorite person";

  if (assignment.status === "pending_assignment") {
    return `${favoriteName} was selected. They must assign one of your existing subtasks before the Matrix can continue.`;
  }

  if (assignment.status === "assigned") {
    return `Complete the assigned subtask before its deadline, upload proof, and submit it for ${favoriteName}'s approval.`;
  }

  if (assignment.status === "submitted") {
    return `Your proof is submitted. The Matrix unlocks after approval or after the subtask deadline is over.`;
  }

  if (assignment.status === "rejected") {
    return `The proof was rejected. Upload better proof and submit again before the deadline, or wait until the deadline is over.`;
  }

  return "The Matrix is waiting for this assignment to be completed.";
}

async function readPickedFileAsArrayBuffer(uri) {
  try {
    const file = new File(uri);
    return await file.arrayBuffer();
  } catch (fileError) {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error(
        "The selected proof file could not be read. Please pick the file again from Gallery or Files."
      );
    }

    return await response.arrayBuffer();
  }
}

function getInitial(value) {
  if (!value) return "F";
  return String(value).trim().charAt(0).toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "NO DEADLINE";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "INVALID DATE";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(value) {
  if (!value) return "";
  return String(value).replace(/_/g, " ").toUpperCase();
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
    fontSize: 38,
    lineHeight: 42,
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
  summaryCard: {
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.lemon,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.black,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.black,
  },
  summaryDivider: {
    width: 3,
    height: 42,
    backgroundColor: COLORS.black,
  },
  progressBlock: {
    marginBottom: 24,
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.black,
  },
  progressTrack: {
    height: 24,
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.mint,
    borderRightWidth: 4,
    borderRightColor: COLORS.black,
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
  selectedCard: {
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.mint,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  selectedLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
  },
  selectedName: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.black,
  },
  selectedMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.black,
  },
  completeCard: {
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.lilac,
    padding: 16,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.black,
  },
  completeText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  nextButton: {
    marginTop: 14,
    backgroundColor: COLORS.black,
    paddingVertical: 13,
    alignItems: "center",
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },
  matrixShadow: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    marginBottom: 30,
  },
  matrixCard: {
    backgroundColor: COLORS.white,
    borderWidth: 4,
    borderColor: COLORS.black,
    padding: 16,
  },
  matrixHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  matrixTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.black,
  },
  matrixHint: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
    backgroundColor: COLORS.lemon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCell: {
    width: "31%",
    aspectRatio: 1,
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.sky,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  gridCellSelected: {
    backgroundColor: COLORS.mint,
  },
  gridCellDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.65,
  },
  gridCellNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.black,
  },
  gridCellText: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.black,
  },
  sectionCard: {
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 14,
  },
  personRow: {
    borderWidth: 3,
    borderColor: COLORS.black,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  personRowDisabled: {
    opacity: 0.55,
    backgroundColor: COLORS.gray,
  },
  personAvatar: {
    width: 38,
    height: 38,
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.lilac,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  personAvatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.black,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.black,
  },
  personEmail: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.darkGray,
  },
  personStatus: {
    borderWidth: 2,
    borderColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusAvailable: {
    backgroundColor: COLORS.mint,
  },
  statusExcluded: {
    backgroundColor: COLORS.lemon,
  },
  personStatusText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.black,
  },
  historyRow: {
    borderWidth: 3,
    borderColor: COLORS.black,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  historyNumber: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  historyNumberText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "900",
  },
  historyMeta: {
    marginTop: 2,
    color: COLORS.darkGray,
    fontSize: 10,
    fontWeight: "700",
  },
  emptySmallText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  lockCard: {
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.lemon,
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  lockLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
    letterSpacing: 1.5,
  },
  lockTitle: {
    marginTop: 4,
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.black,
  },
  lockText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  lockTaskBox: {
    marginTop: 14,
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    padding: 12,
  },
  lockTaskLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
  },
  lockTaskTitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.black,
  },
  lockTaskMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  lockTaskStatus: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.black,
  },
  proofBox: {
    marginTop: 12,
    borderWidth: 3,
    borderColor: COLORS.black,
    backgroundColor: COLORS.mint,
    padding: 12,
  },
  proofLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.black,
  },
  proofName: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.black,
  },
  proofMeta: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.darkGray,
  },
  submitButton: {
    marginTop: 14,
    backgroundColor: COLORS.black,
    paddingVertical: 13,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },
  waitingText: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
    color: COLORS.black,
  },
});
