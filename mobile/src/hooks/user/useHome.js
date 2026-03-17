import React, { useEffect, useState, useRef } from "react";
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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getProducts());
  }, [dispatch]);

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
  }, [
    dispatch,
    searchQuery,
    selectedCategory,
    selectedRating,
    priceGTE,
    priceLTE,
  ]);

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

  return {
    products,
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
  };
};

export default useHome;
