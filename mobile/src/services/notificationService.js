import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

function resolvePlatform() {
  const os = String(Device.osName || "").toLowerCase();
  if (os.includes("android")) return "android";
  if (os.includes("ios")) return "ios";
  if (os.includes("web")) return "web";
  return "unknown";
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Device.osName !== "Android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
    sound: "default",
  });

  // Create order-specific notification channel
  await Notifications.setNotificationChannelAsync("order", {
    name: "Order Updates",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#2196F3",
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });

  // Create promotion-specific notification channel
  await Notifications.setNotificationChannelAsync("promotion", {
    name: "Promotions & Discounts",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#FF9800",
    sound: "default",
    vibrationPattern: [0, 150, 150, 150],
  });
}

function getProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    undefined
  );
}

export async function registerForPushNotificationsAsync() {
  await ensureAndroidChannel();
  const platform = resolvePlatform();

  if (!Device.isDevice) {
    return {
      token: "",
      platform,
      error: "Push notifications require a physical device.",
    };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return {
      token: "",
      platform,
      error: "Push notification permission was not granted.",
    };
  }

  const projectId = getProjectId();

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  return {
    token: tokenResponse?.data || "",
    platform,
    error: "",
  };
}

export function subscribeToForegroundNotifications(onReceive) {
  return Notifications.addNotificationReceivedListener((notification) => {
    onReceive?.(notification);
  });
}

export function subscribeToNotificationResponses(onResponse) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    onResponse?.(response);
  });
}

export function clearNotificationSubscription(subscription) {
  if (!subscription) return;

  if (typeof subscription.remove === "function") {
    subscription.remove();
    return;
  }

  if (typeof Notifications.removeNotificationSubscription === "function") {
    Notifications.removeNotificationSubscription(subscription);
  }
}

export function handleNotificationNavigation(navigationRef, response) {
  const notification = response?.notification?.request?.content;
  const data = notification?.data || {};

  let targetRoute = data?.screen || data?.route || "";
  let params = data?.params || {};
  const details = data?.details || {};

  // Parse string params
  if (typeof params === "string") {
    try {
      params = JSON.parse(params);
    } catch {
      params = {};
    }
  }

  // Parse details
  let parsedDetails = details;
  if (typeof details === "string") {
    try {
      parsedDetails = JSON.parse(details);
    } catch {
      parsedDetails = {};
    }
  }

  // Parse actions if present
  let actions = [];
  if (data?.actions) {
    try {
      actions =
        typeof data.actions === "string"
          ? JSON.parse(data.actions)
          : data.actions;
    } catch {
      actions = [];
    }
  }

  // Extract fallback params from data if params is empty
  if (
    !params ||
    typeof params !== "object" ||
    Object.keys(params).length === 0
  ) {
    const {
      screen,
      route,
      to,
      target,
      categoryIdentifier,
      subtitle,
      sound,
      actions: _,
      details: __,
      ...rest
    } = data || {};
    params = rest;
  }

  // Merge details into params for backward compatibility
  params = {
    ...params,
    ...parsedDetails,
    notificationId: data?.notificationId,
    timestamp: data?.timestamp,
  };

  if (!navigationRef?.isReady?.()) {
    return;
  }

  if (targetRoute) {
    navigationRef.navigate(targetRoute, params);
  }
}

/**
 * Handle notification action (e.g., button clicks)
 */
export function handleNotificationAction(navigationRef, response, actionId) {
  handleNotificationNavigation(navigationRef, response);
}

/**
 * Create notification actions for order updates
 */
export function createOrderNotificationActions(orderId) {
  return [
    {
      id: "view_order",
      title: "View Order",
      icon: "visibility",
    },
    {
      id: "track",
      title: "Track",
      icon: "location-on",
    },
  ];
}

/**
 * Create notification actions for promotions
 */
export function createPromoNotificationActions(promoCode) {
  return [
    {
      id: "view_promo",
      title: "View Promo",
      icon: "local-offer",
    },
    {
      id: "copy_code",
      title: "Copy Code",
      icon: "content-copy",
    },
  ];
}

/**
 * Create notification actions for product discounts
 */
export function createProductNotificationActions(productId) {
  return [
    {
      id: "view_product",
      title: "View Product",
      icon: "shopping-bag",
    },
    {
      id: "add_to_cart",
      title: "Add to Cart",
      icon: "add-shopping-cart",
    },
  ];
}

/**
 * Get notification channel ID based on notification type
 */
export function getNotificationChannelId(notificationType) {
  const type = String(notificationType || "").toLowerCase();
  if (type.includes("order")) return "order";
  if (type.includes("promo") || type.includes("promotion")) return "promotion";
  return "default";
}

/**
 * Format notification badge count
 */
export function getNotificationBadge(count) {
  const num = Number(count || 0);
  return num > 0 ? Math.min(num, 99) : 0;
}
