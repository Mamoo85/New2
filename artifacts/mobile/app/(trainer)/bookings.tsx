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
import {
  DAYS,
  STATUS_COLORS,
  STATUS_LABELS,
  AvailSlot,
  fmt,
  fmtS,
  fmtTime,
  today,
  uid,
} from "@/utils/storage";
import { Tag } from "@/components/ui/Tag";

const STATUSES = ["upcoming", "attended", "cancelled", "noshow"];

export default function BookingsScreen() {
  const { data, updateData } = useApp();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"bookings" | "availability">("bookings");
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotDay, setSlotDay] = useState(1);
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");

  const bookings = [...(data.bookings || [])].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const upcoming = bookings.filter(
    (b) => b.status === "upcoming" && b.date >= today()
  );
  const past = bookings.filter(
    (b) => b.date < today() || b.status !== "upcoming"
  );

  const getClient = (id: number) =>
    data.clients.find((c) => c.id === id)?.name || "Unknown";
  const getSessionType = (id: string) =>
    (data.sessionTypes || []).find((t) => t.id === id)?.name || "Session";

  const updateStatus = (bId: string, status: string) => {
    updateData((d) => {
      const b = d.bookings.find((x) => x.id === bId);
      if (b) b.status = status;
      return d;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addSlot = () => {
    if (!slotStart.trim() || !slotEnd.trim()) return;
    updateData((d) => {
      d.availability.push({
        id: uid(),
        dayOfWeek: slotDay,
        startTime: slotStart.trim(),
        endTime: slotEnd.trim(),
      });
      return d;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSlotModal(false);
    setSlotStart("");
    setSlotEnd("");
  };

  const removeSlot = (id: string) => {
    updateData((d) => {
      d.availability = d.availability.filter((s) => s.id !== id);
      return d;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const grouped: Record<number, AvailSlot[]> = {};
  (data.availability || []).forEach((s) => {
    if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = [];
    grouped[s.dayOfWeek].push(s);
  });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Bookings</Text>
        {tab === "availability" && (
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSlotModal(true);
            }}
          >
            <Feather name="plus" size={16} color={C.white} />
            <Text style={styles.addBtnText}>Add Slot</Text>
          </Pressable>
        )}
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {(["bookings", "availability"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === t && styles.tabBtnTextActive,
              ]}
            >
              {t === "bookings" ? "Bookings" : "Availability"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "bookings" && (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 100,
            },
          ]}
        >
          <Text style={styles.sectionLabel}>UPCOMING</Text>
          {upcoming.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={28} color={C.muted} />
              <Text style={styles.emptyText}>No upcoming bookings.</Text>
            </View>
          ) : (
            upcoming.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                clientName={getClient(b.clientId)}
                sessionName={getSessionType(b.sessionTypeId)}
                onStatusChange={updateStatus}
                isStuck={
                  (data.sessionTypes || []).find(
                    (t) => t.id === b.sessionTypeId
                  )?.type === "stuck"
                }
              />
            ))
          )}

          {past.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                HISTORY
              </Text>
              {past.slice(0, 20).map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  clientName={getClient(b.clientId)}
                  sessionName={getSessionType(b.sessionTypeId)}
                  onStatusChange={updateStatus}
                  isStuck={
                    (data.sessionTypes || []).find(
                      (t) => t.id === b.sessionTypeId
                    )?.type === "stuck"
                  }
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {tab === "availability" && (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom:
                (Platform.OS === "web" ? 34 : insets.bottom) + 100,
            },
          ]}
        >
          {Object.keys(grouped).length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="clock" size={28} color={C.muted} />
              <Text style={styles.emptyText}>No availability set yet.</Text>
              <Text style={styles.emptySubText}>
                Tap "Add Slot" to set when you're available.
              </Text>
            </View>
          ) : (
            [0, 1, 2, 3, 4, 5, 6].map((day) => {
              const slots = grouped[day] || [];
              if (slots.length === 0) return null;
              return (
                <View key={day} style={styles.dayGroup}>
                  <Text style={styles.dayLabel}>{DAYS[day]}</Text>
                  {slots.map((s) => (
                    <View key={s.id} style={styles.slotRow}>
                      <Text style={styles.slotTime}>
                        {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                      </Text>
                      <Pressable onPress={() => removeSlot(s.id)}>
                        <Feather name="trash-2" size={15} color={C.red} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ADD SLOT MODAL */}
      <Modal
        visible={showSlotModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSlotModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowSlotModal(false)}>
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>Add Availability Slot</Text>
            <View style={{ width: 22 }} />
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Day of Week</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, marginBottom: 16 }}
            >
              {DAYS.map((d, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSlotDay(i)}
                  style={[
                    styles.dayChip,
                    slotDay === i && {
                      borderColor: C.orange,
                      backgroundColor: `${C.orange}15`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      slotDay === i && { color: C.orange },
                    ]}
                  >
                    {d.slice(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.fieldLabel}>Start Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={slotStart}
              onChangeText={setSlotStart}
              placeholder="09:00"
              placeholderTextColor={C.muted}
              autoFocus
            />
            <Text style={styles.fieldLabel}>End Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={slotEnd}
              onChangeText={setSlotEnd}
              placeholder="10:00"
              placeholderTextColor={C.muted}
            />
            <Pressable
              style={[
                styles.addSlotBtn,
                (!slotStart.trim() || !slotEnd.trim()) && { opacity: 0.4 },
              ]}
              disabled={!slotStart.trim() || !slotEnd.trim()}
              onPress={addSlot}
            >
              <Text style={styles.addSlotBtnText}>Add Slot</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BookingCard({
  booking,
  clientName,
  sessionName,
  onStatusChange,
  isStuck,
}: {
  booking: any;
  clientName: string;
  sessionName: string;
  onStatusChange: (id: string, s: string) => void;
  isStuck?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_COLORS[booking.status] || C.dim;

  return (
    <View
      style={[
        BookingStyles.card,
        { borderColor: `${sc}44` },
      ]}
    >
      <Pressable onPress={() => setOpen((o) => !o)}>
        <View style={BookingStyles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={BookingStyles.clientName}>{clientName}</Text>
            <Text style={BookingStyles.sessionName}>{sessionName}</Text>
            {!isStuck && (
              <Text style={BookingStyles.dateTime}>
                {DAYS[new Date(booking.date + "T12:00:00").getDay()]},{" "}
                {fmtS(booking.date)}{" "}
                {booking.time !== "anytime" ? `· ${fmtTime(booking.time)}` : ""}
              </Text>
            )}
            {isStuck && (
              <Text style={BookingStyles.dateTime}>Async / pay-what-you-feel</Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Tag
              label={STATUS_LABELS[booking.status] || booking.status}
              color={sc}
            />
            <Feather name={open ? "chevron-up" : "chevron-down"} size={14} color={C.muted} />
          </View>
        </View>
        {!!booking.note && !open && (
          <Text style={BookingStyles.note} numberOfLines={1}>
            {booking.note}
          </Text>
        )}
      </Pressable>

      {open && (
        <View style={BookingStyles.expanded}>
          {!!booking.note && (
            <Text style={BookingStyles.noteExpanded}>{booking.note}</Text>
          )}
          <Text style={BookingStyles.changeLabel}>Change status:</Text>
          <View style={BookingStyles.statusRow}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => onStatusChange(booking.id, s)}
                style={[
                  BookingStyles.statusBtn,
                  booking.status === s && {
                    backgroundColor: `${STATUS_COLORS[s]}20`,
                    borderColor: STATUS_COLORS[s],
                  },
                ]}
              >
                <Text
                  style={[
                    BookingStyles.statusBtnText,
                    { color: STATUS_COLORS[s] || C.dim },
                  ]}
                >
                  {STATUS_LABELS[s]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const BookingStyles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  clientName: {
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sessionName: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  dateTime: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  note: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: 6,
  },
  noteExpanded: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 10,
  },
  expanded: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  changeLabel: {
    color: C.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statusBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBtnText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});

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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.orange,
  },
  tabBtnText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  tabBtnTextActive: {
    color: C.orange,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 16,
  },
  sectionLabel: {
    color: C.dim,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
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
  dayGroup: {
    marginBottom: 14,
  },
  dayLabel: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  slotRow: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  slotTime: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
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
  fieldLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  dayChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dayChipText: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
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
  addSlotBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  addSlotBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
