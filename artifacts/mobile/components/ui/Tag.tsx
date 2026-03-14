import React from "react";
import { StyleSheet, Text, View } from "react-native";
import C from "@/constants/colors";

interface TagProps {
  label: string;
  color?: string;
}

export function Tag({ label, color = C.dim }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
