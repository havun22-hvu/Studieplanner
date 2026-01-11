import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { subjectColors, spacing, borders } from '@/constants/theme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

export function ColorPicker({
  value,
  onChange,
  colors = subjectColors,
}: ColorPickerProps) {
  return (
    <View style={styles.container}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            value === color && styles.selected,
          ]}
          onPress={() => onChange(color)}
          activeOpacity={0.7}
        >
          {value === color && (
            <View style={styles.checkmark}>
              <View style={styles.checkmarkInner} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: borders.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkInner: {
    width: 8,
    height: 8,
    borderRadius: borders.radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
