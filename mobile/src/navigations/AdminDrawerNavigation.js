import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "./CustomDrawerContent";
import { COLORS } from "../constants/adminTheme";

// Screens
import AdminDashboard from "../screens/admin/AdminDashboard";
import AnalyticsOverview from "../screens/admin/analyticsModule/analyticsOverview";
import AnalyticsProduct from "../screens/admin/analyticsModule/analyticsProduct";
import AnalyticsUser from "../screens/admin/analyticsModule/analyticsUser";
import AnalyticsOperation from "../screens/admin/analyticsModule/analyticsOperation";
import CategoryList from "../screens/admin/categoryManagement/categoryList";
import OrderList from "../screens/admin/orderManagement/orderList";
import OrderDetails from "../screens/admin/orderManagement/orderDetails";
import ProductList from "../screens/admin/productManagement/productList";
import Inventory from "../screens/admin/productManagement/inventory";
import RecycleBin from "../screens/admin/productManagement/recycleBin";
import PromoList from "../screens/admin/promoManagement/promoList";
import UserList from "../screens/admin/userManagement/userList";

const Drawer = createDrawerNavigator();

export default function AdminDrawerNavigation() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: COLORS.sidebarBg,
        },
        drawerType: "front",
        overlayColor: COLORS.overlay,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} />
      <Drawer.Screen name="AnalyticsOverview" component={AnalyticsOverview} />
      <Drawer.Screen name="AnalyticsProduct" component={AnalyticsProduct} />
      <Drawer.Screen name="AnalyticsUser" component={AnalyticsUser} />
      <Drawer.Screen name="AnalyticsOperation" component={AnalyticsOperation} />
      <Drawer.Screen name="CategoryList" component={CategoryList} />
      <Drawer.Screen name="OrderList" component={OrderList} />
      <Drawer.Screen name="OrderDetails" component={OrderDetails} />
      <Drawer.Screen name="ProductList" component={ProductList} />
      <Drawer.Screen name="Inventory" component={Inventory} />
      <Drawer.Screen name="RecycleBin" component={RecycleBin} />
      <Drawer.Screen name="PromoList" component={PromoList} />
      <Drawer.Screen name="UserList" component={UserList} />
    </Drawer.Navigator>
  );
}
