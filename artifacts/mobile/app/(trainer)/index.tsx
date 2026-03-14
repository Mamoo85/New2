import { Feather } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "@/components/ui/Logo";
import { ClientDetail } from "@/components/trainer/ClientDetail";
import { CoachingTab } from "@/components/trainer/CoachingTab";
import { InquiriesTab } from "@/components/trainer/InquiriesTab";
import { MailingTab } from "@/components/trainer/MailingTab";
import { OrdersTab } from "@/components/trainer/OrdersTab";
import { SignupsTab } from "@/components/trainer/SignupsTab";
import { styles } from "@/components/trainer/trainerStyles";
import C from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { getMonday } from "@/utils/storage";

type DashTab =
  | "clients"
  | "mailing"
  | "signups"
  | "orders"
  | "inquiries"
  | "coaching";

const TABS: DashTab[] = [
  "clients",
  "coaching",
  "mailing",
  "signups",
  "orders",
  "inquiries",
];
const TAB_LABEL: Record<DashTab, string> = {
  clients: "Clients",
  coaching: "Coaching",
  mailing: "Mailing List",
  signups: "Classes",
  orders: "Store Orders",
  inquiries: "Inquiries",
};

export default function ClientsScreen() {
  const {
    data,
    updateData,
    logout,
    saveProgram,
    deliverProgram,
    markStoreOrderSent,
    markInquiryContacted,
    replyToCheckIn,
    setClientSubscription,
  } = useApp();

  const insets = useSafeAreaInsets();
  const [selId, setSelId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [dashTab, setDashTab] = useState<DashTab>("clients");

  const thisMonday = useMemo(() => getMonday(), []);

  const filteredClients = useMemo(
    () =>
      data.clients.filter(
        (c) =>
          !search.trim() ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.username.toLowerCase().includes(search.toLowerCase())
      ),
    [data.clients, search]
  );

  const tabCounts = useMemo((): Record<DashTab, number> => {
    const pendingOrders = (data.storeOrders || []).filter(
      (o) => o.status !== "sent"
    ).length;
    const pendingInquiries =
      (data.formCheckRequests || []).filter((r) => r.status === "pending")
        .length +
      (data.coachingInquiries || []).filter((r) => r.status === "pending")
        .length;
    const mailingEmails = [
      ...new Set([
        ...data.clients.filter((c) => !!c.email).map((c) => c.email!),
        ...(data.groupClassInterests || []).map((g) => g.email),
      ]),
    ].length;
    return {
      clients: data.clients.length,
      coaching: data.clients.filter(
        (c) => c.subscription?.status === "active"
      ).length,
      mailing: mailingEmails,
      signups: (data.groupClassInterests || []).length,
      orders: pendingOrders,
      inquiries: pendingInquiries,
    };
  }, [
    data.clients,
    data.storeOrders,
    data.formCheckRequests,
    data.coachingInquiries,
    data.groupClassInterests,
    thisMonday,
  ]);

  const openClient = useCallback((id: number) => {
    setSelId(id);
  }, []);

  const handleBack = useCallback(() => setSelId(null), []);

  const handleDelete = useCallback(
    (id: number) => {
      updateData((d) => {
        d.clients = d.clients.filter((c) => c.id !== id);
        return d;
      });
      setSelId(null);
    },
    [updateData]
  );

  const unreadCount = useCallback(
    (id: number) =>
      data.clients.find((c) => c.id === id)?.messages.filter((m) => !m.trainerRead)
        .length || 0,
    [data.clients]
  );

  const pb = (Platform.OS === "web" ? 34 : insets.bottom) + 100;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 },
        ]}
      >
        <View style={{ gap: 2 }}>
          <Logo size="sm" />
          <Text style={styles.headerSub}>Trainer Dashboard</Text>
        </View>
        <Pressable onPress={logout}>
          <Feather name="log-out" size={20} color={C.dim} />
        </Pressable>
      </View>

      {/* CLIENT LIST / DASHBOARD */}
      {selId === null && (
        <View style={{ flex: 1 }}>
          {/* DASH TABS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dashTabs}
            contentContainerStyle={styles.dashTabsContent}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                style={[
                  styles.dashTab,
                  dashTab === tab && styles.dashTabActive,
                ]}
                onPress={() => setDashTab(tab)}
              >
                <Text
                  style={[
                    styles.dashTabText,
                    dashTab === tab && styles.dashTabTextActive,
                  ]}
                >
                  {TAB_LABEL[tab]}
                </Text>
                {tabCounts[tab] > 0 && (
                  <View
                    style={[
                      styles.dashTabBadge,
                      dashTab === tab && styles.dashTabBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dashTabBadgeText,
                        dashTab === tab && styles.dashTabBadgeTextActive,
                      ]}
                    >
                      {tabCounts[tab]}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>

          {/* CLIENTS TAB */}
          {dashTab === "clients" && (
            <>
              <View style={styles.searchRow}>
                <Feather
                  name="search"
                  size={16}
                  color={C.dim}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search clients..."
                  placeholderTextColor={C.muted}
                />
              </View>
              <FlatList
                data={filteredClients}
                keyExtractor={(c) => String(c.id)}
                contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Feather name="users" size={36} color={C.muted} />
                    <Text style={styles.emptyText}>
                      {search
                        ? "No clients match your search."
                        : "No clients yet."}
                    </Text>
                    {!search && (
                      <Text style={styles.emptySubText}>
                        Clients sign up from the home screen.
                      </Text>
                    )}
                  </View>
                }
                renderItem={({ item: c }) => {
                  const uc = unreadCount(c.id);
                  const sessions = [
                    ...new Set(c.entries.map((e) => e.date)),
                  ].length;
                  return (
                    <Pressable
                      style={styles.clientCard}
                      onPress={() => openClient(c.id)}
                    >
                      <View style={styles.clientLeft}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {c.name
                              .split(" ")
                              .map((x) => x[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
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
                }}
              />
            </>
          )}

          {dashTab === "mailing" && <MailingTab data={data} />}

          {dashTab === "signups" && <SignupsTab data={data} />}

          {dashTab === "orders" && (
            <OrdersTab data={data} markStoreOrderSent={markStoreOrderSent} />
          )}

          {dashTab === "inquiries" && (
            <InquiriesTab
              data={data}
              markInquiryContacted={markInquiryContacted}
            />
          )}

          {dashTab === "coaching" && (
            <CoachingTab
              data={data}
              replyToCheckIn={replyToCheckIn}
              setClientSubscription={setClientSubscription}
            />
          )}
        </View>
      )}

      {/* CLIENT DETAIL */}
      {selId !== null && (
        <ClientDetail
          selId={selId}
          data={data}
          updateData={updateData}
          saveProgram={saveProgram}
          deliverProgram={deliverProgram}
          onBack={handleBack}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
}
