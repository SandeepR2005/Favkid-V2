import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
    const [mode, setMode] = useState("login");
    const [fullName, setFullName] = useState("");
    const [accountType, setAccountType] = useState("user");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.logo}>FavKid</Text>

                <Text style={styles.title}>
                    {isLogin ? "Welcome back" : "Create your account"}
                </Text>

                <Text style={styles.subtitle}>
                    Track achievements and connect with your favorite people.
                </Text>

                {!isLogin && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Full name"
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        <Text style={styles.label}>Choose account type</Text>

                        <View style={styles.typeContainer}>
                            <AccountTypeButton
                                title="User"
                                active={accountType === "user"}
                                onPress={() => setAccountType("user")}
                            />

                            <AccountTypeButton
                                title="Favorite"
                                active={accountType === "favorite_person"}
                                onPress={() => setAccountType("favorite_person")}
                            />

                            <AccountTypeButton
                                title="Both"
                                active={accountType === "both"}
                                onPress={() => setAccountType("both")}
                            />
                        </View>
                    </>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleAuth}>
                    <Text style={styles.buttonText}>
                        {isLogin ? "Login" : "Create account"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode(isLogin ? "signup" : "login")}>
                    <Text style={styles.switchText}>
                        {isLogin
                            ? "New to FavKid? Create an account"
                            : "Already have an account? Login"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function AccountTypeButton({ title, active, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.typeButton, active && styles.typeButtonActive]}
            onPress={onPress}
        >
            <Text style={[styles.typeText, active && styles.typeTextActive]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F8FA",
        justifyContent: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    logo: {
        fontSize: 28,
        fontWeight: "800",
        color: "#4F46E5",
        marginBottom: 20,
        textAlign: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 24,
        lineHeight: 20,
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 14,
        marginBottom: 12,
        color: "#0F172A",
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 8,
    },
    typeContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 14,
    },
    typeButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F8FAFC",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    typeButtonActive: {
        backgroundColor: "#EEF0FF",
        borderColor: "#4F46E5",
    },
    typeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#64748B",
    },
    typeTextActive: {
        color: "#4F46E5",
    },
    button: {
        backgroundColor: "#4F46E5",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 6,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    switchText: {
        textAlign: "center",
        color: "#4F46E5",
        fontSize: 13,
        fontWeight: "600",
        marginTop: 18,
    },
});