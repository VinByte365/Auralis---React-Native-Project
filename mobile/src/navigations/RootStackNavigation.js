import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import AuthStackNavigation from "./AuthStackNavigation";
import AdminDrawerNavigation from "./AdminDrawerNavigation";
import UserStackNavigation from "./UserStackNavigation";

function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function RootStackNavigation() {
  const userState = useSelector((state) => state.auth);
  const resolvedUser =
    userState?.user?.user && typeof userState.user.user === "object"
      ? userState.user.user
      : userState?.user || {};
  const hasUserIdentity = Boolean(
    resolvedUser?._id || resolvedUser?.userId || resolvedUser?.id,
  );
  const roleValue =
    resolvedUser?.role ??
    userState?.user?.role ??
    userState?.role ??
    userState?.userRole;
  const normalizedRole =
    typeof roleValue === "string" ? roleValue.trim().toLowerCase() : "";
  const isBootstrapping = !userState?.bootstrapped;
  const isAuthenticated = Boolean(userState?.isLoggedIn || hasUserIdentity);
  const isSignedIn = userState?.bootstrapped && isAuthenticated;
  const isAdmin =
    normalizedRole === "admin" ||
    normalizedRole === "superadmin" ||
    normalizedRole === "super_admin" ||
    normalizedRole.includes("admin");
  const isSignedOut = userState?.bootstrapped && !isAuthenticated;
  // console.log(userState)
  // console.log(isBootstrapping,isSignedIn,isSignedOut)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isBootstrapping && (
        <Stack.Screen name="Splash" component={SplashScreen} />
      )}
      {isSignedOut && (
        <Stack.Screen name="Auth" component={AuthStackNavigation} />
      )}
      {isSignedIn && isAdmin && (
        <Stack.Screen name="Admin" component={AdminDrawerNavigation} />
      )}
      {isSignedIn && !isAdmin && (
        <Stack.Screen name="User" component={UserStackNavigation} />
      )}

      {!isBootstrapping && !isSignedIn && !isSignedOut && (
        <Stack.Screen name="AuthFallback" component={AuthStackNavigation} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
