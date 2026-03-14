import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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
import { WeeklyCheckIn, fmt, fmtS, getMonday, uid, nowTs } from "@/utils/storage";

function RatingRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.ratingBlock}>
      <View style={styles.ratingLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.ratingValue}>{value}/10</Text>
      </View>
      <View style={styles.ratingChips}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            style={[
              styles.ratingChip,
              value === n && { backgroundColor: C.orange, borderColor: C.orange },
            ]}
            onPress={() => {
              onChange(n);
              Haptics.selectionAsync();
            }}
          >
            <Text
              style={[styles.ratingNum, value === n && { color: "#fff" }]}
            >
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.ratingHint}>{hint}</Text>
    </View>
  );
}

export default function CheckInScreen() {
  const { data, currentClientId, submitWeeklyCheckIn } = useApp();
  const insets = useSafeAreaInsets();

  const client = data.clients.find((c) => c.id === currentClientId);
  const thisMonday = getMonday();

  const existing = (data.weeklyCheckIns || []).find(
    (c) => c.clientId === currentClientId && c.weekOf === thisMonday
  );

  const recent = [...(data.weeklyCheckIns || [])]
    .filter((c) => c.clientId === currentClientId && c.weekOf !== thisMonday)
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf))
    .slice(0, 4);

  const [quality, setQuality] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [weight, setWeight] = useState("");
  const [wins, setWins] = useState("");
  const [struggles, setStruggles] = useState("");
  const [questions, setQuestions] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!client) return null;

  const handleSubmit = () => {
    if (!wins.trim() && !struggles.trim() && !questions.trim()) return;
    const checkIn: WeeklyCheckIn = {
      id: uid(),
      clientId: currentClientId!,
      weekOf: thisMonday,
      trainingQuality: quality,
      energyRecovery: energy,
      bodyWeight: weight.trim() ? parseFloat(weight) : undefined,
      wins: wins.trim(),
      struggles: struggles.trim(),
      questionsForMatt: questions.trim(),
      submittedAt: nowTs(),
    };
    submitWeeklyCheckIn(checkIn);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  };

  const weekLabel = (iso: string) =>
    `Week of ${fmt(iso)}`;

  const qualityColor = (q: number) =>
    q >= 8 ? C.green : q >= 5 ? C.orange : "#e84040";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Weekly Check-In</Text>
        {!existing && !submitted && (
          <View style={styles.dueBadge}>
            <Text style={styles.dueText}>Due now</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* WEEK BANNER */}
          <View style={styles.weekBanner}>
            <Feather name="calendar" size={14} color={C.orange} />
            <Text style={styles.weekLabel}>{weekLabel(thisMonday)}</Text>
          </View>

          {/* SUBMITTED THIS WEEK */}
          {(existing || submitted) ? (
            <View>
              <View style={styles.submittedCard}>
                <View style={styles.submittedTop}>
                  <Feather name="check-circle" size={18} color={C.green} />
                  <Text style={styles.submittedTitle}>Check-in submitted</Text>
                </View>
                {existing && (
                  <>
                    <View style={styles.ratingRow2}>
                      <View style={styles.ratingMini}>
                        <Text style={styles.ratingMiniLabel}>Training</Text>
                        <Text style={[styles.ratingMiniVal, { color: qualityColor(existing.trainingQuality) }]}>
                          {existing.trainingQuality}/10
                        </Text>
                      </View>
                      <View style={styles.ratingMini}>
                        <Text style={styles.ratingMiniLabel}>Energy</Text>
                        <Text style={[styles.ratingMiniVal, { color: qualityColor(existing.energyRecovery) }]}>
                          {existing.energyRecovery}/10
                        </Text>
                      </View>
                      {!!existing.bodyWeight && (
                        <View style={styles.ratingMini}>
                          <Text style={styles.ratingMiniLabel}>Weight</Text>
                          <Text style={styles.ratingMiniVal}>{existing.bodyWeight} lbs</Text>
                        </View>
                      )}
                    </View>
                    {!!existing.wins && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Wins</Text>
                        <Text style={styles.detailValue}>{existing.wins}</Text>
                      </View>
                    )}
                    {!!existing.struggles && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Struggles</Text>
                        <Text style={styles.detailValue}>{existing.struggles}</Text>
                      </View>
                    )}
                    {!!existing.questionsForMatt && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Question</Text>
                        <Text style={styles.detailValue}>{existing.questionsForMatt}</Text>
                      </View>
                    )}

                    {existing.trainerReply ? (
                      <View style={styles.replyBox}>
                        <View style={styles.replyHeader}>
                          <View style={styles.mattBadge}>
                            <Text style={styles.mattBadgeText}>Matt</Text>
                          </View>
                        </View>
                        <Text style={styles.replyText}>{existing.trainerReply}</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingRow}>
                        <Feather name="clock" size={12} color={C.muted} />
                        <Text style={styles.pendingText}>
                          Waiting for Matt's response
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          ) : (
            /* FORM */
            <View>
              <RatingRow
                label="Training quality this week"
                hint="1 = terrible, 10 = best sessions ever"
                value={quality}
                onChange={setQuality}
              />

              <RatingRow
                label="Energy & recovery"
                hint="1 = completely drained, 10 = fully recovered"
                value={energy}
                onChange={setEnergy}
              />

              <Text style={styles.fieldLabel}>
                Body weight this week{" "}
                <Text style={{ color: C.muted, fontFamily: "Inter_400Regular" }}>
                  (optional)
                </Text>
              </Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="lbs"
                placeholderTextColor={C.muted}
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Wins this week</Text>
              <TextInput
                style={styles.textarea}
                value={wins}
                onChangeText={setWins}
                placeholder="What went well? PRs, consistency, technique improvements..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Struggles or rough spots</Text>
              <TextInput
                style={styles.textarea}
                value={struggles}
                onChangeText={setStruggles}
                placeholder="Energy dips, soreness, missed sessions, anything feeling off..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Question for Matt</Text>
              <TextInput
                style={styles.textarea}
                value={questions}
                onChangeText={setQuestions}
                placeholder="Form question, program tweak, nutrition, life — anything"
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Pressable
                style={[
                  styles.submitBtn,
                  (!wins.trim() && !struggles.trim() && !questions.trim()) && {
                    opacity: 0.4,
                  },
                ]}
                onPress={handleSubmit}
                disabled={!wins.trim() && !struggles.trim() && !questions.trim()}
              >
                <Feather name="send" size={16} color="#fff" />
                <Text style={styles.submitBtnText}>Send Check-In to Matt</Text>
              </Pressable>

              <Text style={styles.submitNote}>
                Matt reviews every check-in and replies within 24 hours.
              </Text>
            </View>
          )}

          {/* PAST CHECK-INS */}
          {recent.length > 0 && (
            <View style={styles.pastSection}>
              <Text style={styles.pastLabel}>PREVIOUS CHECK-INS</Text>
              {recent.map((c) => (
                <View key={c.id} style={styles.pastCard}>
                  <View style={styles.pastTop}>
                    <Text style={styles.pastWeek}>{weekLabel(c.weekOf)}</Text>
                    <View style={styles.pastRatings}>
                      <Text style={[styles.pastRatingVal, { color: qualityColor(c.trainingQuality) }]}>
                        T: {c.trainingQuality}/10
                      </Text>
                      <Text style={[styles.pastRatingVal, { color: qualityColor(c.energyRecovery) }]}>
                        E: {c.energyRecovery}/10
                      </Text>
                    </View>
                  </View>
                  {!!c.wins && (
                    <Text style={styles.pastWins} numberOfLines={2}>
                      {c.wins}
                    </Text>
                  )}
                  {c.trainerReply ? (
                    <View style={styles.pastReply}>
                      <View style={styles.mattBadgeSm}>
                        <Text style={styles.mattBadgeSmText}>Matt</Text>
                      </View>
                      <Text style={styles.pastReplyText} numberOfLines={2}>
                        {c.trainerReply}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.pastPending}>No reply yet</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  dueBadge: {
    backgroundColor: `${C.orange}22`,
    borderWidth: 1,
    borderColor: `${C.orange}55`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dueText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  scroll: {
    padding: 16,
  },
  weekBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  weekLabel: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  submittedCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  submittedTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  submittedTitle: {
    color: C.green,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  ratingRow2: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  ratingMini: {
    alignItems: "center",
  },
  ratingMiniLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ratingMiniVal: {
    color: C.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  replyBox: {
    backgroundColor: `${C.orange}0d`,
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
  },
  replyHeader: {
    marginBottom: 6,
  },
  mattBadge: {
    backgroundColor: C.orange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  mattBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  replyText: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  pendingText: {
    color: C.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  ratingBlock: {
    marginBottom: 18,
  },
  ratingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fieldLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ratingValue: {
    color: C.orange,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  ratingChips: {
    flexDirection: "row",
    gap: 5,
  },
  ratingChip: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingNum: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  ratingHint: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 5,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
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
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: C.orange,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  submitNote: {
    color: C.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  pastSection: {
    marginTop: 8,
  },
  pastLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  pastCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  pastTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  pastWeek: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  pastRatings: {
    flexDirection: "row",
    gap: 8,
  },
  pastRatingVal: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  pastWins: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    marginBottom: 6,
  },
  pastReply: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  mattBadgeSm: {
    backgroundColor: C.orange,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 1,
  },
  mattBadgeSmText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  pastReplyText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
  },
  pastPending: {
    color: C.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: 4,
  },
});
