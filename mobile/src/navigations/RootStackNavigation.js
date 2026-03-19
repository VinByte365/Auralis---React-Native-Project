import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import AuthStackNavigation from "./AuthStackNavigation";
<<<<<<< HEAD
import AdminDrawerNavigation from "./AdminDrawerNavigation";

const MergeNavigations = createNativeStackNavigator({
  screens: {
    auth: {
      screen: AuthStackNavigation,
    },
    AdminDrawer: {
      screen: AdminDrawerNavigation,
    },
  },
  screenOptions: {
    headerShown: false,
=======
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
  const hasUserIdentity = Boolean(
    userState?.user?._id || userState?.user?.userId,
  );
  const isBootstrapping = !userState?.bootstrapped;
  const isSignedIn =
    userState?.bootstrapped && userState?.isLoggedIn && hasUserIdentity;
  const isSignedOut = userState?.bootstrapped && !userState?.isLoggedIn;
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
      {isSignedIn && (
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
>>>>>>> 22ed45e54210b5385b334f0d158be6c4826b6af3
  },
});
