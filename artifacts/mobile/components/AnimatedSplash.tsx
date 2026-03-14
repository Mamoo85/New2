import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import C from "@/constants/colors";

type Props = {
  onFinished: () => void;
};

const ND = Platform.OS !== "web";
const logoSource = require("../assets/images/logo.jpg");

const IMG_W = 220;
const IMG_H = 180;

const M_W = 200;
const M_H = 148;
const BAR_H = 32;
const PIL_W = 44;
const PIL_H = M_H - BAR_H;
const GAP = (M_W - PIL_W * 3) / 2;

const M_LEFT = (IMG_W - M_W) / 2;
const M_TOP = (IMG_H - M_H) / 2 - 8;

export function AnimatedSplash({ onFinished }: Props) {
  const pY0 = useRef(new Animated.Value(-180)).current;
  const pY1 = useRef(new Animated.Value(-180)).current;
  const pY2 = useRef(new Animated.Value(-180)).current;
  const barY = useRef(new Animated.Value(-180)).current;
  const barScaleY = useRef(new Animated.Value(1)).current;
  const flashOp = useRef(new Animated.Value(0)).current;

  const blocksOp = useRef(new Animated.Value(1)).current;
  const logoOp = useRef(new Animated.Value(0)).current;

  const glowOp = useRef(new Animated.Value(0)).current;
  const exitOp = useRef(new Animated.Value(1)).current;
  const exitSc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fast = { tension: 80, friction: 9, useNativeDriver: ND };
    const snap = { tension: 90, friction: 6, useNativeDriver: ND };

    Animated.sequence([
      Animated.parallel([
        Animated.spring(pY0, { toValue: 0, ...fast }),
        Animated.sequence([
          Animated.delay(50),
          Animated.spring(pY1, { toValue: 0, ...fast }),
        ]),
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(pY2, { toValue: 0, ...fast }),
        ]),
        Animated.sequence([
          Animated.delay(280),
          Animated.spring(barY, { toValue: 0, ...snap }),
        ]),
      ]),

      Animated.parallel([
        Animated.sequence([
          Animated.timing(barScaleY, { toValue: 1.12, duration: 40, useNativeDriver: ND }),
          Animated.spring(barScaleY, { toValue: 1, tension: 400, friction: 5, useNativeDriver: ND }),
        ]),
        Animated.sequence([
          Animated.timing(flashOp, { toValue: 0.6, duration: 35, useNativeDriver: ND }),
          Animated.timing(flashOp, { toValue: 0, duration: 120, useNativeDriver: ND }),
        ]),
      ]),

      Animated.parallel([
        Animated.timing(blocksOp, { toValue: 0, duration: 180, useNativeDriver: ND }),
        Animated.timing(logoOp, { toValue: 1, duration: 180, useNativeDriver: ND }),
        Animated.timing(glowOp, { toValue: 0.5, duration: 180, useNativeDriver: ND }),
      ]),

      Animated.delay(200),

      Animated.parallel([
        Animated.timing(exitOp, { toValue: 0, duration: 260, useNativeDriver: ND }),
        Animated.timing(exitSc, { toValue: 1.1, duration: 260, useNativeDriver: ND }),
        Animated.timing(glowOp, { toValue: 0, duration: 200, useNativeDriver: ND }),
      ]),
    ]).start(() => onFinished());
  }, []);

  return (
    <Animated.View
      style={[styles.container, { opacity: exitOp, transform: [{ scale: exitSc }] }]}
    >
      <Animated.View style={[styles.glow, { opacity: glowOp }]} />

      <View style={styles.stage}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: logoOp }]}>
          <Image source={logoSource} style={styles.logoImg} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, { opacity: blocksOp }]}>
          <View style={[styles.mBox, { left: M_LEFT, top: M_TOP }]}>
            <Animated.View
              style={[styles.crossbar, { transform: [{ translateY: barY }, { scaleY: barScaleY }] }]}
            />
            <Animated.View style={[styles.flashBar, { opacity: flashOp }]} />
            <Animated.View style={[styles.pillar, { left: 0, transform: [{ translateY: pY0 }] }]} />
            <Animated.View style={[styles.pillar, { left: PIL_W + GAP, transform: [{ translateY: pY1 }] }]} />
            <Animated.View style={[styles.pillar, { left: PIL_W * 2 + GAP * 2, transform: [{ translateY: pY2 }] }]} />
          </View>
        </Animated.View>
      </View>
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
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: C.orange,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 40,
    transform: [{ scaleY: 0.4 }],
  },
  stage: {
    width: IMG_W,
    height: IMG_H,
  },
  logoImg: {
    width: IMG_W,
    height: IMG_H,
  },
  mBox: {
    position: "absolute",
    width: M_W,
    height: M_H,
    overflow: "visible" as const,
  },
  crossbar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: M_W,
    height: BAR_H,
    backgroundColor: C.orange,
  },
  flashBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: M_W,
    height: BAR_H,
    backgroundColor: "#ffffff",
  },
  pillar: {
    position: "absolute",
    top: BAR_H,
    width: PIL_W,
    height: PIL_H,
    backgroundColor: C.orange,
  },
});
