import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { LIFTS, SUBSCRIPTION_PLANS, fmtS, fmt, getMonday } from "@/utils/storage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LiftChart } from "@/components/LiftChart";

export default function ClientProgressScreen() {
  const { data, currentClientId, logout } = useApp();
  const insets = useSafeAreaInsets();
  const [activeLift, setActiveLift] = useState(LIFTS[0]);

  const client = data.clients.find((c) => c.id === currentClientId);
  if (!client) return null;

  const thisMonday = getMonday();
  const hasCheckedIn = (data.weeklyCheckIns || []).some(
    (c) => c.clientId === currentClientId && c.weekOf === thisMonday
  );
  const sub = client.subscription;
  const planInfo = sub ? SUBSCRIPTION_PLANS[sub.plan] : null;

  const sessions = [...new Set((client.entries || []).map((e) => e.date))].length;
  const PRs: Record<string, number | null> = {};
  LIFTS.forEach((l) => {
    const es = (client.entries || []).filter((e) => e.lift === l && e.weight);
    PRs[l] = es.length ? Math.max(...es.map((e) => e.weight)) : null;
  });
  const recent = [...(client.entries || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <View>
          <Text style={styles.headerName}>{client.name}</Text>
          {!!client.goal && (
            <Text style={styles.headerGoal}>{client.goal}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.helpBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/help");
            }}
          >
            <Text style={styles.helpBtnText}>Get Help</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              logout();
              router.replace("/");
            }}
          >
            <Feather name="log-out" size={20} color={C.dim} />
          </Pressable>
        </View>
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
        {/* SUBSCRIPTION PLAN CARD */}
        {!!planInfo && sub && (
          <View
            style={[
              styles.planCard,
              { borderColor: `${planInfo.color}55` },
            ]}
          >
            <View style={styles.planRow}>
              <View
                style={[
                  styles.planBadge,
                  { backgroundColor: `${planInfo.color}22`, borderColor: `${planInfo.color}55` },
                ]}
              >
                <Text style={[styles.planBadgeText, { color: planInfo.color }]}>
                  {planInfo.label}
                </Text>
              </View>
              <Text style={styles.planPrice}>${planInfo.price}/mo</Text>
            </View>
            <Text style={styles.planTagline}>{planInfo.tagline}</Text>
            <Text style={styles.planStatus}>
              {sub.status === "active"
                ? "Your coaching plan is active"
                : sub.status === "paused"
                ? "Your plan is currently paused"
                : "Plan cancelled"}
            </Text>
          </View>
        )}

        {/* CHECK-IN CTA */}
        {!hasCheckedIn && (
          <Pressable
            style={styles.checkInCta}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(client)/checkin");
            }}
          >
            <View style={styles.checkInCtaLeft}>
              <Feather name="check-circle" size={20} color={C.orange} />
              <View>
                <Text style={styles.checkInCtaTitle}>Submit your check-in</Text>
                <Text style={styles.checkInCtaSub}>
                  Matt's waiting for your update this week
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={C.orange} />
          </Pressable>
        )}

        {/* STATS ROW */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <View style={[styles.statCard, { borderColor: `${C.orange}44` }]}>
            <Text style={[styles.statValue, { color: C.orange }]}>
              {sessions}
            </Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          {LIFTS.map((l) => (
            <View key={l} style={styles.statCard}>
              <Text
                style={[
                  styles.statValue,
                  { color: PRs[l] ? C.text : C.muted, fontSize: 16 },
                ]}
              >
                {PRs[l] ? `${PRs[l]}` : "—"}
              </Text>
              <Text style={styles.statLabel}>
                {l === "Overhead Press" ? "OHP" : l.split(" ")[0]} PR
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* TRAINER NOTE */}
        {!!client.trainerNote && (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Feather name="message-circle" size={14} color={C.orange} />
              <Text style={styles.noteLabel}>Notes from Matt</Text>
            </View>
            <Text style={styles.noteText}>{client.trainerNote}</Text>
          </View>
        )}

        {/* LIFT CHART */}
        <View style={styles.chartCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liftTabs}
          >
            {LIFTS.map((l) => (
              <Pressable
                key={l}
                onPress={() => {
                  setActiveLift(l);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.liftTab,
                  activeLift === l && styles.liftTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.liftTabText,
                    activeLift === l && styles.liftTabTextActive,
                  ]}
                >
                  {l}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <LiftChart entries={client.entries || []} lift={activeLift} />
        </View>

        {/* SESSION LOG */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SESSION LOG</Text>
          {recent.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="activity" size={32} color={C.muted} />
              <Text style={styles.emptyText}>No entries yet.</Text>
              <Text style={styles.emptySubText}>
                Your trainer will log your lifts here.
              </Text>
            </View>
          ) : (
            recent.map((e, i) => (
              <View key={i} style={styles.logRow}>
                <View style={styles.logLeft}>
                  <Text style={styles.logLift}>{e.lift}</Text>
                  {!!e.note && (
                    <Text style={styles.logNote} numberOfLines={1}>
                      {e.note}
                    </Text>
                  )}
                </View>
                <View style={styles.logRight}>
                  <Text style={styles.logWeight}>{e.weight} lbs</Text>
                  {(e.sets || e.reps) && (
                    <Text style={styles.logSetsReps}>
                      {e.sets}×{e.reps}
                    </Text>
                  )}
                  <Text style={styles.logDate}>{fmtS(e.date)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  headerName: {
    color: C.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  headerGoal: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  helpBtn: {
    borderWidth: 1,
    borderColor: `${C.orange}66`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  helpBtnText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 16,
  },
  statsRow: {
    paddingBottom: 4,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 72,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  statLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  noteCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  noteLabel: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  noteText: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  chartCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  liftTabs: {
    gap: 6,
    marginBottom: 14,
    flexDirection: "row",
  },
  liftTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  liftTabActive: {
    borderColor: C.orange,
    backgroundColor: `${C.orange}15`,
  },
  liftTabText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  liftTabTextActive: {
    color: C.orange,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
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
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logLeft: {
    flex: 1,
    paddingRight: 12,
  },
  logLift: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  logNote: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  logRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  logWeight: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  logSetsReps: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  logDate: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  planCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  planBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  planPrice: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  planTagline: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  planStatus: {
    color: C.green,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  checkInCta: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  checkInCtaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  checkInCtaTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  checkInCtaSub: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
