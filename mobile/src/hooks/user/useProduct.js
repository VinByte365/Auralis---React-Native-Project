import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetails } from "../../redux/thunks/productThunks";
import { getProductReviews } from "../../redux/thunks/reviewThunks";
import { fetchProducts } from "../../services/productService";
import { getOrders } from "../../redux/thunks/orderThunks";

const useProduct = (productId) => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const { productDetails, isLoading } = useSelector((state) => state.product);
  const [isLiked, setIsLiked] = useState(false);
  const [showReviewEditor, setShowReviewEditor] = useState(false);
  const [reviewEditorMode, setReviewEditorMode] = useState("add");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const {
    orders,
    isLoading: orderLoading,
    productIds,
  } = useSelector((state) => state.order);
  const {
    reviews,
    summary,
    isLoading: reviewLoading,
    error: reviewError,
  } = useSelector((state) => state.review);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!productId) return;
    dispatch(getOrders());
    dispatch(getProductDetails(productId));
    dispatch(getProductReviews(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (productIds.includes(productId)) setCanReview(true);
    console.log("reviews", reviews);
    console.log("can Review", canReview);
  }, [orders, productIds]);

  useEffect(() => {
    let isMounted = true;

    if (!productDetails?._id || !productDetails?.category?._id) {
      setSuggestedProducts([]);
      return;
    }

    const loadSuggestions = async () => {
      try {
        const result = await fetchProducts({
          categoryId: productDetails.category._id,
        });
        const allProducts = Array.isArray(result?.products)
          ? result.products
          : [];
        const suggestions = allProducts
          .filter((item) => String(item?._id) !== String(productDetails._id))
          .slice(0, 6);

        if (isMounted) {
          setSuggestedProducts(suggestions);
        }
      } catch (error) {
        if (isMounted) {
          setSuggestedProducts([]);
        }
      }
    };

    loadSuggestions();

    return () => {
      isMounted = false;
    };
  }, [productDetails]);

  const displayPrice = useMemo(() => {
    if (!productDetails) return "0.00";

    return Number(
      productDetails.saleActive && productDetails.salePrice
        ? productDetails.salePrice
        : productDetails.price || 0,
    ).toFixed(2);
  }, [productDetails]);

  const openAddReviewEditor = () => {
    if (!canReview) return;
    setReviewEditorMode("add");
    setShowReviewEditor(true);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      setIsSubmittingReview(true);

      await new Promise((resolve) => setTimeout(resolve, 400));

      Alert.alert(
        reviewEditorMode === "update"
          ? "Mock review updated"
          : "Mock review submitted",
        `Rating: ${rating}\nComment: ${comment}`,
      );
      setShowReviewEditor(false);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!productDetails?._id) return;

    try {
      await dispatch(
        addToCart({ product: productDetails, quantity: 1 }),
      ).unwrap();
      Alert.alert(
        "Added to cart",
        `${productDetails.name} was added to your cart.`,
      );
    } catch (error) {
      Alert.alert(
        "Unable to add",
        error?.error || error?.message || "Please try again.",
      );
    }
  };

  const handleOrderNow = async () => {
    if (!productDetails?._id) return;

    try {
      await dispatch(
        addToCart({ product: productDetails, quantity: 1 }),
      ).unwrap();
      navigation.navigate("Cart");
    } catch (error) {
      Alert.alert(
        "Unable to order",
        error?.error || error?.message || "Please try again.",
      );
    }
  };
  return {
    productDetails,
    isLoading,
    reviews,
    summary,
    reviewLoading,
    reviewError,
    suggestedProducts,
    displayPrice,
    canReview,
    isLiked,
    showReviewEditor,
    reviewEditorMode,
    isSubmittingReview,
    setShowReviewEditor,
    setIsLiked,
    handleAddToCart,
    handleOrderNow,
    handleReviewSubmit,
    openAddReviewEditor,
  };
};

export default useProduct;
