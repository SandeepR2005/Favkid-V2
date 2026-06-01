import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function RoleHomeScreen({ profile, onLogout, onOpenConnect }) {
    const accountType = profile?.account_type || "user";

    const getRoleDetails = () => {
        if (accountType === "favorite_person") {
            return {
                title: "Favorite Person",
                badge: "⭐ Favorite Person Account",
                description:
                    "People can send you connection requests. You can accept requests and later verify their achievements.",
                primaryAction: "View Connection Requests",
            };
        }

        if (accountType === "both") {
            return {
                title: "User + Favorite Person",
                badge: "🔥 Both Account",
                description:
                    "You can create your own achievements and also act as a favorite person for others.",
                primaryAction: "Manage Connections",
            };
        }

        return {
            title: "User",
            badge: "🎯 User Account",
            description:
                "You can create achievements, track your progress, and connect with your favorite people.",
            primaryAction: "Find Favorite People",
        };
    };

    const role = getRoleDetails();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>Welcome back,</Text>
                    <Text style={styles.name}>{profile?.full_name || "FavKid User"}</Text>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.badge}>{role.badge}</Text>
                <Text style={styles.title}>{role.title}</Text>
                <Text style={styles.description}>{role.description}</Text>

                <TouchableOpacity style={styles.primaryButton} onPress={onOpenConnect}>
                    <Text style={styles.primaryButtonText}>{role.primaryAction}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.placeholderCard}>
                <Text style={styles.placeholderTitle}>Role-based dashboard area</Text>
                <Text style={styles.placeholderText}>
                    Later, we will show different features here based on whether the logged
                    in person is a User, Favorite Person, or Both.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F8FA",
        padding: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    welcome: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "600",
    },
    name: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0F172A",
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: "#EF4444",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 22,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 16,
    },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#EEF0FF",
        color: "#4F46E5",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: "800",
        marginBottom: 18,
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: "#64748B",
        lineHeight: 21,
        marginBottom: 22,
    },
    primaryButton: {
        backgroundColor: "#4F46E5",
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },
    placeholderCard: {
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 18,
        padding: 18,
    },
    placeholderTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#92400E",
        marginBottom: 6,
    },
    placeholderText: {
        fontSize: 13,
        color: "#92400E",
        lineHeight: 20,
    },
});