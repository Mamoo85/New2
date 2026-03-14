import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Linking,
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

type ClientView = "overview" | "log" | "messages" | "assessments" | "programs";
type DashTab = "clients" | "mailing" | "signups" | "orders";

export default function ClientsScreen() {
  const { data, updateData, logout, saveProgram, deliverProgram, markStoreOrderSent } = useApp();
  const insets = useSafeAreaInsets();
  const [selId, setSelId] = useState<number | null>(null);
  const [view, setView] = useState<ClientView>("overview");
  const [search, setSearch] = useState("");
  const [dashTab, setDashTab] = useState<DashTab>("clients");

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

  // Program builder
  const [pgTitle, setPgTitle] = useState("");
  const [pgNotes, setPgNotes] = useState("");
  const [pgExName, setPgExName] = useState("");
  const [pgExSets, setPgExSets] = useState("");
  const [pgExReps, setPgExReps] = useState("");
  const [pgExWeight, setPgExWeight] = useState("");
  const [pgExRest, setPgExRest] = useState("");
  const [pgExCues, setPgExCues] = useState("");
  const [pgExercises, setPgExercises] = useState<Array<{
    id: string; name: string; sets: string; reps: string; weight: string; rest: string; coachingCues: string;
  }>>([]);
  const [pgEditId, setPgEditId] = useState<string | null>(null);
  const [pgOk, setPgOk] = useState("");

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
          {/* DASH TABS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dashTabs}
            contentContainerStyle={styles.dashTabsContent}
          >
            {(["clients", "mailing", "signups", "orders"] as DashTab[]).map((tab) => {
              const label = tab === "clients" ? "Clients" : tab === "mailing" ? "Mailing List" : tab === "signups" ? "Classes" : "Store Orders";
              const pendingOrders = (data.storeOrders || []).filter(o => o.status !== "sent").length;
              const count = tab === "clients" ? data.clients.length : tab === "mailing"
                ? [...new Set([
                    ...data.clients.filter(c => !!c.email).map(c => c.email!),
                    ...(data.groupClassInterests || []).map(g => g.email),
                  ])].length
                : tab === "signups"
                ? (data.groupClassInterests || []).length
                : pendingOrders;
              return (
                <Pressable
                  key={tab}
                  style={[styles.dashTab, dashTab === tab && styles.dashTabActive]}
                  onPress={() => setDashTab(tab)}
                >
                  <Text style={[styles.dashTabText, dashTab === tab && styles.dashTabTextActive]}>
                    {label}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.dashTabBadge, dashTab === tab && styles.dashTabBadgeActive]}>
                      <Text style={[styles.dashTabBadgeText, dashTab === tab && styles.dashTabBadgeTextActive]}>
                        {count}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* CLIENTS TAB */}
          {dashTab === "clients" && (
            <>
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
                  { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
                ]}
              >
                {clients.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Feather name="users" size={36} color={C.muted} />
                    <Text style={styles.emptyText}>
                      {search ? "No clients match your search." : "No clients yet."}
                    </Text>
                    {!search && (
                      <Text style={styles.emptySubText}>Clients sign up from the home screen.</Text>
                    )}
                  </View>
                ) : (
                  clients.map((c) => {
                    const uc = unreadCount(c.id);
                    const sessions = [...new Set(c.entries.map((e) => e.date))].length;
                    return (
                      <Pressable key={c.id} style={styles.clientCard} onPress={() => openClient(c.id)}>
                        <View style={styles.clientLeft}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                              {c.name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.clientName}>{c.name}</Text>
                            {!!c.goal && (
                              <Text style={styles.clientGoal} numberOfLines={1}>{c.goal}</Text>
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
            </>
          )}

          {/* MAILING LIST TAB */}
          {dashTab === "mailing" && (() => {
            const clientEmails = data.clients.filter(c => !!c.email).map(c => ({ name: c.name, email: c.email!, source: "client" as const }));
            const interestEmails = (data.groupClassInterests || []).map(g => ({ name: g.name, email: g.email, source: "signup" as const }));
            const allEmails = [...clientEmails];
            interestEmails.forEach(ie => {
              if (!allEmails.find(e => e.email.toLowerCase() === ie.email.toLowerCase())) {
                allEmails.push(ie);
              }
            });
            const mailtoAll = `mailto:?bcc=${allEmails.map(e => encodeURIComponent(`${e.name} <${e.email}>`)).join(",")}`;
            return (
              <View style={{ flex: 1 }}>
                <View style={styles.mailingHeader}>
                  <View>
                    <Text style={styles.mailingCount}>{allEmails.length} addresses</Text>
                    <Text style={styles.mailingNote}>Clients + class sign-up list</Text>
                  </View>
                  <Pressable
                    style={[styles.quickMailBtn, allEmails.length === 0 && { opacity: 0.4 }]}
                    disabled={allEmails.length === 0}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Linking.openURL(mailtoAll).catch(() => {});
                    }}
                  >
                    <Feather name="send" size={14} color="#fff" />
                    <Text style={styles.quickMailText}>Quick Email</Text>
                  </Pressable>
                </View>
                <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 }]}>
                  {allEmails.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Feather name="mail" size={36} color={C.muted} />
                      <Text style={styles.emptyText}>No emails yet.</Text>
                      <Text style={styles.emptySubText}>Clients who sign up will appear here.</Text>
                    </View>
                  ) : (
                    allEmails.map((e, i) => (
                      <Pressable
                        key={i}
                        style={styles.emailRow}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Linking.openURL(`mailto:${e.email}`).catch(() => {});
                        }}
                      >
                        <View style={styles.emailAvatar}>
                          <Text style={styles.emailAvatarText}>
                            {e.name.split(" ").map((x: string) => x[0]).join("").slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.emailName}>{e.name}</Text>
                          <Text style={styles.emailAddr}>{e.email}</Text>
                        </View>
                        <View style={[styles.sourceTag, e.source === "signup" && styles.sourceTagSignup]}>
                          <Text style={[styles.sourceTagText, e.source === "signup" && styles.sourceTagTextSignup]}>
                            {e.source === "client" ? "client" : "signup"}
                          </Text>
                        </View>
                        <Feather name="mail" size={16} color={C.muted} />
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            );
          })()}

          {/* CLASS SIGN-UPS TAB */}
          {dashTab === "signups" && (() => {
            const interests = data.groupClassInterests || [];
            const CLASS_LABELS: Record<string, string> = {
              weekend_rolling: "Weekend Rolling Classes",
              youth_14_16: "Youth 14–16",
              youth_17_18: "Youth 17–18",
            };
            return (
              <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 }]}>
                {interests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Feather name="calendar" size={36} color={C.muted} />
                    <Text style={styles.emptyText}>No sign-ups yet.</Text>
                    <Text style={styles.emptySubText}>When people express interest in group classes, they appear here.</Text>
                  </View>
                ) : (
                  <>
                    {(["weekend_rolling", "youth_14_16", "youth_17_18"] as const).map((cls) => {
                      const group = interests.filter(i => i.classType === cls);
                      if (group.length === 0) return null;
                      return (
                        <View key={cls} style={{ marginBottom: 20 }}>
                          <Text style={styles.signupGroupLabel}>{CLASS_LABELS[cls]} ({group.length})</Text>
                          {group.map((sg) => (
                            <Pressable
                              key={sg.id}
                              style={styles.signupCard}
                              onPress={() => Linking.openURL(`mailto:${sg.email}`).catch(() => {})}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={styles.signupName}>{sg.name}</Text>
                                <Text style={styles.signupEmail}>{sg.email}</Text>
                                {!!sg.phone && <Text style={styles.signupMeta}>{sg.phone}</Text>}
                                {!!sg.athleteName && <Text style={styles.signupMeta}>Athlete: {sg.athleteName}</Text>}
                                {!!sg.sport && <Text style={styles.signupMeta}>Sport: {sg.sport}</Text>}
                                {!!sg.notes && <Text style={styles.signupNote} numberOfLines={2}>{sg.notes}</Text>}
                              </View>
                              <Feather name="mail" size={16} color={C.muted} />
                            </Pressable>
                          ))}
                        </View>
                      );
                    })}
                  </>
                )}
              </ScrollView>
            );
          })()}

          {/* STORE ORDERS TAB */}
          {dashTab === "orders" && (() => {
            const orders = [...(data.storeOrders || [])].sort(
              (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
            );
            const STATUS_COLOR: Record<string, string> = {
              pending: C.orange,
              building: "#4a9eff",
              sent: C.green,
            };
            const STATUS_LABEL: Record<string, string> = {
              pending: "Pending",
              building: "Building",
              sent: "Sent",
            };
            return (
              <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 }]}>
                {orders.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Feather name="shopping-bag" size={36} color={C.muted} />
                    <Text style={styles.emptyText}>No store orders yet.</Text>
                    <Text style={styles.emptySubText}>When someone buys a custom workout program, their intake shows up here.</Text>
                  </View>
                ) : (
                  orders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                      {/* Header row */}
                      <View style={styles.orderHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.orderName}>{order.name}</Text>
                          <Pressable onPress={() => Linking.openURL(`mailto:${order.email}`).catch(() => {})}>
                            <Text style={styles.orderEmail}>{order.email}</Text>
                          </Pressable>
                        </View>
                        <View style={[styles.orderStatusBadge, { borderColor: STATUS_COLOR[order.status] + "60", backgroundColor: STATUS_COLOR[order.status] + "18" }]}>
                          <Text style={[styles.orderStatusText, { color: STATUS_COLOR[order.status] }]}>
                            {STATUS_LABEL[order.status]}
                          </Text>
                        </View>
                      </View>

                      {/* Intake details */}
                      <View style={styles.orderDetails}>
                        <View style={styles.orderDetailRow}>
                          <Text style={styles.orderDetailLabel}>Level</Text>
                          <Text style={styles.orderDetailValue}>{order.level.charAt(0).toUpperCase() + order.level.slice(1)}</Text>
                        </View>
                        {!!order.phone && (
                          <View style={styles.orderDetailRow}>
                            <Text style={styles.orderDetailLabel}>Phone</Text>
                            <Text style={styles.orderDetailValue}>{order.phone}</Text>
                          </View>
                        )}
                        {!!order.equipment && (
                          <View style={styles.orderDetailRow}>
                            <Text style={styles.orderDetailLabel}>Equipment</Text>
                            <Text style={styles.orderDetailValue}>{order.equipment}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.orderSection}>
                        <Text style={styles.orderSectionLabel}>Goals</Text>
                        <Text style={styles.orderSectionText}>{order.goals}</Text>
                      </View>

                      {!!order.notes && (
                        <View style={styles.orderSection}>
                          <Text style={styles.orderSectionLabel}>Additional notes</Text>
                          <Text style={styles.orderSectionText}>{order.notes}</Text>
                        </View>
                      )}

                      {/* Action buttons */}
                      <View style={styles.orderActions}>
                        <Pressable
                          style={styles.orderActionEmail}
                          onPress={() => Linking.openURL(
                            `mailto:${order.email}?subject=Your Custom Workout Program — M² Training&body=Hi ${order.name.split(" ")[0]},\n\nHere is your custom workout program:\n\n[PROGRAM CONTENT]\n\nLet me know if you have any questions!\n\nMatt`
                          ).catch(() => {})}
                        >
                          <Feather name="mail" size={14} color={C.dim} />
                          <Text style={styles.orderActionEmailText}>Email Program</Text>
                        </Pressable>

                        {order.status !== "sent" && (
                          <Pressable
                            style={styles.orderActionSent}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                              markStoreOrderSent(order.id);
                            }}
                          >
                            <Feather name="check" size={14} color="#fff" />
                            <Text style={styles.orderActionSentText}>Mark Sent</Text>
                          </Pressable>
                        )}
                      </View>

                      <Text style={styles.orderDate}>
                        Received {new Date(order.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            );
          })()}
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
            {(["overview", "log", "messages", "assessments", "programs"] as ClientView[]).map(
              (v) => {
                const labels: Record<ClientView, string> = {
                  overview: "Overview",
                  log: "Log Lift",
                  messages: "Messages",
                  assessments: "Assessments",
                  programs: "Programs",
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

          {/* PROGRAMS */}
          {view === "programs" && (
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
              {!!pgOk && (
                <View style={styles.successBanner}>
                  <Feather name="check-circle" size={16} color={C.green} />
                  <Text style={styles.successText}>{pgOk}</Text>
                </View>
              )}

              {/* Existing programs for this client */}
              {(() => {
                const clientPrograms = (data.customPrograms || [])
                  .filter((p) => p.clientId === selId)
                  .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
                if (clientPrograms.length > 0) {
                  return (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={styles.sectionLabel}>EXISTING PROGRAMS</Text>
                      {clientPrograms.map((p) => (
                        <View key={p.id} style={styles.pgExistingCard}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.pgExistingTitle}>
                              {p.title || "Untitled Program"}
                            </Text>
                            <Text style={styles.pgExistingMeta}>
                              {p.status === "requested"
                                ? "Requested"
                                : p.status === "draft"
                                ? "Draft"
                                : "Delivered"}
                              {p.exercises.length > 0
                                ? ` · ${p.exercises.length} exercises`
                                : ""}
                            </Text>
                          </View>
                          <View style={styles.pgExistingActions}>
                            {p.status !== "delivered" && (
                              <>
                                <Pressable
                                  style={[styles.pgDeliverBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }]}
                                  onPress={() => {
                                    setPgEditId(p.id);
                                    setPgTitle(p.title || "");
                                    setPgNotes(p.notes || "");
                                    setPgExercises(
                                      p.exercises.map((ex) => ({
                                        id: ex.id || uid(),
                                        name: ex.name,
                                        sets: ex.sets || "",
                                        reps: ex.reps || "",
                                        weight: ex.weight || "",
                                        rest: ex.rest || "",
                                        coachingCues: ex.coachingCues || "",
                                      }))
                                    );
                                  }}
                                >
                                  <Feather name="edit-2" size={12} color={C.dim} />
                                  <Text style={[styles.pgDeliverBtnText, { color: C.dim }]}>Edit</Text>
                                </Pressable>
                                <Pressable
                                  style={styles.pgDeliverBtn}
                                  onPress={() => {
                                    if (p.exercises.length === 0) {
                                      setPgOk("Add exercises before delivering.");
                                      setTimeout(() => setPgOk(""), 3000);
                                      return;
                                    }
                                    deliverProgram(p.id);
                                    Haptics.notificationAsync(
                                      Haptics.NotificationFeedbackType.Success
                                    );
                                    setPgOk("Program delivered!");
                                    setTimeout(() => setPgOk(""), 3000);
                                  }}
                                >
                                  <Feather name="send" size={12} color={C.white} />
                                  <Text style={styles.pgDeliverBtnText}>Deliver</Text>
                                </Pressable>
                              </>
                            )}
                            {p.status === "delivered" && (
                              <Tag label="Delivered" color={C.green} />
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                }
                return null;
              })()}

              {/* BUILD NEW PROGRAM */}
              <Text style={styles.sectionLabel}>
                {pgEditId ? "EDIT PROGRAM" : "BUILD NEW PROGRAM"}
              </Text>
              <View style={styles.pgBuilder}>
                <Text style={styles.fieldLabel}>Program Title *</Text>
                <TextInput
                  style={styles.input}
                  value={pgTitle}
                  onChangeText={setPgTitle}
                  placeholder="e.g. Off-Season Strength Phase 1"
                  placeholderTextColor={C.muted}
                />

                <Text style={styles.fieldLabel}>Notes for Client</Text>
                <TextInput
                  style={[styles.input, { minHeight: 60 }]}
                  value={pgNotes}
                  onChangeText={setPgNotes}
                  placeholder="Overall coaching notes..."
                  placeholderTextColor={C.muted}
                  multiline
                />

                {/* EXERCISE LIST */}
                {pgExercises.length > 0 && (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.fieldLabel}>
                      Exercises ({pgExercises.length})
                    </Text>
                    {pgExercises.map((ex, i) => (
                      <View key={ex.id} style={styles.pgExRow}>
                        <View style={styles.pgExNum}>
                          <Text style={styles.pgExNumText}>{i + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pgExRowName}>{ex.name}</Text>
                          <Text style={styles.pgExRowDetail}>
                            {[
                              ex.sets && `${ex.sets}s`,
                              ex.reps && `${ex.reps}r`,
                              ex.weight,
                              ex.rest && `rest ${ex.rest}`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Text>
                        </View>
                        <View style={styles.pgExActions}>
                          {i > 0 && (
                            <Pressable
                              onPress={() => {
                                setPgExercises((prev) => {
                                  const arr = [...prev];
                                  [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                                  return arr;
                                });
                              }}
                            >
                              <Feather name="chevron-up" size={16} color={C.dim} />
                            </Pressable>
                          )}
                          {i < pgExercises.length - 1 && (
                            <Pressable
                              onPress={() => {
                                setPgExercises((prev) => {
                                  const arr = [...prev];
                                  [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                                  return arr;
                                });
                              }}
                            >
                              <Feather name="chevron-down" size={16} color={C.dim} />
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => {
                              setPgExercises((prev) =>
                                prev.filter((x) => x.id !== ex.id)
                              );
                            }}
                          >
                            <Feather name="trash-2" size={14} color={C.red} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* ADD EXERCISE FORM */}
                <View style={styles.pgAddExCard}>
                  <Text style={styles.pgAddExTitle}>Add Exercise</Text>
                  <TextInput
                    style={styles.input}
                    value={pgExName}
                    onChangeText={setPgExName}
                    placeholder="Exercise name *"
                    placeholderTextColor={C.muted}
                  />
                  <View style={styles.row2}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        value={pgExSets}
                        onChangeText={setPgExSets}
                        placeholder="Sets"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <TextInput
                        style={styles.input}
                        value={pgExReps}
                        onChangeText={setPgExReps}
                        placeholder="Reps"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={styles.row2}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        value={pgExWeight}
                        onChangeText={setPgExWeight}
                        placeholder="Weight / load"
                        placeholderTextColor={C.muted}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <TextInput
                        style={styles.input}
                        value={pgExRest}
                        onChangeText={setPgExRest}
                        placeholder="Rest (e.g. 90s)"
                        placeholderTextColor={C.muted}
                      />
                    </View>
                  </View>
                  <TextInput
                    style={[styles.input, { minHeight: 50 }]}
                    value={pgExCues}
                    onChangeText={setPgExCues}
                    placeholder="Coaching cues (optional)"
                    placeholderTextColor={C.muted}
                    multiline
                  />
                  <Pressable
                    style={[
                      styles.pgAddExBtn,
                      !pgExName.trim() && { opacity: 0.4 },
                    ]}
                    disabled={!pgExName.trim()}
                    onPress={() => {
                      setPgExercises((prev) => [
                        ...prev,
                        {
                          id: uid(),
                          name: pgExName.trim(),
                          sets: pgExSets,
                          reps: pgExReps,
                          weight: pgExWeight,
                          rest: pgExRest,
                          coachingCues: pgExCues,
                        },
                      ]);
                      setPgExName("");
                      setPgExSets("");
                      setPgExReps("");
                      setPgExWeight("");
                      setPgExRest("");
                      setPgExCues("");
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Feather name="plus" size={14} color={C.white} />
                    <Text style={styles.pgAddExBtnText}>Add Exercise</Text>
                  </Pressable>
                </View>

                {/* SAVE / DELIVER */}
                <View style={{ gap: 8, marginTop: 10 }}>
                  <Pressable
                    style={[
                      styles.logBtn,
                      (!pgTitle.trim() || pgExercises.length === 0) && {
                        opacity: 0.4,
                      },
                    ]}
                    disabled={!pgTitle.trim() || pgExercises.length === 0}
                    onPress={() => {
                      const prog = {
                        id: pgEditId || uid(),
                        clientId: selId!,
                        title: pgTitle.trim(),
                        notes: pgNotes.trim(),
                        exercises: pgExercises.map((ex) => ({
                          id: ex.id,
                          name: ex.name,
                          sets: ex.sets,
                          reps: ex.reps,
                          weight: ex.weight,
                          rest: ex.rest,
                          coachingCues: ex.coachingCues,
                        })),
                        status: "draft" as const,
                        requestedAt:
                          (data.customPrograms || []).find(
                            (p) => p.id === pgEditId
                          )?.requestedAt || new Date().toISOString(),
                      };
                      saveProgram(prog);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      );
                      setPgOk("Program saved as draft!");
                      setPgTitle("");
                      setPgNotes("");
                      setPgExercises([]);
                      setPgEditId(null);
                      setTimeout(() => setPgOk(""), 3000);
                    }}
                  >
                    <Text style={styles.logBtnText}>Save as Draft</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.logBtn,
                      { backgroundColor: C.green },
                      (!pgTitle.trim() || pgExercises.length === 0) && {
                        opacity: 0.4,
                      },
                    ]}
                    disabled={!pgTitle.trim() || pgExercises.length === 0}
                    onPress={() => {
                      const progId = pgEditId || uid();
                      const prog = {
                        id: progId,
                        clientId: selId!,
                        title: pgTitle.trim(),
                        notes: pgNotes.trim(),
                        exercises: pgExercises.map((ex) => ({
                          id: ex.id,
                          name: ex.name,
                          sets: ex.sets,
                          reps: ex.reps,
                          weight: ex.weight,
                          rest: ex.rest,
                          coachingCues: ex.coachingCues,
                        })),
                        status: "delivered" as const,
                        requestedAt:
                          (data.customPrograms || []).find(
                            (p) => p.id === pgEditId
                          )?.requestedAt || new Date().toISOString(),
                        deliveredAt: new Date().toISOString(),
                      };
                      saveProgram(prog);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      );
                      setPgOk("Program delivered to client!");
                      setPgTitle("");
                      setPgNotes("");
                      setPgExercises([]);
                      setPgEditId(null);
                      setTimeout(() => setPgOk(""), 3000);
                    }}
                  >
                    <Text style={styles.logBtnText}>
                      Save & Deliver to Client
                    </Text>
                  </Pressable>
                </View>
              </View>
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
    color: C.dim,
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
    color: C.dim,
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
    color: C.dim,
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
    color: C.dim,
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
    color: C.dim,
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
    color: C.dim,
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
    color: C.dim,
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
  pgExistingCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pgExistingTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  pgExistingMeta: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  pgExistingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pgDeliverBtn: {
    backgroundColor: C.green,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pgDeliverBtnText: {
    color: C.white,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  pgBuilder: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 16,
  },
  pgExRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pgExNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${C.orange}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  pgExNumText: {
    color: C.orange,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  pgExRowName: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  pgExRowDetail: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  pgExActions: {
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  pgAddExCard: {
    backgroundColor: `${C.orange}08`,
    borderWidth: 1,
    borderColor: `${C.orange}22`,
    borderRadius: 8,
    padding: 14,
  },
  pgAddExTitle: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  pgAddExBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
  },
  pgAddExBtnText: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
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
  dashTabs: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
    flexShrink: 0,
  },
  dashTabsContent: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  dashTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 5,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  dashTabActive: {
    borderBottomColor: C.orange,
  },
  dashTabText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  dashTabTextActive: {
    color: C.orange,
  },
  dashTabBadge: {
    backgroundColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
  },
  dashTabBadgeActive: {
    backgroundColor: `${C.orange}22`,
  },
  dashTabBadgeText: {
    color: C.dim,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  dashTabBadgeTextActive: {
    color: C.orange,
  },
  mailingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  mailingCount: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  mailingNote: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  quickMailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.orange,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickMailText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  emailAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${C.orange}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  emailAvatarText: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  emailName: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  emailAddr: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  sourceTag: {
    backgroundColor: `${C.orange}14`,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sourceTagSignup: {
    backgroundColor: `${C.green}14`,
  },
  sourceTagText: {
    color: C.orange,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  sourceTagTextSignup: {
    color: C.green,
  },
  signupGroupLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  signupCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  signupName: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  signupEmail: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  signupMeta: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  signupNote: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  orderName: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  orderEmail: {
    color: C.orange,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
  orderStatusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orderStatusText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  orderDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  orderDetailRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orderDetailLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  orderDetailValue: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  orderSection: {
    marginBottom: 10,
  },
  orderSectionLabel: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  orderSectionText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  orderActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  orderActionEmail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 10,
  },
  orderActionEmailText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  orderActionSent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: C.green,
  },
  orderActionSentText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  orderDate: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
