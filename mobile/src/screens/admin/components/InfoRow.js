import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '../../../constants/adminTheme';

export default function InfoRow({ label, value, icon }) {
  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  value: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: FONT.semibold,
    flex: 1,
    textAlign: 'right',
  },
});
