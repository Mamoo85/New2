import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { CustomProgram, fmt } from "@/utils/storage";

export default function ProgramsScreen() {
  const { data, currentClientId, requestProgram, markProgramViewed } = useApp();
  const insets = useSafeAreaInsets();
  const [viewProgram, setViewProgram] = useState<CustomProgram | null>(null);
  const [requested, setRequested] = useState(false);

  const client = data.clients.find((c) => c.id === currentClientId);
  if (!client) return null;

  const programs = (data.customPrograms || [])
    .filter((p) => p.clientId === currentClientId)
    .sort((a, b) => (b.deliveredAt || b.requestedAt).localeCompare(a.deliveredAt || a.requestedAt));

  const delivered = programs.filter((p) => p.status === "delivered");
  const pending = programs.filter((p) => p.status === "requested" || p.status === "draft");

  const hasPending = pending.length > 0;

  const handleRequest = () => {
    if (hasPending) return;
    requestProgram(currentClientId!);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRequested(true);
    setTimeout(() => setRequested(false), 4000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>My Programs</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{delivered.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* REQUEST BUTTON */}
        {requested ? (
          <View style={styles.successBanner}>
            <Feather name="check-circle" size={16} color={C.green} />
            <Text style={styles.successText}>
              Request sent! Matt will build your program.
            </Text>
          </View>
        ) : hasPending ? (
          <View style={[styles.requestBtn, { opacity: 0.4 }]}>
            <Feather name="clock" size={16} color={C.white} />
            <Text style={styles.requestBtnText}>Request Pending</Text>
          </View>
        ) : (
          <Pressable style={styles.requestBtn} onPress={handleRequest}>
            <Feather name="plus" size={16} color={C.white} />
            <Text style={styles.requestBtnText}>Request a Custom Program</Text>
          </Pressable>
        )}

        {/* PENDING */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IN PROGRESS</Text>
            {pending.map((p) => (
              <View key={p.id} style={styles.pendingCard}>
                <View style={styles.pendingIcon}>
                  <Feather name="clock" size={16} color={C.orange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingTitle}>
                    {p.title || "Custom Program"}
                  </Text>
                  <Text style={styles.pendingStatus}>
                    {p.status === "requested"
                      ? "Requested — Matt will start building it soon"
                      : "Matt is building your program"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* DELIVERED */}
        {delivered.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR PROGRAMS</Text>
            {delivered.map((p) => (
              <Pressable
                key={p.id}
                style={styles.programCard}
                onPress={() => {
                  setViewProgram(p);
                  if (!p.clientViewedAt) markProgramViewed(p.id);
                }}
              >
                <View style={styles.programIcon}>
                  <Feather name="file-text" size={20} color={C.orange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.programTitle}>
                    {p.title || "Custom Program"}
                  </Text>
                  <Text style={styles.programMeta}>
                    {p.exercises.length} exercise{p.exercises.length !== 1 ? "s" : ""}
                    {p.deliveredAt
                      ? ` · Delivered ${fmt(p.deliveredAt.split("T")[0])}`
                      : ""}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={C.muted} />
              </Pressable>
            ))}
          </View>
        ) : (
          pending.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="file-text" size={36} color={C.muted} />
              <Text style={styles.emptyText}>No programs yet.</Text>
              <Text style={styles.emptySubText}>
                Request a custom program and Matt will build one specifically
                for you.
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* PROGRAM DETAIL MODAL */}
      <Modal
        visible={!!viewProgram}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewProgram(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setViewProgram(null)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {viewProgram?.title || "Program"}
            </Text>
            <View style={{ width: 22 }} />
          </View>
          {viewProgram && (
            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* PROGRAM HEADER */}
              <View style={styles.docHeader}>
                <Text style={styles.docLogo}>M² Training</Text>
                <Text style={styles.docTitle}>{viewProgram.title}</Text>
                {viewProgram.deliveredAt && (
                  <Text style={styles.docDate}>
                    Delivered {fmt(viewProgram.deliveredAt.split("T")[0])}
                  </Text>
                )}
              </View>

              {/* NOTES */}
              {!!viewProgram.notes && (
                <View style={styles.docNotes}>
                  <Text style={styles.docNotesLabel}>Notes from Matt</Text>
                  <Text style={styles.docNotesText}>{viewProgram.notes}</Text>
                </View>
              )}

              {/* EXERCISES */}
              <Text style={styles.docSectionLabel}>EXERCISES</Text>
              {viewProgram.exercises.length === 0 ? (
                <Text style={styles.dimText}>No exercises listed.</Text>
              ) : (
                viewProgram.exercises.map((ex, i) => (
                  <View key={ex.id || i} style={styles.exerciseCard}>
                    <View style={styles.exerciseNum}>
                      <Text style={styles.exerciseNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <View style={styles.exerciseDetails}>
                        {!!ex.sets && (
                          <Text style={styles.exerciseDetail}>
                            {ex.sets} sets
                          </Text>
                        )}
                        {!!ex.reps && (
                          <Text style={styles.exerciseDetail}>
                            {ex.reps} reps
                          </Text>
                        )}
                        {!!ex.weight && (
                          <Text style={styles.exerciseDetail}>
                            {ex.weight}
                          </Text>
                        )}
                        {!!ex.rest && (
                          <Text style={styles.exerciseDetail}>
                            Rest: {ex.rest}
                          </Text>
                        )}
                      </View>
                      {!!ex.coachingCues && (
                        <View style={styles.cuesBox}>
                          <Text style={styles.cuesText}>{ex.coachingCues}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: C.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  countBadge: {
    backgroundColor: `${C.orange}22`,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  scroll: {
    padding: 16,
  },
  requestBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  requestBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  successBanner: {
    backgroundColor: `${C.green}18`,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  successText: {
    color: C.green,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    color: C.dim,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  pendingCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pendingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${C.orange}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  pendingStatus: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  programCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  programIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: `${C.orange}12`,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    alignItems: "center",
    justifyContent: "center",
  },
  programTitle: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  programMeta: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    color: C.dim,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  modal: {
    flex: 1,
    backgroundColor: C.bg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  modalBody: {
    padding: 20,
  },
  docHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  docLogo: {
    color: C.orange,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  docTitle: {
    color: C.text,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  docDate: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  docNotes: {
    backgroundColor: `${C.orange}0d`,
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
  },
  docNotesLabel: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  docNotesText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  docSectionLabel: {
    color: C.dim,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  dimText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  exerciseCard: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  exerciseNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${C.orange}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseNumText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  exerciseName: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  exerciseDetail: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cuesBox: {
    marginTop: 6,
    backgroundColor: `${C.green}0d`,
    borderLeftWidth: 2,
    borderLeftColor: C.green,
    padding: 8,
    borderRadius: 3,
  },
  cuesText: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
    fontStyle: "italic",
  },
});
