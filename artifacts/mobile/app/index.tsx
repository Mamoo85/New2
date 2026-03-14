import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { BUSINESS } from "@/constants/contact";
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

        {/* STORE CARD */}
        <Pressable
          style={[styles.storeCard]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/store");
          }}
        >
          <View style={styles.storeCardInner}>
            <View style={styles.storeLeft}>
              <Text style={styles.storeLabel}>CUSTOM PROGRAM · $20</Text>
              <Text style={styles.storeTitle}>Your Custom Workout</Text>
              <Text style={styles.storeSub}>Matt reads your intake and builds a program from scratch — specific to your goals, equipment, and level.</Text>
            </View>
            <View style={styles.storeBadge}>
              <Feather name="package" size={22} color={C.orange} />
            </View>
          </View>
        </Pressable>

        {/* GROUP CLASSES CARD */}
        <Pressable
          style={styles.classCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/group-classes");
          }}
        >
          <View style={styles.classCardInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.classLabel}>WEEKEND & YOUTH PROGRAMS</Text>
              <Text style={styles.classTitle}>Group classes coming soon</Text>
              <Text style={styles.classSub}>Weekend rolling classes · Youth strength 14–16 · Youth strength 17–18</Text>
              <Text style={[styles.classSub, { color: C.orange, marginTop: 6 }]}>Sign up for early access →</Text>
            </View>
          </View>
        </Pressable>

        {/* WORK ONLINE SECTION */}
        <View style={styles.onlineSection}>
          <Text style={styles.onlineSectionTitle}>Work with Matt online</Text>
          <Text style={styles.onlineSectionSub}>No commute. No gym required.</Text>
          <View style={styles.onlineGrid}>
            {[
              { route: "/form-check", icon: "video" as const, label: "REMOTE · $20", title: "Form Check", sub: "Send a video. Get cues back." },
              { route: "/online-coaching", icon: "trending-up" as const, label: "MONTHLY · $100+", title: "Online Coaching", sub: "Programming + weekly check-ins." },
              { route: "/meet-prep", icon: "target" as const, label: "12–16 WEEKS", title: "Meet Prep", sub: "Peak for your competition." },
              { route: "/trainer-mentorship", icon: "users" as const, label: "TRAINERS ONLY", title: "Mentorship", sub: "Programming, coaching, business." },
            ].map((item) => (
              <Pressable
                key={item.route}
                style={styles.onlineCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as any);
                }}
              >
                <View style={styles.onlineCardIcon}>
                  <Feather name={item.icon} size={18} color={C.orange} />
                </View>
                <Text style={styles.onlineCardLabel}>{item.label}</Text>
                <Text style={styles.onlineCardTitle}>{item.title}</Text>
                <Text style={styles.onlineCardSub}>{item.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* STUDIO RENTAL CARD */}
        <Pressable
          style={styles.studioCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/studio-rental");
          }}
        >
          <View style={styles.studioCardInner}>
            <View style={styles.studioIconWrap}>
              <Feather name="home" size={20} color={C.dim} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studioLabel}>FOR TRAINERS</Text>
              <Text style={styles.studioTitle}>Lease studio time</Text>
              <Text style={styles.studioSub}>
                Certified trainers — rent the M² gym by the hour or block. Private, fully equipped, no overhead.
              </Text>
              <Text style={[styles.studioSub, { color: C.orange, marginTop: 6 }]}>
                Inquire about availability →
              </Text>
            </View>
          </View>
        </Pressable>

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
              <Text style={styles.helpTitle}>I Can Fix It</Text>
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

        {/* FIND US */}
        <View style={styles.findUsCard}>
          <Text style={styles.findUsLabel}>FIND US</Text>
          <Text style={styles.findUsName}>{BUSINESS.name}</Text>
          <Text style={styles.findUsAddress}>{BUSINESS.address1}{"\n"}{BUSINESS.address2}</Text>
          <Pressable
            style={styles.mapsBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL(BUSINESS.mapsUrl).catch(() => {});
            }}
          >
            <Feather name="map-pin" size={14} color={C.white} />
            <Text style={styles.mapsBtnText}>Get Directions</Text>
          </Pressable>
          <View style={styles.findUsSocial}>
            <Pressable
              style={styles.fbBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(BUSINESS.facebookUrl).catch(() => {});
              }}
            >
              <Ionicons name="logo-facebook" size={15} color={C.white} />
              <Text style={styles.fbBtnText}>Follow on Facebook</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() =>
              Linking.openURL(`mailto:${BUSINESS.email}`).catch(() => {})
            }
          >
            <Text style={styles.findUsEmail}>{BUSINESS.email}</Text>
          </Pressable>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} M² Training · Grosse Pointe Park, MI
          </Text>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.footerLink}>Client Portal</Text>
            </Pressable>
            <Text style={styles.footerDot}>·</Text>
            <Pressable
              onPress={() => Linking.openURL(BUSINESS.facebookUrl).catch(() => {})}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons name="logo-facebook" size={12} color={C.orange} />
              <Text style={styles.footerLink}>Facebook</Text>
            </Pressable>
          </View>
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
    fontSize: 13,
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
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  scroll: {
    padding: 0,
  },
  hero: {
    backgroundColor: "#0a0a09",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    padding: 16,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "flex-start",
  },
  heroTag: {
    color: C.orange,
    fontSize: 13,
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
    marginBottom: 14,
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
    paddingTop: 14,
    paddingBottom: 4,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 10,
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
    padding: 14,
  },
  portalCardLeft: {
    marginBottom: 14,
  },
  portalCardLabel: {
    color: C.orange,
    fontSize: 12,
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
    padding: 14,
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
    padding: 14,
  },
  teamLabel: {
    color: C.green,
    fontSize: 12,
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
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  cardLabel: {
    color: C.orange,
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 13,
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
  storeCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}55`,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  storeCardInner: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  storeLeft: {
    flex: 1,
  },
  storeLabel: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  storeTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  storeSub: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  storeBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${C.orange}1a`,
    alignItems: "center",
    justifyContent: "center",
  },
  classCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  classCardInner: {
    padding: 18,
  },
  classLabel: {
    color: C.green,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  classTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  classSub: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  onlineSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  onlineSectionTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  onlineSectionSub: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -4,
  },
  onlineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  onlineCard: {
    width: "47.5%",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  onlineCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${C.orange}1a`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  onlineCardLabel: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  onlineCardTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  onlineCardSub: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  studioCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  studioCardInner: {
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  studioIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  studioLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  studioTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  studioSub: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  helpCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  helpCardInner: {
    padding: 14,
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
  findUsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  findUsLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  findUsName: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  findUsAddress: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  mapsBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 4,
  },
  mapsBtnText: {
    color: C.white,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  findUsSocial: {
    flexDirection: "row",
    gap: 8,
  },
  fbBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#1877F2",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  fbBtnText: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  findUsEmail: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  footer: {
    marginHorizontal: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLink: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  footerDot: {
    color: C.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

