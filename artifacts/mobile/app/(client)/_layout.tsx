import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";

function getThisMonday() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return d.toISOString().split("T")[0];
}

function NativeTabLayout() {
  const { data, currentClientId } = useApp();
  const newProgramCount = (data.customPrograms || []).filter(
    (p) => p.clientId === currentClientId && p.status === "delivered" && !p.clientViewedAt
  ).length;
  const hasCheckedIn = (data.weeklyCheckIns || []).some(
    (c) => c.clientId === currentClientId && c.weekOf === getThisMonday()
  );

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Progress</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="checkin" badge={hasCheckedIn ? undefined : "!"}>
        <Icon sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }} />
        <Label>Check-In</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="programs" badge={newProgramCount > 0 ? String(newProgramCount) : undefined}>
        <Icon sf={{ default: "doc.text", selected: "doc.text.fill" }} />
        <Label>Programs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages">
        <Icon sf={{ default: "message", selected: "message.fill" }} />
        <Label>Messages</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <Icon sf={{ default: "calendar", selected: "calendar.fill" }} />
        <Label>Schedule</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { data, currentClientId } = useApp();
  const newProgramCount = (data.customPrograms || []).filter(
    (p) => p.clientId === currentClientId && p.status === "delivered" && !p.clientViewedAt
  ).length;
  const hasCheckedIn = (data.weeklyCheckIns || []).some(
    (c) => c.clientId === currentClientId && c.weekOf === getThisMonday()
  );

  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.orange,
        tabBarInactiveTintColor: C.dim,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : C.surface,
          borderTopWidth: 1,
          borderTopColor: C.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={24} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check-In",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="checkmark.circle" tintColor={color} size={24} />
            ) : (
              <Feather name="check-circle" size={22} color={color} />
            ),
          tabBarBadge: hasCheckedIn ? undefined : "!",
          tabBarBadgeStyle: { backgroundColor: C.orange },
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "Programs",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="doc.text" tintColor={color} size={24} />
            ) : (
              <Feather name="file-text" size={22} color={color} />
            ),
          tabBarBadge: newProgramCount > 0 ? newProgramCount : undefined,
          tabBarBadgeStyle: { backgroundColor: C.orange },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="message" tintColor={color} size={24} />
            ) : (
              <Feather name="message-square" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="calendar" tintColor={color} size={24} />
            ) : (
              <Feather name="calendar" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="trophy" tintColor={color} size={24} />
            ) : (
              <Feather name="award" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function ClientTabLayout() {
  const { currentClientId, isTrainer } = useApp();

  useEffect(() => {
    if (!currentClientId && !isTrainer) {
      router.replace("/");
    }
  }, [currentClientId, isTrainer]);

  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
