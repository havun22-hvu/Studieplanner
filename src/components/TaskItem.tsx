import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borders } from '@/constants/theme';
import type { StudyTask } from '@/types';

interface TaskItemProps {
  task: StudyTask;
  onToggle: () => void;
  onPress: () => void;
}

export function TaskItem({ task, onToggle, onPress }: TaskItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={onToggle}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[styles.description, task.completed && styles.descriptionCompleted]}
          numberOfLines={1}
        >
          {task.description}
        </Text>
        <Text style={styles.details}>
          {task.plannedAmount} {task.unit} · {task.estimatedMinutes} min
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borders.radius.sm,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  details: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
