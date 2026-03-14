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
import C from "@/constants/colors";

const WORKOUTS: { title: string; subtitle: string; desc: string; equipment: string }[] = [
  {
    title: "Hotel Room Hustle",
    subtitle: "Workout 1",
    desc: "Zero equipment, full body. Burpees, mountain climbers, push-up progressions, and a finisher that will make you question why you ever skipped a gym day.",
    equipment: "No equipment",
  },
  {
    title: "Airport Layover Circuit",
    subtitle: "Workout 2",
    desc: "20 minutes, anywhere. Walk, sprint, bodyweight squats and lunges in a stairwell. Matt's favorite way to keep people honest on long travel days.",
    equipment: "No equipment",
  },
  {
    title: "Parking Lot Power",
    subtitle: "Workout 3",
    desc: "Resistance band full-body session. Rows, presses, hinges, and carries — everything you need in a bag you can pack.",
    equipment: "Resistance band",
  },
  {
    title: "The Suitcase Session",
    subtitle: "Workout 4",
    desc: "Use your luggage as a weight. Suitcase carries, goblet squats, Romanian deadlifts, bent-over rows. Looks insane in the lobby. Works even better.",
    equipment: "Suitcase or bag",
  },
  {
    title: "Morning Activator",
    subtitle: "Workout 5",
    desc: "10-minute daily activation routine. Hips, thoracic spine, glutes, and shoulders — the stuff that breaks down when you travel. Do this before anything else.",
    equipment: "No equipment",
  },
  {
    title: "Upper Body Bodyweight Blast",
    subtitle: "Workout 6",
    desc: "Diamonds, wide, incline, decline, archer push-ups. Dips off a chair. Pike press. Pull-up progressions if you find a bar. Upper body destroyed, no gym needed.",
    equipment: "Optional: sturdy chair",
  },
  {
    title: "Lower Body on Lockdown",
    subtitle: "Workout 7",
    desc: "Pistol squat progressions, Bulgarian split squats with a bench, single-leg RDL, and jump variations. Your legs will remember this trip.",
    equipment: "Bench or chair",
  },
  {
    title: "The 30-Minute Road Reset",
    subtitle: "Workout 8",
    desc: "When you've been sitting in a car or plane all day. Full mobility and movement reboot — hip flexors, T-spine, hamstrings, and a light conditioning finish.",
    equipment: "No equipment",
  },
  {
    title: "Core Control",
    subtitle: "Workout 9",
    desc: "Real core training. Not crunches. Dead bugs, hollow holds, Pallof press variations, Copenhagen planks. The deep stability work Matt uses with every athlete.",
    equipment: "No equipment",
  },
  {
    title: "Conditioning Closer",
    subtitle: "Workout 10",
    desc: "High-intensity finisher. Tabata-style intervals, shadow boxing, jump squat variations, and burpee complexes. The one you save for when you need to sweat everything out.",
    equipment: "No equipment",
  },
];

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/workouts_on_the_road";

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const [purchasing, setPurchasing] = useState(false);

  const handleBuy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasing(true);
    try {
      if (Platform.OS === "web") {
        window.open("mailto:matthewmichels4@gmail.com?subject=Workouts on the Road — Purchase&body=Hi Matt, I'd like to purchase the Workouts on the Road pack for $20. Please send me the payment link!", "_blank");
      } else {
        await Linking.openURL(
          "mailto:matthewmichels4@gmail.com?subject=Workouts%20on%20the%20Road%20%E2%80%94%20Purchase&body=Hi%20Matt%2C%20I%27d%20like%20to%20purchase%20the%20Workouts%20on%20the%20Road%20pack%20for%20%2420.%20Please%20send%20me%20the%20payment%20link!"
        );
      }
    } catch {}
    setPurchasing(false);
  };

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
        <Text style={styles.headerTitle}>M² Store</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 100,
          },
        ]}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>DIGITAL PACK</Text>
          <Text style={styles.heroTitle}>Workouts on the Road</Text>
          <Text style={styles.heroBody}>
            10 complete workouts designed for athletes, coaches, and clients who travel. Hotel rooms, airports, parking lots — Matt has trained in all of them. Now you have his playbook.
          </Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroBadge}>
              <Feather name="file-text" size={14} color={C.orange} />
              <Text style={styles.heroBadgeText}>10 full workouts</Text>
            </View>
            <View style={styles.heroBadge}>
              <Feather name="download" size={14} color={C.orange} />
              <Text style={styles.heroBadgeText}>Delivered in-app</Text>
            </View>
            <View style={styles.heroBadge}>
              <Feather name="zap" size={14} color={C.orange} />
              <Text style={styles.heroBadgeText}>No gym needed</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.buyBtn, purchasing && styles.buyBtnDisabled]}
          onPress={handleBuy}
          disabled={purchasing}
        >
          <Text style={styles.buyBtnPrice}>$20</Text>
          <Text style={styles.buyBtnText}>
            {purchasing ? "Opening..." : "Get the Pack"}
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>

        <Text style={styles.buyNote}>
          Stripe checkout coming soon. Clicking above emails Matt directly to complete your purchase.
        </Text>

        <Text style={styles.sectionTitle}>What's Inside</Text>

        {WORKOUTS.map((w, i) => (
          <View key={i} style={styles.workoutCard}>
            <View style={styles.workoutTop}>
              <View style={styles.workoutNum}>
                <Text style={styles.workoutNumText}>{String(i + 1).padStart(2, "0")}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workoutSub}>{w.subtitle}</Text>
                <Text style={styles.workoutTitle}>{w.title}</Text>
              </View>
            </View>
            <Text style={styles.workoutDesc}>{w.desc}</Text>
            <View style={styles.workoutEquip}>
              <Feather name="box" size={12} color={C.muted} />
              <Text style={styles.workoutEquipText}>{w.equipment}</Text>
            </View>
          </View>
        ))}

        <View style={styles.guaranteeCard}>
          <Feather name="shield" size={24} color={C.green} />
          <Text style={styles.guaranteeTitle}>Matt's Guarantee</Text>
          <Text style={styles.guaranteeBody}>
            If you do these 10 workouts and don't feel like you got your $20 worth, email Matt and he'll give you a refund. No forms, no drama.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
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
  },
  heroCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heroLabel: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroTitle: {
    color: C.text,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  heroBody: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 16,
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: `${C.orange}14`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  buyBtn: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  buyBtnDisabled: {
    opacity: 0.6,
  },
  buyBtnPrice: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  buyBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  buyNote: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 16,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  workoutCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  workoutTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  workoutNum: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${C.orange}1a`,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutNumText: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  workoutSub: {
    color: C.muted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  workoutTitle: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  workoutDesc: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 10,
  },
  workoutEquip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  workoutEquipText: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  guaranteeCard: {
    backgroundColor: `${C.green}14`,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginTop: 6,
  },
  guaranteeTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 10,
    marginBottom: 8,
  },
  guaranteeBody: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    textAlign: "center",
  },
});
