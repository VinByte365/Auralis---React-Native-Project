import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import {
  getAdminOperationsAnalyticsData,
  getAdminOrders,
} from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import KpiCard from "../components/KpiCard";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionHeader from "../components/SectionHeader";

const DATE_RANGES = ["7 Days", "30 Days", "90 Days"];

export default function AnalyticsOperation() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedRange, setSelectedRange] = useState("30 Days");

  const { list: orders } = useSelector((state) => state.admin.orders);
  const analytics = useSelector((state) => state.admin.analytics);

  useEffect(() => {
    dispatch(getAdminOrders({ page: 1, limit: 100 }));
    dispatch(getAdminOperationsAnalyticsData());
  }, [dispatch, selectedRange]);

  const counts = useMemo(() => {
    const total = orders.length;
    const cancelled = orders.filter((order) => String(order?.status).toUpperCase() === "CANCELLED").length;
    const completed = orders.filter((order) => String(order?.status).toUpperCase() === "COMPLETED").length;
    const completedRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, cancelled, completedRate };
  }, [orders]);

  const staffList = Array.isArray(analytics.staffPerformance)
    ? analytics.staffPerformance
    : [];

  return (
    <View style={styles.root}>
      <AppHeader title="Operations Analytics" subtitle="Orders, returns and staff performance" navigation={navigation} />
      {analytics.loading && orders.length === 0 ? (
        <LoadingSpinner message="Loading operations analytics..." />
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
            <KpiCard icon="ORD" label="Total Orders" value={String(counts.total)} trend={0} color={COLORS.info} />
            <KpiCard icon="CAN" label="Cancelled" value={String(counts.cancelled)} trend={0} color={COLORS.danger} />
          </View>

          <View style={{ marginTop: SPACING.md }}>
            <ChartCard title="Order Volume" subtitle={`Last ${selectedRange}`} height={180} />
          </View>

          <SectionHeader title="Operation Metrics" />
          <View style={styles.opsGrid}>
            <View style={styles.opCard}>
              <Text style={styles.opValue}>{counts.completedRate}%</Text>
              <Text style={styles.opLabel}>Completion Rate</Text>
            </View>
            <View style={styles.opCard}>
              <Text style={styles.opValue}>{counts.total - counts.cancelled}</Text>
              <Text style={styles.opLabel}>Active Orders</Text>
            </View>
          </View>

          <SectionHeader title="Staff Performance" />
          {staffList.length === 0 ? (
            <EmptyState title="No staff performance data" description="Backend analytics service is not returning staff metrics yet." />
          ) : (
            <View style={styles.staffCard}>
              {staffList.map((staff, index) => (
                <View
                  key={staff?._id || index}
                  style={[styles.staffRow, index === staffList.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.staffAvatar}>
                    <Text style={styles.staffAvatarText}>{String(staff?.name || "S")[0]}</Text>
                  </View>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{staff?.name || "Staff"}</Text>
                    <Text style={styles.staffRole}>{staff?.role || "Member"}</Text>
                  </View>
                  <View style={styles.staffStats}>
                    <Text style={styles.staffProcessed}>{staff?.processed || 0} orders</Text>
                    <View style={styles.staffMeta}>
                      <Text style={styles.staffAvgTime}>{staff?.avgTime || "N/A"}</Text>
                      <Text style={styles.staffRating}>{staff?.rating || "N/A"}</Text>
                    </View>
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
  opsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  opCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  opValue: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.textPrimary },
  opLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
    fontWeight: FONT.medium,
  },
  staffCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  staffAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.infoLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  staffAvatarText: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.info },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  staffRole: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  staffStats: { alignItems: "flex-end" },
  staffProcessed: { fontSize: 13, fontWeight: FONT.bold, color: COLORS.textPrimary },
  staffMeta: { flexDirection: "row", gap: SPACING.sm, marginTop: 2 },
  staffAvgTime: { fontSize: 11, color: COLORS.textSecondary },
  staffRating: { fontSize: 11, color: COLORS.warning },
});
