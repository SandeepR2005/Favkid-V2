import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { COLORS, FONTS } from "../theme";
import Icon from "../components/Icon";
import { Btn, Chip, Eyebrow, Field, Input } from "../components/ui";

export default function LoginScreen() {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing details", "Please enter email and password.");
      return;
    }

    if (!isLogin && !fullName) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }

    setBusy(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login failed", error.message);
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: accountType,
          },
        },
      });

      if (error) {
        Alert.alert("Signup failed", error.message);
      } else {
        Alert.alert(
          "Account created",
          "Your FavKid account has been created successfully."
        );
      }
    }

    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
              <View style={styles.brandMark}>
                <Icon name="spark" size={24} stroke={2.2} color={COLORS.accentInk} />
              </View>
              <Text style={styles.brandText}>FavKid</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Eyebrow style={{ marginBottom: 14 }}>Accountability, gamified</Eyebrow>
            <Text style={styles.title}>{isLogin ? "Welcome\nback." : "Create\naccount."}</Text>
            <Text style={styles.sub}>
              Track achievements, earn momentum, and stay accountable with the people who
              matter.
            </Text>

            {!isLogin && (
              <>
                <Field label="Full name">
                  <Input
                    placeholder="Your name"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </Field>

                <Field label="Account type">
                  <View style={styles.typeRow}>
                    <Chip
                      label="User"
                      on={accountType === "user"}
                      onPress={() => setAccountType("user")}
                      style={styles.typeChip}
                    />
                    <Chip
                      label="Favorite"
                      on={accountType === "favorite_person"}
                      onPress={() => setAccountType("favorite_person")}
                      style={styles.typeChip}
                    />
                    <Chip
                      label="Both"
                      on={accountType === "both"}
                      onPress={() => setAccountType("both")}
                      style={styles.typeChip}
                    />
                  </View>
                </Field>
              </>
            )}

            <Field label="Email address">
              <Input
                placeholder="you@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Field>

            <Field label="Password">
              <Input
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Field>

            <Btn
              title={isLogin ? "Log in" : "Create account"}
              iconRight="arrowR"
              onPress={handleAuth}
              loading={busy}
              style={{ marginTop: 22 }}
            />
            <Btn
              title={isLogin ? "New to FavKid? Create an account" : "Already have an account? Log in"}
              variant="ghost"
              onPress={() => setMode(isLogin ? "signup" : "login")}
              style={{ marginTop: 11 }}
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Icon name="lock" size={13} color={COLORS.textMute} />
              <Text style={styles.footerText}>Private by default</Text>
            </View>
            <View style={styles.footerItem}>
              <Icon name="check" size={13} color={COLORS.textMute} />
              <Text style={styles.footerText}>Proof-verified</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 30, flexGrow: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 22, color: COLORS.text },
  hero: { flex: 1, justifyContent: "center", paddingVertical: 24 },
  title: {
    fontFamily: FONTS.display,
    fontWeight: "800",
    fontSize: 46,
    lineHeight: 46,
    letterSpacing: -1,
    color: COLORS.text,
  },
  sub: { marginTop: 14, color: COLORS.textDim, fontSize: 14.5, lineHeight: 21 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { flex: 1, justifyContent: "center" },
  footer: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 10 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerText: { color: COLORS.textMute, fontSize: 12 },
});
