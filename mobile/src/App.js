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
  const authIdentity = String(user?._id || user?.userId || user?.id || "");

  useEffect(() => {
    dispatch(hydrateSession());
    dispatch(hydrateCart());

    let mounted = true;

    async function setupNotifications() {
      try {
        const { token, platform, error } =
          await registerForPushNotificationsAsync();

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

        if (token && mounted) {
          console.log("Expo push token:", token);
        }
        if (error && mounted) {
          console.log("Push setup:", error);
        }
      } catch (notificationError) {
        if (mounted) {
          console.log(
            "Push setup failed:",
            notificationError?.message || notificationError,
          );
        }
      }
    }

    setupNotifications();

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
