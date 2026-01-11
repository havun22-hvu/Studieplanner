import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Card, ProgressBar } from './common';
import { colors, typography, spacing } from '@/constants/theme';
import type { Subject } from '@/types';

interface SubjectCardProps {
  subject: Subject;
  onPress: () => void;
}

export function SubjectCard({ subject, onPress }: SubjectCardProps) {
  const completedTasks = subject.tasks.filter(t => t.completed).length;
  const totalTasks = subject.tasks.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const formattedDate = format(parseISO(subject.examDate), 'd MMM', { locale: nl });

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.colorDot, { backgroundColor: subject.color }]} />
        <Text style={styles.name}>{subject.name}</Text>
      </View>

      <Text style={styles.date}>Toets: {formattedDate}</Text>

      <Text style={styles.tasks}>
        {completedTasks}/{totalTasks} taken klaar
      </Text>

      <ProgressBar
        progress={progress}
        color={subject.color}
        showPercentage
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.h3,
    flex: 1,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tasks: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
