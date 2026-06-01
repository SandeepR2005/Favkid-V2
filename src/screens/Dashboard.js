import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    StatusBar,
    Platform,
} from 'react-native';

/* ─────────────────────────────────────────────────────────────
 * Theme
 * ──────────────────────────────────────────────────────────── */
const colors = {
    bg: '#F6F7FB',
    surface: '#FFFFFF',
    primary: '#5B5FEF',
    primaryDeep: '#4044CE',
    primarySoft: '#EEF0FF',
    accent: '#FFB020',
    accentSoft: '#FFF4DE',
    textDark: '#111827',
    textMuted: '#6B7280',
    textSubtle: '#9CA3AF',
    border: '#EEF0F4',
    borderStrong: '#E2E5EC',
    success: '#22C55E',
    successSoft: '#E6F8EC',
    warning: '#F59E0B',
    warningSoft: '#FFF4DE',
    info: '#3B82F6',
    infoSoft: '#E6EFFE',
    queueTint: '#FFFBF1',
    queueBorder: '#FCE7B7',
};

const radii = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };
const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

const shadow = Platform.select({
    ios: {
        shadowColor: '#0B1736',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 2 },
    default: {},
});

const shadowLg = Platform.select({
    ios: {
        shadowColor: '#5B5FEF',
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 8 },
    default: {},
});

/* ─────────────────────────────────────────────────────────────
 * Mock data
 * ──────────────────────────────────────────────────────────── */
const MOCK_ACHIEVEMENTS = [
    {
        id: 'a1',
        title: 'Finish thesis introduction',
        category: 'Academic · Writing',
        progress: 0.65,
        due: 'Due Friday',
        status: 'On Track',
        coaches: [
            { id: 'c1', name: 'Maya K.', initials: 'MK' },
            { id: 'c2', name: 'Jordan L.', initials: 'JL' },
            { id: 'c3', name: 'Ravi P.', initials: 'RP' },
        ],
    },
    {
        id: 'a2',
        title: 'Run three times this week',
        category: 'Health · Cardio',
        progress: 0.66,
        due: '2 of 3 logged',
        status: 'Needs Proof',
        coaches: [
            { id: 'c4', name: 'Sam O.', initials: 'SO' },
            { id: 'c5', name: 'Tara N.', initials: 'TN' },
        ],
    },
    {
        id: 'a3',
        title: 'Reach inbox zero',
        category: 'Work · Focus',
        progress: 0.32,
        due: '3 days left',
        status: 'Pending Review',
        coaches: [
            { id: 'c1', name: 'Maya K.', initials: 'MK' },
        ],
    },
    {
        id: 'a4',
        title: 'Apply to 5 jobs',
        category: 'Career · Outreach',
        progress: 0.4,
        due: 'Due Sunday',
        status: 'On Track',
        coaches: [
            { id: 'c2', name: 'Jordan L.', initials: 'JL' },
            { id: 'c3', name: 'Ravi P.', initials: 'RP' },
            { id: 'c4', name: 'Sam O.', initials: 'SO' },
            { id: 'c5', name: 'Tara N.', initials: 'TN' },
        ],
    },
];

const MOCK_QUEUE = [
    {
        id: 'q1',
        friend: 'Maya K.',
        initials: 'MK',
        achievement: 'Morning workout',
        proof: 'Photo submitted',
        submittedAt: '14m ago',
    },
    {
        id: 'q2',
        friend: 'Jordan L.',
        initials: 'JL',
        achievement: 'Write 500 words',
        proof: 'Self-reported',
        submittedAt: '23m ago',
    },
    {
        id: 'q3',
        friend: 'Sam O.',
        initials: 'SO',
        achievement: 'Inbox zero attempt',
        proof: 'Screenshot attached',
        submittedAt: '1h ago',
    },
];

const AVATAR_PALETTE = ['#C7D2FE', '#FBCFE8', '#FED7AA', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FECACA'];
const colorFor = (seed) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};

/* ─────────────────────────────────────────────────────────────
 * Reusable components
 * ──────────────────────────────────────────────────────────── */

