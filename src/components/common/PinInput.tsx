import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, typography, spacing, borders } from '@/constants/theme';

interface PinInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  length?: number;
}

export function PinInput({
  value,
  onChangeText,
  error,
  length = 4,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    // Only allow digits and limit to length
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    onChangeText(cleaned);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.boxesContainer}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.box,
              error && styles.boxError,
              index < value.length && styles.boxFilled,
            ]}
          >
            <Text style={styles.digit}>
              {value[index] ? '\u2022' : ''}
            </Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        maxLength={length}
        caretHidden
        autoComplete="off"
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  box: {
    width: 48,
    height: 56,
    backgroundColor: colors.glass,
    borderWidth: borders.width.thin,
    borderColor: colors.glassBorder,
    borderRadius: borders.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxError: {
    borderColor: colors.danger,
  },
  boxFilled: {
    borderColor: colors.primary,
  },
  digit: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
