import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStackNavigation from "./AuthStackNavigation";
import UserStackNavigation from "./UserStackNavigation";

const MergeNavigations = createNativeStackNavigator({
  screens: {
    Auth: {
      screen: AuthStackNavigation,
    },
    User: {
      screen: UserStackNavigation,
    },
    Admin:{
      
    }
  },
  screenOptions: {
    headerShown: false,
  },
});

export default MergeNavigations;
