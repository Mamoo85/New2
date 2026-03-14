import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import { FlatList, Linking, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import C from "@/constants/colors";
import { AppData } from "@/utils/storage";
import { styles } from "./trainerStyles";

interface Props {
  data: AppData;
  markInquiryContacted: (id: string, type: "formcheck" | "coaching") => void;
}

const TYPE_LABEL: Record<string, string> = {
  online_coaching: "Online Coaching",
  meet_prep: "Meet Prep",
  mentorship: "Mentorship",
};

export const InquiriesTab = React.memo(function InquiriesTab({ data, markInquiryContacted }: Props) {
  const insets = useSafeAreaInsets();

  const formChecks = useMemo(
    () =>
      [...(data.formCheckRequests || [])].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
    [data.formCheckRequests]
  );

  const coachingInquiries = useMemo(
    () =>
      [...(data.coachingInquiries || [])].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
    [data.coachingInquiries]
  );

  const total = formChecks.length + coachingInquiries.length;

  if (total === 0) {
    return (
      <View style={[styles.emptyState, { paddingTop: 40 }]}>
        <Feather name="inbox" size={36} color={C.muted} />
        <Text style={styles.emptyText}>No inquiries yet.</Text>
        <Text style={styles.emptySubText}>
          Form checks, coaching inquiries, meet prep, and mentorship requests
          appear here.
        </Text>
      </View>
    );
  }

  const pb = (Platform.OS === "web" ? 34 : insets.bottom) + 100;

  return (
    <FlatList
      data={[{ type: "formchecks" as const }, { type: "coaching" as const }]}
      keyExtractor={(i) => i.type}
      contentContainerStyle={[styles.scroll, { paddingBottom: pb }]}
      renderItem={({ item }) => {
        if (item.type === "formchecks" && formChecks.length > 0) {
          return (
            <>
              <Text style={styles.inqSectionLabel}>FORM CHECKS</Text>
              {formChecks.map((fc) => (
                <View key={fc.id} style={styles.inqCard}>
                  <View style={styles.inqHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inqName}>{fc.name}</Text>
                      <Pressable
                        onPress={() =>
                          Linking.openURL(`mailto:${fc.email}`).catch(() => {})
                        }
                      >
                        <Text style={styles.inqEmail}>{fc.email}</Text>
                      </Pressable>
                    </View>
                    <View
                      style={[
                        styles.inqBadge,
                        fc.status === "replied" && styles.inqBadgeDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.inqBadgeText,
                          fc.status === "replied" && styles.inqBadgeTextDone,
                        ]}
                      >
                        {fc.status === "replied" ? "Replied" : "Pending"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.inqDetail}>
                    <Text style={styles.inqDetailLabel}>Lift</Text>
                    <Text style={styles.inqDetailValue}>{fc.lift}</Text>
                  </View>
                  {!!fc.videoUrl && (
                    <View style={styles.inqDetail}>
                      <Text style={styles.inqDetailLabel}>Video</Text>
                      <Pressable
                        onPress={() =>
                          Linking.openURL(fc.videoUrl!).catch(() => {})
                        }
                      >
                        <Text
                          style={[
                            styles.inqDetailValue,
                            { color: C.orange },
                          ]}
                          numberOfLines={1}
                        >
                          {fc.videoUrl}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  <Text style={styles.inqNotes}>{fc.notes}</Text>
                  <View style={styles.inqActions}>
                    <Pressable
                      style={styles.inqActionEmail}
                      onPress={() =>
                        Linking.openURL(
                          `mailto:${fc.email}?subject=Form Check Feedback — M² Training&body=Hi ${fc.name.split(" ")[0]},\n\nHere is my feedback on your ${fc.lift}:\n\n[YOUR FEEDBACK]\n\nLet me know if you have questions!\n\nMatt`
                        ).catch(() => {})
                      }
                    >
                      <Feather name="mail" size={14} color={C.dim} />
                      <Text style={styles.inqActionEmailText}>
                        Reply via Email
                      </Text>
                    </Pressable>
                    {fc.status === "pending" && (
                      <Pressable
                        style={styles.inqActionDone}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          markInquiryContacted(fc.id, "formcheck");
                        }}
                      >
                        <Feather name="check" size={14} color="#fff" />
                        <Text style={styles.inqActionDoneText}>
                          Mark Replied
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.inqDate}>
                    {new Date(fc.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              ))}
            </>
          );
        }

        if (item.type === "coaching" && coachingInquiries.length > 0) {
          return (
            <>
              <Text style={styles.inqSectionLabel}>COACHING INQUIRIES</Text>
              {coachingInquiries.map((ci) => (
                <View key={ci.id} style={styles.inqCard}>
                  <View style={styles.inqHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inqName}>{ci.name}</Text>
                      <Pressable
                        onPress={() =>
                          Linking.openURL(`mailto:${ci.email}`).catch(() => {})
                        }
                      >
                        <Text style={styles.inqEmail}>{ci.email}</Text>
                      </Pressable>
                    </View>
                    <View style={styles.inqTypeBadge}>
                      <Text style={styles.inqTypeBadgeText}>
                        {TYPE_LABEL[ci.type] ?? ci.type}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.inqBadge,
                      ci.status === "contacted" && styles.inqBadgeDone,
                      { alignSelf: "flex-start", marginBottom: 8 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.inqBadgeText,
                        ci.status === "contacted" && styles.inqBadgeTextDone,
                      ]}
                    >
                      {ci.status === "contacted" ? "Contacted" : "Pending"}
                    </Text>
                  </View>
                  {!!ci.phone && (
                    <View style={styles.inqDetail}>
                      <Text style={styles.inqDetailLabel}>Phone</Text>
                      <Text style={styles.inqDetailValue}>{ci.phone}</Text>
                    </View>
                  )}
                  {!!ci.frequency && (
                    <View style={styles.inqDetail}>
                      <Text style={styles.inqDetailLabel}>Frequency</Text>
                      <Text style={styles.inqDetailValue}>{ci.frequency}</Text>
                    </View>
                  )}
                  <Text style={styles.inqNotes}>{ci.goals}</Text>
                  {!!ci.notes && (
                    <Text style={[styles.inqNotes, { color: C.muted }]}>
                      {ci.notes}
                    </Text>
                  )}
                  <View style={styles.inqActions}>
                    <Pressable
                      style={styles.inqActionEmail}
                      onPress={() =>
                        Linking.openURL(
                          `mailto:${ci.email}?subject=${TYPE_LABEL[ci.type] ?? "Coaching"} Inquiry — M² Training&body=Hi ${ci.name.split(" ")[0]},\n\nThanks for reaching out about ${TYPE_LABEL[ci.type] ?? "coaching"}. Let's talk more...\n\nMatt`
                        ).catch(() => {})
                      }
                    >
                      <Feather name="mail" size={14} color={C.dim} />
                      <Text style={styles.inqActionEmailText}>
                        Reply via Email
                      </Text>
                    </Pressable>
                    {ci.status === "pending" && (
                      <Pressable
                        style={styles.inqActionDone}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          markInquiryContacted(ci.id, "coaching");
                        }}
                      >
                        <Feather name="check" size={14} color="#fff" />
                        <Text style={styles.inqActionDoneText}>
                          Mark Contacted
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.inqDate}>
                    {new Date(ci.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              ))}
            </>
          );
        }

        return null;
      }}
    />
  );
});
