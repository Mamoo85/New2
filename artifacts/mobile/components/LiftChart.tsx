import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import C from "@/constants/colors";
import { Entry, fmtS } from "@/utils/storage";

const { width } = Dimensions.get("window");
const CHART_W = width - 80;
const CHART_H = 80;
const PAD = 22;

interface LiftChartProps {
  entries: Entry[];
  lift: string;
}

export function LiftChart({ entries, lift }: LiftChartProps) {
  const pts = [...entries]
    .filter((e) => e.lift === lift && e.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);

  if (pts.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Not enough data yet</Text>
      </View>
    );
  }

  const weights = pts.map((e) => e.weight);
  const max = Math.max(...weights);
  const min = Math.min(...weights) * 0.92;
  const range = max - min || 1;
  const cW = CHART_W - PAD * 2;
  const cH = CHART_H - 14;

  const coords = pts.map((e, i) => ({
    x: PAD + (i / (pts.length - 1)) * cW,
    y: CHART_H - 7 - ((e.weight - min) / range) * cH,
    e,
  }));

  const pathD = coords
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const fillD = `${pathD} L${coords[coords.length - 1].x},${CHART_H} L${coords[0].x},${CHART_H} Z`;

  return (
    <View>
      <Svg width={CHART_W} height={CHART_H} style={{ overflow: "visible" }}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.orange} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={C.orange} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={fillD} fill="url(#grad)" />
        <Path
          d={pathD}
          fill="none"
          stroke={C.orange}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={C.bg}
            stroke={C.orange}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={styles.labels}>
        <Text style={styles.labelText}>{fmtS(pts[0].date)}</Text>
        <Text style={[styles.labelText, { color: C.orange }]}>
          PR: {max} lbs
        </Text>
        <Text style={styles.labelText}>{fmtS(pts[pts.length - 1].date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: C.muted,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  labelText: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
