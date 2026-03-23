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

function validateProductForm(form) {
  const errors = {};
  const price = Number(form?.price);
  const stockQuantity = Number(form?.stockQuantity);

  if (!String(form?.name || "").trim())
    errors.name = "Product name is required.";
  if (!String(form?.sku || "").trim()) errors.sku = "SKU is required.";
  if (!String(form?.barcode || "").trim())
    errors.barcode = "Barcode is required.";
  if (!String(form?.barcodeType || "").trim()) {
    errors.barcodeType = "Please select a barcode type.";
  }
  if (!String(form?.category || "").trim()) {
    errors.category = "Please select a category.";
  }

  if (!String(form?.price || "").trim()) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(price) || price <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  if (!String(form?.stockQuantity || "").trim()) {
    errors.stockQuantity = "Stock quantity is required.";
  } else if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
    errors.stockQuantity = "Stock quantity cannot be negative.";
  }

  if (!String(form?.unit || "").trim()) errors.unit = "Please select a unit.";
  if (String(form?.description || "").trim().length > 500) {
    errors.description = "Description must be 500 characters or less.";
  }

  return errors;
}

export default function ProductList() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [existingImagesCount, setExistingImagesCount] = useState(0);
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success",
  });

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
    setExistingImagesCount(0);
    setProductForm(DEFAULT_PRODUCT_FORM);
    setFormErrors({});
    setSelectedImages([]);
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ visible: true, message, type });
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  const updateProductFormField = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
    setExistingImagesCount(
      Array.isArray(product?.images) ? product.images.length : 0,
    );
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
      setSelectedImages((prev) => {
        const next = [...prev, ...assets].slice(0, 5);
        console.log("[PRODUCT_FORM][IMAGES_PICKED]", {
          source: "gallery",
          added: assets.length,
          totalSelected: next.length,
        });
        return next;
      });
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
      setSelectedImages((prev) => {
        const next = [...prev, asset].slice(0, 5);
        console.log("[PRODUCT_FORM][IMAGES_PICKED]", {
          source: "camera",
          added: 1,
          totalSelected: next.length,
        });
        return next;
      });
    } catch {
      Alert.alert(
        "Camera unavailable",
        "Unable to open camera. Please try again.",
      );
    }
  };

  const submitProductForm = async () => {
    const errors = validateProductForm(productForm);
    const hasExistingImages = existingImagesCount > 0;
    if (!hasExistingImages && selectedImages.length === 0) {
      errors.images = "Please upload at least one product image.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showSnackbar("Please correct the highlighted fields.", "error");
      return;
    }

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

    console.log("[PRODUCT_FORM][SUBMIT]", {
      mode: editingProductId ? "update" : "create",
      productId: editingProductId || null,
      imageCount: Array.isArray(selectedImages) ? selectedImages.length : 0,
      imagesPreview: Array.isArray(selectedImages)
        ? selectedImages.map((image) => ({
            uri: image?.uri,
            type: image?.type || image?.mimeType,
            name: image?.fileName || image?.name,
          }))
        : [],
    });

    try {
      const action = editingProductId
        ? await dispatch(
            editProduct({
              productId: editingProductId,
              payload,
              images: selectedImages,
            }),
          )
        : await dispatch(createProduct({ payload, images: selectedImages }));

      console.log("[PRODUCT_FORM][RESULT]", {
        requestStatus: action?.meta?.requestStatus,
        payload: action?.payload,
        error: action?.error,
      });

      if (action?.meta?.requestStatus === "fulfilled") {
        showSnackbar(
          editingProductId
            ? "Product updated successfully."
            : "Product created successfully.",
          "success",
        );
        closeProductForm();
      } else {
        showSnackbar(
          action?.payload?.error || "Unable to save product. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.log("[PRODUCT_FORM][CATCH_ERROR]", {
        message: error?.message,
        stack: error?.stack,
      });
      showSnackbar("Unable to save product. Please try again.", "error");
    }
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
        onConfirm={async () => {
          if (archiveTarget?._id) {
            const action = await dispatch(archiveProduct(archiveTarget._id));
            if (action?.meta?.requestStatus === "fulfilled") {
              showSnackbar("Product archived successfully.", "success");
            } else {
              showSnackbar(
                action?.payload?.error ||
                  "Unable to archive product. Please try again.",
                "error",
              );
            }
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
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="Enter product name"
                value={productForm.name}
                onChangeText={(value) => updateProductFormField("name", value)}
              />
              {!!formErrors.name && (
                <Text style={styles.fieldError}>{formErrors.name}</Text>
              )}

              <Text style={styles.fieldLabel}>SKU</Text>
              <TextInput
                style={[styles.input, formErrors.sku && styles.inputError]}
                placeholder="Enter SKU"
                value={productForm.sku}
                onChangeText={(value) => updateProductFormField("sku", value)}
              />
              {!!formErrors.sku && (
                <Text style={styles.fieldError}>{formErrors.sku}</Text>
              )}

              <Text style={styles.fieldLabel}>Barcode</Text>
              <TextInput
                style={[styles.input, formErrors.barcode && styles.inputError]}
                placeholder="Enter barcode"
                value={productForm.barcode}
                onChangeText={(value) =>
                  updateProductFormField("barcode", value)
                }
              />
              {!!formErrors.barcode && (
                <Text style={styles.fieldError}>{formErrors.barcode}</Text>
              )}

              <Text style={styles.fieldLabel}>Barcode Type</Text>
              <View style={styles.optionWrap}>
                {BARCODE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionBtn,
                      formErrors.barcodeType && styles.optionBtnError,
                      productForm.barcodeType === option &&
                        styles.optionBtnActive,
                    ]}
                    onPress={() =>
                      updateProductFormField("barcodeType", option)
                    }
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!!formErrors.barcodeType && (
                <Text style={styles.fieldError}>{formErrors.barcodeType}</Text>
              )}

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.optionWrap}>
                {categoryList.map((category) => (
                  <TouchableOpacity
                    key={String(category?._id)}
                    style={[
                      styles.optionBtn,
                      formErrors.category && styles.optionBtnError,
                      productForm.category === String(category?._id) &&
                        styles.optionBtnActive,
                    ]}
                    onPress={() =>
                      updateProductFormField("category", String(category?._id))
                    }
                  >
                    <Text style={styles.optionText}>
                      {category?.categoryName || "Category"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!!formErrors.category && (
                <Text style={styles.fieldError}>{formErrors.category}</Text>
              )}

              <Text style={styles.fieldLabel}>Price</Text>
              <TextInput
                style={[styles.input, formErrors.price && styles.inputError]}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={productForm.price}
                onChangeText={(value) => updateProductFormField("price", value)}
              />
              {!!formErrors.price && (
                <Text style={styles.fieldError}>{formErrors.price}</Text>
              )}

              <Text style={styles.fieldLabel}>Stock Quantity</Text>
              <TextInput
                style={[
                  styles.input,
                  formErrors.stockQuantity && styles.inputError,
                ]}
                placeholder="0"
                keyboardType="number-pad"
                value={productForm.stockQuantity}
                onChangeText={(value) =>
                  updateProductFormField("stockQuantity", value)
                }
              />
              {!!formErrors.stockQuantity && (
                <Text style={styles.fieldError}>
                  {formErrors.stockQuantity}
                </Text>
              )}

              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.optionWrap}>
                {UNIT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionBtn,
                      formErrors.unit && styles.optionBtnError,
                      productForm.unit === option && styles.optionBtnActive,
                    ]}
                    onPress={() => updateProductFormField("unit", option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!!formErrors.unit && (
                <Text style={styles.fieldError}>{formErrors.unit}</Text>
              )}

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  formErrors.description && styles.inputError,
                ]}
                multiline
                numberOfLines={4}
                placeholder="Optional description"
                value={productForm.description}
                onChangeText={(value) =>
                  updateProductFormField("description", value)
                }
              />
              {!!formErrors.description && (
                <Text style={styles.fieldError}>{formErrors.description}</Text>
              )}

              <Text style={styles.fieldLabel}>
                Images ({selectedImages.length}/5)
                {editingProductId && existingImagesCount > 0
                  ? ` • Existing: ${existingImagesCount}`
                  : ""}
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
              {!!formErrors.images && (
                <Text style={styles.fieldError}>{formErrors.images}</Text>
              )}
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

      {snackbar.visible ? (
        <View
          style={[
            styles.snackbar,
            snackbar.type === "error"
              ? styles.snackbarError
              : styles.snackbarSuccess,
          ]}
        >
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </View>
      ) : null}
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
  inputError: {
    borderColor: COLORS.danger,
  },
  fieldError: {
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
    fontSize: 12,
    color: COLORS.danger,
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
  optionBtnError: {
    borderColor: COLORS.danger,
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
  snackbar: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.lg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOW.sm,
  },
  snackbarSuccess: {
    backgroundColor: COLORS.success,
  },
  snackbarError: {
    backgroundColor: COLORS.danger,
  },
  snackbarText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: FONT.semibold,
  },
});
