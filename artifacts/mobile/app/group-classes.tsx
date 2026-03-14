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
import { GroupClassType, uid, nowTs } from "@/utils/storage";

const CLASS_OPTIONS: {
  id: GroupClassType;
  label: string;
  ages: string;
  desc: string;
  days: string;
  price: string;
}[] = [
  {
    id: "weekend_rolling",
    label: "Weekend Rolling Classes",
    ages: "All Ages",
    desc: "Saturday morning group training sessions. Strength, movement, conditioning — built around whoever shows up. Rotating focus every week.",
    days: "Saturdays, rotating schedule",
    price: "Packages available",
  },
  {
    id: "youth_14_16",
    label: "Youth Strength — Ages 14–16",
    ages: "Ages 14–16",
    desc: "Foundational strength and movement training for young athletes. Learn to lift correctly, move well, and build a base that carries into high school and beyond.",
    days: "Weekends",
    price: "Group packages",
  },
  {
    id: "youth_17_18",
    label: "Youth Strength — Ages 17–18",
    ages: "Ages 17–18",
    desc: "Advanced youth training for athletes heading into college or serious competition. Sport-specific conditioning, strength development, and performance testing.",
    days: "Weekends",
    price: "Group packages",
  },
];

export default function GroupClassesScreen() {
  const { submitGroupInterest } = useApp();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<GroupClassType | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [athleteName, setAthleteName] = useState("");
  const [sport, setSport] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isYouth = selected === "youth_14_16" || selected === "youth_17_18";

  const handleSubmit = () => {
    if (!selected) {
      setErr("Please select a class type.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setErr("Name and email are required.");
      return;
    }
    submitGroupInterest({
      id: uid(),
      classType: selected,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      athleteName: athleteName.trim() || undefined,
      sport: sport.trim() || undefined,
      notes: notes.trim() || undefined,
      submittedAt: nowTs(),
    });
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
        <Text style={styles.headerTitle}>Group Classes</Text>
        <View style={{ width: 36 }} />
      </View>

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
        {submitted ? (
          <View style={styles.successBox}>
            <Feather name="check-circle" size={48} color={C.green} />
            <Text style={styles.successTitle}>You're on the list.</Text>
            <Text style={styles.successBody}>
              Matt will reach out once class schedules are confirmed. Keep an eye on your inbox.
            </Text>
            <Pressable style={styles.backHome} onPress={() => router.back()}>
              <Text style={styles.backHomeText}>Back to home</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.pageLabel}>INTEREST SIGN-UP</Text>
            <Text style={styles.pageTitle}>
              Weekend & Youth Programs
            </Text>
            <Text style={styles.pageBody}>
              Matt is gauging interest for group training packages. Sign up below and you'll be first to know when spots open — no commitment required.
            </Text>

            <Text style={styles.sectionTitle}>Select a Program</Text>

            {CLASS_OPTIONS.map((cls) => (
              <Pressable
                key={cls.id}
                style={[
                  styles.classCard,
                  selected === cls.id && styles.classCardSelected,
                ]}
                onPress={() => {
                  setSelected(cls.id);
                  setErr("");
                }}
              >
                <View style={styles.classCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.classLabel}>{cls.label}</Text>
                    <Text style={styles.classAges}>{cls.ages}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      selected === cls.id && styles.radioOuterSelected,
                    ]}
                  >
                    {selected === cls.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
                <Text style={styles.classDesc}>{cls.desc}</Text>
                <View style={styles.classMeta}>
                  <Feather name="calendar" size={12} color={C.muted} />
                  <Text style={styles.classMetaText}>{cls.days}</Text>
                  <Text style={styles.classDot}>·</Text>
                  <Feather name="package" size={12} color={C.muted} />
                  <Text style={styles.classMetaText}>{cls.price}</Text>
                </View>
              </Pressable>
            ))}

            <Text style={styles.sectionTitle}>Your Information</Text>

            <Text style={styles.fieldLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(t) => { setName(t); setErr(""); }}
              placeholder="Full name"
              placeholderTextColor={C.muted}
            />

            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setErr(""); }}
              placeholder="you@example.com"
              placeholderTextColor={C.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Phone (optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="For quick updates"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
            />

            {isYouth && (
              <>
                <Text style={styles.sectionTitle}>Athlete Info</Text>
                <Text style={styles.fieldLabel}>Athlete's Name</Text>
                <TextInput
                  style={styles.input}
                  value={athleteName}
                  onChangeText={setAthleteName}
                  placeholder="If different from above"
                  placeholderTextColor={C.muted}
                />
                <Text style={styles.fieldLabel}>Sport</Text>
                <TextInput
                  style={styles.input}
                  value={sport}
                  onChangeText={setSport}
                  placeholder="Football, basketball, soccer, etc."
                  placeholderTextColor={C.muted}
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Anything else Matt should know?</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Goals, schedule constraints, questions..."
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={3}
            />

            {!!err && <Text style={styles.errText}>{err}</Text>}

            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Count Me In</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>

            <Text style={styles.disclaimer}>
              No payment required now. Matt will confirm schedules and pricing with everyone on the list.
            </Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 20,
  },
  pageLabel: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pageTitle: {
    color: C.text,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  pageBody: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 28,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    marginTop: 8,
  },
  classCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  classCardSelected: {
    borderColor: C.orange,
    backgroundColor: `${C.orange}0d`,
  },
  classCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  classLabel: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  classAges: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  classDesc: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 10,
  },
  classMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  classMetaText: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  classDot: {
    color: C.muted,
    fontSize: 11,
    marginHorizontal: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: C.orange,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.orange,
  },
  fieldLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  textarea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  errText: {
    color: C.red,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: C.orange,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  disclaimer: {
    color: C.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 14,
    lineHeight: 18,
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  successTitle: {
    color: C.text,
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginTop: 20,
    marginBottom: 10,
  },
  successBody: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  backHome: {
    marginTop: 32,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  backHomeText: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
