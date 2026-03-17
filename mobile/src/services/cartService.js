import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_STORAGE_KEY = "auralis-cart";

export const getStoredCart = async () => {
  const cart = await AsyncStorage.getItem(CART_STORAGE_KEY);
  if (!cart) return [];

  try {
    return JSON.parse(cart);
  } catch {
    return [];
  }
};

export const saveStoredCart = async (items = []) => {
  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const clearStoredCart = async () => {
  await AsyncStorage.removeItem(CART_STORAGE_KEY);
  return true;
};

export const upsertCartItem = async (product, quantity = 1) => {
  const items = await getStoredCart();
  const existingIndex = items.findIndex(
    (item) => item.productId === product._id,
  );

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity,
    };
  } else {
    items.push({
      productId: product._id,
      name: product.name,
      price:
        product.saleActive && product.salePrice
          ? product.salePrice
          : product.price,
      image: product.images?.[0]?.url || null,
      quantity,
    });
  }

  return saveStoredCart(items);
};

export const removeStoredCartItem = async (productId) => {
  const items = await getStoredCart();
  const nextItems = items.filter((item) => item.productId !== productId);
  return saveStoredCart(nextItems);
};