function ProgressBar({ value, color = colors.primary, height = 8 }) {
    const pct = Math.max(0, Math.min(1, value)) * 100;
    return (
        <View style={[progressStyles.track, { height }]}>
            <View style={[progressStyles.fill, { width: `${pct}%`, backgroundColor: color, height }]} />
        </View>
    );
}

const progressStyles = StyleSheet.create({
    track: {
        width: '100%',
        backgroundColor: colors.border,
        borderRadius: radii.pill,
        overflow: 'hidden',
    },
    fill: {
        borderRadius: radii.pill,
    },
});

function Avatar({ initials, size = 30, ring = colors.surface }) {
    return (
        <View
            style={[
                avatarStyles.base,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colorFor(initials),
                    borderColor: ring,
                },
            ]}>
            <Text style={[avatarStyles.label, { fontSize: size * 0.38 }]}>{initials}</Text>
        </View>
    );
}

const avatarStyles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    label: {
        fontWeight: '700',
        color: '#1F2937',
        letterSpacing: -0.2,
    },
});

function AvatarGroup({ coaches, max = 4, size = 30 }) {
    const shown = coaches.slice(0, max);
    const extra = coaches.length - shown.length;
    return (
        <View style={avatarGroupStyles.row}>
            {shown.map((c, i) => (
                <View key={c.id} style={{ marginLeft: i === 0 ? 0 : -size * 0.32 }}>
                    <Avatar initials={c.initials} size={size} />
                </View>
            ))}
            {extra > 0 && (
                <View
                    style={[
                        avatarGroupStyles.more,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            marginLeft: -size * 0.32,
                        },
                    ]}>
                    <Text style={avatarGroupStyles.moreLabel}>+{extra}</Text>
                </View>
            )}
        </View>
    );
}

const avatarGroupStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    more: {
        backgroundColor: colors.bg,
        borderWidth: 2,
        borderColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
    },
});

