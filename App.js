import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { supabase } from "./src/lib/supabase";
import { COLORS } from "./src/theme";
import Icon from "./src/components/Icon";
import { LoadingBox } from "./src/components/ui";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/RoleHomeScreen";
import ConnectScreen from "./src/screens/ConnectScreen";
import CreateAchievementScreen from "./src/screens/CreateAchievementScreen";
import AchievementListScreen from "./src/screens/AchievementListScreen";
import MatrixScreen from "./src/screens/MatrixScreen";
import FavoriteMatrixAssignmentScreen from "./src/screens/FavoriteMatrixAssignmentScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import ChatbotScreen from "./src/screens/ChatbotScreen";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState("home");

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);

      if (currentSession?.user) {
        loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
        setActiveScreen("home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      Alert.alert("Session error", error.message);
      setLoading(false);
      return;
    }

    setSession(data.session);

    if (data.session?.user) {
      await loadProfile(data.session.user.id);
    }

    setLoading(false);
  };

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, account_type, favkid_code")
      .eq("id", userId)
      .single();

    if (error) {
      Alert.alert("Profile error", error.message);
      return;
    }

    setProfile(data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Logout failed", error.message);
      return;
    }

    setSession(null);
    setProfile(null);
    setActiveScreen("home");
  };

  const isFavoriteOnly = profile?.account_type === "favorite_person";

  const go = (screen) => setActiveScreen(screen);

  const renderActiveScreen = () => {
    if (activeScreen === "achievements") {
      return <AchievementListScreen onLogout={handleLogout} />;
    }

    if (activeScreen === "matrix") {
      if (isFavoriteOnly) {
        return <FavoriteMatrixAssignmentScreen onLogout={handleLogout} />;
      }
      return <MatrixScreen onLogout={handleLogout} />;
    }

    if (activeScreen === "leaderboard") {
      return <LeaderboardScreen onLogout={handleLogout} />;
    }

    if (activeScreen === "connect") {
      return <ConnectScreen onLogout={handleLogout} />;
    }

    if (activeScreen === "chatbot") {
      return <ChatbotScreen onLogout={handleLogout} />;
    }

    if (activeScreen === "create") {
      return (
        <CreateAchievementScreen
          onLogout={handleLogout}
          onCreated={() => setActiveScreen("achievements")}
        />
      );
    }

    return <HomeScreen profile={profile} onLogout={handleLogout} go={go} />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingBox text="Loading FavKid…" />
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!session) {
    return (
      <>
        <LoginScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  const navLeft = [
    { id: "home", icon: "home", label: "Home" },
    { id: "achievements", icon: "target", label: "Track" },
    {
      id: "matrix",
      icon: isFavoriteOnly ? "grid" : "dice",
      label: isFavoriteOnly ? "Assign" : "Matrix",
    },
  ];
  const navRight = [
    { id: "leaderboard", icon: "trophy", label: "Rank" },
    { id: "connect", icon: "handshake", label: "Connect" },
  ];

  return (
    <View style={styles.appContainer}>
      {renderActiveScreen()}

      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.chatFab, activeScreen === "chatbot" && styles.chatFabActive]}
        onPress={() => go("chatbot")}
      >
        <Icon
          name="spark"
          size={20}
          stroke={2.3}
          color={activeScreen === "chatbot" ? COLORS.accentInk : COLORS.accent}
        />
        <Text style={[styles.chatFabText, activeScreen === "chatbot" && styles.chatFabTextActive]}>
          Guide
        </Text>
      </TouchableOpacity>

      <View style={[styles.bottomNav, isFavoriteOnly && styles.bottomNavTight]}>
        {navLeft.map((n) => (
          <NavItem key={n.id} {...n} active={activeScreen === n.id} onPress={() => go(n.id)} />
        ))}

        {!isFavoriteOnly && (
          <TouchableOpacity activeOpacity={0.85} style={styles.navAdd} onPress={() => go("create")}>
            <View style={styles.navAddCircle}>
              <Icon name="plus" size={24} stroke={2.4} color={COLORS.accentInk} />
            </View>
            <Text style={styles.navAddLabel}>Add</Text>
          </TouchableOpacity>
        )}

        {navRight.map((n) => (
          <NavItem key={n.id} {...n} active={activeScreen === n.id} onPress={() => go(n.id)} />
        ))}
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

function NavItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <Icon name={icon} size={22} color={active ? COLORS.accent : COLORS.textMute} />
      <Text style={[styles.navLabel, active && { color: COLORS.accent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  chatFab: {
    position: "absolute",
    right: 20,
    bottom: 96,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    shadowColor: "#1B1F2A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 12,
    zIndex: 110,
  },
  chatFabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chatFabText: {
    color: COLORS.accent,
    fontWeight: "800",
    fontSize: 12.5,
    letterSpacing: 0.2,
  },
  chatFabTextActive: { color: COLORS.accentInk },
  bottomNav: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 16,
    height: 68,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    shadowColor: "#1B1F2A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 12,
    zIndex: 100,
  },
  bottomNavTight: { justifyContent: "space-between", paddingHorizontal: 18 },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 8 },
  navLabel: { fontSize: 9.5, fontWeight: "700", letterSpacing: 0.2, color: COLORS.textMute },
  navAdd: { flex: 1, alignItems: "center", justifyContent: "center" },
  navAddCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  navAddLabel: { fontSize: 9.5, fontWeight: "700", color: COLORS.textMute, marginTop: 3 },
});
