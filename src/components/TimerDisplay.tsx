import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';

interface TimerDisplayProps {
  elapsedSeconds: number;
  plannedSeconds?: number;
  isRunning: boolean;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function TimerDisplay({
  elapsedSeconds,
  plannedSeconds,
  isRunning,
}: TimerDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.elapsed, isRunning && styles.running]}>
        {formatTime(elapsedSeconds)}
      </Text>
      {plannedSeconds !== undefined && (
        <Text style={styles.planned}>/ {formatTime(plannedSeconds)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  elapsed: {
    ...typography.timer,
    color: colors.textPrimary,
  },
  running: {
    color: colors.primary,
  },
  planned: {
    ...typography.timerSmall,
    marginTop: spacing.sm,
  },
});
