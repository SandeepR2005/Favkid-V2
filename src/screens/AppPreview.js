import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import AchievementsScreen from "./src/screens/AchievementsScreen";
import MentorshipScreen from "./src/screens/MentorshipScreen";
import MatrixScreen from "./src/screens/MatrixScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import ConnectScreen from "./src/screens/ConnectScreen";

const screens = {
  Home: HomeScreen,
  Achievements: AchievementsScreen,
  Mentorship: MentorshipScreen,
  Matrix: MatrixScreen,
  History: HistoryScreen,
  Leaderboard: LeaderboardScreen,
  Connect: ConnectScreen,
};

export default function App() {
  const [current, setCurrent] = useState("Home");
  const Screen = screens[current];
  return <Screen />;
}
