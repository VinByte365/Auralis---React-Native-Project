import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { getAdminUserAnalyticsData } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import KpiCard from "../components/KpiCard";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionHeader from "../components/SectionHeader";

const DATE_RANGES = ["7 Days", "30 Days", "90 Days"];

export default function AnalyticsUser() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedRange, setSelectedRange] = useState("30 Days");

  const analyticsState = useSelector((state) => state.admin.analytics);
  const users = useSelector((state) => state.admin.users.list);

  useEffect(() => {
    dispatch(getAdminUserAnalyticsData());
  }, [dispatch, selectedRange]);

  const customers = useMemo(
    () => users.filter((user) => String(user?.role || "").toLowerCase() !== "admin"),
    [users],
  );
  const adminCount = users.length - customers.length;
  const activeCount = users.filter((user) => String(user?.status || "").toLowerCase() === "active").length;
  const retention = users.length > 0 ? Math.round((activeCount / users.length) * 100) : 0;

  return (
    <View style={styles.root}>
      <AppHeader title="User Analytics" subtitle="Customer growth and behavior" navigation={navigation} />
      {analyticsState.loading && users.length === 0 ? (
        <LoadingSpinner message="Loading user analytics..." />
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.dateRow}>
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.dateChip, selectedRange === range && styles.dateChipActive]}
                onPress={() => setSelectedRange(range)}
              >
                <Text style={[styles.dateChipText, selectedRange === range && styles.dateChipTextActive]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.kpiRow}>
            <KpiCard icon="USR" label="Users" value={String(users.length)} trend={0} color={COLORS.primary} />
            <KpiCard icon="ACT" label="Active Users" value={String(activeCount)} trend={0} color={COLORS.success} />
          </View>
          <View style={[styles.kpiRow, { marginTop: SPACING.md }]}>
            <KpiCard icon="RET" label="Retention Rate" value={`${retention}%`} trend={0} color={COLORS.info} />
            <KpiCard icon="ADM" label="Admins" value={String(adminCount)} trend={0} color={COLORS.warning} />
          </View>

          <View style={{ marginTop: SPACING.md }}>
            <ChartCard title="User Growth" subtitle={`Last ${selectedRange}`} height={200} />
          </View>

          <SectionHeader title="User Insights" />
          <View style={styles.insightCard}>
            <View style={styles.insightItem}>
              <View style={styles.insightInfo}>
                <Text style={styles.insightLabel}>Customer Accounts</Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${users.length > 0 ? Math.round((customers.length / users.length) * 100) : 0}%`,
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.insightPercent}>{customers.length}</Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightInfo}>
                <Text style={styles.insightLabel}>Admin Accounts</Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${users.length > 0 ? Math.round((adminCount / users.length) * 100) : 0}%`,
                        backgroundColor: COLORS.info,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.insightPercent}>{adminCount}</Text>
            </View>
          </View>

          <SectionHeader title="Top Customers" />
          {customers.length === 0 ? (
            <EmptyState title="No customer data available" />
          ) : (
            <View style={styles.listCard}>
              {customers.slice(0, 6).map((customer, index) => (
                <View
                  key={customer?._id}
                  style={[styles.customerRow, index === customers.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{String(customer?.name || "U")[0]}</Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer?.name || "Unknown"}</Text>
                    <Text style={styles.customerEmail}>{customer?.email || "No email"}</Text>
                  </View>
                  <View style={styles.customerStats}>
                    <Text style={styles.customerOrders}>
                      {String(customer?.status || "N/A").toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  dateRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dateChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  dateChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: FONT.medium },
  dateChipTextActive: { color: COLORS.textInverse },
  kpiRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.lg,
    ...SHADOW.sm,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightInfo: { flex: 1 },
  insightLabel: { fontSize: 13, fontWeight: FONT.medium, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  barBg: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  insightPercent: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.textPrimary, marginLeft: SPACING.md },
  listCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight + "40",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  avatarText: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.primary },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  customerEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  customerStats: { alignItems: "flex-end" },
  customerOrders: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
});