function ToggleTabs({ value, onChange, tabs }) {
    return (
        <View style={toggleStyles.wrap}>
            {tabs.map((t) => {
                const active = value === t.value;
                return (
                    <Pressable
                        key={t.value}
                        onPress={() => onChange(t.value)}
                        style={[toggleStyles.tab, active && toggleStyles.tabActive]}>
                        <Text style={[toggleStyles.label, active && toggleStyles.labelActive]}>
                            {t.label}
                        </Text>
                        {typeof t.badge === 'number' && t.badge > 0 && (
                            <View style={[toggleStyles.badge, active && toggleStyles.badgeActive]}>
                                <Text style={[toggleStyles.badgeText, active && toggleStyles.badgeTextActive]}>
                                    {t.badge}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const toggleStyles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        backgroundColor: '#ECEEF4',
        borderRadius: radii.md + 2,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        borderRadius: radii.md,
        gap: 8,
    },
    tabActive: {
        backgroundColor: colors.surface,
        ...Platform.select({
            ios: {
                shadowColor: '#0B1736',
                shadowOpacity: 0.08,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
            },
            android: { elevation: 1 },
        }),
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: -0.1,
    },
    labelActive: {
        color: colors.textDark,
        fontWeight: '700',
    },
    badge: {
        minWidth: 20,
        paddingHorizontal: 6,
        height: 20,
        borderRadius: radii.pill,
        backgroundColor: colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeActive: {
        backgroundColor: colors.primary,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
    },
    badgeTextActive: {
        color: '#FFFFFF',
    },
});

function StatusBadge({ status }) {
    const cfg = useMemo(() => {
        switch (status) {
            case 'On Track':
                return { bg: colors.successSoft, fg: '#15803D', dot: colors.success };
            case 'Needs Proof':
                return { bg: colors.warningSoft, fg: '#9A6300', dot: colors.warning };
            case 'Pending Review':
                return { bg: colors.infoSoft, fg: '#1D4ED8', dot: colors.info };
            default:
                return { bg: colors.border, fg: colors.textMuted, dot: colors.textSubtle };
        }
    }, [status]);

    return (
        <View style={[badgeStyles.wrap, { backgroundColor: cfg.bg }]}>
            <View style={[badgeStyles.dot, { backgroundColor: cfg.dot }]} />
            <Text style={[badgeStyles.label, { color: cfg.fg }]}>{status}</Text>
        </View>
    );
}

const badgeStyles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: radii.pill,
        gap: 6,
        alignSelf: 'flex-start',
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    label: { fontSize: 12, fontWeight: '700', letterSpacing: -0.1 },
});

function AchievementCard({ item, onPress }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [
            achievementStyles.card,
            shadow,
            pressed && { transform: [{ scale: 0.995 }], opacity: 0.96 },
        ]}>
            <View style={achievementStyles.topRow}>
                <View style={{ flex: 1, paddingRight: spacing.md }}>
                    <Text style={achievementStyles.category}>{item.category}</Text>
                    <Text style={achievementStyles.title} numberOfLines={2}>{item.title}</Text>
                </View>
                <Text style={achievementStyles.pct}>{Math.round(item.progress * 100)}%</Text>
            </View>

            <View style={{ marginTop: spacing.md }}>
                <ProgressBar value={item.progress} />
            </View>

            <View style={achievementStyles.footer}>
                <View style={achievementStyles.coachBlock}>
                    <AvatarGroup coaches={item.coaches} size={28} />
                    <Text style={achievementStyles.coachLabel}>
                        {item.coaches.length} {item.coaches.length === 1 ? 'coach' : 'coaches'}
                    </Text>
                </View>
                <Text style={achievementStyles.due}>{item.due}</Text>
            </View>

            <View style={achievementStyles.badgeRow}>
                <StatusBadge status={item.status} />
            </View>
        </Pressable>
    );
}

const achievementStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        padding: spacing.xl,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    topRow: { flexDirection: 'row', alignItems: 'flex-start' },
    category: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.textDark,
        marginTop: 4,
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    pct: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: -0.4,
    },
    footer: {
        marginTop: spacing.md + 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    coachBlock: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    coachLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
    },
    due: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textDark,
    },
    badgeRow: { marginTop: spacing.md },
});

function CoachQueueCard({ item, onApprove, onReview }) {
    return (
        <View style={[queueStyles.card, shadow]}>
            <View style={queueStyles.accentStripe} />
            <View style={queueStyles.body}>
                <View style={queueStyles.head}>
                    <Avatar initials={item.initials} size={42} ring={colors.queueTint} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text style={queueStyles.friend}>{item.friend}</Text>
                        <Text style={queueStyles.achievement} numberOfLines={2}>{item.achievement}</Text>
                    </View>
                    <View style={queueStyles.timeBlock}>
                        <Text style={queueStyles.timeLabel}>WAITING</Text>
                        <Text style={queueStyles.timeValue}>{item.submittedAt}</Text>
                    </View>
                </View>

                <View style={queueStyles.proofRow}>
                    <View style={queueStyles.proofDot} />
                    <Text style={queueStyles.proofText}>{item.proof}</Text>
                </View>

                <View style={queueStyles.actions}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => onReview && onReview(item)}
                        style={[queueStyles.btn, queueStyles.btnReview]}>
                        <Text style={queueStyles.btnReviewText}>Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => onApprove && onApprove(item)}
                        style={[queueStyles.btn, queueStyles.btnApprove]}>
                        <Text style={queueStyles.btnApproveText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const queueStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.queueTint,
        borderRadius: radii.xl,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.queueBorder,
        overflow: 'hidden',
    },
    accentStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: colors.accent,
    },
    body: { padding: spacing.xl, paddingLeft: spacing.xl + 2 },
    head: { flexDirection: 'row', alignItems: 'flex-start' },
    friend: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8B5E00',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    achievement: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textDark,
        marginTop: 3,
        letterSpacing: -0.2,
        lineHeight: 21,
    },
    timeBlock: { alignItems: 'flex-end' },
    timeLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8B5E00',
        letterSpacing: 0.6,
    },
    timeValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#5A3F00',
        marginTop: 2,
    },
    proofRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: 8,
    },
    proofDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accent,
    },
    proofText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
    },
    actions: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        gap: spacing.md,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnReview: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.queueBorder,
    },
    btnReviewText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8B5E00',
    },
    btnApprove: {
        backgroundColor: colors.primary,
    },
    btnApproveText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

