import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { BUSINESS } from "@/constants/contact";
import { TRAINER_PASSWORD } from "@/utils/storage";

WebBrowser.maybeCompleteAuthSession();

const ADMIN_EMAIL = BUSINESS.email;
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type Mode = "choose" | "email" | "email-trainer-pw" | "trainer-pw";

// ── Inner component that uses Google hook (only when Client ID is set) ───────
type GoogleBtnProps = {
  onSuccess: (token: string) => void;
  onError: (msg: string) => void;
};

function GoogleSignInButton({ onSuccess, onError }: GoogleBtnProps) {
  const [loading, setLoading] = useState(false);
  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      if (token) {
        onSuccess(token);
      } else {
        setLoading(false);
        onError("Google sign-in failed. No access token received.");
      }
    } else if (response?.type === "error") {
      setLoading(false);
      onError("Google sign-in failed. Try again.");
    } else if (response?.type === "dismiss") {
      setLoading(false);
    }
  }, [response]);

  return (
    <Pressable
      style={[styles.socialBtn, loading && styles.btnDisabled]}
      onPress={() => {
        setLoading(true);
        promptAsync();
      }}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={C.text} />
      ) : (
        <View style={styles.googleIcon}>
          <Text style={styles.googleIconText}>G</Text>
        </View>
      )}
      <Text style={styles.socialBtnText}>Continue with Google</Text>
    </Pressable>
  );
}

function GoogleButtonDisabled() {
  return (
    <Pressable style={[styles.socialBtn, styles.btnDisabled]}>
      <View style={styles.googleIcon}>
        <Text style={styles.googleIconText}>G</Text>
      </View>
      <Text style={[styles.socialBtnText, { color: C.dim }]}>
        Continue with Google
      </Text>
      <Text style={{ color: C.dim, fontSize: 13 }}>(setup needed)</Text>
    </Pressable>
  );
}

