import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from '../../../constants/adminTheme';

export default function SearchBar({ placeholder = 'Search...', value, onChangeText, onClear }) {
  const [focused, setFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChangeText?.('');
    onClear?.();
  }, [onChangeText, onClear]);

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    height: 44,
  },
  containerFocused: {
    borderColor: COLORS.primary,
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: FONT.regular,
  },
  clearBtn: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
