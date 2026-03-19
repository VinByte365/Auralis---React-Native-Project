import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import {
  changeUserRole,
  getAdminUsersData,
  removeUser,
} from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import StatusChip from "../components/StatusChip";

const FILTER_OPTIONS = ["All", "Admin", "User"];

function toLabel(roleValue) {
  const normalized = String(roleValue || "").toLowerCase();
  if (normalized === "admin") return "Admin";
  return "User";
}

function formatDate(value) {
  if (!value) return "Unknown date";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

export default function UserList() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { list, loading } = useSelector((state) => state.admin.users);

  useEffect(() => {
    dispatch(getAdminUsersData());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return list.filter((user) => {
      const roleLabel = toLabel(user?.role);
      const matchSearch =
        String(user?.name || "").toLowerCase().includes(query) ||
        String(user?.email || "").toLowerCase().includes(query);
      const matchFilter = activeFilter === "All" || roleLabel === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [activeFilter, list, search]);

  const renderItem = ({ item }) => {
    const roleLabel = toLabel(item?.role);
    const isAdmin = roleLabel === "Admin";
    const nextRole = isAdmin ? "user" : "admin";
    return (
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, isAdmin && { backgroundColor: COLORS.primary + "30" }]}>
            <Text style={[styles.avatarText, isAdmin && { color: COLORS.primary }]}>
              {String(item?.name || "U")[0]}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item?.name || "Unknown User"}</Text>
            <Text style={styles.email}>{item?.email || "No email"}</Text>
            <Text style={styles.joined}>Joined {formatDate(item?.createdAt)}</Text>
          </View>
          <View style={styles.badges}>
            <StatusChip status={roleLabel} size="sm" />
            <View style={{ marginTop: SPACING.xs }}>
              <StatusChip status={item?.status || "Active"} size="sm" />
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => dispatch(changeUserRole({ userId: item?._id, role: nextRole }))}
          >
            <Text style={styles.editText}>{`Set as ${nextRole}`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setDeleteTarget(item)}
            disabled={isAdmin}
          >
            <Text style={[styles.deleteText, isAdmin && styles.deleteTextDisabled]}>Delete User</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader title="User Management" subtitle={`${list.length} total users`} navigation={navigation} />
      <SearchBar
        placeholder="Search by name or email..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && list.length === 0 ? (
        <LoadingSpinner message="Loading users..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderItem}
          estimatedItemSize={150}
          keyExtractor={(item) => String(item?._id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete User"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?._id) {
            dispatch(removeUser(deleteTarget._id));
          }
          setDeleteTarget(null);
        }}
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
});
