import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SessionBlock } from './SessionBlock';
import { colors, typography, spacing, layout, borders } from '@/constants/theme';
import type { PlannedSession, Subject } from '@/types';

interface ShelfProps {
  sessions: PlannedSession[];
  subjects: Subject[];
  onSessionPress: (session: PlannedSession) => void;
}

export function Shelf({ sessions, subjects, onSessionPress }: ShelfProps) {
  const getSubject = (subjectId: string) =>
    subjects.find(s => s.id === subjectId);

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Plank</Text>
        <View style={styles.emptyShelf}>
          <Text style={styles.emptyText}>Geen ongeplande blokken</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Plank (ongepland)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sessions.map(session => {
          const subject = getSubject(session.subjectId);
          if (!subject) return null;

          return (
            <View key={session.id} style={styles.blockWrapper}>
              <SessionBlock
                session={session}
                subject={subject}
                onPress={() => onSessionPress(session)}
                compact
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.label,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  blockWrapper: {
    width: 80,
  },
  emptyShelf: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: borders.radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
