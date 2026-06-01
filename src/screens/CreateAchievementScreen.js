import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const categories = ["Study", "Fitness", "Career", "Personal", "Skill"];
const priorities = ["Low", "Medium", "High"];
const proofTypes = ["Text", "Image", "File", "Link"];

export default function CreateAchievementScreen() {
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

    const formatDate = (date) => {
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const updateSubtask = (id, field, value) => {
        setSubtasks((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
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

        setPickerConfig({
            target,
            subtaskId,
            mode,
            value,
        });
    };

    const handlePickerChange = (event, selectedDate) => {
        if (event?.type === "dismissed") {
            setPickerConfig(null);
            return;
        }

        if (!selectedDate || !pickerConfig) return;

        if (pickerConfig.target === "overallDeadline") {
            setOverallDeadline(selectedDate);
        }

        if (pickerConfig.target === "reminderAt") {
            setReminderAt(selectedDate);
        }

        if (pickerConfig.target === "subtaskDeadline") {
            updateSubtask(pickerConfig.subtaskId, "deadline", selectedDate);
        }

        if (Platform.OS === "android") {
            setPickerConfig(null);
        } else {
            setPickerConfig(null);
        }
    };

    const buildMetadata = () => {
        const timezone =
            Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || "Asia/Kolkata";

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

        const { error: taskError } = await supabase
            .from("achievement_tasks")
            .insert(taskRows);

        if (taskError) {
            await supabase.from("achievements").delete().eq("id", achievementData.id);

            setSaving(false);
            Alert.alert("Subtask save failed", taskError.message);
            return;
        }

        setSaving(false);

        Alert.alert(
            "Achievement created",
            "Your achievement and subtasks were saved successfully."
        );

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
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.smallTitle}>Create new</Text>
                <Text style={styles.title}>Achievement</Text>
                <Text style={styles.subtitle}>
                    Plan your goal, set a final deadline, and break it into clear subtasks.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Achievement details</Text>

                    <Text style={styles.label}>Achievement title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Example: Complete DSA revision"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe what you want to achieve"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.chipRow}>
                        {categories.map((item) => (
                            <ChoiceChip
                                key={item}
                                label={item}
                                active={category === item}
                                onPress={() => setCategory(item)}
                            />
                        ))}
                    </View>

                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.chipRow}>
                        {priorities.map((item) => (
                            <ChoiceChip
                                key={item}
                                label={item}
                                active={priority === item}
                                onPress={() => setPriority(item)}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Overall deadline</Text>
                    <Text style={styles.helperText}>
                        This is the final deadline for the complete achievement.
                    </Text>

                    <View style={styles.dateGrid}>
                        <DateButton
                            label="Deadline date"
                            value={formatDate(overallDeadline)}
                            onPress={() =>
                                openPicker({ target: "overallDeadline", mode: "date" })
                            }
                        />

                        <DateButton
                            label="Deadline time"
                            value={formatTime(overallDeadline)}
                            onPress={() =>
                                openPicker({ target: "overallDeadline", mode: "time" })
                            }
                        />
                    </View>

                    <View style={styles.dateGrid}>
                        <DateButton
                            label="Reminder date"
                            value={formatDate(reminderAt)}
                            onPress={() => openPicker({ target: "reminderAt", mode: "date" })}
                        />

                        <DateButton
                            label="Reminder time"
                            value={formatTime(reminderAt)}
                            onPress={() => openPicker({ target: "reminderAt", mode: "time" })}
                        />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Verification metadata</Text>

                    <Text style={styles.label}>Proof type required</Text>
                    <View style={styles.chipRow}>
                        {proofTypes.map((item) => (
                            <ChoiceChip
                                key={item}
                                label={item}
                                active={proofType === item}
                                onPress={() => setProofType(item)}
                            />
                        ))}
                    </View>

                    <Text style={styles.label}>Success criteria</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Example: Submit screenshot of solved problems"
                        value={successCriteria}
                        onChangeText={setSuccessCriteria}
                        multiline
                    />

                    <Text style={styles.label}>Extra notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Any additional instructions for coach verification"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Subtasks</Text>
                            <Text style={styles.helperText}>
                                Each subtask should have its own deadline.
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.addButton} onPress={addSubtask}>
                            <Text style={styles.addButtonText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    {subtasks.map((item, index) => (
                        <View key={item.id} style={styles.subtaskCard}>
                            <View style={styles.subtaskHeader}>
                                <Text style={styles.subtaskTitle}>Subtask {index + 1}</Text>

                                <TouchableOpacity onPress={() => removeSubtask(item.id)}>
                                    <Text style={styles.removeText}>Remove</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Subtask title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Example: Complete arrays problems"
                                value={item.title}
                                onChangeText={(value) => updateSubtask(item.id, "title", value)}
                            />

                            <View style={styles.dateGrid}>
                                <DateButton
                                    label="Subtask date"
                                    value={formatDate(item.deadline)}
                                    onPress={() =>
                                        openPicker({
                                            target: "subtaskDeadline",
                                            subtaskId: item.id,
                                            mode: "date",
                                        })
                                    }
                                />

                                <DateButton
                                    label="Subtask time"
                                    value={formatTime(item.deadline)}
                                    onPress={() =>
                                        openPicker({
                                            target: "subtaskDeadline",
                                            subtaskId: item.id,
                                            mode: "time",
                                        })
                                    }
                                />
                            </View>

                            <Text style={styles.label}>Estimated time in minutes</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Example: 60"
                                value={item.estimatedMinutes}
                                onChangeText={(value) =>
                                    updateSubtask(item.id, "estimatedMinutes", value)
                                }
                                keyboardType="numeric"
                            />
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateAchievement}
                >
                    <Text style={styles.createButtonText}>
                        {saving ? "Saving..." : "Create Achievement"}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    This screen currently creates the UI and metadata. In the next step, we
                    will save it into Supabase.
                </Text>
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

function ChoiceChip({ label, active, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.chip, active && styles.chipActive]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function DateButton({ label, value, onPress }) {
    return (
        <TouchableOpacity style={styles.dateButton} onPress={onPress}>
            <Text style={styles.dateLabel}>{label}</Text>
            <Text style={styles.dateValue}>{value}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F8FA",
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    smallTitle: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "700",
    },
    title: {
        fontSize: 30,
        fontWeight: "900",
        color: "#0F172A",
        marginTop: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 6,
        marginBottom: 20,
        lineHeight: 21,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        color: "#64748B",
        lineHeight: 18,
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: "#334155",
        fontWeight: "800",
        marginBottom: 7,
        marginTop: 8,
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 13,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 14,
        color: "#0F172A",
        marginBottom: 8,
    },
    textArea: {
        minHeight: 88,
        textAlignVertical: "top",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F8FAFC",
    },
    chipActive: {
        backgroundColor: "#EEF0FF",
        borderColor: "#4F46E5",
    },
    chipText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#64748B",
    },
    chipTextActive: {
        color: "#4F46E5",
    },
    dateGrid: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    dateButton: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        padding: 13,
    },
    dateLabel: {
        fontSize: 11,
        color: "#64748B",
        fontWeight: "800",
        marginBottom: 5,
    },
    dateValue: {
        fontSize: 14,
        color: "#0F172A",
        fontWeight: "900",
    },
    addButton: {
        backgroundColor: "#EEF0FF",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addButtonText: {
        color: "#4F46E5",
        fontSize: 12,
        fontWeight: "900",
    },
    subtaskCard: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 12,
    },
    subtaskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    subtaskTitle: {
        fontSize: 14,
        fontWeight: "900",
        color: "#0F172A",
    },
    removeText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#EF4444",
    },
    createButton: {
        backgroundColor: "#4F46E5",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 4,
    },
    createButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
    },
    footerText: {
        fontSize: 12,
        color: "#64748B",
        textAlign: "center",
        marginTop: 14,
        lineHeight: 18,
    },
});