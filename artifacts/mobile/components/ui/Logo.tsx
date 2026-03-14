import React, { useEffect, useRef } from "react";
import { Animated, Image, Platform } from "react-native";

const logoSource = require("../../assets/images/logo.jpg");

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, number> = {
  sm: 38,
  md: 56,
  lg: 140,
};

type Props = {
  size?: LogoSize;
  animate?: boolean;
};

export function Logo({ size = "md", animate = false }: Props) {
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(animate ? 0.75 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    const useNative = Platform.OS !== "web";
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: useNative,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 55,
        friction: 7,
        useNativeDriver: useNative,
      }),
    ]).start();
  }, []);

  const dim = SIZES[size];

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <Image
        source={logoSource}
        style={{ width: dim, height: dim }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
