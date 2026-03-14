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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import C from "@/constants/colors";
import { LIFTS, fmt, fmtS, today, uid } from "@/utils/storage";
import { Tag } from "@/components/ui/Tag";
import { LiftChart } from "@/components/LiftChart";

type ClientView = "overview" | "log" | "messages" | "assessments";

export default function ClientsScreen() {
  const { data, updateData, logout } = useApp();
  const insets = useSafeAreaInsets();
  const [selId, setSelId] = useState<number | null>(null);
  const [view, setView] = useState<ClientView>("overview");
  const [search, setSearch] = useState("");

  // Log form
  const [logLift, setLogLift] = useState(LIFTS[0]);
  const [logWeight, setLogWeight] = useState("");
  const [logSets, setLogSets] = useState("");
  const [logReps, setLogReps] = useState("");
  const [logDate, setLogDate] = useState(today());
  const [logNote, setLogNote] = useState("");
  const [logErr, setLogErr] = useState("");
  const [logOk, setLogOk] = useState(false);

  // Note
  const [editNote, setEditNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Message reply
  const [replyMsgId, setReplyMsgId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [activeLift, setActiveLift] = useState(LIFTS[0]);

  const clients = data.clients.filter((c) =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const selClient = data.clients.find((c) => c.id === selId);

  const openClient = (id: number) => {
    setSelId(id);
    setView("overview");
    const c = data.clients.find((x) => x.id === id);
    setNoteText(c?.trainerNote || "");
    setActiveLift(LIFTS[0]);
  };

  const handleLog = () => {
    if (!+logWeight) {
      setLogErr("Enter a weight.");
      return;
    }
    updateData((d) => {
      const c = d.clients.find((x) => x.id === selId);
      if (c) {
        c.entries.push({
          lift: logLift,
          weight: +logWeight,
          sets: logSets ? +logSets : null,
          reps: logReps ? +logReps : null,
          date: logDate || today(),
          note: logNote,
        });
      }
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogWeight("");
    setLogSets("");
    setLogReps("");
    setLogNote("");
    setLogDate(today());
    setLogErr("");
    setLogOk(true);
    setTimeout(() => setLogOk(false), 3000);
  };

  const saveNote = () => {
    updateData((d) => {
      const c = d.clients.find((x) => x.id === selId);
      if (c) c.trainerNote = noteText;
      return d;
    });
    setEditNote(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReply = () => {
    if (!replyText.trim() || !replyMsgId) return;
    updateData((d) => {
      const c = d.clients.find((x) => x.id === selId);
      if (c) {
        const m = c.messages.find((x) => x.id === replyMsgId);
        if (m) {
          m.trainerReply = replyText.trim();
          m.trainerRead = true;
        }
      }
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReplyMsgId(null);
    setReplyText("");
  };

  const deleteClient = (id: number) => {
    updateData((d) => {
      d.clients = d.clients.filter((c) => c.id !== id);
      return d;
    });
    setSelId(null);
  };

  const unreadCount = (id: number) =>
    data.clients
      .find((c) => c.id === id)
      ?.messages.filter((m) => !m.trainerRead).length || 0;

  const getPR = (id: number, lift: string) => {
    const entries = data.clients
      .find((c) => c.id === id)
      ?.entries.filter((e) => e.lift === lift && e.weight);
    if (!entries?.length) return null;
    return Math.max(...entries.map((e) => e.weight));
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>M² Training</Text>
          <Text style={styles.headerSub}>Trainer Dashboard</Text>
        </View>
        <Pressable
          onPress={() => {
            logout();
          }}
        >
          <Feather name="log-out" size={20} color={C.dim} />
        </Pressable>
      </View>

      {/* CLIENT LIST */}
      {selId === null && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchRow}>
            <Feather name="search" size={16} color={C.dim} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search clients..."
              placeholderTextColor={C.muted}
            />
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
            {clients.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="users" size={36} color={C.muted} />
                <Text style={styles.emptyText}>
                  {search ? "No clients match your search." : "No clients yet."}
                </Text>
                {!search && (
                  <Text style={styles.emptySubText}>
                    Clients sign up from the home screen.
                  </Text>
                )}
              </View>
            ) : (
              clients.map((c) => {
                const uc = unreadCount(c.id);
                const sessions = [...new Set(c.entries.map((e) => e.date))].length;
                return (
                  <Pressable
                    key={c.id}
                    style={styles.clientCard}
                    onPress={() => openClient(c.id)}
                  >
                    <View style={styles.clientLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {c.name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{c.name}</Text>
                        {!!c.goal && (
                          <Text style={styles.clientGoal} numberOfLines={1}>
                            {c.goal}
                          </Text>
                        )}
                        <Text style={styles.clientMeta}>
                          @{c.username} · {sessions} sessions
                        </Text>
                      </View>
                    </View>
                    {uc > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{uc}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={18} color={C.muted} />
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* CLIENT DETAIL */}
      {selId !== null && selClient && (
        <View style={{ flex: 1 }}>
          {/* SUB-HEADER */}
          <View style={styles.subHeader}>
            <Pressable onPress={() => setSelId(null)} style={styles.backBtn}>
              <Feather name="arrow-left" size={20} color={C.dim} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientDetailName}>{selClient.name}</Text>
              {!!selClient.goal && (
                <Text style={styles.clientDetailGoal}>{selClient.goal}</Text>
              )}
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                deleteClient(selId);
              }}
            >
              <Feather name="trash-2" size={18} color={C.red} />
            </Pressable>
          </View>
          {/* VIEW TABS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.viewTabs}
          >
            {(["overview", "log", "messages", "assessments"] as ClientView[]).map(
              (v) => {
                const labels: Record<ClientView, string> = {
                  overview: "Overview",
                  log: "Log Lift",
                  messages: "Messages",
                  assessments: "Assessments",
                };
                return (
                  <Pressable
                    key={v}
                    onPress={() => setView(v)}
                    style={[
                      styles.viewTab,
                      view === v && styles.viewTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.viewTabText,
                        view === v && styles.viewTabTextActive,
                      ]}
                    >
                      {labels[v]}
                      {v === "messages" &&
                        unreadCount(selId) > 0 &&
                        ` (${unreadCount(selId)})`}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          {/* OVERVIEW */}
          {view === "overview" && (
            <ScrollView
              contentContainerStyle={[
                styles.scroll,
                {
                  paddingBottom:
                    (Platform.OS === "web" ? 34 : insets.bottom) + 100,
                },
              ]}
            >
              {/* PR row */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginBottom: 14 }}
              >
                {LIFTS.map((l) => {
                  const pr = getPR(selId, l);
                  return (
                    <View key={l} style={styles.prCard}>
                      <Text style={styles.prValue}>
                        {pr ? `${pr}` : "—"}
                      </Text>
                      <Text style={styles.prLabel}>
                        {l === "Overhead Press" ? "OHP" : l.split(" ")[0]}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Trainer note */}
              <View style={styles.noteCard}>
                <View style={styles.noteHeaderRow}>
                  <Text style={styles.noteLabel}>Trainer Note</Text>
                  <Pressable onPress={() => setEditNote(!editNote)}>
                    <Feather
                      name={editNote ? "x" : "edit-2"}
                      size={14}
                      color={C.dim}
                    />
                  </Pressable>
                </View>
                {editNote ? (
                  <>
                    <TextInput
                      style={styles.noteInput}
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Notes for this client..."
                      placeholderTextColor={C.muted}
                      multiline
                    />
                    <Pressable style={styles.saveNoteBtn} onPress={saveNote}>
                      <Text style={styles.saveNoteBtnText}>Save</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={styles.noteText}>
                    {selClient.trainerNote || "No note yet. Tap the edit button to add one."}
                  </Text>
                )}
              </View>

              {/* Chart */}
              <View style={styles.chartCard}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, marginBottom: 12 }}
                >
                  {LIFTS.map((l) => (
                    <Pressable
                      key={l}
                      onPress={() => setActiveLift(l)}
                      style={[
                        styles.liftTab,
                        activeLift === l && styles.liftTabActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.liftTabText,
                          activeLift === l && styles.liftTabTextActive,
                        ]}
                      >
                        {l}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <LiftChart entries={selClient.entries || []} lift={activeLift} />
              </View>

              {/* Recent entries */}
              <Text style={styles.sectionLabel}>RECENT ENTRIES</Text>
              {(selClient.entries || []).length === 0 ? (
                <Text style={styles.dimText}>No entries yet.</Text>
              ) : (
                [...(selClient.entries || [])]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 10)
                  .map((e, i) => (
                    <View key={i} style={styles.entryRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.entryLift}>{e.lift}</Text>
                        {!!e.note && (
                          <Text style={styles.entryNote}>{e.note}</Text>
                        )}
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.entryWeight}>{e.weight} lbs</Text>
                        {(e.sets || e.reps) && (
                          <Text style={styles.entrySetsReps}>
                            {e.sets}×{e.reps}
                          </Text>
                        )}
                        <Text style={styles.entryDate}>{fmtS(e.date)}</Text>
                      </View>
                    </View>
                  ))
              )}
            </ScrollView>
          )}

          {/* LOG LIFT */}
          {view === "log" && (
            <ScrollView
              contentContainerStyle={[
                styles.scroll,
                {
                  paddingBottom:
                    (Platform.OS === "web" ? 34 : insets.bottom) + 100,
                },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              {logOk && (
                <View style={styles.successBanner}>
                  <Feather name="check-circle" size={16} color={C.green} />
                  <Text style={styles.successText}>Entry logged!</Text>
                </View>
              )}
              <Text style={styles.fieldLabel}>Lift</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, marginBottom: 14 }}
              >
                {LIFTS.map((l) => (
                  <Pressable
                    key={l}
                    onPress={() => setLogLift(l)}
                    style={[
                      styles.liftTab,
                      logLift === l && styles.liftTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.liftTabText,
                        logLift === l && styles.liftTabTextActive,
                      ]}
                    >
                      {l}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.fieldLabel}>Weight (lbs) *</Text>
              <TextInput
                style={styles.input}
                value={logWeight}
                onChangeText={(t) => {
                  setLogWeight(t);
                  setLogErr("");
                }}
                placeholder="185"
                placeholderTextColor={C.muted}
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Sets</Text>
                  <TextInput
                    style={styles.input}
                    value={logSets}
                    onChangeText={setLogSets}
                    placeholder="3"
                    placeholderTextColor={C.muted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.fieldLabel}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    value={logReps}
                    onChangeText={setLogReps}
                    placeholder="5"
                    placeholderTextColor={C.muted}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={logDate}
                onChangeText={setLogDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.muted}
              />
              <Text style={styles.fieldLabel}>Note (optional)</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={logNote}
                onChangeText={setLogNote}
                placeholder="e.g. Form looked solid"
                placeholderTextColor={C.muted}
                multiline
              />
              {!!logErr && <Text style={styles.errText}>{logErr}</Text>}
              <Pressable style={styles.logBtn} onPress={handleLog}>
                <Text style={styles.logBtnText}>Log Entry</Text>
              </Pressable>
            </ScrollView>
          )}

          {/* MESSAGES */}
          {view === "messages" && (
            <ScrollView
              contentContainerStyle={[
                styles.scroll,
                {
                  paddingBottom:
                    (Platform.OS === "web" ? 34 : insets.bottom) + 100,
                },
              ]}
            >
              {(selClient.messages || []).length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="message-circle" size={28} color={C.muted} />
                  <Text style={styles.emptyText}>No messages from this client.</Text>
                </View>
              ) : (
                [...(selClient.messages || [])]
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                  .map((m) => (
                    <View key={m.id} style={styles.msgCard}>
                      <View style={styles.msgTop}>
                        <Tag
                          label={m.type.replace("_", " ")}
                          color={C.dim}
                        />
                        <Text style={styles.msgDate}>
                          {fmtS(m.timestamp.split("T")[0])}
                        </Text>
                      </View>
                      <Text style={styles.msgText}>{m.text}</Text>
                      {!!m.preferredDate && (
                        <Text style={styles.msgMeta}>
                          Preferred: {m.preferredDate}
                        </Text>
                      )}
                      {!!m.trainerReply && (
                        <View style={styles.replyBox}>
                          <Text style={styles.replyText}>{m.trainerReply}</Text>
                        </View>
                      )}
                      {!m.trainerReply && (
                        <Pressable
                          style={styles.replyBtn}
                          onPress={() => {
                            setReplyMsgId(m.id);
                            setReplyText("");
                          }}
                        >
                          <Feather name="corner-down-right" size={13} color={C.orange} />
                          <Text style={styles.replyBtnText}>Reply</Text>
                        </Pressable>
                      )}
                    </View>
                  ))
              )}
            </ScrollView>
          )}

          {/* ASSESSMENTS */}
          {view === "assessments" && (
            <ScrollView
              contentContainerStyle={[
                styles.scroll,
                {
                  paddingBottom:
                    (Platform.OS === "web" ? 34 : insets.bottom) + 100,
                },
              ]}
            >
              {(data.assessments || []).filter((a) => a.clientId === selId)
                .length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="clipboard" size={28} color={C.muted} />
                  <Text style={styles.emptyText}>No assessments yet.</Text>
                </View>
              ) : (
                (data.assessments || [])
                  .filter((a) => a.clientId === selId)
                  .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
                  .map((a) => (
                    <View key={a.id} style={styles.assessCard}>
                      <View style={styles.assessTop}>
                        <Tag
                          label={a.type === "video" ? "Video" : "Zoom"}
                          color={C.blue}
                        />
                        <Text style={styles.msgDate}>
                          {fmtS(a.submittedAt.split("T")[0])}
                        </Text>
                      </View>
                      {a.type === "video" && !!a.videoUrl && (
                        <Text style={styles.msgMeta}>Video: {a.videoUrl}</Text>
                      )}
                      {a.type === "zoom" && (
                        <Text style={styles.msgMeta}>
                          {a.zoomDate || ""} {a.zoomTime || ""}
                        </Text>
                      )}
                      {!!a.clientNotes && (
                        <Text style={styles.msgText}>{a.clientNotes}</Text>
                      )}
                      {!!a.trainerNotes && (
                        <View style={styles.replyBox}>
                          <Text style={styles.replyText}>
                            {a.trainerNotes}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* REPLY MODAL */}
      <Modal
        visible={!!replyMsgId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReplyMsgId(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setReplyMsgId(null)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>Reply to Message</Text>
            <View style={{ width: 22 }} />
          </View>
          <View style={styles.modalBody}>
            <TextInput
              style={[styles.noteInput, { minHeight: 120 }]}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Your reply..."
              placeholderTextColor={C.muted}
              multiline
              autoFocus
            />
            <Pressable
              style={[
                styles.logBtn,
                { marginTop: 8 },
                !replyText.trim() && { opacity: 0.4 },
              ]}
              disabled={!replyText.trim()}
              onPress={handleReply}
            >
              <Text style={styles.logBtnText}>Send Reply</Text>
            </Pressable>
          </View>
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
    color: C.orange,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  headerSub: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 10,
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
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  emptySubText: {
    color: C.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  clientCard: {
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
  clientLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${C.orange}22`,
    borderWidth: 1,
    borderColor: `${C.orange}44`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  clientName: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  clientGoal: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  clientMeta: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  badge: {
    backgroundColor: C.orange,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: C.white,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  subHeader: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  clientDetailName: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  clientDetailGoal: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  viewTabs: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  viewTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  viewTabActive: {
    borderColor: C.orange,
    backgroundColor: `${C.orange}15`,
  },
  viewTabText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  viewTabTextActive: {
    color: C.orange,
  },
  prCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 70,
  },
  prValue: {
    color: C.orange,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  prLabel: {
    color: C.muted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: `${C.orange}33`,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  noteHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteLabel: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  noteText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  noteInput: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 10,
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  saveNoteBtn: {
    backgroundColor: C.orange,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  saveNoteBtnText: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  chartCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  liftTab: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liftTabActive: {
    borderColor: C.orange,
    backgroundColor: `${C.orange}15`,
  },
  liftTabText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  liftTabTextActive: {
    color: C.orange,
  },
  sectionLabel: {
    color: C.dim,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  dimText: {
    color: C.muted,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  entryLift: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  entryNote: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  entryWeight: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  entrySetsReps: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  entryDate: {
    color: C.muted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
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
  errText: {
    color: C.red,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  logBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 4,
  },
  logBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  successBanner: {
    backgroundColor: `${C.green}18`,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  successText: {
    color: C.green,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  msgCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  msgTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  msgDate: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  msgText: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  msgMeta: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: 4,
  },
  replyBox: {
    backgroundColor: `${C.orange}0d`,
    borderLeftWidth: 2,
    borderLeftColor: C.orange,
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
  },
  replyText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  replyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  replyBtnText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  assessCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  assessTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  },
});
