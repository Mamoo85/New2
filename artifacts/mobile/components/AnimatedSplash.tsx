import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
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

const M_LEFT = (IMG_W - M_W) / 2;
const M_TOP = (IMG_H - M_H) / 2 - 8;

export function AnimatedSplash({ onFinished }: Props) {
  // Left pillar rises from below  → start at +220 (below), end at 0
  const pY0 = useRef(new Animated.Value(220)).current;
  // Right pillar rises from below (slight delay)
  const pY1 = useRef(new Animated.Value(220)).current;

  // Crossbar drops from above → start at -180 (above), end at 0
  const barY = useRef(new Animated.Value(-180)).current;
  const barScaleY = useRef(new Animated.Value(1)).current;

  const flashOp = useRef(new Animated.Value(0)).current;

  // Text reveal after snap
  const supOp = useRef(new Animated.Value(0)).current;
  const supSc = useRef(new Animated.Value(0.4)).current;
  const tagOp = useRef(new Animated.Value(0)).current;

  // Crossfade + exit
  const blocksOp = useRef(new Animated.Value(1)).current;
  const logoOp = useRef(new Animated.Value(0)).current;
  const glowOp = useRef(new Animated.Value(0)).current;
  const exitOp = useRef(new Animated.Value(1)).current;
  const exitSc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const up = { tension: 80, friction: 9, useNativeDriver: ND };
    const drop = { tension: 90, friction: 6, useNativeDriver: ND };

    Animated.sequence([
      // Phase 1: Left + right pillars rise (staggered), crossbar drops after
      Animated.parallel([
        Animated.spring(pY0, { toValue: 0, ...up }),
        Animated.sequence([
          Animated.delay(80),
          Animated.spring(pY1, { toValue: 0, ...up }),
        ]),
        Animated.sequence([
          Animated.delay(290),
          Animated.spring(barY, { toValue: 0, ...drop }),
        ]),
      ]),

      // Phase 2: Crossbar lock — squish bounce + white flash
      Animated.parallel([
        Animated.sequence([
          Animated.timing(barScaleY, {
            toValue: 1.14,
            duration: 40,
            useNativeDriver: ND,
          }),
          Animated.spring(barScaleY, {
            toValue: 1,
            tension: 400,
            friction: 5,
            useNativeDriver: ND,
          }),
        ]),
        Animated.sequence([
          Animated.timing(flashOp, {
            toValue: 0.65,
            duration: 35,
            useNativeDriver: ND,
          }),
          Animated.timing(flashOp, {
            toValue: 0,
            duration: 120,
            useNativeDriver: ND,
          }),
        ]),
      ]),

      // Phase 3: "2" superscript + "TRAINING" appear
      Animated.parallel([
        Animated.spring(supSc, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: ND,
        }),
        Animated.timing(supOp, {
          toValue: 1,
          duration: 150,
          useNativeDriver: ND,
        }),
        Animated.timing(tagOp, {
          toValue: 1,
          duration: 200,
          useNativeDriver: ND,
        }),
      ]),

      // Phase 4: Cross-fade blocks → real logo
      Animated.parallel([
        Animated.timing(blocksOp, {
          toValue: 0,
          duration: 180,
          useNativeDriver: ND,
        }),
        Animated.timing(logoOp, {
          toValue: 1,
          duration: 180,
          useNativeDriver: ND,
        }),
        Animated.timing(glowOp, {
          toValue: 0.5,
          duration: 180,
          useNativeDriver: ND,
        }),
      ]),

      Animated.delay(200),

      // Phase 5: Zoom-out exit
      Animated.parallel([
        Animated.timing(exitOp, {
          toValue: 0,
          duration: 260,
          useNativeDriver: ND,
        }),
        Animated.timing(exitSc, {
          toValue: 1.1,
          duration: 260,
          useNativeDriver: ND,
        }),
        Animated.timing(glowOp, {
          toValue: 0,
          duration: 200,
          useNativeDriver: ND,
        }),
      ]),
    ]).start(() => onFinished());
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: exitOp, transform: [{ scale: exitSc }] },
      ]}
    >
      <Animated.View style={[styles.glow, { opacity: glowOp }]} />

      <View style={styles.stage}>
        {/* Real logo — fades in during crossfade */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: logoOp }]}>
          <Image
            source={logoSource}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* SVG block assembly + text */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: blocksOp }]}>
          <View
            style={[styles.mWrap, { left: M_LEFT, top: M_TOP }]}
          >
            {/* Left pillar — rises from below */}
            <Animated.View
              style={[
                styles.pillar,
                { left: 0, top: BAR_H, transform: [{ translateY: pY0 }] },
              ]}
            >
              <Svg width={PIL_W} height={PIL_H}>
                <Rect width={PIL_W} height={PIL_H} fill={C.orange} />
              </Svg>
            </Animated.View>

            {/* Right pillar — rises from below (slight delay) */}
            <Animated.View
              style={[
                styles.pillar,
                {
                  left: M_W - PIL_W,
                  top: BAR_H,
                  transform: [{ translateY: pY1 }],
                },
              ]}
            >
              <Svg width={PIL_W} height={PIL_H}>
                <Rect width={PIL_W} height={PIL_H} fill={C.orange} />
              </Svg>
            </Animated.View>

            {/* Crossbar — drops from above */}
            <Animated.View
              style={[
                styles.crossbar,
                { transform: [{ translateY: barY }, { scaleY: barScaleY }] },
              ]}
            >
              <Svg width={M_W} height={BAR_H}>
                <Rect width={M_W} height={BAR_H} fill={C.orange} />
              </Svg>
            </Animated.View>

            {/* Lock flash overlay */}
            <Animated.View
              style={[styles.flashBar, { opacity: flashOp }]}
            />
          </View>

          {/* "2" superscript */}
          <Animated.Text
            style={[
              styles.sup,
              {
                position: "absolute",
                left: M_LEFT + M_W + 4,
                top: M_TOP - 4,
                opacity: supOp,
                transform: [{ scale: supSc }],
              },
            ]}
          >
            2
          </Animated.Text>

          {/* "training" wordmark */}
          <Animated.Text
            style={[
              styles.tagText,
              {
                position: "absolute",
                top: M_TOP + M_H + 12,
                left: 0,
                right: 0,
                textAlign: "center",
                opacity: tagOp,
              },
            ]}
          >
            training
          </Animated.Text>
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
  mWrap: {
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
  },
  sup: {
    color: C.orange,
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    lineHeight: 40,
  },
  tagText: {
    color: C.orange,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
});
