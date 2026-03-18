import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories, getProducts } from "../../redux/thunks/productThunks";
import {
  clearFilters,
  setPriceRange,
  setSearchQuery,
  setSelectedCategory,
  setSelectedRating,
} from "../../redux/slices/productSlice";

const useHome = () => {
  const searchTimeout = useRef(null);
  const {
    products,
    categories,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    selectedRating,
    priceGTE,
    priceLTE,
  } = useSelector((state) => state.product);
  const cartItems = useSelector((state) => state.cart.items);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const fetchData = useCallback(async () => {
    await Promise.all([
      dispatch(getCategories()).unwrap(),
      dispatch(getProducts()).unwrap(),
    ]);
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(
      (product) => String(product?.category?._id) === String(selectedCategory),
    );
  }, [products, selectedCategory]);

  useEffect(() => {
    fetchData().catch(() => {});
  }, [fetchData]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      dispatch(getProducts());
    }, 250);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [dispatch, searchQuery, selectedRating, priceGTE, priceLTE]);

  const handleSearch = (text) => {
    dispatch(setSearchQuery(text));
  };

  const handleCategoryPress = (categoryId) => {
    dispatch(
      setSelectedCategory(selectedCategory === categoryId ? null : categoryId),
    );
  };

  const handlePriceChange = (field, value) => {
    const sanitizedValue = value.replace(/[^0-9]/g, "");

    dispatch(
      setPriceRange({
        [field]: sanitizedValue,
      }),
    );
  };

  const handleClearPriceRange = () => {
    dispatch(
      setPriceRange({
        priceGTE: "",
        priceLTE: "",
      }),
    );
  };

  const handleRatingPress = (rating) => {
    dispatch(setSelectedRating(selectedRating === rating ? null : rating));
  };

  const handleClearAllFilters = () => {
    dispatch(clearFilters());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  return {
    products: filteredProducts,
    categories,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    selectedRating,
    priceGTE: String(priceGTE ?? ""),
    priceLTE: String(priceLTE ?? ""),
    handleSearch,
    handleCategoryPress,
    handleRatingPress,
    handleClearAllFilters,
    handlePriceChange,
    handleClearPriceRange,
    fetchData,
    refreshing,
    handleRefresh,
  };
};

export default useHome;
