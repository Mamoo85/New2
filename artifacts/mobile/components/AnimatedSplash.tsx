import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import C from "@/constants/colors";

type Props = {
  onFinished: () => void;
};

const ND = Platform.OS !== "web";

export function AnimatedSplash({ onFinished }: Props) {
  const scale = useRef(new Animated.Value(0.55)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Spring the logo in
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: ND,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: ND,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.55,
          duration: 400,
          useNativeDriver: ND,
        }),
      ]),

      // 2. Fade in the tagline
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: ND,
      }),

      // 3. Hold
      Animated.delay(700),

      // 4. Fade out + slight scale up (like zooming into the app)
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 380,
          useNativeDriver: ND,
        }),
        Animated.timing(exitScale, {
          toValue: 1.12,
          duration: 380,
          useNativeDriver: ND,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 260,
          useNativeDriver: ND,
        }),
      ]),
    ]).start(() => {
      onFinished();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: exitOpacity, transform: [{ scale: exitScale }] },
      ]}
    >
      {/* Glow ring behind logo */}
      <Animated.View
        style={[styles.glow, { opacity: glowOpacity }]}
      />

      {/* Logo mark */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity, transform: [{ scale }] },
        ]}
      >
        <View style={styles.logoBox}>
          <Text style={styles.logoM}>M</Text>
          <Text style={styles.logoSup}>2</Text>
        </View>

        <Animated.View style={[styles.tagWrap, { opacity: tagOpacity }]}>
          <View style={styles.tagLine} />
          <Text style={styles.tagText}>TRAINING</Text>
          <View style={styles.tagLine} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: C.orange,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 40,
    transform: [{ scaleY: 0.45 }],
  },
  logoWrap: {
    alignItems: "center",
    gap: 18,
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  logoM: {
    color: C.orange,
    fontSize: 88,
    fontFamily: "Inter_700Bold",
    lineHeight: 88,
    letterSpacing: -3,
  },
  logoSup: {
    color: C.orange,
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    lineHeight: 44,
    marginTop: 6,
  },
  tagWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tagLine: {
    width: 28,
    height: 1,
    backgroundColor: C.dim,
  },
  tagText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 5,
  },
});
