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
  }, [orders, productIds]);

  console.log("reviews", reviews)
  console.log("can Review", canReview);
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

  return {
    productDetails,
    isLoading,
    reviews,
    summary,
    reviewLoading,
    reviewError,
    suggestedProducts,
    displayPrice,
  };
};

export default useProduct;
