import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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
import { fmt, fmtS } from "@/utils/storage";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function ChallengesScreen() {
  const { data, currentClientId, logChallenge, toggleOptIn } = useApp();
  const insets = useSafeAreaInsets();
  const [logChalId, setLogChalId] = useState<string | null>(null);
  const [logAmount, setLogAmount] = useState("");
  const [logNote, setLogNote] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lbChalId, setLbChalId] = useState<string | null>(null);

  const client = data.clients.find((c) => c.id === currentClientId);
  if (!client) return null;

  const activeChallenges = (data.challenges || []).filter((c) => c.active);
  const getChalTotal = (id: string) =>
    (client.challengeLogs || [])
      .filter((l) => l.challengeId === id)
      .reduce((s, l) => s + l.amount, 0);
  const isOptedIn = (id: string) =>
    (client.challengeOptIns || {})[id] !== false;

  const lbChal = (data.challenges || []).find((c) => c.id === lbChalId);
  const getRanked = (chId: string) =>
    (data.clients || [])
      .filter((cl) => (cl.challengeOptIns || {})[chId] !== false)
      .map((cl) => ({
        name: cl.name,
        id: cl.id,
        total: (cl.challengeLogs || [])
          .filter((l) => l.challengeId === chId)
          .reduce((s, l) => s + l.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

  const medalColors = [C.gold, C.silver, C.bronze];
  const medalLabels = ["1st", "2nd", "3rd"];

  const handleLog = () => {
    if (!logChalId || !+logAmount) return;
    logChallenge(currentClientId!, logChalId, +logAmount, logNote);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogChalId(null);
    setLogAmount("");
    setLogNote("");
  };

  const logModal = (data.challenges || []).find((c) => c.id === logChalId);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Challenges</Text>
        <Pressable
          style={styles.lbBtn}
          onPress={() => {
            if (activeChallenges.length) {
              setLbChalId(activeChallenges[0].id);
              setShowLeaderboard(true);
            }
          }}
        >
          <Feather name="award" size={16} color={C.orange} />
          <Text style={styles.lbBtnText}>Leaderboard</Text>
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
        {activeChallenges.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="award" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No active challenges yet.</Text>
            <Text style={styles.emptySubText}>
              Matt will launch challenges here.
            </Text>
          </View>
        ) : (
          activeChallenges.map((ch) => {
            const total = getChalTotal(ch.id);
            const myLogs = (client.challengeLogs || [])
              .filter((l) => l.challengeId === ch.id)
              .slice(-3)
              .reverse();
            return (
              <View key={ch.id} style={styles.challengeCard}>
                <View style={styles.challengeTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.challengeName}>{ch.name}</Text>
                    {!!ch.description && (
                      <Text style={styles.challengeDesc}>{ch.description}</Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => toggleOptIn(currentClientId!, ch.id)}
                    style={styles.optInRow}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isOptedIn(ch.id) && {
                          backgroundColor: C.orange,
                          borderColor: C.orange,
                        },
                      ]}
                    >
                      {isOptedIn(ch.id) && (
                        <Feather name="check" size={10} color={C.white} />
                      )}
                    </View>
                    <Text style={styles.optInLabel}>Leaderboard</Text>
                  </Pressable>
                </View>
                <ProgressBar value={total} goal={ch.goal} color={C.green} />
                <Pressable
                  style={styles.logBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLogChalId(ch.id);
                  }}
                >
                  <Feather name="plus" size={14} color={C.green} />
                  <Text style={styles.logBtnText}>
                    Log {ch.unit}
                  </Text>
                </Pressable>
                {myLogs.map((l, i) => (
                  <View key={i} style={styles.logEntry}>
                    <Text style={styles.logEntryDate}>{fmt(l.date)}</Text>
                    <Text style={styles.logEntryAmount}>
                      +{l.amount} {ch.unit}
                    </Text>
                    {!!l.note && (
                      <Text style={styles.logEntryNote}>· {l.note}</Text>
                    )}
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* LOG MODAL */}
      <Modal
        visible={!!logChalId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLogChalId(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setLogChalId(null)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>Log Progress</Text>
            <View style={{ width: 22 }} />
          </View>
          <View style={styles.modalBody}>
            {!!logModal && (
              <>
                <Text style={styles.modalSubtitle}>{logModal.name}</Text>
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Your total</Text>
                  <Text style={styles.totalValue}>
                    {getChalTotal(logModal.id).toLocaleString()}{" "}
                    <Text style={styles.totalUnit}>{logModal.unit}</Text>
                  </Text>
                  <ProgressBar
                    value={getChalTotal(logModal.id)}
                    goal={logModal.goal}
                    color={C.orange}
                  />
                </View>
                <Text style={styles.fieldLabel}>
                  Add {logModal.unit}
                </Text>
                <TextInput
                  style={styles.input}
                  value={logAmount}
                  onChangeText={setLogAmount}
                  placeholder="50"
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.fieldLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={logNote}
                  onChangeText={setLogNote}
                  placeholder="Optional note"
                  placeholderTextColor={C.muted}
                />
                <Pressable
                  style={[
                    styles.submitBtn,
                    { backgroundColor: C.green },
                    !+logAmount && { opacity: 0.4 },
                  ]}
                  disabled={!+logAmount}
                  onPress={handleLog}
                >
                  <Text style={styles.submitBtnText}>
                    Add {logAmount || "0"} {logModal.unit}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* LEADERBOARD MODAL */}
      <Modal
        visible={showLeaderboard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLeaderboard(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowLeaderboard(false)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>Leaderboard</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            {/* Challenge selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {activeChallenges.map((ch) => (
                <Pressable
                  key={ch.id}
                  onPress={() => setLbChalId(ch.id)}
                  style={[
                    styles.lbTab,
                    lbChalId === ch.id && {
                      borderColor: C.orange,
                      backgroundColor: `${C.orange}15`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.lbTabText,
                      lbChalId === ch.id && { color: C.orange },
                    ]}
                  >
                    {ch.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {lbChal && (
              <View>
                <Text style={styles.lbChalName}>{lbChal.name}</Text>
                {!!lbChal.description && (
                  <Text style={styles.lbChalDesc}>{lbChal.description}</Text>
                )}
                <Text style={styles.lbGoal}>
                  Goal: {lbChal.goal.toLocaleString()} {lbChal.unit}
                </Text>
                {getRanked(lbChal.id).length === 0 ? (
                  <Text style={styles.emptyText}>No participants yet.</Text>
                ) : (
                  getRanked(lbChal.id).map((item, i) => {
                    const isMe = item.id === currentClientId;
                    const mc = medalColors[i] || C.dim;
                    return (
                      <View key={item.id} style={styles.lbRow}>
                        <Text style={[styles.lbRank, { color: mc }]}>
                          {medalLabels[i] || `${i + 1}.`}
                        </Text>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text
                            style={[
                              styles.lbName,
                              isMe && { color: C.orange },
                            ]}
                          >
                            {item.name}
                            {isMe ? " (you)" : ""}
                          </Text>
                          <ProgressBar
                            value={item.total}
                            goal={lbChal.goal}
                            color={mc}
                            showLabel={false}
                          />
                        </View>
                        <Text style={[styles.lbScore, { color: mc }]}>
                          {item.total.toLocaleString()}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </ScrollView>
        </View>
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
  lbBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  lbBtnText: {
    color: C.orange,
    fontSize: 12,
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
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  challengeCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  challengeTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  challengeName: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 3,
  },
  challengeDesc: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  optInRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  optInLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  logBtnText: {
    color: C.green,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  logEntry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  logEntryDate: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  logEntryAmount: {
    color: C.green,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  logEntryNote: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  modal: {
    flex: 1,
    backgroundColor: C.bg,
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
  },
  modalSubtitle: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  totalCard: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  totalLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  totalValue: {
    color: C.orange,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  totalUnit: {
    fontSize: 13,
    color: C.dim,
    fontFamily: "Inter_400Regular",
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
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  submitBtn: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  submitBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  lbTab: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  lbTabText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  lbChalName: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  lbChalDesc: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  lbGoal: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  lbRank: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    minWidth: 30,
  },
  lbName: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  lbScore: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    minWidth: 50,
    textAlign: "right",
  },
});
