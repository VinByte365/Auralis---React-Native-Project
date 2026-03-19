import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { getAdminCategories, removeCategory } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";

export default function CategoryList() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { list, loading } = useSelector((state) => state.admin.categories);

  useEffect(() => {
    dispatch(getAdminCategories());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return list.filter((category) =>
      String(category?.categoryName || "").toLowerCase().includes(query),
    );
  }, [list, search]);

  return (
    <View style={styles.root}>
      <AppHeader title="Categories" subtitle={`${list.length} categories`} navigation={navigation} />
      <SearchBar placeholder="Search categories..." value={search} onChangeText={setSearch} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading && list.length === 0 ? (
          <LoadingSpinner message="Loading categories..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No categories found" description="Try adjusting your search." />
        ) : (
          <View style={styles.list}>
            {filtered.map((category, index) => (
              <View
                key={category?._id || index}
                style={[styles.card, index === filtered.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.iconWrap}>
                  <Text style={styles.catIcon}>CT</Text>
                </View>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{category?.categoryName || "Category"}</Text>
                  <Text style={styles.catCount}>{Number(category?.count || 0)} products</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(category)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.categoryName}"?`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?._id) {
            dispatch(removeCategory(deleteTarget._id));
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
  list: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  catIcon: { fontSize: 11, color: COLORS.textSecondary, fontWeight: FONT.semibold },
  catInfo: { flex: 1 },
  catName: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  catCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  deleteBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.dangerLight,
  },
  deleteText: { fontSize: 12, fontWeight: FONT.semibold, color: COLORS.danger },
});
