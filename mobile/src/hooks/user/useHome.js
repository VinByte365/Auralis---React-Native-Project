import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const useHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(1);

  const userState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSearch = (text) => {
    setSearchQuery(text);
    console.log("Searching for:", text);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    console.log("Selected category:", categoryId);
  };

  return { searchQuery, handleSearch, handleCategoryPress, selectedCategory };
};

export default useHome;
