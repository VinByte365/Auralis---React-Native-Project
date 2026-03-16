import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/user/HomeScreen";

const UserStackNavigation = createNativeStackNavigator({
  screens: {
    Home: {
        screen:HomeScreen,
        options:{
            headerShown:false
        }
    },
  },
});

export default UserStackNavigation
