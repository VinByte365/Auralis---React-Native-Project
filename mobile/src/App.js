import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import RootStackNavigation from "./navigations/RootStackNavigation";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { hydrateSession } from "./redux/thunks/authThunk";
import { hydrateCart } from "./redux/thunks/cartThunks";
import {
  clearNotificationSubscription,
  handleNotificationNavigation,
  registerForPushNotificationsAsync,
  subscribeToForegroundNotifications,
  subscribeToNotificationResponses,
} from "./services/notificationService";
import { registerPushToken } from "./services/userService";

function Bootstrapper() {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const navigationRef = useNavigationContainerRef();
  const foregroundSubscription = useRef(null);
  const responseSubscription = useRef(null);
  const syncedPushTokenRef = useRef("");
  const pushTokenRef = useRef("");
  const pushPlatformRef = useRef("unknown");
  const syncIntervalRef = useRef(null);
  const authIdentity = String(user?._id || user?.userId || user?.id || "");

  useEffect(() => {
    dispatch(hydrateSession());
    dispatch(hydrateCart());

    let mounted = true;

    async function syncPushToken() {
      if (!isLoggedIn || !mounted) return;

      if (!pushTokenRef.current) {
        const { token, platform, error } =
          await registerForPushNotificationsAsync();

        if (error) {
          console.log("[PUSH][SYNC] token acquisition error", { error });
        }

        pushTokenRef.current = token || "";
        pushPlatformRef.current = platform || "unknown";
      }

      const token = pushTokenRef.current;
      const platform = pushPlatformRef.current;

      if (!token) return;

      const syncKey = `${authIdentity || "session"}:${token}`;
      if (syncedPushTokenRef.current === syncKey) return;

      try {
        await registerPushToken(token, platform || "unknown");
        syncedPushTokenRef.current = syncKey;
        console.log("[PUSH][SYNC] token synced", {
          authIdentity,
          platform,
        });
      } catch (error) {
        console.log("[PUSH][SYNC] token sync failed", {
          authIdentity,
          platform,
          message: error?.message,
          code: error?.code,
        });
      }
    }

    async function setupNotifications() {
      try {
        const { token, platform, error } =
          await registerForPushNotificationsAsync();

        if (error) {
          console.log("[PUSH][SETUP] registration warning", { error });
        }

        pushTokenRef.current = token || "";
        pushPlatformRef.current = platform || "unknown";

        if (!isLoggedIn) {
          syncedPushTokenRef.current = "";
        }

        const syncKey = `${authIdentity || "session"}:${token || ""}`;

        if (
          isLoggedIn &&
          token &&
          mounted &&
          syncedPushTokenRef.current !== syncKey
        ) {
          await registerPushToken(token, platform || "unknown");
          syncedPushTokenRef.current = syncKey;
        }

        // Push token registered
      } catch (notificationError) {
        console.log("[PUSH][SETUP] error", {
          message: notificationError?.message,
        });
      }
    }

    setupNotifications();

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    if (isLoggedIn) {
      syncPushToken();
      syncIntervalRef.current = setInterval(() => {
        syncPushToken();
      }, 30000);
    }

    foregroundSubscription.current = subscribeToForegroundNotifications(
      () => {},
    );

    responseSubscription.current = subscribeToNotificationResponses(
      (response) => {
        handleNotificationNavigation(navigationRef, response);
      },
    );

    return () => {
      mounted = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      clearNotificationSubscription(foregroundSubscription.current);
      clearNotificationSubscription(responseSubscription.current);
    };
  }, [dispatch, isLoggedIn, authIdentity]);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStackNavigation />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Bootstrapper />
    </Provider>
  );
}
