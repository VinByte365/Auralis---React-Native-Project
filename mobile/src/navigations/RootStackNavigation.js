import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStackNavigation from "./AuthStackNavigation";

const MergeNavigations = createNativeStackNavigator({
  screens: {
    auth: {
      screen: AuthStackNavigation,
    },
  },
  screenOptions: {
    headerShown: false,
  },
});

export default MergeNavigations;
