import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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
import C from "@/constants/colors";
import { BUSINESS } from "@/constants/contact";

const CONTACT_EMAIL = BUSINESS.email;
const SUBJECT = "Studio Rental Inquiry";

const WHAT_IS_INCLUDED: { icon: keyof typeof Feather.glyphMap; text: string }[] = [
  { icon: "zap", text: "Private, fully equipped strength gym" },
  { icon: "calendar", text: "Flexible hourly, half-day, or monthly blocks" },
  { icon: "lock", text: "Exclusive use — your sessions, your clients" },
  { icon: "wifi", text: "Sound system, mirrors, climate controlled" },
  { icon: "check-circle", text: "No overhead, no gym fees eating your margin" },
];

const WHO_IS_IT_FOR = [
  {
    title: "Independent trainers",
    body: "You have clients but need a real space. Rent time in a legit facility without committing to a long-term lease.",
  },
  {
    title: "Visiting coaches",
    body: "Coming through the area? Book a block for your athletes and train in a professional environment.",
  },
  {
    title: "Sports coaches",
    body: "Need off-season strength work for your team? Bring your group in and use the full facility.",
  },
];

function openEmail() {
  const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else if (Platform.OS === "web") {
      window.open(url, "_blank");
    }
  });
}

export default function StudioRentalScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={C.dim} />
        </Pressable>
        <Text style={styles.headerTitle}>Studio Rental</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 60,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTag}>TRAINER SPACE · M² STUDIO</Text>
          <Text style={styles.heroTitle}>Lease time at the gym.</Text>
          <Text style={styles.heroBody}>
            M² Training's private studio is available for certified trainers
            looking for a professional, fully equipped space to work with their
            clients — without the overhead of owning or leasing a full facility.
          </Text>
        </View>

        {/* WHAT'S INCLUDED */}
        <Text style={styles.sectionTitle}>What's included</Text>
        <View style={styles.includesCard}>
          {WHAT_IS_INCLUDED.map((item, i) => (
            <View key={i} style={styles.includeRow}>
              <View style={styles.includeIcon}>
                <Feather name={item.icon} size={16} color={C.orange} />
              </View>
              <Text style={styles.includeText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* WHO IS IT FOR */}
        <Text style={styles.sectionTitle}>Who it's for</Text>
        <View style={styles.whoGrid}>
          {WHO_IS_IT_FOR.map((w, i) => (
            <View key={i} style={styles.whoCard}>
              <Text style={styles.whoTitle}>{w.title}</Text>
              <Text style={styles.whoBody}>{w.body}</Text>
            </View>
          ))}
        </View>

        {/* PRICING NOTE */}
        <View style={styles.pricingCard}>
          <Feather name="dollar-sign" size={20} color={C.dim} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pricingTitle}>Pricing & availability</Text>
            <Text style={styles.pricingBody}>
              Rates depend on frequency, block length, and schedule. Email Matt
              directly — he'll give you a straight answer fast.
            </Text>
          </View>
        </View>

        {/* CONTACT CTA */}
        <Pressable
          style={styles.contactBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            openEmail();
          }}
        >
          <Feather name="mail" size={18} color="#fff" />
          <Text style={styles.contactBtnText}>Email Matt about studio time</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>

        <Text style={styles.emailNote}>{CONTACT_EMAIL}</Text>

        {/* BOTTOM NOTE */}
        <View style={styles.bottomNote}>
          <Feather name="info" size={14} color={C.dim} />
          <Text style={styles.bottomNoteText}>
            You must be a certified personal trainer or licensed coach to rent
            studio time. Matt reserves the right to decline any inquiry.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: C.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  heroCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 16,
    padding: 14,
  },
  heroTag: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroTitle: {
    color: C.text,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    lineHeight: 32,
  },
  heroBody: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
    marginBottom: 2,
  },
  includesCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  includeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${C.orange}1a`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  includeText: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  whoGrid: {
    gap: 10,
  },
  whoCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
  },
  whoTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  whoBody: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  pricingCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  pricingTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  pricingBody: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  contactBtn: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  contactBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "center",
  },
  emailNote: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  bottomNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  bottomNoteText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
});
