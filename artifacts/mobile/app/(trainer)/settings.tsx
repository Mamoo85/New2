import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { HomeContent, DEFAULT_QUOTES } from "@/utils/storage";
import { router } from "expo-router";

const SESSION_TYPES = [
  "single",
  "blueprint",
  "virtual",
  "stuck",
];

export default function SettingsScreen() {
  const { data, updateData, logout } = useApp();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"home" | "sessions" | "help">("home");

  const [wordsFromMatt, setWordsFromMatt] = useState(
    data.homeContent?.wordsFromMatt || ""
  );
  const [monthlyFocusTitle, setMonthlyFocusTitle] = useState(
    data.homeContent?.monthlyFocusTitle || ""
  );
  const [monthlyFocus, setMonthlyFocus] = useState(
    data.homeContent?.monthlyFocus || ""
  );
  const [quotesText, setQuotesText] = useState(
    (data.homeContent?.quotes || DEFAULT_QUOTES).join("\n")
  );
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    setWordsFromMatt(data.homeContent?.wordsFromMatt || "");
    setMonthlyFocusTitle(data.homeContent?.monthlyFocusTitle || "");
    setMonthlyFocus(data.homeContent?.monthlyFocus || "");
    setQuotesText(
      (data.homeContent?.quotes || DEFAULT_QUOTES).join("\n")
    );
  }, [data.homeContent]);

  const saveHomeContent = () => {
    const quotes = quotesText
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean);
    updateData((d) => {
      d.homeContent = {
        ...d.homeContent,
        wordsFromMatt,
        monthlyFocusTitle,
        monthlyFocus,
        quotes,
      };
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 3000);
  };

  const toggleSession = (id: string) => {
    updateData((d) => {
      const t = (d.sessionTypes || []).find((x) => x.id === id);
      if (t) t.active = !t.active;
      return d;
    });
  };

  const helpRequests = (data.helpRequests || []).sort(
    (a, b) => b.submittedAt.localeCompare(a.submittedAt)
  );

  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleHelpReply = (id: string) => {
    if (!replyText.trim()) return;
    updateData((d) => {
      const r = (d.helpRequests || []).find((x) => x.id === id);
      if (r) {
        r.trainerReply = replyText.trim();
        r.repliedAt = new Date().toISOString();
        r.status = "replied";
      }
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReplyId(null);
    setReplyText("");
  };

  const catLabels: Record<string, string> = {
    workout: "Need a Workout",
    lift: "Lift Question",
    injury: "Something Hurts",
    badassery: "Pure Badassery",
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Pressable
          onPress={() => {
            logout();
            router.replace("/");
          }}
        >
          <Feather name="log-out" size={20} color={C.dim} />
        </Pressable>
      </View>

      {/* TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {(["home", "sessions", "help"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === t && styles.tabBtnTextActive,
              ]}
            >
              {t === "home"
                ? "Home Content"
                : t === "sessions"
                ? "Session Types"
                : "Help Requests"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* HOME CONTENT */}
      {tab === "home" && (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 100,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {savedOk && (
            <View style={styles.successBanner}>
              <Feather name="check-circle" size={16} color={C.green} />
              <Text style={styles.successText}>Home content saved!</Text>
            </View>
          )}
          <Text style={styles.fieldLabel}>Words from Matt</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
            value={wordsFromMatt}
            onChangeText={setWordsFromMatt}
            placeholder="Your message to clients..."
            placeholderTextColor={C.muted}
            multiline
          />
          <Text style={styles.fieldLabel}>Monthly Focus Title</Text>
          <TextInput
            style={styles.input}
            value={monthlyFocusTitle}
            onChangeText={setMonthlyFocusTitle}
            placeholder="e.g. March: Posterior Chain"
            placeholderTextColor={C.muted}
          />
          <Text style={styles.fieldLabel}>Monthly Focus</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
            value={monthlyFocus}
            onChangeText={setMonthlyFocus}
            placeholder="What you're focusing on this month..."
            placeholderTextColor={C.muted}
            multiline
          />
          <Text style={styles.fieldLabel}>
            Motivational Quotes{" "}
            <Text style={{ color: C.muted, fontFamily: "Inter_400Regular" }}>
              (one per line)
            </Text>
          </Text>
          <TextInput
            style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
            value={quotesText}
            onChangeText={setQuotesText}
            placeholder="Your only competition is who you were yesterday.&#10;Pain is temporary. Quitting lasts forever."
            placeholderTextColor={C.muted}
            multiline
          />
          <Pressable style={styles.saveBtn} onPress={saveHomeContent}>
            <Text style={styles.saveBtnText}>Save Home Content</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* SESSION TYPES */}
      {tab === "sessions" && (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 100,
            },
          ]}
        >
          <Text style={styles.sectionNote}>
            Toggle session types on or off to control what clients can book.
          </Text>
          {(data.sessionTypes || []).map((t) => (
            <View key={t.id} style={styles.sessionCard}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.sessionName,
                    !t.active && { color: C.muted },
                  ]}
                >
                  {t.name}
                </Text>
                {!!t.description && (
                  <Text style={styles.sessionDesc} numberOfLines={2}>
                    {t.description}
                  </Text>
                )}
                <Text style={styles.sessionMeta}>
                  {t.duration} min ·{" "}
                  {t.type === "stuck" ? "$1+ pay what you feel" : `$${t.price}`}
                </Text>
              </View>
              <Switch
                value={t.active}
                onValueChange={() => toggleSession(t.id)}
                thumbColor={t.active ? C.orange : C.muted}
                trackColor={{ false: C.border, true: `${C.orange}44` }}
              />
            </View>
          ))}
        </ScrollView>
      )}

      {/* HELP REQUESTS */}
      {tab === "help" && (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 100,
            },
          ]}
        >
          {helpRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="help-circle" size={32} color={C.muted} />
              <Text style={styles.emptyText}>No help requests yet.</Text>
            </View>
          ) : (
            helpRequests.map((r) => {
              const isOpen = replyId === r.id;
              return (
                <View key={r.id} style={styles.helpCard}>
                  <View style={styles.helpCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.helpName}>{r.name}</Text>
                      <Text style={styles.helpMeta}>
                        {catLabels[r.category] || r.category} ·{" "}
                        {r.submittedAt.split("T")[0]}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            r.status === "replied" ? C.green : C.orange,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.helpDetails}>{r.details}</Text>
                  {!!r.videoUrl && (
                    <Text style={styles.helpMeta}>Video: {r.videoUrl}</Text>
                  )}
                  {!!r.trainerReply && (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyText}>{r.trainerReply}</Text>
                    </View>
                  )}
                  {!r.trainerReply && !isOpen && (
                    <Pressable
                      style={styles.replyBtn}
                      onPress={() => {
                        setReplyId(r.id);
                        setReplyText("");
                      }}
                    >
                      <Feather name="corner-down-right" size={13} color={C.orange} />
                      <Text style={styles.replyBtnText}>Reply</Text>
                    </Pressable>
                  )}
                  {isOpen && (
                    <View style={{ marginTop: 10 }}>
                      <TextInput
                        style={[styles.input, { minHeight: 70, textAlignVertical: "top" }]}
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder="Your response..."
                        placeholderTextColor={C.muted}
                        multiline
                        autoFocus
                      />
                      <View style={styles.replyBtns}>
                        <Pressable
                          style={[
                            styles.sendReplyBtn,
                            !replyText.trim() && { opacity: 0.4 },
                          ]}
                          disabled={!replyText.trim()}
                          onPress={() => handleHelpReply(r.id)}
                        >
                          <Text style={styles.sendReplyBtnText}>Send</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setReplyId(null)}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: C.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  tabsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabBtnActive: {
    borderColor: C.orange,
    backgroundColor: `${C.orange}15`,
  },
  tabBtnText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  tabBtnTextActive: {
    color: C.orange,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 16,
  },
  fieldLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 13,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  successBanner: {
    backgroundColor: `${C.green}18`,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  successText: {
    color: C.green,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  sectionNote: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
    lineHeight: 18,
  },
  sessionCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sessionName: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  sessionDesc: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 3,
  },
  sessionMeta: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  helpCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  helpCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  helpName: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  helpMeta: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  helpDetails: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 6,
  },
  replyBox: {
    backgroundColor: `${C.orange}0d`,
    borderLeftWidth: 2,
    borderLeftColor: C.orange,
    padding: 10,
    marginTop: 8,
    borderRadius: 4,
  },
  replyText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  replyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  replyBtnText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  replyBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sendReplyBtn: {
    backgroundColor: C.orange,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 7,
  },
  sendReplyBtnText: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  cancelText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
