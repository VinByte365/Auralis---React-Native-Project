import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/user/HomeScreen";
import ProductScreen from "../screens/user/ProductScreen";
import CartScreen from "../screens/user/CartScreen";
import CheckoutScreen from "../screens/user/CheckoutScreen";

const Stack = createNativeStackNavigator();

export default function UserHomeStackNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}
