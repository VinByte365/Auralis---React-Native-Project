import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { logout } from "../redux/thunks/authThunk";
import UserHomeStackNavigation from "./UserHomeStackNavigation";
import OrderScreen from "../screens/user/OrderScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import MoreScreen from "../screens/user/MoreScreen";

const Drawer = createDrawerNavigator();

function UserDrawerContent(props) {
  const dispatch = useDispatch();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Sign out"
        onPress={() => dispatch(logout())}
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="logout" size={size} color={color} />
        )}
      />
    </DrawerContentScrollView>
  );
}

export default function UserStackNavigation() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <UserDrawerContent {...props} />}
      screenOptions={{
        headerTitleAlign: "center",
        drawerActiveTintColor: "#111",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={UserHomeStackNavigation}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Order"
        component={OrderScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="More"
        component={MoreScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="dots-horizontal-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
