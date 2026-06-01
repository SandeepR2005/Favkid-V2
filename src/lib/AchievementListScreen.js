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
    black: "#000000",
    white: "#FFFFFF",
    mint: "#A7F3D0",
    lemon: "#FEF08A",
    lilac: "#E9D5FF",
    sky: "#BAE6FD",
    red: "#EF4444",
    gray: "#F3F4F6",
    dot: "#D1D5DB",
};

const DOTS = Array.from({ length: 260 }, (_, index) => {
    const columns = 10;
    return {
        id: index,
        left: 12 + (index % columns) * 34,
        top: 12 + Math.floor(index / columns) * 34,
    };
});

export default function AchievementListScreen() {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [tasksByAchievement, setTasksByAchievement] = useState({});
    const [profilesById, setProfilesById] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        const isInitialLoad = loading;
        if (!isInitialLoad) setRefreshing(true);

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
            if (!groupedTasks[task.achievement_id]) {
                groupedTasks[task.achievement_id] = [];
            }
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

    const completedCount = useMemo(() => {
        return achievements.filter((item) => item.status === "completed").length;
    }, [achievements]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <DotPattern />
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                    <Text style={styles.loadingText}>LOADING ACHIEVEMENTS...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <DotPattern />

            <View style={styles.topBar}>
                <View style={styles.brandRow}>
                    <View style={styles.brandIcon}>
                        <Text style={styles.brandIconText}>★</Text>
                    </View>
                    <Text style={styles.brandText}>FAVKID</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.settingsButton}
                    onPress={() => Alert.alert("Settings", "Settings will be added later.")}
                >
                    <Text style={styles.settingsText}>⚙</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadAchievements}
                        tintColor={COLORS.black}
                    />
                }
            >
                <View style={styles.headerBlock}>
                    <Text style={styles.pageTitle}>ACHIEVEMENTS</Text>
                    <View style={styles.subtitleBorder}>
                        <Text style={styles.subtitle}>
                            Your achievements and achievements shared by connected users.
                        </Text>
                    </View>
                </View>

                <View style={styles.summaryRow}>
                    <View style={[styles.summaryBox, { backgroundColor: COLORS.mint }]}>
                        <Text style={styles.summaryNumber}>{achievements.length}</Text>
                        <Text style={styles.summaryLabel}>TOTAL</Text>
                    </View>

                    <View style={[styles.summaryBox, { backgroundColor: COLORS.lemon }]}>
                        <Text style={styles.summaryNumber}>{completedCount}</Text>
                        <Text style={styles.summaryLabel}>DONE</Text>
                    </View>
                </View>

                {achievements.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>NO ACHIEVEMENTS YET</Text>
                        <Text style={styles.emptyText}>
                            Create an achievement from the Add tab. Once saved, it will appear here.
                            Accepted favorite people can also view shared achievements.
                        </Text>
                    </View>
                ) : (
                    achievements.map((achievement, index) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            index={index}
                            owner={profilesById[achievement.owner_id]}
                            tasks={tasksByAchievement[achievement.id] || []}
                            isOwnAchievement={achievement.owner_id === currentUserId}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function AchievementCard({
    achievement,
    index,
    owner,
    tasks,
    isOwnAchievement,
}) {
    const theme = getTheme(achievement.category, index);
    const priority = normalizeText(achievement.priority || "medium");
    const status = normalizeText(achievement.status || "active");
    const progressValue = Number(achievement.progress || 0);
    const visualProgress = progressValue === 0 ? 4 : Math.min(progressValue, 100);
    const badgeLabel = isOwnAchievement ? "MINE" : "SHARED";
    const ownerName = isOwnAchievement
        ? "YOUR ACHIEVEMENT"
        : `${(owner?.full_name || "CONNECTED USER").toUpperCase()}`;
    const ownerNote = isOwnAchievement
        ? "VISIBLE TO ACCEPTED FAVORITE PEOPLE"
        : "SHARED THROUGH ACCEPTED CONNECTION";

    return (
        <View style={styles.achievementShadow}>
            <View style={styles.achievementCard}>
                <View style={styles.cardTopRow}>
                    <View style={styles.ownerRow}>
                        <View style={[styles.avatarBox, { backgroundColor: theme.icon }]}>
                            <Text style={styles.avatarText}>
                                {getInitial(owner?.full_name || achievement.title)}
                            </Text>
                        </View>

                        <View style={styles.ownerTextBox}>
                            <Text style={styles.ownerName}>{ownerName}</Text>
                            <Text style={styles.ownerNote}>{ownerNote}</Text>
                        </View>
                    </View>

                    <View style={styles.mineBadge}>
                        <Text style={styles.mineBadgeText}>{badgeLabel}</Text>
                    </View>
                </View>

                <View style={styles.titleBlock}>
                    <Text style={styles.achievementTitle} numberOfLines={2}>
                        {achievement.title || "UNTITLED"}
                    </Text>

                    {!!achievement.description && (
                        <View
                            style={[
                                styles.descriptionBox,
                                { backgroundColor: theme.description },
                            ]}
                        >
                            <Text style={styles.descriptionText}>
                                {achievement.description}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.metaRow}>
                    <View style={[styles.metaCard, { backgroundColor: theme.category }]}>
                        <Text style={styles.metaLabel}>CATEGORY</Text>
                        <Text style={styles.metaValue}>
                            {normalizeText(achievement.category || "general")}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.metaCard,
                            priority === "High" ? styles.priorityHighCard : styles.priorityNormalCard,
                        ]}
                    >
                        <Text
                            style={[
                                styles.metaLabel,
                                priority === "High" && styles.priorityHighLabel,
                            ]}
                        >
                            PRIORITY
                        </Text>
                        <Text
                            style={[
                                styles.metaValue,
                                priority === "High" && styles.priorityHighText,
                            ]}
                        >
                            {priority}
                        </Text>
                    </View>
                </View>

                <View style={styles.deadlineCard}>
                    <Text style={styles.metaLabel}>OVERALL DEADLINE</Text>
                    <Text style={styles.deadlineText}>
                        {formatDateTime(achievement.overall_deadline_at)}
                    </Text>
                </View>

                <View style={styles.progressBlock}>
                    <View style={styles.progressTopRow}>
                        <Text style={styles.progressLabel}>PROGRESS: {progressValue}%</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>{status}</Text>
                        </View>
                    </View>

                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${visualProgress}%`,
                                    backgroundColor: theme.progress,
                                },
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.subtaskHeader}>
                    <Text style={styles.subtaskHeaderIcon}>☷</Text>
                    <Text style={styles.subtaskHeaderText}>SUBTASKS ({tasks.length})</Text>
                </View>

                {tasks.length === 0 ? (
                    <View style={styles.noTaskBox}>
                        <Text style={styles.noTaskText}>NO SUBTASKS</Text>
                    </View>
                ) : (
                    tasks.map((task, taskIndex) => (
                        <SubtaskItem key={task.id} task={task} index={taskIndex} />
                    ))
                )}
            </View>
        </View>
    );
}

function SubtaskItem({ task, index }) {
    return (
        <View style={styles.subtaskShadow}>
            <View style={styles.subtaskCard}>
                <View style={styles.subtaskLeft}>
                    <View style={styles.subtaskNumber}>
                        <Text style={styles.subtaskNumberText}>{index + 1}</Text>
                    </View>

                    <View style={styles.subtaskTextBox}>
                        <Text style={styles.subtaskTitle} numberOfLines={2}>
                            {task.title || "UNTITLED TASK"}
                        </Text>
                        <Text style={styles.subtaskMeta}>
                            {task.estimated_minutes || 0} MIN ESTIMATED
                        </Text>
                        <Text style={styles.subtaskMeta}>
                            DEADLINE: {formatDateTime(task.deadline_at)}
                        </Text>
                    </View>
                </View>

                <View style={styles.subtaskStatus}>
                    <Text style={styles.subtaskStatusText}>
                        {normalizeText(task.status || "pending")}
                    </Text>
                </View>
            </View>
        </View>
    );
}

function DotPattern() {
    return (
        <View pointerEvents="none" style={styles.dotLayer}>
            {DOTS.map((dot) => (
                <View
                    key={dot.id}
                    style={[
                        styles.dot,
                        {
                            left: dot.left,
                            top: dot.top,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

function getTheme(category, index) {
    const normalized = String(category || "").toLowerCase();

    if (normalized.includes("career")) {
        return {
            icon: COLORS.sky,
            category: COLORS.mint,
            description: "#E0F7FF",
            progress: COLORS.mint,
        };
    }

    if (normalized.includes("personal")) {
        return {
            icon: COLORS.lilac,
            category: COLORS.lilac,
            description: "#F3E8FF",
            progress: COLORS.lilac,
        };
    }

    if (normalized.includes("fitness")) {
        return {
            icon: COLORS.mint,
            category: COLORS.mint,
            description: "#DCFCE7",
            progress: COLORS.mint,
        };
    }

    if (normalized.includes("study") || normalized.includes("skill")) {
        return {
            icon: COLORS.lemon,
            category: COLORS.sky,
            description: "#FEF9C3",
            progress: COLORS.sky,
        };
    }

    const fallbackThemes = [
        {
            icon: COLORS.sky,
            category: COLORS.mint,
            description: "#E0F7FF",
            progress: COLORS.mint,
        },
        {
            icon: COLORS.lilac,
            category: COLORS.lilac,
            description: "#F3E8FF",
            progress: COLORS.lilac,
        },
    ];

    return fallbackThemes[index % fallbackThemes.length];
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
        hour: "numeric",
        minute: "2-digit",
    });
}

function getInitial(value) {
    if (!value) return "F";
    return String(value).trim().charAt(0).toUpperCase();
}

function normalizeText(value) {
    if (!value) return "";
    const text = String(value).replace(/_/g, " ");
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    dotLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    dot: {
        position: "absolute",
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.dot,
    },
    topBar: {
        height: 66,
        backgroundColor: COLORS.white,
        borderBottomWidth: 4,
        borderBottomColor: COLORS.black,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 5,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    brandIcon: {
        width: 34,
        height: 34,
        borderWidth: 3,
        borderColor: COLORS.black,
        backgroundColor: COLORS.lilac,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    brandIconText: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: "900",
    },
    brandText: {
        color: COLORS.black,
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    settingsButton: {
        width: 34,
        height: 34,
        borderWidth: 3,
        borderColor: COLORS.black,
        backgroundColor: COLORS.lemon,
        alignItems: "center",
        justifyContent: "center",
    },
    settingsText: {
        fontSize: 16,
        fontWeight: "900",
        color: COLORS.black,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 26,
        paddingBottom: 120,
    },
    headerBlock: {
        marginBottom: 34,
    },
    pageTitle: {
        fontSize: 38,
        lineHeight: 42,
        fontWeight: "900",
        color: COLORS.black,
        letterSpacing: -1,
    },
    subtitleBorder: {
        marginTop: 12,
        borderLeftWidth: 8,
        borderLeftColor: COLORS.black,
        paddingLeft: 12,
    },
    subtitle: {
        color: COLORS.black,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: "800",
    },
    summaryRow: {
        flexDirection: "row",
        gap: 14,
        marginBottom: 26,
    },
    summaryBox: {
        flex: 1,
        borderWidth: 3,
        borderColor: COLORS.black,
        paddingVertical: 12,
        alignItems: "center",
        shadowColor: COLORS.black,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    summaryNumber: {
        fontSize: 26,
        lineHeight: 30,
        fontWeight: "900",
        color: COLORS.black,
    },
    summaryLabel: {
        marginTop: 2,
        fontSize: 10,
        fontWeight: "900",
        color: COLORS.black,
    },
    emptyCard: {
        backgroundColor: COLORS.white,
        borderWidth: 4,
        borderColor: COLORS.black,
        padding: 18,
        shadowColor: COLORS.black,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.black,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.black,
        lineHeight: 19,
    },
    achievementShadow: {
        marginBottom: 44,
        shadowColor: COLORS.black,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    achievementCard: {
        backgroundColor: COLORS.white,
        borderWidth: 4,
        borderColor: COLORS.black,
        padding: 18,
    },
    cardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    ownerRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 8,
    },
    avatarBox: {
        width: 44,
        height: 44,
        borderWidth: 4,
        borderColor: COLORS.black,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.black,
    },
    ownerTextBox: {
        flex: 1,
    },
    ownerName: {
        color: COLORS.black,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "900",
    },
    ownerNote: {
        color: COLORS.black,
        opacity: 0.6,
        fontSize: 9,
        lineHeight: 12,
        fontWeight: "900",
        marginTop: 2,
    },
    mineBadge: {
        backgroundColor: COLORS.black,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    mineBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: "900",
    },
    titleBlock: {
        marginBottom: 26,
    },
    achievementTitle: {
        fontSize: 28,
        lineHeight: 32,
        fontWeight: "900",
        color: COLORS.black,
        textTransform: "uppercase",
        marginBottom: 10,
    },
    descriptionBox: {
        borderWidth: 2,
        borderColor: COLORS.black,
        padding: 8,
    },
    descriptionText: {
        color: COLORS.black,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "800",
    },
    metaRow: {
        flexDirection: "row",
        gap: 14,
        marginBottom: 26,
    },
    metaCard: {
        flex: 1,
        borderWidth: 3,
        borderColor: COLORS.black,
        padding: 12,
        minHeight: 78,
        shadowColor: COLORS.black,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    priorityNormalCard: {
        backgroundColor: COLORS.white,
    },
    priorityHighCard: {
        backgroundColor: COLORS.black,
    },
    metaLabel: {
        fontSize: 10,
        lineHeight: 13,
        fontWeight: "900",
        color: COLORS.black,
        marginBottom: 5,
    },
    metaValue: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: "900",
        color: COLORS.black,
    },
    priorityHighLabel: {
        color: COLORS.white,
    },
    priorityHighText: {
        color: COLORS.red,
    },
    deadlineCard: {
        backgroundColor: COLORS.lemon,
        borderWidth: 3,
        borderColor: COLORS.black,
        padding: 14,
        marginBottom: 26,
        shadowColor: COLORS.black,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    deadlineText: {
        color: COLORS.black,
        fontSize: 15,
        fontWeight: "900",
    },
    progressBlock: {
        marginBottom: 28,
    },
    progressTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 10,
    },
    progressLabel: {
        color: COLORS.black,
        fontSize: 11,
        fontWeight: "900",
    },
    statusBadge: {
        backgroundColor: COLORS.black,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    progressTrack: {
        width: "100%",
        height: 28,
        backgroundColor: COLORS.white,
        borderWidth: 4,
        borderColor: COLORS.black,
        padding: 3,
    },
    progressFill: {
        height: "100%",
        borderRightWidth: 4,
        borderRightColor: COLORS.black,
    },
    subtaskHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    subtaskHeaderIcon: {
        color: COLORS.black,
        fontSize: 18,
        fontWeight: "900",
        marginRight: 8,
    },
    subtaskHeaderText: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: "900",
    },
    noTaskBox: {
        borderWidth: 2,
        borderColor: COLORS.black,
        padding: 12,
        alignItems: "center",
    },
    noTaskText: {
        color: COLORS.black,
        fontSize: 12,
        fontWeight: "900",
    },
    subtaskShadow: {
        marginBottom: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    subtaskCard: {
        backgroundColor: COLORS.white,
        borderWidth: 3,
        borderColor: COLORS.black,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    subtaskLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 8,
    },
    subtaskNumber: {
        width: 30,
        height: 30,
        backgroundColor: COLORS.black,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    subtaskNumberText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "900",
    },
    subtaskTextBox: {
        flex: 1,
    },
    subtaskTitle: {
        color: COLORS.black,
        fontSize: 14,
        lineHeight: 18,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    subtaskMeta: {
        color: COLORS.black,
        opacity: 0.6,
        fontSize: 9,
        lineHeight: 12,
        fontWeight: "900",
        marginTop: 2,
    },
    subtaskStatus: {
        borderWidth: 2,
        borderColor: COLORS.black,
        paddingHorizontal: 8,
        paddingVertical: 4,
        maxWidth: 86,
    },
    subtaskStatusText: {
        color: COLORS.black,
        fontSize: 9,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    loadingBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 14,
        color: COLORS.black,
        fontSize: 13,
        fontWeight: "900",
    },
});