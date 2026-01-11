import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borders } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 8,
  showPercentage = false,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{percentage}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: borders.radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borders.radius.full,
  },
  percentage: {
    ...typography.caption,
    marginLeft: spacing.sm,
    minWidth: 36,
    textAlign: 'right',
  },
});
