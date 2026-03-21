import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  createPromoEntry,
  editPromoEntry,
  getAdminPromosData,
  removePromoEntry,
} from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import {
  fetchAdminCategories,
  fetchAdminProducts,
} from "../../../services/adminService";

const PROMO_TYPES = ["percentage", "fixed"];
const PROMO_SCOPES = ["cart", "category", "product"];

const EMPTY_FORM = {
  promoName: "",
  code: "",
  promoType: "percentage",
  scope: "cart",
  targetIds: [],
  value: "",
  usageLimit: "",
  useCount: "0",
  active: true,
};

export default function PromoList() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [targetSearch, setTargetSearch] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const { list, loading, updating } = useSelector(
    (state) => state.admin.promos,
  );

  useEffect(() => {
    dispatch(getAdminPromosData());
  }, [dispatch]);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          fetchAdminProducts(),
          fetchAdminCategories(),
        ]);

        const normalizedProducts = Array.isArray(productsResult?.products)
          ? productsResult.products
          : Array.isArray(productsResult)
            ? productsResult
            : [];

        const normalizedCategories = Array.isArray(categoriesResult)
          ? categoriesResult
          : [];

        if (active) {
          setProductOptions(normalizedProducts);
          setCategoryOptions(normalizedCategories);
        }
      } catch {
        if (active) {
          setProductOptions([]);
          setCategoryOptions([]);
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return list.filter((promo) => {
      const name = String(promo?.promoName?.promo || "").toLowerCase();
      const code = String(promo?.code || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [list, search]);

  const openCreateModal = () => {
    setEditingPromo(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setForm({
      promoName: String(promo?.promoName?.promo || ""),
      code: String(promo?.code || ""),
      promoType: String(promo?.promoType || "percentage"),
      scope: String(promo?.scope || "cart"),
      targetIds: Array.isArray(promo?.targetIds)
        ? promo.targetIds.map((id) => String(id))
        : [],
      value: String(promo?.value ?? ""),
      usageLimit: String(promo?.usageLimit ?? ""),
      useCount: String(promo?.usedCount ?? 0),
      active: Boolean(promo?.active),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPromo(null);
    setForm(EMPTY_FORM);
    setTargetSearch("");
  };

  const availableTargets = useMemo(() => {
    const source = form.scope === "product" ? productOptions : categoryOptions;
    const query = targetSearch.trim().toLowerCase();

    if (!query) return source.slice(0, 25);

    return source
      .filter((item) => {
        const name =
          form.scope === "product"
            ? String(item?.name || "")
            : String(item?.categoryName || "");
        const sku = String(item?.sku || "");
        return (
          name.toLowerCase().includes(query) ||
          sku.toLowerCase().includes(query)
        );
      })
      .slice(0, 25);
  }, [categoryOptions, form.scope, productOptions, targetSearch]);

  const toggleTarget = (id) => {
    const normalizedId = String(id || "");
    if (!normalizedId) return;

    setForm((prev) => {
      const current = Array.isArray(prev.targetIds) ? prev.targetIds : [];
      const exists = current.includes(normalizedId);

      return {
        ...prev,
        targetIds: exists
          ? current.filter((item) => item !== normalizedId)
          : [...current, normalizedId],
      };
    });
  };

  const onSavePromo = () => {
    if (!form.promoName.trim()) return;

    const payload = {
      promoName: form.promoName.trim(),
      code: form.code.trim(),
      promoType: form.promoType,
      scope: form.scope,
      targetIds: form.scope === "cart" ? [] : form.targetIds,
      value: Number(form.value || 0),
      usageLimit: Number(form.usageLimit || 0),
      usedCount: Number(form.useCount || 0),
      active: Boolean(form.active),
    };

    if (editingPromo?._id) {
      dispatch(editPromoEntry({ promoId: editingPromo._id, payload }));
    } else {
      dispatch(createPromoEntry(payload));
    }

    closeForm();
  };

  return (
    <View style={styles.root}>
      <AppHeader
        title="Promotions"
        subtitle={`${list.length} promos/discounts`}
        navigation={navigation}
      />
      <SearchBar
        placeholder="Search promo by name or code..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Text style={styles.addBtnText}>+ New Promo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading && list.length === 0 ? (
          <LoadingSpinner message="Loading promotions..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No promotions found"
            description="Create a promo/discount to get started."
          />
        ) : (
          <View style={styles.listCard}>
            {filtered.map((promo, index) => (
              <View
                key={promo?._id || index}
                style={[
                  styles.row,
                  index === filtered.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {promo?.promoName?.promo || "Promo"}
                  </Text>
                  <Text style={styles.meta}>
                    {String(promo?.promoType || "percentage").toUpperCase()} •{" "}
                    {Number(promo?.value || 0)}
                  </Text>
                  <Text style={styles.meta}>
                    Scope: {String(promo?.scope || "cart")}
                  </Text>
                  <Text style={styles.code}>Code: {promo?.code || "N/A"}</Text>
                  <Text style={styles.code}>
                    Use Count: {Number(promo?.usedCount || 0)} /{" "}
                    {Number(promo?.usageLimit || 0)}
                  </Text>
                </View>

                <View style={styles.rightActions}>
                  <View
                    style={[
                      styles.statusChip,
                      promo?.active ? styles.activeChip : styles.inactiveChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        promo?.active ? styles.activeText : styles.inactiveText,
                      ]}
                    >
                      {promo?.active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEditModal(promo)}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => setDeleteTarget(promo)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal
        visible={showForm}
        transparent
        animationType="fade"
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingPromo ? "Edit Promo" : "Create Promo"}
            </Text>

            <Text style={styles.formLabel}>Promo Name</Text>
            <TextInput
              value={form.promoName}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, promoName: text }))
              }
              placeholder="Promo name"
              style={styles.input}
            />

            <Text style={styles.formLabel}>Promo Code</Text>
            <TextInput
              value={form.code}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, code: text }))
              }
              placeholder="Promo code"
              autoCapitalize="characters"
              style={styles.input}
            />

            <Text style={styles.formLabel}>Discount Value</Text>
            <TextInput
              value={form.value}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  value: text.replace(/[^0-9.]/g, ""),
                }))
              }
              placeholder="Discount value"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.formLabel}>Promo Type</Text>
            <View style={styles.typeRow}>
              {PROMO_TYPES.map((type) => {
                const isActive = form.promoType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, isActive && styles.typeChipActive]}
                    onPress={() =>
                      setForm((prev) => ({ ...prev, promoType: type }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        isActive && styles.typeChipTextActive,
                      ]}
                    >
                      {type === "percentage" ? "Percentage" : "Fixed"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Scope</Text>
            <View style={styles.typeRow}>
              {PROMO_SCOPES.map((scope) => {
                const isActive = form.scope === scope;
                return (
                  <TouchableOpacity
                    key={scope}
                    style={[styles.typeChip, isActive && styles.typeChipActive]}
                    onPress={() =>
                      setForm((prev) => ({
                        ...prev,
                        scope,
                        targetIds: scope === "cart" ? [] : prev.targetIds,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        isActive && styles.typeChipTextActive,
                      ]}
                    >
                      {scope.charAt(0).toUpperCase() + scope.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {form.scope !== "cart" ? (
              <>
                <Text style={styles.formLabel}>
                  Select {form.scope === "product" ? "Products" : "Categories"}
                </Text>
                <TextInput
                  value={targetSearch}
                  onChangeText={setTargetSearch}
                  placeholder={`Search ${form.scope}...`}
                  style={styles.input}
                />
                <View style={styles.targetList}>
                  {availableTargets.length === 0 ? (
                    <Text style={styles.targetEmptyText}>
                      No matches found.
                    </Text>
                  ) : (
                    availableTargets.map((item) => {
                      const id = String(item?._id || "");
                      const label =
                        form.scope === "product"
                          ? String(item?.name || "Product")
                          : String(item?.categoryName || "Category");
                      const selected = form.targetIds.includes(id);

                      return (
                        <TouchableOpacity
                          key={id}
                          style={[
                            styles.targetChip,
                            selected && styles.targetChipActive,
                          ]}
                          onPress={() => toggleTarget(id)}
                        >
                          <Text
                            style={[
                              styles.targetChipText,
                              selected && styles.targetChipTextActive,
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
                <Text style={styles.helperText}>
                  Selected targets: {form.targetIds.length}
                </Text>
              </>
            ) : null}

            <Text style={styles.formLabel}>Usage Limit</Text>
            <TextInput
              value={form.usageLimit}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  usageLimit: text.replace(/[^0-9]/g, ""),
                }))
              }
              placeholder="Usage limit"
              keyboardType="number-pad"
              style={styles.input}
            />

            <Text style={styles.formLabel}>Use Count</Text>
            <TextInput
              value={form.useCount}
              onChangeText={(text) =>
                setForm((prev) => ({
                  ...prev,
                  useCount: text.replace(/[^0-9]/g, ""),
                }))
              }
              placeholder="Used count"
              keyboardType="number-pad"
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Active</Text>
              <Switch
                value={form.active}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, active: value }))
                }
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, updating && styles.disabledBtn]}
                disabled={updating || !form.promoName.trim()}
                onPress={onSavePromo}
              >
                <Text style={styles.saveBtnText}>
                  {editingPromo ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Promo"
        message={`Delete \"${deleteTarget?.promoName?.promo || "promo"}\"?`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?._id) {
            dispatch(removePromoEntry(deleteTarget._id));
          }
          setDeleteTarget(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  actionsRow: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  addBtn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  addBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: FONT.semibold,
  },
  listCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  info: { flex: 1, paddingRight: SPACING.md },
  name: {
    fontSize: 14,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  code: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightActions: {
    alignItems: "flex-end",
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  activeChip: { backgroundColor: COLORS.successLight },
  inactiveChip: { backgroundColor: COLORS.warningLight },
  statusText: { fontSize: 11, fontWeight: FONT.semibold },
  activeText: { color: COLORS.success },
  inactiveText: { color: COLORS.warning },
  btnRow: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  editBtn: {
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  editText: {
    color: COLORS.info,
    fontSize: 11,
    fontWeight: FONT.semibold,
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: FONT.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: FONT.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  targetList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  targetChip: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  targetChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  targetChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  targetChipTextActive: {
    color: COLORS.textInverse,
  },
  targetEmptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  typeRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  typeChipTextActive: {
    color: COLORS.textInverse,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  switchLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: FONT.semibold,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.sm,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: FONT.medium,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: FONT.semibold,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
