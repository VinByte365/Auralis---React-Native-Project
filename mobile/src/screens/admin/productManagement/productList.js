import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import {
  COLORS,
  FONT,
  RADIUS,
  SHADOW,
  SPACING,
} from "../../../constants/adminTheme";
import {
  archiveProduct,
  createProduct,
  editProduct,
  getAdminProductsData,
} from "../../../redux/thunks/adminThunks";
import { getAdminCategories } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import StatusChip from "../components/StatusChip";

const DEFAULT_PRODUCT_FORM = {
  name: "",
  sku: "",
  barcode: "",
  barcodeType: "UPC",
  category: "",
  price: "",
  stockQuantity: "",
  unit: "pc",
  description: "",
};

const UNIT_OPTIONS = ["pc", "pack", "kg", "g", "liter", "ml"];
const BARCODE_OPTIONS = [
  "UPC",
  "EAN_13",
  "EAN_8",
  "ISBN_10",
  "ISBN_13",
  "CODE_128",
  "QR",
];

const IMAGE_MEDIA_TYPE =
  ImagePicker.MediaType?.Images ||
  ImagePicker.MediaTypeOptions?.Images ||
  "images";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString()}`;
}

export default function ProductList() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);
  const [selectedImages, setSelectedImages] = useState([]);

  const { list, loading } = useSelector((state) => state.admin.products);
  const categoryList = useSelector(
    (state) => state.admin.categories.list || [],
  );

  useEffect(() => {
    dispatch(getAdminProductsData({ q: search.trim() || undefined }));
  }, [dispatch, search]);

  useEffect(() => {
    dispatch(getAdminCategories());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return list.filter((product) => {
      const name = String(product?.name || "").toLowerCase();
      const sku = String(product?.sku || "").toLowerCase();
      return name.includes(query) || sku.includes(query);
    });
  }, [list, search]);

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(DEFAULT_PRODUCT_FORM);
    setSelectedImages([]);
  };

  const closeProductForm = () => {
    setFormVisible(false);
    resetProductForm();
  };

  const openCreateForm = () => {
    resetProductForm();
    setFormVisible(true);
  };

  const openEditForm = (product) => {
    setEditingProductId(product?._id || null);
    setProductForm({
      name: String(product?.name || ""),
      sku: String(product?.sku || ""),
      barcode: String(product?.barcode || ""),
      barcodeType: String(product?.barcodeType || "UPC"),
      category:
        typeof product?.category === "object"
          ? String(product?.category?._id || "")
          : String(product?.category || ""),
      price: String(product?.price ?? ""),
      stockQuantity: String(product?.stockQuantity ?? ""),
      unit: String(product?.unit || "pc"),
      description: String(product?.description || ""),
    });
    setSelectedImages([]);
    setFormVisible(true);
  };

  const pickImageFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (result.canceled) return;
      const assets = result.assets || [];
      setSelectedImages((prev) => [...prev, ...assets].slice(0, 5));
    } catch {
      Alert.alert("Upload failed", "Unable to open gallery. Please try again.");
    }
  };

  const captureImageFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      setSelectedImages((prev) => [...prev, asset].slice(0, 5));
    } catch {
      Alert.alert(
        "Camera unavailable",
        "Unable to open camera. Please try again.",
      );
    }
  };

  const submitProductForm = async () => {
    const payload = {
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      barcode: productForm.barcode.trim(),
      barcodeType: productForm.barcodeType,
      category: productForm.category,
      price: Number(productForm.price),
      stockQuantity: Number(productForm.stockQuantity),
      unit: productForm.unit,
      description: productForm.description.trim(),
    };

    if (
      !payload.name ||
      !payload.sku ||
      !payload.barcode ||
      !payload.category ||
      Number.isNaN(payload.price) ||
      Number.isNaN(payload.stockQuantity)
    ) {
      return;
    }

    if (editingProductId) {
      await dispatch(
        editProduct({
          productId: editingProductId,
          payload,
          images: selectedImages,
        }),
      );
    } else {
      await dispatch(createProduct({ payload, images: selectedImages }));
    }

    closeProductForm();
  };

  const renderProduct = ({ item }) => {
    const isLowStock = Number(item?.stockQuantity || 0) <= 10;
    return (
      <View style={styles.productCard}>
        <View style={styles.imgPlaceholder}>
          <Text style={styles.imgText}>IMG</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item?.name || "Product"}
          </Text>
          <Text style={styles.productSku}>
            {(item?.sku || "N/A") +
              " | " +
              (item?.category?.categoryName || "Uncategorized")}
          </Text>
          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>
              {formatCurrency(item?.price)}
            </Text>
            <View style={styles.stockBadge}>
              <Text
                style={[
                  styles.stockText,
                  isLowStock && { color: COLORS.danger },
                ]}
              >
                {Number(item?.stockQuantity || 0)} in stock
              </Text>
            </View>
            <StatusChip status={isLowStock ? "Low" : "Active"} />
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => openEditForm(item)}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.archiveBtn}
            onPress={() => setArchiveTarget(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.archiveBtnText}>Move to Recycle Bin</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader
        title="Products"
        subtitle={`${list.length} products`}
        navigation={navigation}
      />
      <SearchBar
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.createRow}>
        <TouchableOpacity style={styles.createBtn} onPress={openCreateForm}>
          <Text style={styles.createText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      {loading && list.length === 0 ? (
        <LoadingSpinner message="Loading products..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try a different search term."
        />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderProduct}
          estimatedItemSize={130}
          keyExtractor={(item) => String(item?._id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}

      <ConfirmDialog
        visible={!!archiveTarget}
        title="Archive Product"
        message={`Move "${archiveTarget?.name}" to recycle bin?`}
        confirmLabel="Archive"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (archiveTarget?._id) {
            dispatch(archiveProduct(archiveTarget._id));
          }
          setArchiveTarget(null);
        }}
      />

      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={closeProductForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingProductId ? "Edit Product" : "Create Product"}
            </Text>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={{ paddingBottom: SPACING.md }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.fieldLabel}>Product Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                value={productForm.name}
                onChangeText={(value) =>
                  setProductForm((prev) => ({ ...prev, name: value }))
                }
              />

              <Text style={styles.fieldLabel}>SKU</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter SKU"
                value={productForm.sku}
                onChangeText={(value) =>
                  setProductForm((prev) => ({ ...prev, sku: value }))
                }
              />

              <Text style={styles.fieldLabel}>Barcode</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter barcode"
                value={productForm.barcode}
                onChangeText={(value) =>
                  setProductForm((prev) => ({ ...prev, barcode: value }))
                }
              />

              <Text style={styles.fieldLabel}>Barcode Type</Text>
              <View style={styles.optionWrap}>
                {BARCODE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionBtn,
                      productForm.barcodeType === option &&
                        styles.optionBtnActive,
                    ]}
                    onPress={() =>
                      setProductForm((prev) => ({
                        ...prev,
                        barcodeType: option,
                      }))
                    }
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.optionWrap}>
                {categoryList.map((category) => (
                  <TouchableOpacity
                    key={String(category?._id)}
                    style={[
                      styles.optionBtn,
                      productForm.category === String(category?._id) &&
                        styles.optionBtnActive,
                    ]}
                    onPress={() =>
                      setProductForm((prev) => ({
                        ...prev,
                        category: String(category?._id),
                      }))
                    }
                  >
                    <Text style={styles.optionText}>
                      {category?.categoryName || "Category"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={productForm.price}
                onChangeText={(value) =>
                  setProductForm((prev) => ({ ...prev, price: value }))
                }
              />

              <Text style={styles.fieldLabel}>Stock Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="number-pad"
                value={productForm.stockQuantity}
                onChangeText={(value) =>
                  setProductForm((prev) => ({ ...prev, stockQuantity: value }))
                }
              />

              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.optionWrap}>
                {UNIT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionBtn,
                      productForm.unit === option && styles.optionBtnActive,
                    ]}
                    onPress={() =>
                      setProductForm((prev) => ({ ...prev, unit: option }))
                    }
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                placeholder="Optional description"
                value={productForm.description}
                onChangeText={(value) =>
                  setProductForm((prev) => ({ ...prev, description: value }))
                }
              />

              <Text style={styles.fieldLabel}>
                Images ({selectedImages.length}/5)
              </Text>
              <View style={styles.mediaRow}>
                <TouchableOpacity
                  style={styles.mediaBtn}
                  onPress={pickImageFromGallery}
                >
                  <Text style={styles.mediaBtnText}>Upload Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mediaBtn}
                  onPress={captureImageFromCamera}
                >
                  <Text style={styles.mediaBtnText}>Use Camera</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closeProductForm}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={submitProductForm}
              >
                <Text style={styles.saveText}>
                  {editingProductId ? "Save" : "Create"}
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
  productCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  imgPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  imgText: { fontSize: 11, color: COLORS.textMuted, fontWeight: FONT.semibold },
  productInfo: { flex: 1, justifyContent: "center" },
  productName: {
    fontSize: 15,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  productSku: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  stockBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
  },
  stockText: { fontSize: 11, fontWeight: FONT.medium, color: COLORS.success },
  archiveBtn: {
    marginTop: SPACING.sm,
    alignSelf: "flex-start",
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  archiveBtnText: {
    fontSize: 12,
    fontWeight: FONT.semibold,
    color: COLORS.warning,
  },
  editBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight + "40",
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: FONT.semibold,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    maxHeight: "90%",
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  formScroll: {
    maxHeight: 500,
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
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  optionBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "30",
  },
  optionText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: FONT.medium,
  },
  mediaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  mediaBtn: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    backgroundColor: COLORS.surfaceBorder,
  },
  mediaBtnText: {
    fontSize: 12,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.sm,
    marginTop: SPACING.md,
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
