import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { fmt } from "@/utils/storage";

const STUB_TYPES = [
  { id: "lift_question", label: "Lift Question" },
  { id: "schedule", label: "Scheduling" },
  { id: "check_in", label: "Check-in" },
  { id: "feedback", label: "Feedback" },
  { id: "other", label: "Other" },
];

export default function MessagesScreen() {
  const { data, currentClientId, sendMessage } = useApp();
  const insets = useSafeAreaInsets();
  const [showNew, setShowNew] = useState(false);
  const [msgType, setMsgType] = useState(STUB_TYPES[0].id);
  const [msgText, setMsgText] = useState("");
  const [msgDate, setMsgDate] = useState("");

  const client = data.clients.find((c) => c.id === currentClientId);
  if (!client) return null;

  const msgs = [...(client.messages || [])].sort(
    (a, b) => b.timestamp.localeCompare(a.timestamp)
  );

  const handleSend = () => {
    if (!msgText.trim()) return;
    sendMessage(currentClientId!, {
      type: msgType,
      text: msgText.trim(),
      preferredDate: msgDate.trim() || null,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowNew(false);
    setMsgText("");
    setMsgDate("");
    setMsgType(STUB_TYPES[0].id);
  };

  const typeLabel = (t: string) =>
    STUB_TYPES.find((x) => x.id === t)?.label || t;

  const typeBadgeColor = (t: string) => {
    if (t === "lift_question") return C.orange;
    if (t === "schedule") return C.blue;
    if (t === "check_in") return C.green;
    if (t === "feedback") return C.purple;
    return C.dim;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable
          style={styles.newBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowNew(true);
          }}
        >
          <Feather name="edit-2" size={14} color={C.white} />
          <Text style={styles.newBtnText}>New</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {msgs.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubText}>
              Reach out to Matt with questions or check-ins
            </Text>
          </View>
        ) : (
          msgs.map((m) => {
            const bc = typeBadgeColor(m.type);
            return (
              <View key={m.id} style={styles.messageCard}>
                <View style={styles.msgTop}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: `${bc}18`,
                        borderColor: `${bc}44`,
                      },
                    ]}
                  >
                    <Text style={[styles.typeBadgeText, { color: bc }]}>
                      {typeLabel(m.type)}
                    </Text>
                  </View>
                  <Text style={styles.msgDate}>
                    {fmt(m.timestamp.split("T")[0])}
                  </Text>
                </View>
                <Text style={styles.msgText}>{m.text}</Text>
                {!!m.preferredDate && (
                  <View style={styles.dateRow}>
                    <Feather name="calendar" size={12} color={C.dim} />
                    <Text style={styles.dateText}>
                      Preferred date: {m.preferredDate}
                    </Text>
                  </View>
                )}
                {/* Trainer reply */}
                {!!m.trainerReply && (
                  <View style={styles.replyBox}>
                    <View style={styles.replyHeader}>
                      <View style={styles.mattBadge}>
                        <Text style={styles.mattBadgeText}>Matt</Text>
                      </View>
                    </View>
                    <Text style={styles.replyText}>{m.trainerReply}</Text>
                  </View>
                )}
                {!m.trainerReply && (
                  <View style={styles.pendingRow}>
                    <Feather name="clock" size={11} color={C.muted} />
                    <Text style={styles.pendingText}>
                      Waiting for Matt's reply
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* NEW MESSAGE MODAL */}
      <Modal
        visible={showNew}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNew(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: C.bg }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowNew(false)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>New Message</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.typeRow}>
              {STUB_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setMsgType(t.id)}
                  style={[
                    styles.typeChip,
                    msgType === t.id && {
                      borderColor: typeBadgeColor(t.id),
                      backgroundColor: `${typeBadgeColor(t.id)}15`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      msgType === t.id && {
                        color: typeBadgeColor(t.id),
                      },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={styles.textarea}
              value={msgText}
              onChangeText={setMsgText}
              placeholder="What's on your mind?"
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={5}
              autoFocus
            />

            <Text style={styles.fieldLabel}>
              Preferred session date{" "}
              <Text style={{ color: C.muted, fontFamily: "Inter_400Regular" }}>
                (optional)
              </Text>
            </Text>
            <TextInput
              style={styles.input}
              value={msgDate}
              onChangeText={setMsgDate}
              placeholder="e.g. Thursday morning, next week"
              placeholderTextColor={C.muted}
            />

            <Pressable
              style={[
                styles.sendBtn,
                !msgText.trim() && { opacity: 0.4 },
              ]}
              disabled={!msgText.trim()}
              onPress={handleSend}
            >
              <Text style={styles.sendBtnText}>Send Message</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  newBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBtnText: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubText: {
    color: C.muted,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  messageCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  msgTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  msgDate: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  msgText: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  dateText: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  replyBox: {
    backgroundColor: `${C.orange}0d`,
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
    borderRadius: 0,
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  mattBadge: {
    backgroundColor: C.orange,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 3,
  },
  mattBadgeText: {
    color: C.white,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  replyText: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  pendingText: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  modalBody: {
    padding: 16,
    paddingBottom: 48,
  },
  fieldLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeChipText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  textarea: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 14,
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
  sendBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  sendBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
