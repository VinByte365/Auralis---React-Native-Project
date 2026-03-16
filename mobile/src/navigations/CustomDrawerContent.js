import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/adminTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MENU_GROUPS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    screen: 'AdminDashboard',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: '📈',
    children: [
      { key: 'analyticsOverview', label: 'Overview', screen: 'AnalyticsOverview' },
      { key: 'analyticsProduct', label: 'Products', screen: 'AnalyticsProduct' },
      { key: 'analyticsUser', label: 'Users', screen: 'AnalyticsUser' },
      { key: 'analyticsOperation', label: 'Operations', screen: 'AnalyticsOperation' },
    ],
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: '🗂️',
    screen: 'CategoryList',
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: '📦',
    children: [
      { key: 'orderList', label: 'All Orders', screen: 'OrderList' },
      { key: 'orderDetails', label: 'Order Details', screen: 'OrderDetails' },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    icon: '🛒',
    children: [
      { key: 'productList', label: 'All Products', screen: 'ProductList' },
      { key: 'inventory', label: 'Inventory', screen: 'Inventory' },
      { key: 'recycleBin', label: 'Recycle Bin', screen: 'RecycleBin' },
    ],
  },
  {
    key: 'users',
    label: 'Users',
    icon: '👤',
    screen: 'UserList',
  },
];

export default function CustomDrawerContent(props) {
  const { state, navigation } = props;
  const [expandedGroups, setExpandedGroups] = useState({ analytics: false, orders: false, products: false });
  const activeRouteName = state.routes[state.index]?.name;

  const toggleGroup = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Auralis</Text>
          <Text style={styles.headerSubtitle}>Admin Panel</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Menu */}
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {MENU_GROUPS.map((group) => {
          const hasChildren = group.children && group.children.length > 0;
          const isExpanded = expandedGroups[group.key];
          const isActive = !hasChildren && activeRouteName === group.screen;

          return (
            <View key={group.key}>
              <TouchableOpacity
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => {
                  if (hasChildren) {
                    toggleGroup(group.key);
                  } else {
                    navigateTo(group.screen);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{group.icon}</Text>
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                  {group.label}
                </Text>
                {hasChildren && (
                  <Text style={styles.chevron}>{isExpanded ? '▾' : '▸'}</Text>
                )}
              </TouchableOpacity>

              {hasChildren && isExpanded && (
                <View style={styles.subMenu}>
                  {group.children.map((child) => {
                    const isChildActive = activeRouteName === child.screen;
                    return (
                      <TouchableOpacity
                        key={child.key}
                        style={[styles.subMenuItem, isChildActive && styles.subMenuItemActive]}
                        onPress={() => navigateTo(child.screen)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.subDot, isChildActive && styles.subDotActive]} />
                        <Text style={[styles.subMenuLabel, isChildActive && styles.subMenuLabelActive]}>
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
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutIcon}>🚪</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 52,
    paddingBottom: SPACING.lg,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: 18,
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
    backgroundColor: '#1E293B',
    marginHorizontal: SPACING.lg,
  },
  menuScroll: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 18,
    width: 28,
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
  chevron: {
    fontSize: 14,
    color: COLORS.sidebarIcon,
  },
  subMenu: {
    paddingLeft: 44,
    marginBottom: SPACING.xs,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: FONT.medium,
  },
});
