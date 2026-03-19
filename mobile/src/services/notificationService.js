import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

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

  if (!Device.isDevice) {
    return {
      token: "",
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
      error: "Push notification permission was not granted.",
    };
  }

  const projectId = getProjectId();

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  return {
    token: tokenResponse?.data || "",
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
  Notifications.removeNotificationSubscription(subscription);
}

export function handleNotificationNavigation(navigationRef, response) {
  const data = response?.notification?.request?.content?.data || {};
  const targetRoute = data?.screen || data?.route || "";
  const params = data?.params || {};

  if (!navigationRef?.isReady?.()) return;

  if (targetRoute) {
    navigationRef.navigate(targetRoute, params);
  }
}