// ── Main login screen ────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { data, loginTrainer, loginClient, signUp } = useApp();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [trainerPw, setTrainerPw] = useState("");
  const [err, setErr] = useState("");

  const handleGoogleToken = async (token: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const info = (await res.json()) as {
        email?: string;
        name?: string;
      };
      const googleEmail = (info.email ?? "").toLowerCase();
      const googleName = info.name ?? googleEmail;

      if (googleEmail === ADMIN_EMAIL) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        loginTrainer();
        router.replace("/(trainer)");
        return;
      }

      finishClientLogin(googleEmail, googleName);
    } catch {
      setErr("Could not fetch your Google profile. Try again.");
    }
  };

  // ── Email-only login ────────────────────────────────────────────────────
  const handleEmailContinue = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      setErr("Enter a valid email address.");
      return;
    }
    setErr("");

    if (trimmed === ADMIN_EMAIL) {
      setMode("email-trainer-pw");
      return;
    }

    finishClientLogin(trimmed, "");
  };

  const handleEmailTrainerPw = () => {
    if (trainerPw === TRAINER_PASSWORD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loginTrainer();
      router.replace("/(trainer)");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErr("Incorrect password.");
      setTrainerPw("");
    }
  };

  const handleTrainerPw = () => {
    if (trainerPw === TRAINER_PASSWORD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loginTrainer();
      router.replace("/(trainer)");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErr("Incorrect password.");
      setTrainerPw("");
    }
  };

  const finishClientLogin = (emailAddr: string, name: string) => {
    const existing = data.clients.find(
      (c) => c.email?.toLowerCase() === emailAddr
    );
    if (existing) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loginClient(existing.id);
      router.replace("/(client)");
    } else {
      const displayName = name || emailAddr.split("@")[0];
      const newId = signUp({
        name: displayName,
        email: emailAddr,
        username: emailAddr,
        clientPassword: "",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loginClient(newId);
      router.replace("/(client)");
    }
  };

  const goBack = () => {
    if (mode !== "choose") {
      setMode("choose");
      setErr("");
      setEmail("");
      setTrainerPw("");
    } else {
      router.back();
    }
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
        <Pressable onPress={goBack} style={styles.backBtn}>
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
              (Platform.OS === "web" ? 34 : insets.bottom) + 40,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── CHOOSE ─────────────────────────────────────────────────── */}
        {mode === "choose" && (
          <View style={styles.center}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              20+ years. 50+ college athletes produced. Zero injuries.
            </Text>

            {GOOGLE_CLIENT_ID ? (
              <GoogleSignInButton
                onSuccess={handleGoogleToken}
                onError={(msg) => setErr(msg)}
              />
            ) : (
              <GoogleButtonDisabled />
            )}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.emailBtn}
              onPress={() => {
                setMode("email");
                setErr("");
              }}
            >
              <Feather name="mail" size={18} color="#fff" />
              <Text style={styles.emailBtnText}>Continue with Email</Text>
            </Pressable>

            {!!err && (
              <Text style={[styles.errText, { marginTop: 16 }]}>{err}</Text>
            )}

            <Pressable
              onPress={() => {
                setMode("trainer-pw");
                setErr("");
              }}
              style={{ marginTop: 16 }}
            >
              <Text style={styles.trainerLink}>Trainer access</Text>
            </Pressable>

            <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
              <Text style={styles.backLink}>Back to home</Text>
            </Pressable>
          </View>
        )}

        {/* ── EMAIL ENTRY ────────────────────────────────────────────── */}
        {mode === "email" && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Your email</Text>
            <Text style={styles.formSub}>
              Enter your email to sign in or create an account.
            </Text>

            <TextInput
              style={[styles.input, !!err && styles.inputErr]}
              placeholder="you@email.com"
              placeholderTextColor={C.dim}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErr("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              returnKeyType="go"
              onSubmitEditing={handleEmailContinue}
            />
            {!!err && <Text style={styles.errText}>{err}</Text>}

            <Pressable style={styles.primaryBtn} onPress={handleEmailContinue}>
              <Text style={styles.primaryBtnText}>Continue</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </Pressable>

            <Text style={styles.legalNote}>
              New to M² Training? An account is created automatically.
            </Text>
          </View>
        )}

        {/* ── ADMIN EMAIL → TRAINER PASSWORD ─────────────────────────── */}
        {mode === "email-trainer-pw" && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Trainer Access</Text>
            <Text style={styles.formSub}>
              Welcome back, Matt. Enter your trainer password to continue.
            </Text>

            <TextInput
              style={[styles.input, !!err && styles.inputErr]}
              placeholder="Trainer password"
              placeholderTextColor={C.dim}
              secureTextEntry
              value={trainerPw}
              onChangeText={(t) => {
                setTrainerPw(t);
                setErr("");
              }}
              autoFocus
              returnKeyType="go"
              onSubmitEditing={handleEmailTrainerPw}
            />
            {!!err && <Text style={styles.errText}>{err}</Text>}

            <Pressable
              style={[styles.primaryBtn, { backgroundColor: C.green }]}
              onPress={handleEmailTrainerPw}
            >
              <Text style={styles.primaryBtnText}>Sign in as Trainer</Text>
            </Pressable>
          </View>
        )}

        {/* ── DIRECT TRAINER PASSWORD ─────────────────────────────────── */}
        {mode === "trainer-pw" && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Trainer Access</Text>

            <TextInput
              style={[styles.input, !!err && styles.inputErr]}
              placeholder="Trainer password"
              placeholderTextColor={C.dim}
              secureTextEntry
              value={trainerPw}
              onChangeText={(t) => {
                setTrainerPw(t);
                setErr("");
              }}
              autoFocus
              returnKeyType="go"
              onSubmitEditing={handleTrainerPw}
            />
            {!!err && <Text style={styles.errText}>{err}</Text>}

            <Pressable
              style={[styles.primaryBtn, { backgroundColor: C.green }]}
              onPress={handleTrainerPw}
            >
              <Text style={styles.primaryBtnText}>Sign in</Text>
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
    paddingTop: 28,
  },
  center: {
    alignItems: "center",
  },
  title: {
    color: C.text,
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  subtitle: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  socialBtn: {
    width: "100%",
    maxWidth: 340,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1e1e1c",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  socialBtnText: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#4285F4",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 340,
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  emailBtn: {
    width: "100%",
    maxWidth: 340,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.orange,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  emailBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  trainerLink: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  backLink: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  form: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  formTitle: {
    color: C.text,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  formSub: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 16,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  inputErr: {
    borderColor: C.red,
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
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  legalNote: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
});
