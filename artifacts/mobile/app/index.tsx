import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DEFAULT_QUOTES, Challenge } from "@/utils/storage";

export default function HomeScreen() {
  const { data, isLoading, currentClientId, isTrainer } = useApp();
  const insets = useSafeAreaInsets();
  const [quoteIdx] = useState(() =>
    Math.floor(Math.random() * DEFAULT_QUOTES.length)
  );

  useEffect(() => {
    if (!isLoading) {
      if (isTrainer) {
        router.replace("/(trainer)");
      } else if (currentClientId !== null) {
        router.replace("/(client)");
      }
    }
  }, [isLoading, isTrainer, currentClientId]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>M² Training</Text>
      </View>
    );
  }

  const hc = data.homeContent;
  const quotes = hc.quotes?.length ? hc.quotes : DEFAULT_QUOTES;
  const quote = quotes[quoteIdx % quotes.length];
  const activeChallenges = (data.challenges || []).filter((c) => c.active).slice(0, 3);

  const getTop = (ch: Challenge) =>
    (data.clients || [])
      .filter((cl) => (cl.challengeOptIns || {})[ch.id] !== false)
      .map((cl) => ({
        name: cl.name,
        total: (cl.challengeLogs || [])
          .filter((l) => l.challengeId === ch.id)
          .reduce((s, l) => s + l.amount, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* NAV */}
      <View
        style={[
          styles.nav,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top },
        ]}
      >
        <View>
          <Text style={styles.navTitle}>M² Training</Text>
          <Text style={styles.navSub}>Real training, real results</Text>
        </View>
        <View style={styles.navRight}>
          <Pressable
            style={styles.portalBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/login");
            }}
          >
            <Feather name="user" size={14} color={C.white} />
            <Text style={styles.portalBtnText}>Client Portal</Text>
          </Pressable>
          <Pressable
            style={styles.trainerBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/login");
            }}
          >
            <Text style={styles.trainerBtnText}>Trainer</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroTag}>PERSONAL TRAINING</Text>
          <Text style={styles.heroTitle}>
            Train smarter.{"\n"}Fix what's broken.{"\n"}Get stronger.
          </Text>
          <Text style={styles.heroSub}>
            Two decades of experience. Thousands of clients trained with zero
            injuries. From middle school athletes to Division I competitors
            — real training, real results.
          </Text>
          <Pressable
            style={styles.heroBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/login");
            }}
          >
            <Text style={styles.heroBtnText}>Get started</Text>
            <Feather name="arrow-right" size={16} color={C.white} />
          </Pressable>
        </View>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          {[
            { value: "20+", label: "Years" },
            { value: "50+", label: "College Athletes" },
            { value: "1000s", label: "Clients Trained" },
            { value: "Zero", label: "Injuries" },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* CLIENT PORTAL CTA */}
        <Pressable
          style={styles.portalCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/login");
          }}
        >
          <View style={styles.portalCardLeft}>
            <Text style={styles.portalCardLabel}>CURRENT CLIENTS</Text>
            <Text style={styles.portalCardTitle}>Already training with Matt?</Text>
            <Text style={styles.portalCardBody}>
              Log a lift  ·  View progress  ·  Book a session
            </Text>
          </View>
          <View style={styles.portalCardBtn}>
            <Text style={styles.portalCardBtnText}>Go to your portal</Text>
            <Feather name="arrow-right" size={14} color={C.white} />
          </View>
        </Pressable>

        {/* TEAM & YOUTH PROGRAMS */}
        <View style={styles.teamCard}>
          <Text style={styles.teamLabel}>TEAM & YOUTH PROGRAMS</Text>
          <Text style={styles.teamTitle}>
            Any team. Any sport. Any age.
          </Text>
          <Text style={styles.teamBody}>
            Custom one-time programs built specifically for your team — from
            middle school all the way through college. Matt builds the program
            for your coach to deliver, comes on-site to teach it, or trains
            the team directly. A day, a week, a month — whatever you need.
          </Text>
          <Text style={styles.teamCred}>
            20+ years developing athletes. 50+ college athletes produced. Zero
            injuries. Guaranteed results.
          </Text>
          <Pressable
            style={styles.teamBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/teams");
            }}
          >
            <Text style={styles.teamBtnText}>I Can Do That</Text>
            <Feather name="arrow-right" size={16} color={C.white} />
          </Pressable>
        </View>

        {/* QUOTE */}
        <View style={styles.quoteBanner}>
          <Text style={styles.quoteText}>"{quote}"</Text>
          <Text style={styles.quoteCredit}>— M² Training</Text>
        </View>

        {/* WORDS FROM MATT */}
        {!!hc.wordsFromMatt && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>WORDS FROM MATT</Text>
            <Text style={styles.cardBody}>{hc.wordsFromMatt}</Text>
          </View>
        )}

        {/* MONTHLY FOCUS */}
        {!!hc.monthlyFocus && (
          <View style={[styles.card, { borderColor: `${C.purple}44` }]}>
            <Text style={[styles.cardLabel, { color: C.purple }]}>
              MONTHLY FOCUS
            </Text>
            <Text style={styles.cardTitle}>
              {hc.monthlyFocusTitle || "This Month"}
            </Text>
            <Text style={styles.cardBody}>{hc.monthlyFocus}</Text>
          </View>
        )}

        {/* ACTIVE CHALLENGES */}
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACTIVE CHALLENGES</Text>
            {activeChallenges.map((ch) => {
              const top = getTop(ch);
              const totalAll = (data.clients || [])
                .flatMap((cl) =>
                  (cl.challengeLogs || []).filter(
                    (l) => l.challengeId === ch.id
                  )
                )
                .reduce((s, l) => s + l.amount, 0);
              const medals = ["1st", "2nd", "3rd"];
              const medalColors = [C.gold, C.silver, C.bronze];
              return (
                <View key={ch.id} style={styles.challengeCard}>
                  <Text style={styles.challengeName}>{ch.name}</Text>
                  {!!ch.description && (
                    <Text style={styles.challengeDesc}>{ch.description}</Text>
                  )}
                  <ProgressBar
                    value={totalAll}
                    goal={ch.goal}
                    color={C.green}
                  />
                  {top.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      {top.map((t, i) => (
                        <View key={i} style={styles.leaderRow}>
                          <Text
                            style={[
                              styles.leaderMedal,
                              { color: medalColors[i] },
                            ]}
                          >
                            {medals[i]}
                          </Text>
                          <Text style={styles.leaderName}>{t.name}</Text>
                          <Text
                            style={[
                              styles.leaderScore,
                              { color: medalColors[i] },
                            ]}
                          >
                            {t.total.toLocaleString()}{" "}
                            <Text style={{ color: C.dim, fontFamily: "Inter_400Regular" }}>
                              {ch.unit}
                            </Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* HELP CTA */}
        <Pressable
          style={styles.helpCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/help");
          }}
        >
          <View style={styles.helpCardInner}>
            <View>
              <Text style={styles.helpTitle}>Matt's Never Wrong</Text>
              <Text style={styles.helpSub}>
                Stuck? Something hurts? Need a workout?
              </Text>
              <Text style={[styles.helpSub, { color: C.orange, marginTop: 4 }]}>
                Pay what you feel →
              </Text>
            </View>
            <Feather name="arrow-right" size={20} color={C.orange} />
          </View>
        </Pressable>

        {/* FOOTER QUOTES */}
        <View style={styles.footerQuotes}>
          {quotes.slice(0, 4).map((q, i) => (
            <View key={i} style={styles.footerQuoteCard}>
              <Text style={styles.footerQuoteText}>"{q}"</Text>
            </View>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>M² Training · Real results.</Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.footerLink}>Client Portal</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: C.orange,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  nav: {
    backgroundColor: "#0a0a09",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navTitle: {
    color: C.orange,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  navSub: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  portalBtn: {
    backgroundColor: C.orange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  portalBtnText: {
    color: C.white,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  trainerBtn: {
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  trainerBtnText: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  scroll: {
    padding: 0,
  },
  hero: {
    backgroundColor: "#0a0a09",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    padding: 28,
    paddingTop: 36,
    paddingBottom: 36,
    alignItems: "flex-start",
  },
  heroTag: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    marginBottom: 12,
  },
  heroTitle: {
    color: C.text,
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    lineHeight: 42,
    marginBottom: 14,
  },
  heroSub: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 24,
  },
  heroBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 8,
  },
  heroBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: {
    color: C.orange,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: C.dim,
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
    textAlign: "center",
  },
  portalCard: {
    margin: 16,
    marginBottom: 6,
    backgroundColor: `${C.orange}12`,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 10,
    padding: 20,
  },
  portalCardLeft: {
    marginBottom: 14,
  },
  portalCardLabel: {
    color: C.orange,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 8,
  },
  portalCardTitle: {
    color: C.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  portalCardBody: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  portalCardBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  portalCardBtnText: {
    color: C.white,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  quoteBanner: {
    margin: 16,
    marginTop: 14,
    padding: 20,
    backgroundColor: `${C.orange}10`,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    borderRadius: 8,
    flexDirection: "column",
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: C.orange,
  },
  quoteText: {
    color: C.text,
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    lineHeight: 26,
  },
  quoteCredit: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  teamCard: {
    margin: 16,
    marginTop: 6,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 10,
    padding: 20,
  },
  teamLabel: {
    color: C.green,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 8,
  },
  teamTitle: {
    color: C.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  teamBody: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 10,
  },
  teamCred: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
    marginBottom: 16,
  },
  teamBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  teamBtnText: {
    color: C.white,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  cardLabel: {
    color: C.orange,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  cardTitle: {
    color: C.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  cardBody: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    color: C.dim,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  challengeCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  challengeName: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  challengeDesc: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  leaderMedal: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    minWidth: 28,
  },
  leaderName: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  leaderScore: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  helpCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  helpCardInner: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  helpTitle: {
    color: C.text,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  helpSub: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footerQuotes: {
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  footerQuoteCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
  },
  footerQuoteText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 20,
  },
  footer: {
    marginHorizontal: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: "center",
    gap: 10,
  },
  footerText: {
    color: C.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  footerLink: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
