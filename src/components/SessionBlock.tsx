import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borders, layout } from '@/constants/theme';
import type { PlannedSession, Subject } from '@/types';

interface SessionBlockProps {
  session: PlannedSession;
  subject: Subject;
  onPress: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
  compact?: boolean;
}

// Helper to determine if text should be white or black based on background
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? colors.textPrimary : colors.textInverse;
}

export function SessionBlock({
  session,
  subject,
  onPress,
  onLongPress,
  isDragging = false,
  compact = false,
}: SessionBlockProps) {
  const textColor = getContrastColor(subject.color);
  const height = compact ? 60 : Math.max(session.minutesPlanned, 30);

  // Find task name
  const task = subject.tasks.find(t => t.id === session.taskId);
  const taskName = task?.description || '';

  // Truncate subject name if needed
  const shortName = subject.name.length > 10
    ? subject.name.substring(0, 8) + '...'
    : subject.name;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: subject.color,
          height,
          opacity: isDragging ? 0.7 : session.completed ? 0.6 : 1,
        },
        isDragging && styles.dragging,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
        {shortName}
      </Text>
      {!compact && taskName && (
        <Text style={[styles.task, { color: textColor }]} numberOfLines={1}>
          {taskName.length > 8 ? taskName.substring(0, 6) + '...' : taskName}
        </Text>
      )}
      <Text style={[styles.duration, { color: textColor }]}>
        {session.minutesPlanned}m
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borders.radius.sm,
    padding: spacing.xs,
    justifyContent: 'space-between',
    minWidth: 50,
  },
  dragging: {
    transform: [{ scale: 1.05 }],
  },
  name: {
    ...typography.buttonSmall,
    fontWeight: '600',
  },
  task: {
    ...typography.caption,
    opacity: 0.9,
  },
  duration: {
    ...typography.caption,
    opacity: 0.8,
  },
});
