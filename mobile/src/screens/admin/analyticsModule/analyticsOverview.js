import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { getAdminAnalyticsOverview } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ChartCard from "../components/ChartCard";
import KpiCard from "../components/KpiCard";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionHeader from "../components/SectionHeader";

const DATE_RANGES = ["7 Days", "30 Days", "90 Days", "Year"];

function buildDateParams(selectedRange) {
  const endDate = new Date();
  const startDate = new Date(endDate);

  if (selectedRange === "7 Days") startDate.setDate(endDate.getDate() - 7);
  if (selectedRange === "30 Days") startDate.setDate(endDate.getDate() - 30);
  if (selectedRange === "90 Days") startDate.setDate(endDate.getDate() - 90);
  if (selectedRange === "Year") startDate.setFullYear(endDate.getFullYear() - 1);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString()}`;
}

export default function AnalyticsOverview() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedRange, setSelectedRange] = useState("30 Days");
  const { overview, loading } = useSelector((state) => state.admin.analytics);

  useEffect(() => {
    dispatch(getAdminAnalyticsOverview(buildDateParams(selectedRange)));
  }, [dispatch, selectedRange]);

  const kpis = useMemo(() => {
    const revenue =
      overview?.sales?.totalRevenue ||
      overview?.sales?.revenue ||
      overview?.orders?.totalRevenue ||
      0;
    const orderCount =
      overview?.orders?.totalOrders ||
      overview?.orders?.orderCount ||
      overview?.sales?.totalOrders ||
      0;
    const avgOrderValue =
      orderCount > 0 ? Number(revenue) / Number(orderCount) : 0;
    const projection =
      overview?.predictive?.projectedRevenue ||
      overview?.predictive?.forecastRevenue ||
      0;

    return [
      { icon: "REV", label: "Total Revenue", value: formatCurrency(revenue), trend: 0, color: COLORS.success },
      { icon: "AOV", label: "Avg. Order Value", value: formatCurrency(avgOrderValue), trend: 0, color: COLORS.primary },
      { icon: "ORD", label: "Total Orders", value: String(orderCount), trend: 0, color: COLORS.info },
      { icon: "FC", label: "Projected Revenue", value: formatCurrency(projection), trend: 0, color: COLORS.warning },
    ];
  }, [overview]);

  return (
    <View style={styles.root}>
      <AppHeader title="Analytics Overview" subtitle="Business insights and trends" navigation={navigation} />
      {loading && !overview ? (
        <LoadingSpinner message="Loading overview..." />
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.dateRangeWrap}>
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

          <View style={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <View key={kpi.label} style={styles.kpiItem}>
                <KpiCard {...kpi} />
              </View>
            ))}
          </View>

          <ChartCard title="Sales Trend" subtitle={`Last ${selectedRange}`} height={200} />
          <ChartCard title="Revenue Distribution" subtitle="By category" height={180} />

          <SectionHeader title="Predictive Insights" />
          <View style={styles.insightsCard}>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Projected Revenue (30 days)</Text>
              <Text style={styles.insightValue}>
                {formatCurrency(overview?.predictive?.projectedRevenue || 0)}
              </Text>
            </View>
            <View style={styles.insightDivider} />
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Expected Order Growth</Text>
              <Text style={styles.insightValue}>
                {String(overview?.predictive?.orderGrowth || "N/A")}
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  dateRangeWrap: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
  dateChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  dateChipTextActive: {
    color: COLORS.textInverse,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  kpiItem: { width: "47%" },
  insightsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  insightValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  insightDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },
});
