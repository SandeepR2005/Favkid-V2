import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { COLORS, FONTS, avatarColor, initialOf } from "../theme";
import Icon from "../components/Icon";
import {
  Btn,
  Card,
  Eyebrow,
  Field,
  Input,
  Mono,
  PageSub,
  PageTitle,
  Pill,
  SecTitle,
  TopBar,
} from "../components/ui";

export default function ConnectScreen({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [foundPerson, setFoundPerson] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCurrentProfile();
    loadIncomingRequests();
    loadOutgoingRequests();
  }, []);

  const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      Alert.alert("Error", "User not found. Please login again.");
      return null;
    }

    return data.user;
  };

  const loadCurrentProfile = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, account_type, favkid_code")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Profile error", error.message);
      return;
    }

    setProfile(data);
  };

  const searchByFavKidCode = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const cleanedCode = codeInput.trim().toUpperCase();

    if (!cleanedCode) {
      Alert.alert("Code required", "Please enter a FavKid code.");
      return;
    }

    setLoading(true);
    setFoundPerson(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, account_type, favkid_code")
      .eq("favkid_code", cleanedCode)
      .maybeSingle();

    setLoading(false);

    if (error) {
      Alert.alert("Search failed", error.message);
      return;
    }

    if (!data) {
      Alert.alert("Not found", "No person found with this FavKid code.");
      return;
    }

    if (data.id === user.id) {
      Alert.alert("Invalid code", "You cannot connect with yourself.");
      return;
    }

    if (data.account_type !== "favorite_person" && data.account_type !== "both") {
      Alert.alert("Not a favorite person", "This code belongs to a normal user account.");
      return;
    }

    setFoundPerson(data);
  };

  const sendConnectionRequest = async () => {
    const user = await getCurrentUser();
    if (!user || !foundPerson) return;

    const { data: existingOutgoing } = await supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", user.id)
      .eq("receiver_id", foundPerson.id)
      .maybeSingle();

    if (existingOutgoing) {
      Alert.alert(
        "Already requested",
        `You already have a ${existingOutgoing.status} request with this person.`
      );
      return;
    }

    const { data: existingIncoming } = await supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", foundPerson.id)
      .eq("receiver_id", user.id)
      .maybeSingle();

    if (existingIncoming) {
      Alert.alert(
        "Request already exists",
        `This person already has a ${existingIncoming.status} request with you.`
      );
      return;
    }

    const { error } = await supabase.from("connections").insert({
      requester_id: user.id,
      receiver_id: foundPerson.id,
      connection_type: "favorite_person",
      status: "pending",
    });

    if (error) {
      Alert.alert("Request failed", error.message);
      return;
    }

    Alert.alert("Request sent", "Your connection request has been sent.");
    setFoundPerson(null);
    setCodeInput("");
    loadOutgoingRequests();
  };

  const loadIncomingRequests = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const { data: requestData, error: requestError } = await supabase
      .from("connections")
      .select("id, requester_id, status, created_at")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (requestError) {
      Alert.alert("Incoming request error", requestError.message);
      return;
    }

    const requesterIds = requestData.map((item) => item.requester_id);

    if (requesterIds.length === 0) {
      setIncomingRequests([]);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, username, account_type")
      .in("id", requesterIds);

    if (profilesError) {
      Alert.alert("Profile loading error", profilesError.message);
      return;
    }

    const formattedRequests = requestData.map((request) => {
      const requesterProfile = profilesData.find((item) => item.id === request.requester_id);
      return { ...request, requester: requesterProfile };
    });

    setIncomingRequests(formattedRequests);
  };

  const loadOutgoingRequests = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const { data: requestData, error: requestError } = await supabase
      .from("connections")
      .select("id, receiver_id, status, created_at")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });

    if (requestError) {
      Alert.alert("Outgoing request error", requestError.message);
      return;
    }

    const receiverIds = requestData.map((item) => item.receiver_id);

    if (receiverIds.length === 0) {
      setOutgoingRequests([]);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, username, account_type")
      .in("id", receiverIds);

    if (profilesError) {
      Alert.alert("Profile loading error", profilesError.message);
      return;
    }

    const formattedRequests = requestData.map((request) => {
      const receiverProfile = profilesData.find((item) => item.id === request.receiver_id);
      return { ...request, receiver: receiverProfile };
    });

    setOutgoingRequests(formattedRequests);
  };

  const updateRequestStatus = async (requestId, status) => {
    const { error } = await supabase
      .from("connections")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }

    Alert.alert("Success", `Request ${status}.`);
    loadIncomingRequests();
    loadOutgoingRequests();
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCurrentProfile(), loadIncomingRequests(), loadOutgoingRequests()]);
    setRefreshing(false);
  };

  const isFavoritePerson =
    profile?.account_type === "favorite_person" || profile?.account_type === "both";

  const statusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s === "accepted") return { bg: COLORS.positiveSoft, color: COLORS.positive, dot: COLORS.positive };
    if (s === "rejected") return { bg: COLORS.dangerSoft, color: COLORS.danger, dot: COLORS.danger };
    return { bg: COLORS.warnSoft, color: COLORS.warn, dot: COLORS.warn };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.accent} />
        }
      >
        <TopBar brand="FAVKID NETWORK" onLogout={onLogout} />

        <PageTitle>Connect</PageTitle>
        <PageSub>Connect users with favorite people using a unique FavKid code.</PageSub>

        {profile && (
          <Card style={styles.myCodeCard}>
            <Mono style={styles.metaLabel}>LOGGED IN AS</Mono>
            <Text style={styles.profileName}>{profile.full_name}</Text>
            <Mono style={styles.roleText}>{String(profile.account_type || "").toUpperCase()}</Mono>

            {isFavoritePerson ? (
              <View style={styles.codeBox}>
                <View>
                  <Mono style={styles.codeBoxLabel}>YOUR CODE</Mono>
                  <Mono style={styles.codeBoxValue}>{profile.favkid_code}</Mono>
                </View>
              </View>
            ) : (
              <Text style={styles.helperText}>
                Enter a favorite person's FavKid code below to send a connection request.
              </Text>
            )}
          </Card>
        )}

        <Card style={{ marginTop: 14 }}>
          <View style={styles.cardHead}>
            <Icon name="handshake" size={19} stroke={2} color={COLORS.text} />
            <Text style={styles.cardHeadTitle}>Connect using FavKid code</Text>
          </View>
          <Field>
            <Input
              placeholder="Example: FK-8A91BC22"
              value={codeInput}
              onChangeText={(v) => setCodeInput(v.toUpperCase())}
              autoCapitalize="characters"
              style={{ fontFamily: FONTS.mono, letterSpacing: 1 }}
            />
          </Field>
          <Btn
            title={loading ? "Searching…" : "Find favorite person"}
            iconRight="arrowR"
            onPress={searchByFavKidCode}
            loading={loading}
            style={{ marginTop: 12 }}
          />
        </Card>

        {foundPerson && (
          <Card style={styles.foundCard}>
            <View style={[styles.avatar, { backgroundColor: avatarColor(foundPerson.id).soft }]}>
              <Text style={[styles.avatarText, { color: avatarColor(foundPerson.id).solid }]}>
                {initialOf(foundPerson.full_name)}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name}>{foundPerson.full_name}</Text>
              <Text style={styles.email} numberOfLines={1}>
                {foundPerson.username}
              </Text>
              <Text style={styles.roleSmall}>Favorite Person</Text>
            </View>
            <Btn title="Request" small onPress={sendConnectionRequest} />
          </Card>
        )}

        <SecTitle style={{ fontSize: 20 }}>Incoming requests</SecTitle>
        {incomingRequests.length === 0 ? (
          <Card style={{ borderStyle: "dashed", alignItems: "center", paddingVertical: 26 }}>
            <Icon name="bell" size={22} color={COLORS.textMute} />
            <Text style={styles.emptyText}>No pending incoming requests.</Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {incomingRequests.map((item) => (
              <Card key={item.id} style={styles.requestRow}>
                <View style={[styles.avatar, { backgroundColor: avatarColor(item.requester_id).soft }]}>
                  <Text style={[styles.avatarText, { color: avatarColor(item.requester_id).solid }]}>
                    {initialOf(item.requester?.full_name)}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name}>{item.requester?.full_name}</Text>
                  <Text style={styles.email} numberOfLines={1}>
                    {item.requester?.username}
                  </Text>
                  <Text style={styles.roleSmall}>Wants to connect with you</Text>
                </View>
                <View style={{ gap: 6 }}>
                  <Btn title="Accept" small onPress={() => updateRequestStatus(item.id, "accepted")} />
                  <Btn
                    title="Reject"
                    small
                    variant="ghost"
                    onPress={() => updateRequestStatus(item.id, "rejected")}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        <SecTitle style={{ fontSize: 20 }}>Your requests</SecTitle>
        {outgoingRequests.length === 0 ? (
          <Card style={{ borderStyle: "dashed" }}>
            <Text style={styles.emptyText}>You have not sent any requests.</Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {outgoingRequests.map((item) => {
              const sc = statusColor(item.status);
              return (
                <Card key={item.id} style={styles.requestRow}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor(item.receiver_id).soft }]}>
                    <Text style={[styles.avatarText, { color: avatarColor(item.receiver_id).solid }]}>
                      {initialOf(item.receiver?.full_name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.name}>{item.receiver?.full_name}</Text>
                    <Text style={styles.email} numberOfLines={1}>
                      {item.receiver?.username}
                    </Text>
                  </View>
                  <Pill bg={sc.bg} color={sc.color} dotColor={sc.dot}>
                    {item.status}
                  </Pill>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  metaLabel: { fontSize: 11, letterSpacing: 1, color: COLORS.textDim },
  myCodeCard: { marginTop: 16, backgroundColor: COLORS.accentSoft, borderColor: "transparent" },
  profileName: { fontFamily: FONTS.display, fontSize: 28, fontWeight: "800", color: COLORS.text, marginTop: 5 },
  roleText: { fontSize: 12, fontWeight: "700", color: COLORS.accent, marginTop: 3, letterSpacing: 0.8 },
  helperText: { color: COLORS.textDim, fontSize: 13, lineHeight: 19, marginTop: 12 },
  codeBox: {
    marginTop: 14,
    backgroundColor: COLORS.ink,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  codeBoxLabel: { fontSize: 9.5, letterSpacing: 1, color: COLORS.textMute },
  codeBoxValue: { fontSize: 17, fontWeight: "700", color: COLORS.onInk, marginTop: 3, letterSpacing: 0.5 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 4 },
  cardHeadTitle: { fontFamily: FONTS.display, fontWeight: "800", fontSize: 15.5, color: COLORS.text },
  foundCard: { marginTop: 14, borderColor: COLORS.accent, flexDirection: "row", alignItems: "center", gap: 12 },
  requestRow: { flexDirection: "row", alignItems: "center", gap: 13, padding: 15 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: FONTS.display, fontSize: 18, fontWeight: "800" },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  email: { fontSize: 11.5, color: COLORS.textMute, marginTop: 1 },
  roleSmall: { fontSize: 11, color: COLORS.accent, fontWeight: "700", marginTop: 4 },
  emptyText: { color: COLORS.textMute, fontSize: 13.5, marginTop: 8, textAlign: "center" },
});
