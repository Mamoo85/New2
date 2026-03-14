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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { uid, nowTs } from "@/utils/storage";
import type { TrainingLevel } from "@/utils/storage";

const STRIPE_CHECKOUT_URL =
  "https://buy.stripe.com/test_cNi3cvggre7Y2ISe0ffbq00";

const LEVELS: { key: TrainingLevel; label: string; desc: string }[] = [
  {
    key: "beginner",
    label: "Beginner",
    desc: "New to structured training or returning after a long break",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    desc: "Training consistently for 1+ years with some structure",
  },
  {
    key: "advanced",
    label: "Advanced",
    desc: "Competitive athlete or serious lifter with specific performance goals",
  },
];

const WHAT_YOU_GET = [
  {
    icon: "clipboard" as const,
    title: "Full written program",
    desc: "Every exercise, set, rep, and rest period. No guessing.",
  },
  {
    icon: "target" as const,
    title: "Built around your goals",
    desc: "Not a template. Matt reads your intake and writes it for you.",
  },
  {
    icon: "tool" as const,
    title: "Equipment-specific",
    desc: "Works with what you have — gym, home, or a hotel room.",
  },
  {
    icon: "message-circle" as const,
    title: "Coaching cues included",
    desc: "Key technique notes on each movement so you do it right.",
  },
];

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { submitStoreOrder } = useApp();

  const [step, setStep] = useState<"info" | "submitting" | "done">("info");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [goals, setGoals] = useState("");
  const [level, setLevel] = useState<TrainingLevel>("intermediate");
  const [equipment, setEquipment] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!goals.trim()) e.goals = "Tell Matt what you're working toward";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("submitting");

    submitStoreOrder({
      id: uid(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      goals: goals.trim(),
      level,
      equipment: equipment.trim() || undefined,
      notes: notes.trim() || undefined,
      submittedAt: nowTs(),
      status: "pending",
    });

    try {
      const supported = await Linking.canOpenURL(STRIPE_CHECKOUT_URL);
      if (supported) {
        await Linking.openURL(STRIPE_CHECKOUT_URL);
      } else if (Platform.OS === "web") {
        window.open(STRIPE_CHECKOUT_URL, "_blank");
      }
    } catch {}

    setStep("done");
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

      {step === "done" ? (
        <View style={styles.doneWrap}>
          <Feather name="check-circle" size={56} color={C.green} />
          <Text style={styles.doneTitle}>You're all set.</Text>
          <Text style={styles.doneBody}>
            Your intake is saved. Once your payment goes through, Matt will
            build your custom workout program and send it to{" "}
            <Text style={{ color: C.orange }}>{email}</Text>. Usually within
            24 hours.
          </Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      ) : (
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
          {/* HERO */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>CUSTOM — ONE-TIME — $20</Text>
            <Text style={styles.heroTitle}>Your Custom Workout Program</Text>
            <Text style={styles.heroBody}>
              Fill out your intake below. Matt reads it, builds your program
              from scratch, and sends it to you. One workout, built
              specifically for you.
            </Text>
          </View>

          {/* WHAT YOU GET */}
          <Text style={styles.sectionTitle}>What you get</Text>
          <View style={styles.featuresGrid}>
            {WHAT_YOU_GET.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={18} color={C.orange} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* INTAKE FORM */}
          <Text style={styles.sectionTitle}>Your intake</Text>
          <Text style={styles.sectionSub}>
            Matt reads every field. The more detail you give, the better the
            program.
          </Text>

          <View style={styles.formCard}>
            <View style={styles.row}>
              <View style={[styles.fieldWrap, { flex: 1 }]}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputErr]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={C.muted}
                  autoCapitalize="words"
                />
                {errors.name ? (
                  <Text style={styles.errText}>{errors.name}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputErr]}
                value={email}
                onChangeText={setEmail}
                placeholder="Where Matt sends the program"
                placeholderTextColor={C.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <Text style={styles.errText}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Phone (optional)</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="In case Matt has a quick question"
                placeholderTextColor={C.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Training level *</Text>
              <View style={styles.levelRow}>
                {LEVELS.map((l) => (
                  <Pressable
                    key={l.key}
                    style={[
                      styles.levelBtn,
                      level === l.key && styles.levelBtnActive,
                    ]}
                    onPress={() => setLevel(l.key)}
                  >
                    <Text
                      style={[
                        styles.levelLabel,
                        level === l.key && styles.levelLabelActive,
                      ]}
                    >
                      {l.label}
                    </Text>
                    <Text
                      style={[
                        styles.levelDesc,
                        level === l.key && styles.levelDescActive,
                      ]}
                      numberOfLines={2}
                    >
                      {l.desc}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Goals *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textarea,
                  errors.goals && styles.inputErr,
                ]}
                value={goals}
                onChangeText={setGoals}
                placeholder="What are you trying to accomplish? Be specific — 'get stronger', 'lose weight', 'prep for a season', 'fix my back'..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={4}
              />
              {errors.goals ? (
                <Text style={styles.errText}>{errors.goals}</Text>
              ) : null}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Equipment available (optional)</Text>
              <TextInput
                style={styles.input}
                value={equipment}
                onChangeText={setEquipment}
                placeholder="Full gym, dumbbells, bands, bodyweight only, hotel room..."
                placeholderTextColor={C.muted}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Anything else Matt should know?</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Injuries, limitations, schedule, preferences..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* SUBMIT + CHECKOUT */}
          <Pressable
            style={[styles.buyBtn, step === "submitting" && styles.buyBtnDisabled]}
            onPress={handleSubmit}
            disabled={step === "submitting"}
          >
            <Text style={styles.buyBtnPrice}>$20</Text>
            <Text style={styles.buyBtnText}>
              {step === "submitting" ? "Saving & opening checkout..." : "Save intake + Checkout"}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>

          <Text style={styles.buyNote}>
            Secure checkout via Stripe. One-time payment. Matt builds your
            program after payment is confirmed.
          </Text>

          <View style={styles.guaranteeCard}>
            <Feather name="shield" size={22} color={C.green} />
            <Text style={styles.guaranteeTitle}>Matt's Guarantee</Text>
            <Text style={styles.guaranteeBody}>
              If the program isn't what you needed, email Matt and he'll either
              fix it or refund you. No forms, no drama.
            </Text>
          </View>
        </ScrollView>
      )}
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
  },
  heroCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
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
    marginBottom: 4,
  },
  sectionSub: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 14,
  },
  featuresGrid: {
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${C.orange}1a`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  featureDesc: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  inputErr: {
    borderColor: C.red,
  },
  textarea: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  errText: {
    color: C.red,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  levelRow: {
    gap: 8,
  },
  levelBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: C.bg,
  },
  levelBtnActive: {
    borderColor: C.orange,
    backgroundColor: `${C.orange}14`,
  },
  levelLabel: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  levelLabelActive: {
    color: C.orange,
  },
  levelDesc: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  levelDescActive: {
    color: C.dim,
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
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  buyNote: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 16,
  },
  guaranteeCard: {
    backgroundColor: `${C.green}14`,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  guaranteeTitle: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
    marginBottom: 6,
  },
  guaranteeBody: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    textAlign: "center",
  },
  doneWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  doneTitle: {
    color: C.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  doneBody: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    textAlign: "center",
  },
  doneBtn: {
    marginTop: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  doneBtnText: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
