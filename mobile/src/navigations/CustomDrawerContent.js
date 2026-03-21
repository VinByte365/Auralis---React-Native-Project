import React, { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { logout } from "../redux/thunks/authThunk";
import { COLORS, FONT, RADIUS, SPACING } from "../constants/adminTheme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MENU_GROUPS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "view-dashboard-outline",
    screen: "AdminDashboard",
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: "chart-line",
    children: [
      {
        key: "analyticsOverview",
        label: "Overview",
        screen: "AnalyticsOverview",
      },
      {
        key: "analyticsProduct",
        label: "Products",
        screen: "AnalyticsProduct",
      },
      { key: "analyticsUser", label: "Users", screen: "AnalyticsUser" },
      {
        key: "analyticsOperation",
        label: "Operations",
        screen: "AnalyticsOperation",
      },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    icon: "shape-outline",
    screen: "CategoryList",
  },
  {
    key: "orders",
    label: "Orders",
    icon: "package-variant-closed",
    children: [
      { key: "orderList", label: "All Orders", screen: "OrderList" },
      { key: "orderDetails", label: "Order Details", screen: "OrderDetails" },
    ],
  },
  {
    key: "products",
    label: "Products",
    icon: "shopping-outline",
    children: [
      { key: "productList", label: "All Products", screen: "ProductList" },
      { key: "inventory", label: "Inventory", screen: "Inventory" },
      { key: "recycleBin", label: "Recycle Bin", screen: "RecycleBin" },
    ],
  },
  {
    key: "promotions",
    label: "Promotions",
    icon: "ticket-percent-outline",
    screen: "PromoList",
  },
  {
    key: "users",
    label: "Users",
    icon: "account-group-outline",
    screen: "UserList",
  },
];

function hasActiveChild(group, activeRouteName) {
  if (!Array.isArray(group.children)) return false;
  return group.children.some((child) => child.screen === activeRouteName);
}

export default function CustomDrawerContent(props) {
  const { state, navigation } = props;
  const dispatch = useDispatch();
  const activeRouteName = state.routes[state.index]?.name;

  const [expandedGroups, setExpandedGroups] = useState({
    analytics: true,
    orders: true,
    products: true,
  });

  const computedExpanded = useMemo(() => {
    const next = { ...expandedGroups };
    MENU_GROUPS.forEach((group) => {
      if (hasActiveChild(group, activeRouteName)) {
        next[group.key] = true;
      }
    });
    return next;
  }, [activeRouteName, expandedGroups]);

  const toggleGroup = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>AD</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Auralis</Text>
          <Text style={styles.headerSubtitle}>Administration</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.menuScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_GROUPS.map((group) => {
          const hasChildren =
            Array.isArray(group.children) && group.children.length > 0;
          const isExpanded = computedExpanded[group.key];
          const isActive =
            (!hasChildren && activeRouteName === group.screen) ||
            hasActiveChild(group, activeRouteName);

          return (
            <View key={group.key}>
              <TouchableOpacity
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() =>
                  hasChildren
                    ? toggleGroup(group.key)
                    : navigateTo(group.screen)
                }
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={group.icon}
                  size={18}
                  color={
                    isActive ? COLORS.sidebarIconActive : COLORS.sidebarIcon
                  }
                  style={styles.menuIcon}
                />
                <Text
                  style={[styles.menuLabel, isActive && styles.menuLabelActive]}
                >
                  {group.label}
                </Text>
                {hasChildren && (
                  <MaterialCommunityIcons
                    name={isExpanded ? "chevron-down" : "chevron-right"}
                    size={18}
                    color={COLORS.sidebarIcon}
                  />
                )}
              </TouchableOpacity>

              {hasChildren && isExpanded && (
                <View style={styles.subMenu}>
                  {group.children.map((child) => {
                    const isChildActive = activeRouteName === child.screen;
                    return (
                      <TouchableOpacity
                        key={child.key}
                        style={[
                          styles.subMenuItem,
                          isChildActive && styles.subMenuItemActive,
                        ]}
                        onPress={() => navigateTo(child.screen)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.subDot,
                            isChildActive && styles.subDotActive,
                          ]}
                        />
                        <Text
                          style={[
                            styles.subMenuLabel,
                            isChildActive && styles.subMenuLabelActive,
                          ]}
                        >
                          {child.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => dispatch(logout())}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="logout"
            size={18}
            color={COLORS.danger}
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sidebarBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 52,
    paddingBottom: SPACING.lg,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: FONT.bold,
  },
  headerInfo: {
    marginLeft: SPACING.md,
  },
  headerTitle: {
    color: COLORS.sidebarTextActive,
    fontSize: 17,
    fontWeight: FONT.bold,
  },
  headerSubtitle: {
    color: COLORS.sidebarText,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginHorizontal: SPACING.lg,
  },
  menuScrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: 2,
  },
  menuItemActive: {
    backgroundColor: COLORS.sidebarActive,
  },
  menuIcon: {
    marginRight: SPACING.sm,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: FONT.medium,
    color: COLORS.sidebarText,
  },
  menuLabelActive: {
    color: COLORS.sidebarTextActive,
    fontWeight: FONT.semibold,
  },
  subMenu: {
    paddingLeft: 42,
    marginBottom: SPACING.xs,
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.sm,
    marginBottom: 1,
  },
  subMenuItemActive: {
    backgroundColor: COLORS.sidebarActive,
  },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.sidebarIcon,
    marginRight: SPACING.sm,
  },
  subDotActive: {
    backgroundColor: COLORS.sidebarIconActive,
  },
  subMenuLabel: {
    fontSize: 13,
    color: COLORS.sidebarText,
    fontWeight: FONT.regular,
  },
  subMenuLabelActive: {
    color: COLORS.sidebarTextActive,
    fontWeight: FONT.medium,
  },
  footer: {
    paddingBottom: 32,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  logoutIcon: {
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: FONT.medium,
  },
});
