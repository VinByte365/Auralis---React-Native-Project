import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT, SHADOW } from '../../../constants/adminTheme';

export default function AppHeader({ title, subtitle, actions = [], onBack, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        {navigation && (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <TouchableOpacity key={i} onPress={action.onPress} style={styles.actionBtn}>
              <Text style={styles.actionLabel}>{action.icon || action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOW.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  menuBtn: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  menuIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  actionLabel: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: FONT.semibold,
  },
});
