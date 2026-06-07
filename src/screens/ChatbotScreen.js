import React, { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";
import Icon from "../components/Icon";
import { Card, Eyebrow, Mono, PageSub, PageTitle, Pill, TopBar } from "../components/ui";
import {
  getFavKidBotReply,
  GUIDE_SECTIONS,
  QUICK_QUESTIONS,
} from "../data/favkidKnowledgeBase";

const INITIAL_MESSAGES = [
  {
    id: "bot-welcome",
    from: "bot",
    title: "FavKid Guide Bot",
    text:
      "Hi! I am your local FavKid guide. I can explain the app like a manual: what each tab does, how a new user should start, how Matrix works, what a favorite person should do, how predictions work, how to upload proof, how ranking updates, and how to fix common testing problems.\n\nTap a guide topic below or ask your own question.",
    suggestions: QUICK_QUESTIONS.slice(0, 8),
  },
];

export default function ChatbotScreen({ onLogout }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const latestSuggestions = useMemo(() => {
    const lastBot = [...messages].reverse().find((message) => message.from === "bot");
    return lastBot?.suggestions?.length ? lastBot.suggestions : QUICK_QUESTIONS.slice(0, 8);
  }, [messages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    });
  };

  const askQuestion = (rawQuestion) => {
    const question = String(rawQuestion || "").trim();
    if (!question) return;

    const reply = getFavKidBotReply(question);
    const now = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${now}`,
        from: "user",
        text: question,
      },
      {
        id: `bot-${now}`,
        from: "bot",
        title: reply.title,
        text: reply.answer,
        suggestions: reply.suggestions,
        matched: reply.matched,
      },
    ]);

    setInput("");
    scrollToBottom();
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setInput("");
    scrollToBottom();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <TopBar brand="FAVKID GUIDE" onLogout={onLogout} />

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Icon name="spark" size={24} stroke={2.3} color={COLORS.accentInk} />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>Local app manual</Eyebrow>
              <PageTitle style={styles.title}>Guide Bot</PageTitle>
              <PageSub>
                Detailed answers for testers and new users. No API key, no internet AI, no extra cost.
              </PageSub>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            <Card style={styles.sectionCard}>
              <View style={styles.suggestionHead}>
                <Mono style={styles.suggestionTitle}>GUIDE SECTIONS</Mono>
                <TouchableOpacity onPress={() => askQuestion("Show all guide topics")} activeOpacity={0.75}>
                  <Text style={styles.topicText}>All topics</Text>
                </TouchableOpacity>
              </View>

              {GUIDE_SECTIONS.map((section) => (
                <View key={section.title} style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.chipWrap}>
                    {section.questions.map((question) => (
                      <TouchableOpacity
                        key={question}
                        activeOpacity={0.82}
                        style={styles.sectionChip}
                        onPress={() => askQuestion(question)}
                      >
                        <Text style={styles.questionChipText}>{question}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </Card>

            <Card style={styles.suggestionCard}>
              <View style={styles.suggestionHead}>
                <Mono style={styles.suggestionTitle}>RELATED QUESTIONS</Mono>
                <TouchableOpacity onPress={clearChat} activeOpacity={0.75}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipWrap}>
                {latestSuggestions.map((question) => (
                  <TouchableOpacity
                    key={question}
                    activeOpacity={0.82}
                    style={styles.questionChip}
                    onPress={() => askQuestion(question)}
                  >
                    <Text style={styles.questionChipText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask: Why is Matrix locked? How to upload proof?"
              placeholderTextColor={COLORS.textMute}
              style={styles.input}
              multiline
              maxLength={360}
              returnKeyType="send"
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={() => askQuestion(input)}
              disabled={!input.trim()}
            >
              <Icon name="arrowUp" size={21} stroke={2.5} color={COLORS.accentInk} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message }) {
  const isUser = message.from === "user";

  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Icon name="spark" size={17} stroke={2.2} color={COLORS.accent} />
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        {!isUser && message.title ? <Text style={styles.botTitle}>{message.title}</Text> : null}
        <Text style={[styles.messageText, isUser && styles.userText]}>{message.text}</Text>
        {!isUser && message.matched === false ? (
          <Pill bg={COLORS.warnSoft} color={COLORS.warn} style={{ marginTop: 10 }}>
            Try a suggested topic
          </Pill>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  keyboardWrap: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 104 },
  heroCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 31, marginBottom: 3 },
  chatContent: { paddingTop: 4, paddingBottom: 16, gap: 12 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 9 },
  messageRowBot: { justifyContent: "flex-start" },
  messageRowUser: { justifyContent: "flex-end" },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "90%",
    borderRadius: 20,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  botBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderBottomLeftRadius: 7,
  },
  userBubble: {
    maxWidth: "82%",
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 7,
  },
  botTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 7,
  },
  messageText: { fontSize: 14.4, lineHeight: 21.5, color: COLORS.textDim },
  userText: { color: COLORS.accentInk, fontWeight: "600" },
  sectionCard: { marginTop: 4, padding: 14 },
  suggestionCard: { padding: 14 },
  suggestionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  suggestionTitle: { fontSize: 11, color: COLORS.textMute, fontWeight: "800", letterSpacing: 1.1 },
  clearText: { color: COLORS.danger, fontWeight: "800", fontSize: 12 },
  topicText: { color: COLORS.accent, fontWeight: "800", fontSize: 12 },
  sectionBlock: { marginTop: 10 },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  questionChip: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionChip: {
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: RADIUS.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  questionChipText: { color: COLORS.textDim, fontSize: 12.5, fontWeight: "700", lineHeight: 17 },
  inputBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 94,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 22,
    padding: 10,
    shadowColor: "#1B1F2A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 10,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    minHeight: 42,
    color: COLORS.text,
    fontSize: 14.5,
    lineHeight: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.45 },
});
