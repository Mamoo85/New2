import React from "react";
import { StyleSheet, Text, View } from "react-native";
import C from "@/constants/colors";

interface ProgressBarProps {
  value: number;
  goal: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  goal,
  color = C.orange,
  showLabel = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <View>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]}
        />
      </View>
      {showLabel && (
        <View style={styles.labels}>
          <Text style={styles.label}>
            {value.toLocaleString()} / {goal.toLocaleString()}
          </Text>
          <Text style={[styles.pct, { color }]}>{pct}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 5,
    backgroundColor: C.muted,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
    color: C.dim,
    fontFamily: "Inter_400Regular",
  },
  pct: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
