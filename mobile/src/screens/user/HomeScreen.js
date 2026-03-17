import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import HomeCarousel from "../../components/HomeCarousel";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/ProductCard";
import FilterBottomSheet from "../../components/FilterBottomSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useHome from "../../hooks/user/useHome";

export default function HomeScreen() {
  const {
    searchQuery,
    selectedCategory,
    selectedRating,
    handleSearch,
    handleCategoryPress,
    handleRatingPress,
    handleClearAllFilters,
    handlePriceChange,
    handleClearPriceRange,
    categories,
    products,
    cartCount,
    isLoading,
    error,
    priceGTE,
    priceLTE,
  } = useHome();
  const [isFilterVisible, setFilterVisible] = React.useState(false);

  const banners = [
    { id: 6, image: require("../../../assets/home/6.png") },
    { id: 2, image: require("../../../assets/home/2.png") },
    { id: 3, image: require("../../../assets/home/3.png") },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>AURALIS</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={24}
              color="#333"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons
              name="cart-outline"
              size={24}
              color="#333"
            />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#999"
            style={styles.searchMaterialCommunityIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#999"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterVisible(true)}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color="#333"
            />
          </TouchableOpacity>
        </View>

        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <HomeCarousel data={banners} />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>Loading products...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackError}>{error}</Text>
          </View>
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>
              No products matched your filters.
            </Text>
          </View>
        ) : null}

        <ProductCard products={products} />
      </ScrollView>

      <FilterBottomSheet
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryPress}
        selectedRating={selectedRating}
        onSelectRating={handleRatingPress}
        minPrice={priceGTE}
        maxPrice={priceLTE}
        onChangeMinPrice={(value) => handlePriceChange("priceGTE", value)}
        onChangeMaxPrice={(value) => handlePriceChange("priceLTE", value)}
        onClearPrice={handleClearPriceRange}
        onClearAll={handleClearAllFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logo: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#000",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 20,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#000",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterButton: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#efefef",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 8,
    fontWeight: "400",
  },
  carouselContainer: {
    marginTop: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  feedbackContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: "#666",
  },
  feedbackError: {
    fontSize: 14,
    color: "#d11a2a",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
