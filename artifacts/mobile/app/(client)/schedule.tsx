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
  fmt,
  fmtS,
  fmtTime,
  getAvailableSlots,
  today,
  uid,
} from "@/utils/storage";
import { Tag } from "@/components/ui/Tag";

export default function ScheduleScreen() {
  const { data, currentClientId, addBooking } = useApp();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selTypeId, setSelTypeId] = useState<string | null>(null);
  const [selSlot, setSelSlot] = useState<{
    date: string;
    time: string;
    slotId: string;
  } | null>(null);
  const [bookNote, setBookNote] = useState("");
  const [stuckCats, setStuckCats] = useState<string[]>([]);
  const [bookingDone, setBookingDone] = useState(false);

  const client = data.clients.find((c) => c.id === currentClientId);
  if (!client) return null;

  const activeTypes = (data.sessionTypes || []).filter((t) => t.active);
  const slots = getAvailableSlots(
    data.availability || [],
    data.bookings || []
  );
  const myBookings = (data.bookings || []).filter(
    (b) => b.clientId === currentClientId
  );
  const upcoming = myBookings
    .filter((b) => b.status === "upcoming" && b.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = myBookings
    .filter((b) => b.date < today() || b.status !== "upcoming")
    .sort((a, b) => b.date.localeCompare(a.date));

  const selType = activeTypes.find((t) => t.id === selTypeId);
  const isStuck = selType?.type === "stuck";

  const stuckOpts = [
    "I'm stuck on a lift",
    "I need a full workout",
    "Something hurts",
    "I need program direction",
    "Other",
  ];

  const toggleCat = (c: string) =>
    setStuckCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const handleBook = () => {
    if (!selType || (!isStuck && !selSlot)) return;
    addBooking({
      id: uid(),
      clientId: currentClientId!,
      sessionTypeId: selType.id,
      date: isStuck ? today() : selSlot!.date,
      time: isStuck ? "anytime" : selSlot!.time,
      note: isStuck
        ? `[${stuckCats.join(", ")}] ${bookNote}`
        : bookNote,
      status: "upcoming",
      bookedAt: new Date().toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    setStep(1);
    setSelTypeId(null);
    setSelSlot(null);
    setBookNote("");
    setStuckCats([]);
    setBookingDone(true);
    setTimeout(() => setBookingDone(false), 4000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Schedule</Text>
        <Pressable
          style={styles.bookBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowModal(true);
            setStep(1);
          }}
        >
          <Feather name="plus" size={16} color={C.white} />
          <Text style={styles.bookBtnText}>Book</Text>
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
        showsVerticalScrollIndicator={false}
      >
        {bookingDone && (
          <View style={styles.successBanner}>
            <Feather name="check-circle" size={16} color={C.green} />
            <Text style={styles.successText}>
              Booked — Matt will confirm shortly.
            </Text>
          </View>
        )}

        {/* UPCOMING */}
        <Text style={styles.sectionLabel}>UPCOMING</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={28} color={C.muted} />
            <Text style={styles.emptyText}>No upcoming sessions</Text>
          </View>
        ) : (
          upcoming.map((b) => {
            const st = (data.sessionTypes || []).find(
              (t) => t.id === b.sessionTypeId
            );
            const isS = st?.type === "stuck";
            return (
              <View
                key={b.id}
                style={[
                  styles.bookingCard,
                  { borderColor: isS ? `${C.green}44` : C.border },
                ]}
              >
                <View style={styles.bookingTop}>
                  <Text style={styles.bookingType}>
                    {isS ? "Waiting for Matt" : `${DAYS[new Date(b.date + "T12:00:00").getDay()]}, ${fmt(b.date)}`}
                  </Text>
                  <Tag label="Upcoming" color={C.blue} />
                </View>
                <Text style={styles.bookingSession}>{st?.name || "Session"}</Text>
                {!isS && (
                  <Text style={styles.bookingTime}>{fmtTime(b.time)}</Text>
                )}
                {!!b.note && (
                  <Text style={styles.bookingNote} numberOfLines={2}>
                    {b.note}
                  </Text>
                )}
              </View>
            );
          })
        )}

        {/* PAST */}
        {past.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              HISTORY
            </Text>
            {past.slice(0, 10).map((b) => {
              const st = (data.sessionTypes || []).find(
                (t) => t.id === b.sessionTypeId
              );
              const sc = STATUS_COLORS[b.status] || C.muted;
              return (
                <View key={b.id} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>{fmtS(b.date)}</Text>
                    <Text style={styles.historyType} numberOfLines={1}>
                      {st?.name || "Session"}
                    </Text>
                  </View>
                  <Tag
                    label={STATUS_LABELS[b.status] || b.status}
                    color={sc}
                  />
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* BOOKING MODAL */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                if (step > 1) setStep(step - 1);
                else setShowModal(false);
              }}
            >
              <Feather name="x" size={22} color={C.dim} />
            </Pressable>
            <Text style={styles.modalTitle}>
              {step === 1 ? "Book a Session" : step === 2 ? "Pick a Time" : "Confirm"}
            </Text>
            <Text style={styles.modalStep}>Step {step}/3</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* STEP 1: session type */}
            {step === 1 && (
              <View style={{ gap: 10 }}>
                {activeTypes.map((t) => {
                  const sel = selTypeId === t.id;
                  const isS = t.type === "stuck";
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setSelTypeId(t.id)}
                      style={[
                        styles.typeCard,
                        sel && {
                          borderColor: isS ? C.green : C.orange,
                          backgroundColor: isS
                            ? `${C.green}0d`
                            : `${C.orange}0d`,
                        },
                      ]}
                    >
                      <View style={styles.typeTop}>
                        <Text
                          style={[
                            styles.typeName,
                            sel && {
                              color: isS ? C.green : C.orange,
                            },
                          ]}
                        >
                          {t.name}
                        </Text>
                        <Text
                          style={[
                            styles.typePrice,
                            { color: isS ? C.green : C.green },
                          ]}
                        >
                          {isS ? "$1+" : `$${t.price}`}
                        </Text>
                      </View>
                      {!!t.description && (
                        <Text style={styles.typeDesc}>{t.description}</Text>
                      )}
                      <Text style={styles.typeDuration}>
                        {t.duration} min
                        {t.type === "virtual" || isS
                          ? " · Virtual / Async"
                          : ""}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  style={[
                    styles.nextBtn,
                    !selTypeId && { opacity: 0.4 },
                  ]}
                  disabled={!selTypeId}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.nextBtnText}>Next →</Text>
                </Pressable>
              </View>
            )}

            {/* STEP 2: slot or stuck */}
            {step === 2 && selType && (
              <View>
                {isStuck ? (
                  <View>
                    <View style={styles.stuckBanner}>
                      <Feather name="info" size={14} color={C.green} />
                      <Text style={styles.stuckBannerText}>
                        No time slot needed. Matt will message you back.
                      </Text>
                    </View>
                    <Text style={styles.fieldLabel}>What do you need?</Text>
                    {stuckOpts.map((o) => (
                      <Pressable
                        key={o}
                        onPress={() => toggleCat(o)}
                        style={styles.checkRow}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            stuckCats.includes(o) && {
                              backgroundColor: C.green,
                              borderColor: C.green,
                            },
                          ]}
                        >
                          {stuckCats.includes(o) && (
                            <Feather name="check" size={12} color={C.white} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.checkLabel,
                            stuckCats.includes(o) && { color: C.text },
                          ]}
                        >
                          {o}
                        </Text>
                      </Pressable>
                    ))}
                    <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                      Tell Matt more
                    </Text>
                    <TextInput
                      style={styles.textarea}
                      value={bookNote}
                      onChangeText={setBookNote}
                      placeholder="Describe what's going on..."
                      placeholderTextColor={C.muted}
                      multiline
                      numberOfLines={4}
                    />
                    <Pressable
                      style={[
                        styles.nextBtn,
                        { backgroundColor: C.green },
                        !stuckCats.length && !bookNote.trim() && { opacity: 0.4 },
                      ]}
                      disabled={!stuckCats.length && !bookNote.trim()}
                      onPress={() => setStep(3)}
                    >
                      <Text style={styles.nextBtnText}>Next →</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View>
                    {slots.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Feather name="calendar" size={28} color={C.muted} />
                        <Text style={styles.emptyText}>
                          No available slots in the next 3 weeks.
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={{ maxHeight: 300, gap: 6 }}>
                          {slots.map((s, i) => {
                            const sel =
                              selSlot?.date === s.date &&
                              selSlot?.time === s.time;
                            return (
                              <Pressable
                                key={i}
                                onPress={() => setSelSlot(s)}
                                style={[
                                  styles.slotCard,
                                  sel && {
                                    borderColor: C.orange,
                                    backgroundColor: `${C.orange}0d`,
                                  },
                                ]}
                              >
                                <View>
                                  <Text style={styles.slotDay}>
                                    {DAYS[new Date(s.date + "T12:00:00").getDay()]},{" "}
                                    {fmtS(s.date)}
                                  </Text>
                                  <Text style={styles.slotTime}>
                                    {fmtTime(s.time)}
                                  </Text>
                                </View>
                                {sel && (
                                  <Feather
                                    name="check"
                                    size={16}
                                    color={C.orange}
                                  />
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                        <Pressable
                          style={[
                            styles.nextBtn,
                            { marginTop: 14 },
                            !selSlot && { opacity: 0.4 },
                          ]}
                          disabled={!selSlot}
                          onPress={() => setStep(3)}
                        >
                          <Text style={styles.nextBtnText}>Next →</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* STEP 3: confirm */}
            {step === 3 && selType && (isStuck || selSlot) && (
              <View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Session</Text>
                    <Text style={styles.summaryVal}>{selType.name}</Text>
                  </View>
                  {!isStuck && selSlot && (
                    <>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Date</Text>
                        <Text style={styles.summaryVal}>
                          {DAYS[new Date(selSlot.date + "T12:00:00").getDay()]},{" "}
                          {fmt(selSlot.date)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Time</Text>
                        <Text style={styles.summaryVal}>
                          {fmtTime(selSlot.time)}
                        </Text>
                      </View>
                    </>
                  )}
                  {isStuck && stuckCats.length > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Categories</Text>
                      <Text
                        style={[styles.summaryVal, { maxWidth: 220, textAlign: "right" }]}
                      >
                        {stuckCats.join(", ")}
                      </Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Duration</Text>
                    <Text style={styles.summaryVal}>{selType.duration} min</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Price</Text>
                    <Text style={[styles.summaryVal, { color: C.green }]}>
                      {isStuck ? "$1+ pay what you feel" : `$${selType.price}`}
                    </Text>
                  </View>
                </View>
                {!isStuck && (
                  <>
                    <Text style={styles.fieldLabel}>Note for Matt (optional)</Text>
                    <TextInput
                      style={[styles.textarea, { minHeight: 60 }]}
                      value={bookNote}
                      onChangeText={setBookNote}
                      placeholder="Anything Matt should know..."
                      placeholderTextColor={C.muted}
                      multiline
                    />
                  </>
                )}
                {isStuck && (
                  <View style={styles.stuckBanner}>
                    <Feather name="clock" size={14} color={C.green} />
                    <Text style={styles.stuckBannerText}>
                      Matt will reach out within 24 hours.
                    </Text>
                  </View>
                )}
                {!isStuck && (
                  <Text style={styles.paymentNote}>
                    Payment arranged separately with Matt.
                  </Text>
                )}
                <Pressable
                  style={[styles.nextBtn, { backgroundColor: C.green }]}
                  onPress={handleBook}
                >
                  <Text style={styles.nextBtnText}>Confirm Booking</Text>
                </Pressable>
              </View>
            )}
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
  bookBtn: {
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 16,
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
  sectionLabel: {
    color: C.dim,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  emptyText: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  bookingCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  bookingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bookingType: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  bookingSession: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  bookingTime: {
    color: C.orange,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  bookingNote: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: 4,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  historyLeft: {
    flex: 1,
    paddingRight: 12,
  },
  historyDate: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  historyType: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
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
  modalStep: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  modalScroll: {
    padding: 16,
    paddingBottom: 48,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
  },
  typeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  typeName: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    paddingRight: 8,
  },
  typePrice: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: C.green,
  },
  typeDesc: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 4,
  },
  typeDuration: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  nextBtn: {
    backgroundColor: C.orange,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  nextBtnText: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  stuckBanner: {
    backgroundColor: `${C.green}10`,
    borderWidth: 1,
    borderColor: `${C.green}44`,
    borderRadius: 6,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  stuckBannerText: {
    color: C.green,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  fieldLabel: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkLabel: {
    color: C.dim,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  slotCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotDay: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  slotTime: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  summaryTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryKey: {
    color: C.dim,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  summaryVal: {
    color: C.text,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  paymentNote: {
    color: C.dim,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
    textAlign: "center",
  },
});
