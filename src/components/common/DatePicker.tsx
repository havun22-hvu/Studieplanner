import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { nl } from 'date-fns/locale';
import { colors, typography, spacing, borders } from '@/constants/theme';

interface DatePickerProps {
  label?: string;
  value: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
}

export function DatePicker({ label, value, onChange, placeholder = 'Selecteer datum' }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Parse the date string to a Date object
  const dateValue = value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date();

  // Format for display
  const displayValue = value
    ? format(dateValue, 'd MMMM yyyy', { locale: nl })
    : placeholder;

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // iOS keeps picker open
    if (selectedDate) {
      onChange(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {displayValue}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borders.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  text: {
    ...typography.body,
    flex: 1,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  icon: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
});
