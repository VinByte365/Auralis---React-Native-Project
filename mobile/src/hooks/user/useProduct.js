import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetails } from "../../redux/thunks/productThunks";
import {
  addReview,
  editReview,
  getProductReviews,
  removeReview,
} from "../../redux/thunks/reviewThunks";
import { fetchProducts } from "../../services/productService";
import { getOrders } from "../../redux/thunks/orderThunks";
import { addToCart } from "../../redux/thunks/cartThunks";

const useProduct = (productId, navigation) => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const { productDetails, isLoading } = useSelector((state) => state.product);
  const user = useSelector((state) => state.auth.user);
  const [isLiked, setIsLiked] = useState(false);
  const [showReviewEditor, setShowReviewEditor] = useState(false);
  const [reviewEditorMode, setReviewEditorMode] = useState("add");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { orders } = useSelector((state) => state.order);
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

  const userId = user?._id || user?.userId || "";

  const myReview = useMemo(() => {
    if (!userId || !Array.isArray(reviews)) return null;

    return (
      reviews.find((review) => {
        const reviewUserId = review?.user?._id || review?.user;
        return String(reviewUserId) === String(userId);
      }) || null
    );
  }, [reviews, userId]);

  const hasCompletedOrderForProduct = useMemo(() => {
    if (!productId || !Array.isArray(orders)) return false;

    return orders.some(
      (order) =>
        order?.status === "COMPLETED" &&
        Array.isArray(order?.items) &&
        order.items.some((item) => {
          const itemProductId = item?.product?._id || item?.product;
          return String(itemProductId) === String(productId);
        }),
    );
  }, [orders, productId]);

  const canReview = hasCompletedOrderForProduct && !myReview;

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

  const openEditReviewEditor = () => {
    if (!myReview) return;
    setReviewEditorMode("update");
    setShowReviewEditor(true);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      setIsSubmittingReview(true);

      if (reviewEditorMode === "update" && myReview?._id) {
        await dispatch(
          editReview({
            reviewId: myReview._id,
            payload: { rating, comment },
          }),
        ).unwrap();
      } else {
        await dispatch(
          addReview({
            rating,
            comment,
            productId,
          }),
        ).unwrap();
      }

      await dispatch(getProductReviews(productId)).unwrap();

      Alert.alert(
        reviewEditorMode === "update" ? "Review updated" : "Review submitted",
        "Thank you for active review!"
      );
      setShowReviewEditor(false);
    } catch (error) {
      Alert.alert(
        "Unable to save review",
        error?.error || error?.message || "Please try again.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview?._id) return;

    try {
      setIsSubmittingReview(true);
      await dispatch(removeReview(myReview._id)).unwrap();
      await dispatch(getProductReviews(productId)).unwrap();
      Alert.alert("Review deleted", "Your review has been removed.");
      setShowReviewEditor(false);
    } catch (error) {
      Alert.alert(
        "Unable to delete review",
        error?.error || error?.message || "Please try again.",
      );
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
    userId,
    productDetails,
    isLoading,
    reviews,
    summary,
    reviewLoading,
    reviewError,
    suggestedProducts,
    displayPrice,
    canReview,
    myReview,
    isLiked,
    showReviewEditor,
    reviewEditorMode,
    isSubmittingReview,
    setShowReviewEditor,
    setIsLiked,
    handleAddToCart,
    handleOrderNow,
    handleReviewSubmit,
    handleDeleteReview,
    openAddReviewEditor,
    openEditReviewEditor,
  };
};

export default useProduct;
