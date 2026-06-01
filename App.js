import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { supabase } from "./src/lib/supabase";

import LoginScreen from "./src/screens/LoginScreen";
import RoleHomeScreen from "./src/screens/RoleHomeScreen";
import ConnectScreen from "./src/screens/ConnectScreen";
import CreateAchievementScreen from "./src/screens/CreateAchievementScreen";
import AchievementListScreen from "./src/screens/AchievementListScreen";
import MatrixScreen from "./src/screens/MatrixScreen";
import FavoriteMatrixAssignmentScreen from "./src/screens/FavoriteMatrixAssignmentScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";

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

  const renderActiveScreen = () => {
    if (activeScreen === "achievements") {
      return <AchievementListScreen />;
    }

    if (activeScreen === "matrix") {
      if (isFavoriteOnly) {
        return <FavoriteMatrixAssignmentScreen />;
      }

      return <MatrixScreen />;
    }

    if (activeScreen === "leaderboard") {
      return <LeaderboardScreen />;
    }

    if (activeScreen === "connect") {
      return <ConnectScreen />;
    }

    if (activeScreen === "create") {
      return <CreateAchievementScreen />;
    }

    return (
      <RoleHomeScreen
        profile={profile}
        onLogout={handleLogout}
        onOpenConnect={() => setActiveScreen("connect")}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading FavKid...</Text>
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

  return (
    <View style={styles.appContainer}>
      {renderActiveScreen()}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <NavItem
          label="Home"
          icon="🏠"
          active={activeScreen === "home"}
          onPress={() => setActiveScreen("home")}
        />

        <NavItem
          label="Track"
          icon="🎯"
          active={activeScreen === "achievements"}
          onPress={() => setActiveScreen("achievements")}
        />

        <NavItem
          label={isFavoriteOnly ? "Assign" : "Matrix"}
          icon={isFavoriteOnly ? "🧾" : "🎲"}
          active={activeScreen === "matrix"}
          onPress={() => setActiveScreen("matrix")}
        />

        <NavItem
          label="Rank"
          icon="🏆"
          active={activeScreen === "leaderboard"}
          onPress={() => setActiveScreen("leaderboard")}
        />

        <NavItem
          label="Connect"
          icon="🤝"
          active={activeScreen === "connect"}
          onPress={() => setActiveScreen("connect")}
        />

        {!isFavoriteOnly && (
          <NavItem
            label="Add"
            icon="➕"
            active={activeScreen === "create"}
            onPress={() => setActiveScreen("create")}
          />
        )}
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

function NavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  logoutButton: {
    position: "absolute",
    top: 45,
    right: 20,
    backgroundColor: "#EF4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  bottomNav: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 18,
    height: 66,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 18,
  },
  navItemActive: {
    backgroundColor: "#EEF0FF",
  },
  navIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#64748B",
  },
  navLabelActive: {
    color: "#4F46E5",
  },
});
