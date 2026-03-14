import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { HelpRequest, uid } from "@/utils/storage";

type Category = "workout" | "lift" | "injury" | "badassery";

const CATEGORIES: { id: Category; label: string; desc: string }[] = [
  {
    id: "workout",
    label: "I need a workout",
    desc: "No gym, traveling, or just need direction",
  },
  {
    id: "lift",
    label: "Lift question",
    desc: "Technique, programming, or stuck on a number",
  },
  {
    id: "injury",
    label: "Something hurts",
    desc: "Pain, tightness, or something feels off",
  },
  {
    id: "badassery",
    label: "Pure badassery",
    desc: "You want to do something impressive. Matt will help.",
  },
];

export default function HelpScreen() {
  const { submitHelpRequest } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [details, setDetails] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [err, setErr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !category || !details.trim()) {
      setErr("Please fill out all required fields.");
      return;
    }
    const req: HelpRequest = {
      id: uid(),
      name: name.trim(),
      email: email.trim(),
      category,
      details: details.trim(),
      videoUrl: videoUrl.trim() || undefined,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    submitHelpRequest(req);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={C.dim} />
        </Pressable>
        <Text style={styles.logo}>Matt's Never Wrong</Text>
        <View style={{ width: 36 }} />
      </View>

      {submitted ? (
        <View style={styles.successScreen}>
          <View style={styles.successIconWrap}>
            <Feather name="check" size={40} color={C.orange} />
          </View>
          <Text style={styles.successTitle}>Message sent to Matt</Text>
          <Text style={styles.successText}>
            Matt will review your situation and get back to you. Usually within
            24 hours. Remember: Matt's never wrong.
          </Text>
          <Pressable style={styles.successBtn} onPress={() => router.back()}>
            <Text style={styles.successBtnText}>Back to home</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 40,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* INTRO */}
          <View style={styles.intro}>
            <Text style={styles.introTitle}>
              Stuck? Something hurts?{"\n"}Need a workout?
            </Text>
            <Text style={styles.introBody}>
              This is Matt's direct line. He personally reviews every
              submission. The price is whatever you feel like paying — minimum
              $1. Matt will give you a real answer.
            </Text>
          </View>

          {/* GUARANTEE */}
          <View style={styles.guaranteeCard}>
            <View style={styles.guaranteeTop}>
              <Feather name="shield" size={16} color={C.orange} />
              <Text style={styles.guaranteeTitle}>The Guarantee</Text>
            </View>
            <Text style={styles.guaranteeText}>
              Matt's never wrong. If he is, the next session is free. It has
              never happened.
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>Your name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setErr("");
              }}
              placeholder="John Smith"
              placeholderTextColor={C.muted}
            />

            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErr("");
              }}
              placeholder="john@email.com"
              placeholderTextColor={C.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Category *</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setCategory(cat.id);
                    setErr("");
                  }}
                  style={[
                    styles.catCard,
                    category === cat.id && styles.catCardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.catLabel,
                      category === cat.id && styles.catLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                  <Text style={styles.catDesc}>{cat.desc}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Tell Matt everything *</Text>
            <TextInput
              style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]}
              value={details}
              onChangeText={(t) => {
                setDetails(t);
                setErr("");
              }}
              placeholder="Don't hold back. The more detail, the better the answer."
              placeholderTextColor={C.muted}
              multiline
            />

            <Text style={styles.fieldLabel}>
              Video link{" "}
              <Text style={{ color: C.muted, fontFamily: "Inter_400Regular" }}>
                (optional — YouTube, Google Drive, etc.)
              </Text>
            </Text>
            <TextInput
              style={styles.input}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://..."
              placeholderTextColor={C.muted}
              autoCapitalize="none"
            />

            {/* PRICING */}
            <View style={styles.pricingCard}>
              <Text style={styles.pricingTitle}>Pay what you feel</Text>
              <Text style={styles.pricingBody}>
                Minimum $1. No maximum. Matt will give you the same quality
                answer regardless. Payment link sent with Matt's reply.
              </Text>
              <View style={styles.pricingRow}>
                {["$5", "$20", "$50", "???"].map((p) => (
                  <View key={p} style={styles.priceChip}>
                    <Text style={styles.priceChipText}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>

            {!!err && <Text style={styles.errText}>{err}</Text>}

            <Pressable
              style={[
                styles.submitBtn,
                (!name || !email || !category || !details) && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitBtnText}>Send to Matt</Text>
              <Feather name="send" size={16} color={C.white} />
            </Pressable>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0a0a09",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    color: C.orange,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
  },
  scroll: {
    padding: 20,
  },
  intro: {
    marginBottom: 18,
  },
  introTitle: {
    color: C.text,
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
    marginBottom: 10,
  },
  introBody: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  guaranteeCard: {
    backgroundColor: `${C.orange}10`,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  guaranteeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  guaranteeTitle: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  guaranteeText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  form: {
    gap: 0,
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
    marginBottom: 16,
  },
  catGrid: {
    gap: 8,
    marginBottom: 16,
  },
  catCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 13,
  },
  catCardActive: {
    borderColor: C.orange,
    backgroundColor: `${C.orange}10`,
  },
  catLabel: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  catLabelActive: {
    color: C.orange,
  },
  catDesc: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  pricingCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.green}33`,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  pricingTitle: {
    color: C.green,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 5,
  },
  pricingBody: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 10,
  },
  pricingRow: {
    flexDirection: "row",
    gap: 8,
  },
  priceChip: {
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceChipText: {
    color: C.green,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  errText: {
    color: C.red,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${C.orange}15`,
    borderWidth: 2,
    borderColor: `${C.orange}40`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    color: C.text,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
  successBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  successBtnText: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
