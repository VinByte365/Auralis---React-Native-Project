import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../constants/adminTheme";
import { getAdminDashboardData } from "../../redux/thunks/adminThunks";
import AppHeader from "./components/AppHeader";
import ChartCard from "./components/ChartCard";
import EmptyState from "./components/EmptyState";
import KpiCard from "./components/KpiCard";
import LoadingSpinner from "./components/LoadingSpinner";
import SectionHeader from "./components/SectionHeader";
import StatusChip from "./components/StatusChip";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString()}`;
}

export default function AdminDashboard() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { summary, recentOrders, activity, loading } = useSelector(
    (state) => state.admin.dashboard,
  );

  useEffect(() => {
    dispatch(getAdminDashboardData());
  }, [dispatch]);

  const kpis = useMemo(() => {
    const totalRevenue = summary?.totalRevenue || summary?.revenue || 0;
    const totalOrders =
      summary?.totalOrders || summary?.orderCount || recentOrders.length || 0;
    const totalCustomers = summary?.totalCustomers || summary?.userCount || 0;
    const totalProducts = summary?.totalProducts || summary?.productCount || 0;

    return [
      { icon: "REV", label: "Total Revenue", value: formatCurrency(totalRevenue), trend: 0, color: COLORS.success },
      { icon: "ORD", label: "Total Orders", value: String(totalOrders), trend: 0, color: COLORS.info },
      { icon: "CUS", label: "Customers", value: String(totalCustomers), trend: 0, color: COLORS.primary },
      { icon: "PRD", label: "Products", value: String(totalProducts), trend: 0, color: COLORS.warning },
    ];
  }, [recentOrders.length, summary]);

  return (
    <View style={styles.root}>
      <AppHeader title="Dashboard" subtitle="Welcome back, Admin" navigation={navigation} />
      {loading && !summary && recentOrders.length === 0 ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <View key={kpi.label} style={styles.kpiItem}>
                <KpiCard {...kpi} />
              </View>
            ))}
          </View>

          <ChartCard title="Sales Overview" subtitle="Recent performance" height={180} />
          <ChartCard title="Top Products" subtitle="By revenue" height={160} />

          <SectionHeader title="Recent Orders" actionLabel="View All" onAction={() => navigation.navigate("OrderList")} />
          {recentOrders.length === 0 ? (
            <EmptyState title="No recent orders" description="Orders will appear here once available." />
          ) : (
            <View style={styles.ordersCard}>
              {recentOrders.map((order) => (
                <TouchableOpacity
                  key={order?._id}
                  style={styles.orderRow}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("OrderDetails", { orderId: order?._id })}
                >
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>{order?._id?.slice(-8) || "Order"}</Text>
                    <Text style={styles.orderCustomer}>{order?.user?.name || "Guest"}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderTotal}>{formatCurrency(order?.finalAmountPaid)}</Text>
                    <StatusChip status={order?.status || "PENDING"} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <SectionHeader title="Activity Log" />
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="System activity will be listed here." />
          ) : (
            <View style={styles.activityCard}>
              {activity.slice(0, 6).map((item, index) => (
                <View
                  key={item?._id || index}
                  style={[styles.activityRow, index === activity.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.activityDot} />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityAction}>{item?.action || "Activity"}</Text>
                    <Text style={styles.activityDetail}>{item?.description || "No details"}</Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                  </Text>
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
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  kpiItem: {
    width: "47%",
  },
  ordersCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  orderCustomer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  orderRight: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 13,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  activityDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
});
