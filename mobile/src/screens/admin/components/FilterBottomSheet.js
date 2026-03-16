import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';

const FilterBottomSheet = forwardRef(({ filters = [], activeFilters = {}, onApply, onReset, onFilterChange }, ref) => {
  const snapPoints = useMemo(() => ['40%', '60%'], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={onReset}>
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {filters.map((section) => (
          <View key={section.key} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            <View style={styles.chipsWrap}>
              {section.options.map((option) => {
                const isActive = activeFilters[section.key] === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => onFilterChange?.(section.key, option.value)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
});

FilterBottomSheet.displayName = 'FilterBottomSheet';

export default FilterBottomSheet;

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    ...SHADOW.lg,
  },
  indicator: {
    backgroundColor: COLORS.surfaceBorder,
    width: 40,
  },
  content: {
    padding: SPACING.lg,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  resetText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: FONT.medium,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: FONT.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.background,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  applyText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: FONT.semibold,
  },
});
