import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT,
  SHADOW,
} from "../../../constants/adminTheme";
import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import StatusChip from "../components/StatusChip";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";

const MOCK_USERS = [
  {
    id: 1,
    name: "Melvin Catuera",
    email: "melvin@admin.com",
    role: "Admin",
    status: "Active",
    joined: "Jan 10, 2026",
  },
  {
    id: 2,
    name: "Juan Dela Cruz",
    email: "juan@email.com",
    role: "Customer",
    status: "Active",
    joined: "Jan 15, 2026",
  },
  {
    id: 3,
    name: "Pedro Reyes",
    email: "pedro@staff.com",
    role: "Staff",
    status: "Active",
    joined: "Feb 02, 2026",
  },
  {
    id: 4,
    name: "Maria Santos",
    email: "maria@email.com",
    role: "Customer",
    status: "Inactive",
    joined: "Feb 12, 2026",
  },
  {
    id: 5,
    name: "Ana Garcia",
    email: "ana@email.com",
    role: "Customer",
    status: "Active",
    joined: "Feb 20, 2026",
  },
  {
    id: 6,
    name: "Luis Ramos",
    email: "luis@email.com",
    role: "Customer",
    status: "Active",
    joined: "Mar 01, 2026",
  },
];

const FILTER_OPTIONS = ["All", "Admin", "Staff", "Customer"];

export default function UserList() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || u.role === activeFilter;
    return matchSearch && matchFilter;
  });

  const getRoleStatusChip = (role) => {
    return role.toLowerCase() === "admin"
      ? "Admin"
      : role.toLowerCase() === "staff"
        ? "Staff"
        : "Customer";
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <View
          style={[
            styles.avatar,
            item.role === "Admin" && { backgroundColor: COLORS.primary + "30" },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              item.role === "Admin" && { color: COLORS.primary },
            ]}
          >
            {item.name[0]}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.joined}>Joined {item.joined}</Text>
        </View>
        <View style={styles.badges}>
          <StatusChip status={getRoleStatusChip(item.role)} size="sm" />
          <View style={{ marginTop: SPACING.xs }}>
            <StatusChip status={item.status} size="sm" />
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editText}>Edit Role</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setDeleteTarget(item)}
          disabled={item.role === "Admin"}
        >
          <Text
            style={[
              styles.deleteText,
              item.role === "Admin" && styles.deleteTextDisabled,
            ]}
          >
            Disable User
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <AppHeader
        title="User Management"
        subtitle={`${MOCK_USERS.length} total users`}
        navigation={navigation}
      />
      <SearchBar
        placeholder="Search by name or email..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              activeFilter === f && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderItem}
          estimatedItemSize={150}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Disable User"
        message={`Are you sure you want to disable the account for "${deleteTarget?.name}"? They will lose access to the app.`}
        confirmLabel="Disable Account"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  filterTextActive: { color: COLORS.textInverse },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.infoLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  avatarText: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.info },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  email: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  joined: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  badges: { alignItems: "flex-end" },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  editBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight + "30",
    alignItems: "center",
  },
  editText: { fontSize: 13, fontWeight: FONT.semibold, color: COLORS.primary },
  deleteBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerLight,
    alignItems: "center",
  },
  deleteText: { fontSize: 13, fontWeight: FONT.semibold, color: COLORS.danger },
  deleteTextDisabled: { color: COLORS.textMuted },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.textInverse,
    fontWeight: FONT.light,
    marginTop: -2,
  },
});