/* ─────────────────────────────────────────────────────────────
 * Dashboard screen
 * ──────────────────────────────────────────────────────────── */
export default function DashboardScreen() {
    const [tab, setTab] = useState('myTrack');
    const [queue, setQueue] = useState(MOCK_QUEUE);

    const handleApprove = (item) => {
        console.log('approve', item.id);
        setQueue((q) => q.filter((x) => x.id !== item.id));
    };

    const handleReview = (item) => {
        console.log('review', item.id);
    };

    const handleFab = () => {
        console.log('create new achievement');
    };

    const tabs = [
        { value: 'myTrack', label: 'My Track' },
        { value: 'coachQueue', label: 'Coach Queue', badge: queue.length },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1, paddingRight: spacing.md }}>
                        <Text style={styles.welcome}>Welcome back, Sandeep</Text>
                        <Text style={styles.subtitle}>
                            Small steps today, big wins this week.
                        </Text>
                    </View>
                    <View style={styles.streak}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <View>
                            <Text style={styles.streakValue}>7</Text>
                            <Text style={styles.streakLabel}>day streak</Text>
                        </View>
                    </View>
                </View>

                {/* Toggle */}
                <View style={styles.toggleWrap}>
                    <ToggleTabs value={tab} onChange={setTab} tabs={tabs} />
                </View>

                {/* Section label */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>
                        {tab === 'myTrack' ? 'Active Achievements' : 'Needs Your Verification'}
                    </Text>
                    <Text style={styles.sectionMeta}>
                        {tab === 'myTrack'
                            ? `${MOCK_ACHIEVEMENTS.length} in progress`
                            : queue.length > 0
                                ? `${queue.length} pending`
                                : 'all clear'}
                    </Text>
                </View>

                {/* Content */}
                {tab === 'myTrack' ? (
                    <View style={styles.list}>
                        {MOCK_ACHIEVEMENTS.map((a) => (
                            <AchievementCard key={a.id} item={a} onPress={() => console.log('open', a.id)} />
                        ))}
                    </View>
                ) : (
                    <View style={styles.list}>
                        {queue.length === 0 ? (
                            <View style={styles.empty}>
                                <Text style={styles.emptyTitle}>All caught up</Text>
                                <Text style={styles.emptyBody}>
                                    Your friends have nothing pending. We'll let you know the moment they do.
                                </Text>
                            </View>
                        ) : (
                            queue.map((q) => (
                                <CoachQueueCard
                                    key={q.id}
                                    item={q}
                                    onApprove={handleApprove}
                                    onReview={handleReview}
                                />
                            ))
                        )}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleFab}
                style={[styles.fab, shadowLg]}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    welcome: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textDark,
        letterSpacing: -0.6,
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: colors.textMuted,
        fontWeight: '500',
        lineHeight: 20,
    },
    streak: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radii.pill,
        paddingVertical: 8,
        paddingHorizontal: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow,
    },
    streakEmoji: { fontSize: 20 },
    streakValue: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textDark,
        lineHeight: 18,
        letterSpacing: -0.3,
    },
    streakLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        marginTop: 1,
    },
    toggleWrap: {
        marginBottom: spacing.xl,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textDark,
        letterSpacing: -0.2,
    },
    sectionMeta: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
    },
    list: {
        width: '100%',
    },
    empty: {
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textDark,
        letterSpacing: -0.2,
    },
    emptyBody: {
        marginTop: 6,
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 19,
    },
    fab: {
        position: 'absolute',
        right: 22,
        bottom: 28,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabIcon: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '300',
        lineHeight: 34,
        marginTop: -2,
    },
});
