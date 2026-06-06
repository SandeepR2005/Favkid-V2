import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, FONTS, RADIUS } from "../theme";
import Icon from "../components/Icon";
import { Btn, Card, Chip, Eyebrow, Field, Input, Mono, PageSub, PageTitle, TopBar } from "../components/ui";

const categories = ["Study", "Fitness", "Career", "Personal", "Skill"];
const priorities = ["Low", "Medium", "High"];
const proofTypes = [
  ["Text", "text"],
  ["Image", "image"],
  ["File", "file"],
  ["Link", "link"],
];

export default function CreateAchievementScreen({ onLogout, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Study");
  const [saving, setSaving] = useState(false);
  const [priority, setPriority] = useState("Medium");
  const [overallDeadline, setOverallDeadline] = useState(new Date());
  const [reminderAt, setReminderAt] = useState(new Date());
  const [proofType, setProofType] = useState("Image");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [notes, setNotes] = useState("");

  const [subtasks, setSubtasks] = useState([
    {
      id: Date.now().toString(),
      title: "",
      deadline: new Date(),
      estimatedMinutes: "",
      status: "pending",
    },
  ]);

  const [pickerConfig, setPickerConfig] = useState(null);

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const updateSubtask = (id, field, value) => {
    setSubtasks((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addSubtask = () => {
    setSubtasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: "",
        deadline: new Date(),
        estimatedMinutes: "",
        status: "pending",
      },
    ]);
  };

  const removeSubtask = (id) => {
    if (subtasks.length === 1) {
      Alert.alert("Required", "At least one subtask is required.");
      return;
    }
    setSubtasks((prev) => prev.filter((item) => item.id !== id));
  };

  const openPicker = ({ target, subtaskId = null, mode }) => {
    let value = new Date();
    if (target === "overallDeadline") value = overallDeadline;
    if (target === "reminderAt") value = reminderAt;
    if (target === "subtaskDeadline") {
      const selectedSubtask = subtasks.find((item) => item.id === subtaskId);
      value = selectedSubtask?.deadline || new Date();
    }
    setPickerConfig({ target, subtaskId, mode, value });
  };

  const handlePickerChange = (event, selectedDate) => {
    if (event?.type === "dismissed") {
      setPickerConfig(null);
      return;
    }
    if (!selectedDate || !pickerConfig) return;

    if (pickerConfig.target === "overallDeadline") setOverallDeadline(selectedDate);
    if (pickerConfig.target === "reminderAt") setReminderAt(selectedDate);
    if (pickerConfig.target === "subtaskDeadline") {
      updateSubtask(pickerConfig.subtaskId, "deadline", selectedDate);
    }

    setPickerConfig(null);
  };

  const buildMetadata = () => {
    const timezone = Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || "Asia/Kolkata";

    return {
      achievement: {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: "active",
        progress: 0,
        overall_deadline_at: overallDeadline.toISOString(),
        reminder_at: reminderAt.toISOString(),
        proof_type_required: proofType.toLowerCase(),
        success_criteria: successCriteria.trim(),
        notes: notes.trim(),
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        timezone,
        source: "mobile_app",
        app_section: "create_achievement",
        total_subtasks: subtasks.length,
        completed_subtasks: 0,
        coach_verification_required: true,
      },
      subtasks: subtasks.map((item, index) => ({
        order_number: index + 1,
        title: item.title.trim(),
        deadline_at: item.deadline.toISOString(),
        estimated_minutes: Number(item.estimatedMinutes || 0),
        status: item.status,
      })),
    };
  };

  const handleCreateAchievement = async () => {
    if (saving) return;

    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter the achievement title.");
      return;
    }

    if (!successCriteria.trim()) {
      Alert.alert(
        "Missing success criteria",
        "Please explain how this achievement will be verified."
      );
      return;
    }

    const invalidSubtask = subtasks.find((item) => !item.title.trim());
    if (invalidSubtask) {
      Alert.alert("Missing subtask", "Please enter all subtask titles.");
      return;
    }

    const lateSubtask = subtasks.find(
      (item) => item.deadline.getTime() > overallDeadline.getTime()
    );
    if (lateSubtask) {
      Alert.alert(
        "Invalid deadline",
        "Subtask deadline cannot be after the overall achievement deadline."
      );
      return;
    }

    setSaving(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setSaving(false);
      Alert.alert("Login required", "Please login again.");
      return;
    }

    const user = userData.user;
    const metadata = buildMetadata();

    const achievementPayload = {
      owner_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      priority: priority.toLowerCase(),
      status: "active",
      progress: 0,
      overall_deadline_at: overallDeadline.toISOString(),
      reminder_at: reminderAt.toISOString(),
      proof_type_required: proofType.toLowerCase(),
      success_criteria: successCriteria.trim(),
      notes: notes.trim(),
      metadata: metadata.metadata,
      updated_at: new Date().toISOString(),
    };

    const { data: achievementData, error: achievementError } = await supabase
      .from("achievements")
      .insert(achievementPayload)
      .select("id")
      .single();

    if (achievementError) {
      setSaving(false);
      Alert.alert("Achievement save failed", achievementError.message);
      return;
    }

    const taskRows = metadata.subtasks.map((task) => ({
      achievement_id: achievementData.id,
      owner_id: user.id,
      order_number: task.order_number,
      title: task.title,
      status: "pending",
      deadline_at: task.deadline_at,
      estimated_minutes: task.estimated_minutes,
      metadata: {
        created_from: "create_achievement_screen",
        source: "mobile_app",
        created_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    }));

    const { error: taskError } = await supabase.from("achievement_tasks").insert(taskRows);

    if (taskError) {
      await supabase.from("achievements").delete().eq("id", achievementData.id);
      setSaving(false);
      Alert.alert("Subtask save failed", taskError.message);
      return;
    }

    setSaving(false);

    setTitle("");
    setDescription("");
    setCategory("Study");
    setPriority("Medium");
    setOverallDeadline(new Date());
    setReminderAt(new Date());
    setProofType("Image");
    setSuccessCriteria("");
    setNotes("");
    setSubtasks([
      {
        id: Date.now().toString(),
        title: "",
        deadline: new Date(),
        estimatedMinutes: "",
        status: "pending",
      },
    ]);

    Alert.alert("Achievement created", "Your achievement and subtasks were saved successfully.");
    onCreated?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar onLogout={onLogout} />

        <Eyebrow>Create new</Eyebrow>
        <PageTitle>Achievement</PageTitle>
        <PageSub>Plan your goal, set a final deadline, and break it into clear subtasks.</PageSub>

        {/* Details */}
        <Card style={styles.card}>
          <SectionHead icon="target" title="Achievement details" />
          <Field label="Achievement title">
            <Input placeholder="Example: Complete DSA revision" value={title} onChangeText={setTitle} />
          </Field>
          <Field label="Description">
            <Input
              placeholder="Describe what you want to achieve"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </Field>
          <Field label="Category">
            <View style={styles.chipRow}>
              {categories.map((item) => (
                <Chip key={item} label={item} on={category === item} onPress={() => setCategory(item)} />
              ))}
            </View>
          </Field>
          <Field label="Priority">
            <View style={styles.chipRow}>
              {priorities.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  on={priority === item}
                  onPress={() => setPriority(item)}
                  style={{ flex: 1, justifyContent: "center" }}
                />
              ))}
            </View>
          </Field>
        </Card>

        {/* Deadline */}
        <Card style={styles.card}>
          <SectionHead icon="cal" title="Overall deadline" />
          <Text style={styles.helper}>The final deadline for the complete achievement.</Text>
          <View style={styles.dateGrid}>
            <MiniField label="Deadline date" value={formatDate(overallDeadline)} icon="cal" onPress={() => openPicker({ target: "overallDeadline", mode: "date" })} />
            <MiniField label="Deadline time" value={formatTime(overallDeadline)} icon="clock" onPress={() => openPicker({ target: "overallDeadline", mode: "time" })} />
          </View>
          <View style={styles.dateGrid}>
            <MiniField label="Reminder date" value={formatDate(reminderAt)} icon="bell" onPress={() => openPicker({ target: "reminderAt", mode: "date" })} />
            <MiniField label="Reminder time" value={formatTime(reminderAt)} icon="clock" onPress={() => openPicker({ target: "reminderAt", mode: "time" })} />
          </View>
        </Card>

        {/* Verification */}
        <Card style={styles.card}>
          <SectionHead icon="check" title="Verification" />
          <Text style={styles.subLabel}>Proof type required</Text>
          <View style={styles.chipRow}>
            {proofTypes.map(([label, icon]) => (
              <Chip key={label} label={label} icon={icon} on={proofType === label} onPress={() => setProofType(label)} />
            ))}
          </View>
          <Field label="Success criteria">
            <Input
              placeholder="Example: Submit screenshot of solved problems"
              value={successCriteria}
              onChangeText={setSuccessCriteria}
              multiline
            />
          </Field>
          <Field label="Extra notes">
            <Input
              placeholder="Any additional instructions for verification"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </Field>
        </Card>

        {/* Subtasks */}
        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <SectionHead icon="grid" title="Subtasks" />
            <Chip label="Add" icon="plus" on onPress={addSubtask} />
          </View>
          <Text style={styles.helper}>Each subtask should have its own deadline.</Text>

          <View style={{ gap: 12 }}>
            {subtasks.map((item, index) => (
              <View key={item.id} style={styles.subtaskCard}>
                <View style={styles.rowBetween}>
                  <Mono style={styles.subtaskLabel}>SUBTASK {index + 1}</Mono>
                  {subtasks.length > 1 && (
                    <TouchableOpacity onPress={() => removeSubtask(item.id)} style={styles.removeBtn}>
                      <Icon name="trash" size={14} color={COLORS.danger} />
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Input
                  placeholder="Example: Complete arrays problems"
                  value={item.title}
                  onChangeText={(value) => updateSubtask(item.id, "title", value)}
                  style={{ marginTop: 10 }}
                />
                <View style={[styles.dateGrid, { marginTop: 10 }]}>
                  <MiniField label="Date" value={formatDate(item.deadline)} icon="cal" onPress={() => openPicker({ target: "subtaskDeadline", subtaskId: item.id, mode: "date" })} />
                  <MiniField label="Time" value={formatTime(item.deadline)} icon="clock" onPress={() => openPicker({ target: "subtaskDeadline", subtaskId: item.id, mode: "time" })} />
                </View>
                <Input
                  placeholder="Estimated minutes — e.g. 60"
                  value={item.estimatedMinutes}
                  onChangeText={(value) => updateSubtask(item.id, "estimatedMinutes", value)}
                  keyboardType="numeric"
                  style={{ marginTop: 10 }}
                />
              </View>
            ))}
          </View>
        </Card>

        <Btn
          title={saving ? "Saving…" : "Create achievement"}
          icon="spark"
          onPress={handleCreateAchievement}
          loading={saving}
          style={{ marginTop: 4 }}
        />
      </ScrollView>

      {pickerConfig && (
        <DateTimePicker
          value={pickerConfig.value}
          mode={pickerConfig.mode}
          display="default"
          is24Hour
          onChange={handlePickerChange}
        />
      )}
    </SafeAreaView>
  );
}

function SectionHead({ icon, title }) {
  return (
    <View style={styles.sectionHead}>
      <Icon name={icon} size={18} stroke={2} color={COLORS.text} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function MiniField({ label, value, icon, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.miniField} onPress={onPress}>
      <Mono style={styles.miniLabel}>{String(label).toUpperCase()}</Mono>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 5 }}>
        {icon ? <Icon name={icon} size={14} stroke={2} color={COLORS.textDim} /> : null}
        <Text style={styles.miniValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  card: { marginTop: 14 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 4 },
  sectionTitle: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 15.5, color: COLORS.text },
  helper: { color: COLORS.textMute, fontSize: 12.5, marginTop: 6, marginBottom: 14 },
  subLabel: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginTop: 4, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dateGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  miniField: {
    flex: 1,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  miniLabel: { fontSize: 10, letterSpacing: 0.8, color: COLORS.textMute },
  miniValue: { fontWeight: "700", fontSize: 14, color: COLORS.text },
  subtaskCard: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 15,
  },
  subtaskLabel: { fontSize: 11, letterSpacing: 0.8, color: COLORS.accent, fontWeight: "700" },
  removeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  removeText: { color: COLORS.danger, fontWeight: "700", fontSize: 12.5 },
});
