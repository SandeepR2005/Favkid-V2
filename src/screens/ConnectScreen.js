import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function ConnectScreen() {
  const [profile, setProfile] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [foundPerson, setFoundPerson] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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

    if (
      data.account_type !== "favorite_person" &&
      data.account_type !== "both"
    ) {
      Alert.alert(
        "Not a favorite person",
        "This code belongs to a normal user account."
      );
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
      const requesterProfile = profilesData.find(
        (item) => item.id === request.requester_id
      );

      return {
        ...request,
        requester: requesterProfile,
      };
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
      const receiverProfile = profilesData.find(
        (item) => item.id === request.receiver_id
      );

      return {
        ...request,
        receiver: receiverProfile,
      };
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

  const isFavoritePerson =
    profile?.account_type === "favorite_person" || profile?.account_type === "both";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.smallTitle}>FavKid Network</Text>
        <Text style={styles.title}>Connect</Text>
        <Text style={styles.subtitle}>
          Connect users with favorite people using a unique FavKid code.
        </Text>

        {profile && (
          <View style={styles.myCodeCard}>
            <Text style={styles.cardLabel}>Logged in as</Text>
            <Text style={styles.profileName}>{profile.full_name}</Text>
            <Text style={styles.roleText}>{profile.account_type}</Text>

            {isFavoritePerson ? (
              <>
                <Text style={styles.codeLabel}>Your FavKid Code</Text>
                <Text style={styles.codeText}>{profile.favkid_code}</Text>
                <Text style={styles.helperText}>
                  Share this code with users who want to connect with you.
                </Text>
              </>
            ) : (
              <Text style={styles.helperText}>
                You are a user. Enter a favorite person's FavKid code below to
                send a connection request.
              </Text>
            )}
          </View>
        )}

        <View style={styles.searchCard}>
          <Text style={styles.sectionTitle}>Connect using FavKid Code</Text>

          <TextInput
            style={styles.input}
            placeholder="Example: FK-8A91BC22"
            value={codeInput}
            onChangeText={setCodeInput}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.button} onPress={searchByFavKidCode}>
            <Text style={styles.buttonText}>
              {loading ? "Searching..." : "Find Favorite Person"}
            </Text>
          </TouchableOpacity>
        </View>

        {foundPerson && (
          <View style={styles.foundCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {foundPerson.full_name?.charAt(0)?.toUpperCase() || "F"}
              </Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.name}>{foundPerson.full_name}</Text>
              <Text style={styles.email}>{foundPerson.username}</Text>
              <Text style={styles.role}>Favorite Person</Text>
            </View>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={sendConnectionRequest}
            >
              <Text style={styles.connectButtonText}>Request</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Incoming Requests</Text>

        {incomingRequests.length === 0 ? (
          <Text style={styles.emptyText}>No pending incoming requests.</Text>
        ) : (
          incomingRequests.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.requester?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.requester?.full_name}</Text>
                <Text style={styles.email}>{item.requester?.username}</Text>
                <Text style={styles.role}>Wants to connect with you</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => updateRequestStatus(item.id, "rejected")}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => updateRequestStatus(item.id, "accepted")}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Your Requests</Text>

        {outgoingRequests.length === 0 ? (
          <Text style={styles.emptyText}>You have not sent any requests.</Text>
        ) : (
          outgoingRequests.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.receiver?.full_name?.charAt(0)?.toUpperCase() || "F"}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.receiver?.full_name}</Text>
                <Text style={styles.email}>{item.receiver?.username}</Text>
                <Text style={styles.role}>Status: {item.status}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
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
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  myCodeCard: {
    backgroundColor: "#EEF0FF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 18,
  },
  cardLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 3,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4F46E5",
    marginTop: 4,
    textTransform: "uppercase",
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    marginTop: 18,
  },
  codeText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#4F46E5",
    letterSpacing: 1,
    marginTop: 6,
  },
  helperText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 10,
    lineHeight: 19,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  foundCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#4F46E5",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  requestCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#4F46E5",
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },
  email: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  role: {
    fontSize: 11,
    color: "#4F46E5",
    fontWeight: "800",
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  actionRow: {
    gap: 6,
  },
  rejectButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    marginBottom: 6,
  },
  rejectText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  acceptButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
  },
  acceptText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 18,
  },
});