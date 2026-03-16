import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStackNavigation from "./AuthStackNavigation";
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
  },
});

export default MergeNavigations;
