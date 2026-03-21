import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  COLORS,
  FONT,
  RADIUS,
  SHADOW,
  SPACING,
} from "../../../constants/adminTheme";
import {
  changeUserRole,
  createUser,
  editUser,
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
  const [formVisible, setFormVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    password: "",
  });

  const { list, loading } = useSelector((state) => state.admin.users);

  useEffect(() => {
    dispatch(getAdminUsersData());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return list.filter((user) => {
      const roleLabel = toLabel(user?.role);
      const matchSearch =
        String(user?.name || "")
          .toLowerCase()
          .includes(query) ||
        String(user?.email || "")
          .toLowerCase()
          .includes(query);
      const matchFilter = activeFilter === "All" || roleLabel === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [activeFilter, list, search]);

  const resetForm = () => {
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
      status: "active",
      password: "",
    });
  };

  const openCreateForm = () => {
    resetForm();
    setFormVisible(true);
  };

  const openEditForm = (user) => {
    setEditingUserId(user?._id || null);
    setFormData({
      name: String(user?.name || ""),
      email: String(user?.email || ""),
      role: String(user?.role || "user"),
      status: String(user?.status || "active"),
      password: "",
    });
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    resetForm();
  };

  const submitForm = async () => {
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      status: formData.status,
    };

    if (!editingUserId && formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    if (!payload.name || !payload.email) return;

    if (editingUserId) {
      await dispatch(editUser({ userId: editingUserId, payload }));
    } else {
      await dispatch(createUser(payload));
    }

    closeForm();
  };

  const renderItem = ({ item }) => {
    const roleLabel = toLabel(item?.role);
    const isAdmin = roleLabel === "Admin";
    const nextRole = isAdmin ? "user" : "admin";
    return (
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatar,
              isAdmin && { backgroundColor: COLORS.primary + "30" },
            ]}
          >
            <Text
              style={[styles.avatarText, isAdmin && { color: COLORS.primary }]}
            >
              {String(item?.name || "U")[0]}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item?.name || "Unknown User"}</Text>
            <Text style={styles.email}>{item?.email || "No email"}</Text>
            <Text style={styles.joined}>
              Joined {formatDate(item?.createdAt)}
            </Text>
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
            style={styles.secondaryBtn}
            onPress={() => openEditForm(item)}
          >
            <Text style={styles.secondaryText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              dispatch(changeUserRole({ userId: item?._id, role: nextRole }))
            }
          >
            <Text style={styles.editText}>{`Set as ${nextRole}`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setDeleteTarget(item)}
            disabled={isAdmin}
          >
            <Text
              style={[styles.deleteText, isAdmin && styles.deleteTextDisabled]}
            >
              Delete User
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader
        title="User Management"
        subtitle={`${list.length} total users`}
        navigation={navigation}
      />
      <SearchBar
        placeholder="Search by name or email..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.createRow}>
        <TouchableOpacity style={styles.createBtn} onPress={openCreateForm}>
          <Text style={styles.createText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
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

      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingUserId ? "Edit User" : "Create User"}
            </Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, name: value }))
              }
            />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, email: value }))
              }
            />

            {!editingUserId && (
              <>
                <Text style={styles.fieldLabel}>Password (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password (optional)"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(value) =>
                    setFormData((prev) => ({ ...prev, password: value }))
                  }
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.rowOptions}>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  formData.role === "user" && styles.optionBtnActive,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, role: "user" }))
                }
              >
                <Text style={styles.optionText}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  formData.role === "admin" && styles.optionBtnActive,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, role: "admin" }))
                }
              >
                <Text style={styles.optionText}>Admin</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.rowOptions}>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  formData.status === "active" && styles.optionBtnActive,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, status: "active" }))
                }
              >
                <Text style={styles.optionText}>Active</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  formData.status === "inactive" && styles.optionBtnActive,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, status: "inactive" }))
                }
              >
                <Text style={styles.optionText}>Inactive</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={submitForm}>
                <Text style={styles.saveText}>
                  {editingUserId ? "Save" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  createRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  createBtn: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  createText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: FONT.semibold,
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
  secondaryBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceBorder,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: FONT.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  rowOptions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  optionBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "30",
  },
  optionText: {
    color: COLORS.textPrimary,
    fontWeight: FONT.medium,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceBorder,
  },
  cancelText: {
    color: COLORS.textPrimary,
    fontWeight: FONT.semibold,
  },
  saveBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  saveText: {
    color: COLORS.textInverse,
    fontWeight: FONT.semibold,
  },
});
