import React from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const authStack = createNativeStackNavigator({
  screens: {
    Login: {
      screen: LoginScreen,
      options: { title: "Welcome back bitch" },
    },
    Register:{
      screen: RegisterScreen,
      options: { title: "Create an account" },
    }
  },
});


export default authStack
