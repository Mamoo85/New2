import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { uid } from "@/utils/storage";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function TrainerChallengesScreen() {
  const { data, updateData } = useApp();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [unit, setUnit] = useState("");
  const [active, setActive] = useState(true);
  const [lbExpanded, setLbExpanded] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDesc("");
    setGoal("");
    setUnit("");
    setActive(true);
    setEditId(null);
  };

  const openEdit = (id: string) => {
    const c = data.challenges.find((x) => x.id === id);
    if (!c) return;
    setEditId(id);
    setName(c.name);
    setDesc(c.description || "");
    setGoal(String(c.goal));
    setUnit(c.unit);
    setActive(c.active);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim() || !+goal || !unit.trim()) return;
    updateData((d) => {
      if (editId) {
        const c = d.challenges.find((x) => x.id === editId);
        if (c) {
          c.name = name;
          c.description = desc;
          c.goal = +goal;
          c.unit = unit;
          c.active = active;
        }
      } else {
        d.challenges.push({
          id: uid(),
          name,
          description: desc,
          goal: +goal,
          unit,
          active,
        });
      }
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    updateData((d) => {
      d.challenges = d.challenges.filter((c) => c.id !== id);
      return d;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleActive = (id: string) => {
    updateData((d) => {
      const c = d.challenges.find((x) => x.id === id);
      if (c) c.active = !c.active;
      return d;
    });
  };

  const getRanked = (chId: string) =>
    (data.clients || [])
      .filter((cl) => (cl.challengeOptIns || {})[chId] !== false)
      .map((cl) => ({
        name: cl.name,
        id: cl.id,
        total: (cl.challengeLogs || [])
          .filter((l) => l.challengeId === chId)
          .reduce((s, l) => s + l.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

  const medalColors = [C.gold, C.silver, C.bronze];
  const medalLabels = ["1st", "2nd", "3rd"];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Challenges</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Feather name="plus" size={16} color={C.white} />
          <Text style={styles.addBtnText}>New</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 100,
          },
        ]}
      >
        {data.challenges.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="award" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No challenges yet.</Text>
            <Text style={styles.emptySubText}>
              Create a challenge to motivate your clients.
            </Text>
          </View>
        ) : (
          data.challenges.map((ch) => {
            const totalAll = (data.clients || [])
              .flatMap((cl) =>
                (cl.challengeLogs || []).filter((l) => l.challengeId === ch.id)
              )
              .reduce((s, l) => s + l.amount, 0);
            const ranked = getRanked(ch.id);
            const exp = lbExpanded === ch.id;

            return (
              <View key={ch.id} style={styles.challengeCard}>
                <View style={styles.challengeTop}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.challengeName,
                        !ch.active && { color: C.muted },
                      ]}
                    >
                      {ch.name}
                    </Text>
                    {!!ch.description && (
                      <Text style={styles.challengeDesc}>{ch.description}</Text>
                    )}
                    <Text style={styles.challengeMeta}>
                      Goal: {ch.goal.toLocaleString()} {ch.unit}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Switch
                      value={ch.active}
                      onValueChange={() => toggleActive(ch.id)}
                      thumbColor={ch.active ? C.orange : C.muted}
                      trackColor={{ false: C.border, true: `${C.orange}44` }}
                    />
                    <View style={styles.challengeActions}>
                      <Pressable onPress={() => openEdit(ch.id)}>
                        <Feather name="edit-2" size={15} color={C.dim} />
                      </Pressable>
                      <Pressable onPress={() => handleDelete(ch.id)}>
                        <Feather name="trash-2" size={15} color={C.red} />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <ProgressBar
                  value={totalAll}
                  goal={ch.goal}
                  color={ch.active ? C.green : C.muted}
                />
                <Pressable
                  style={styles.lbToggle}
                  onPress={() => setLbExpanded(exp ? null : ch.id)}
                >
                  <Feather
                    name="award"
                    size={13}
                    color={exp ? C.orange : C.dim}
                  />
                  <Text
                    style={[
                      styles.lbToggleText,
                      exp && { color: C.orange },
                    ]}
                  >
                    Leaderboard ({ranked.length} participants)
                  </Text>
                  <Feather
                    name={exp ? "chevron-up" : "chevron-down"}
                    size={13}
                    color={exp ? C.orange : C.muted}
                  />
                </Pressable>
                {exp && (
                  <View style={styles.lbExpanded}>
                    {ranked.length === 0 ? (
                      <Text style={styles.dimText}>No participants yet.</Text>
                    ) : (
                      ranked.map((item, i) => {
                        const mc = medalColors[i] || C.dim;
                        return (
                          <View key={item.id} style={styles.lbRow}>
                            <Text style={[styles.lbRank, { color: mc }]}>
                              {medalLabels[i] || `${i + 1}.`}
                            </Text>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                              <Text style={styles.lbName}>{item.name}</Text>
                              <ProgressBar
                                value={item.total}
                                goal={ch.goal}
                                color={mc}
                                showLabel={false}
                              />
                            </View>
                            <Text style={[styles.lbScore, { color: mc }]}>
                              {item.total.toLocaleString()}{" "}
                              <Text style={{ color: C.muted, fontFamily: "Inter_400Regular", fontSize: 11 }}>
                                {ch.unit}
                              </Text>
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>
              {editId ? "Edit Challenge" : "New Challenge"}
            </Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. 10,000 Push-Ups"
              placeholderTextColor={C.muted}
              autoFocus
            />
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]}
              value={desc}
              onChangeText={setDesc}
              placeholder="Optional description"
              placeholderTextColor={C.muted}
              multiline
            />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Goal *</Text>
                <TextInput
                  style={styles.input}
                  value={goal}
                  onChangeText={setGoal}
                  placeholder="10000"
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.fieldLabel}>Unit *</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="reps"
                  placeholderTextColor={C.muted}
                />
              </View>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Active</Text>
              <Switch
                value={active}
                onValueChange={setActive}
                thumbColor={active ? C.orange : C.muted}
                trackColor={{ false: C.border, true: `${C.orange}44` }}
              />
            </View>
            <Pressable
              style={[
                styles.saveBtn,
                (!name.trim() || !+goal || !unit.trim()) && { opacity: 0.4 },
              ]}
              disabled={!name.trim() || !+goal || !unit.trim()}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>
                {editId ? "Save Changes" : "Create Challenge"}
              </Text>
            </Pressable>
          </ScrollView>
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
  addBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  addBtnText: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 16,
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
  },
  challengeCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  challengeTop: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  challengeName: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 3,
  },
  challengeDesc: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  challengeMeta: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  challengeActions: {
    flexDirection: "row",
    gap: 12,
  },
  lbToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  lbToggleText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  lbExpanded: {
    marginTop: 10,
    gap: 8,
  },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lbRank: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    minWidth: 28,
  },
  lbName: {
    color: C.text,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  lbScore: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    minWidth: 50,
    textAlign: "right",
  },
  dimText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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
  },
  modalBody: {
    padding: 16,
    paddingBottom: 48,
  },
  fieldLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 13,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  row2: {
    flexDirection: "row",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 16,
  },
  saveBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 6,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
