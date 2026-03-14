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
import { TRAINER_PASSWORD } from "@/utils/storage";

type Mode = "choose" | "trainer" | "client" | "signup";

export default function LoginScreen() {
  const { data, loginTrainer, loginClient, signUp } = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>("choose");
  const [pw, setPw] = useState("");
  const [user, setUser] = useState("");
  const [cpw, setCpw] = useState("");
  const [err, setErr] = useState("");

  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suUser, setSuUser] = useState("");
  const [suPw, setSuPw] = useState("");
  const [suPw2, setSuPw2] = useState("");
  const [suGoal, setSuGoal] = useState("");

  const tryTrainer = () => {
    if (pw === TRAINER_PASSWORD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loginTrainer();
      router.replace("/(trainer)");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErr("Incorrect password.");
      setPw("");
    }
  };

  const tryClient = () => {
    const f = data.clients.find(
      (c) =>
        c.username?.toLowerCase() === user.toLowerCase() &&
        c.clientPassword === cpw
    );
    if (f) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loginClient(f.id);
      router.replace("/(client)");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErr("Incorrect username or password.");
      setCpw("");
    }
  };

  const trySignUp = () => {
    if (
      !suName.trim() ||
      !suUser.trim() ||
      !suPw.trim() ||
      !suEmail.trim()
    ) {
      setErr("All fields are required.");
      return;
    }
    if (suPw !== suPw2) {
      setErr("Passwords don't match.");
      return;
    }
    if (
      data.clients.find(
        (c) => c.username?.toLowerCase() === suUser.toLowerCase()
      )
    ) {
      setErr("Username already taken.");
      return;
    }
    const id = signUp({
      name: suName,
      email: suEmail,
      goal: suGoal,
      username: suUser,
      clientPassword: suPw,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loginClient(id);
    router.replace("/(client)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0a0a09" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 10 },
        ]}
      >
        <Pressable
          onPress={() => {
            if (mode !== "choose") {
              setMode("choose");
              setErr("");
            } else {
              router.back();
            }
          }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={20} color={C.dim} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.logo}>M² Training</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "choose" && (
          <View style={styles.center}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Choose how you want to sign in</Text>
            <View style={styles.choiceGroup}>
              <Pressable
                style={[styles.choiceBtn, { backgroundColor: C.orange }]}
                onPress={() => {
                  setMode("client");
                  setErr("");
                }}
              >
                <Text style={styles.choiceBtnText}>Client login</Text>
              </Pressable>
              <Pressable
                style={[styles.choiceBtn, { backgroundColor: C.green }]}
                onPress={() => {
                  setMode("signup");
                  setErr("");
                }}
              >
                <Text style={styles.choiceBtnText}>Create account</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.choiceBtn,
                  {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: C.border,
                  },
                ]}
                onPress={() => {
                  setMode("trainer");
                  setErr("");
                }}
              >
                <Text style={[styles.choiceBtnText, { color: C.dim }]}>
                  Trainer login
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                style={{ marginTop: 4 }}
              >
                <Text style={styles.backLink}>← Back to home</Text>
              </Pressable>
            </View>
          </View>
        )}

        {mode === "trainer" && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Trainer Access</Text>
            <Text style={styles.formLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Trainer password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={pw}
              onChangeText={(t) => {
                setPw(t);
                setErr("");
              }}
              onSubmitEditing={tryTrainer}
              returnKeyType="go"
              autoFocus
            />
            {!!err && <Text style={styles.errText}>{err}</Text>}
            <Pressable style={styles.primaryBtn} onPress={tryTrainer}>
              <Text style={styles.primaryBtnText}>Sign in</Text>
            </Pressable>
          </View>
        )}

        {mode === "client" && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Client Login</Text>
            <Text style={styles.formLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Your username"
              placeholderTextColor={C.muted}
              value={user}
              onChangeText={(t) => {
                setUser(t);
                setErr("");
              }}
              autoCapitalize="none"
              autoFocus
            />
            <Text style={styles.formLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={cpw}
              onChangeText={(t) => {
                setCpw(t);
                setErr("");
              }}
              onSubmitEditing={tryClient}
              returnKeyType="go"
            />
            {!!err && <Text style={styles.errText}>{err}</Text>}
            <Pressable style={styles.primaryBtn} onPress={tryClient}>
              <Text style={styles.primaryBtnText}>Sign in</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode("signup");
                setErr("");
              }}
              style={{ marginTop: 16, alignItems: "center" }}
            >
              <Text style={styles.linkText}>
                No account?{" "}
                <Text style={{ color: C.orange }}>Sign up</Text>
              </Text>
            </Pressable>
          </View>
        )}

        {mode === "signup" && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formLabel}>Full name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Smith"
              placeholderTextColor={C.muted}
              value={suName}
              onChangeText={(t) => {
                setSuName(t);
                setErr("");
              }}
              autoFocus
            />
            <Text style={styles.formLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="john@email.com"
              placeholderTextColor={C.muted}
              value={suEmail}
              onChangeText={(t) => {
                setSuEmail(t);
                setErr("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.formLabel}>Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="jsmith"
              placeholderTextColor={C.muted}
              value={suUser}
              onChangeText={(t) => {
                setSuUser(t);
                setErr("");
              }}
              autoCapitalize="none"
            />
            <Text style={styles.formLabel}>
              Goal{" "}
              <Text style={{ color: C.muted, fontFamily: "Inter_400Regular" }}>
                (optional)
              </Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Get stronger"
              placeholderTextColor={C.muted}
              value={suGoal}
              onChangeText={setSuGoal}
            />
            <Text style={styles.formLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a password"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={suPw}
              onChangeText={(t) => {
                setSuPw(t);
                setErr("");
              }}
            />
            <Text style={styles.formLabel}>Confirm password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm"
              placeholderTextColor={C.muted}
              secureTextEntry
              value={suPw2}
              onChangeText={(t) => {
                setSuPw2(t);
                setErr("");
              }}
              onSubmitEditing={trySignUp}
              returnKeyType="go"
            />
            {!!err && <Text style={styles.errText}>{err}</Text>}
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: C.green }]}
              onPress={trySignUp}
            >
              <Text style={styles.primaryBtnText}>Create account</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
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
    letterSpacing: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  center: {
    alignItems: "center",
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  subtitle: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 36,
    textAlign: "center",
  },
  choiceGroup: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
    alignItems: "center",
  },
  choiceBtn: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  choiceBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  backLink: {
    color: C.muted,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
  form: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  formTitle: {
    color: C.text,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 24,
    textAlign: "center",
  },
  formLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    letterSpacing: 0.5,
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
    marginBottom: 16,
  },
  errText: {
    color: C.red,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  linkText: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
