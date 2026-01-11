import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing, borders, inputSize } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

export function Input({
  value,
  onChangeText,
  label,
  error,
  placeholder,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
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
    height: inputSize.height,
    paddingHorizontal: inputSize.paddingHorizontal,
    fontSize: inputSize.fontSize,
    backgroundColor: colors.surface,
    borderWidth: inputSize.borderWidth,
    borderColor: colors.border,
    borderRadius: inputSize.borderRadius,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
