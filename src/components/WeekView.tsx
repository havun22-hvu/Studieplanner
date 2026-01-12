import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { SessionBlock } from './SessionBlock';
import { colors, typography, spacing, borders, layout } from '@/constants/theme';
import type { PlannedSession, Subject } from '@/types';

interface WeekViewProps {
  sessions: PlannedSession[];
  subjects: Subject[];
  weekStart: Date;
  onSessionPress: (session: PlannedSession) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 7 }, (_, i) => i);
const HOUR_HEIGHT = layout.hourHeight;
const SCREEN_WIDTH = Dimensions.get('window').width;
const TIME_COLUMN_WIDTH = 40;
const DAY_WIDTH = (SCREEN_WIDTH - TIME_COLUMN_WIDTH - spacing.md * 2) / 7;

export function WeekView({
  sessions,
  subjects,
  weekStart,
  onSessionPress,
}: WeekViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to 8:00 on mount
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 8 * HOUR_HEIGHT, animated: false });
    }, 100);
  }, []);

  const getSubject = (subjectId: string) =>
    subjects.find(s => s.id === subjectId);

  const getSessionsForDayHour = (dayIndex: number, hour: number) => {
    const date = addDays(weekStart, dayIndex);
    const dateStr = format(date, 'yyyy-MM-dd');

    return sessions.filter(s =>
      s.date === dateStr && s.hour === hour
    );
  };

  const renderDayHeader = () => (
    <View style={styles.dayHeaderRow}>
      <View style={styles.timeColumnHeader} />
      {DAYS.map(dayIndex => {
        const date = addDays(weekStart, dayIndex);
        const isToday = isSameDay(date, new Date());

        return (
          <View key={dayIndex} style={styles.dayHeader}>
            <Text style={[styles.dayName, isToday && styles.todayText]}>
              {format(date, 'EEE', { locale: nl })}
            </Text>
            <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
              {format(date, 'd')}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderTimeGrid = () => (
    <View style={styles.gridContainer}>
      {/* Time column */}
      <View style={styles.timeColumn}>
        {HOURS.map(hour => (
          <View key={hour} style={styles.timeCell}>
            <Text style={styles.timeText}>
              {hour.toString().padStart(2, '0')}:00
            </Text>
          </View>
        ))}
      </View>

      {/* Day columns */}
      {DAYS.map(dayIndex => (
        <View key={dayIndex} style={styles.dayColumn}>
          {HOURS.map(hour => {
            const daySessions = getSessionsForDayHour(dayIndex, hour);

            return (
              <View key={hour} style={styles.hourCell}>
                {daySessions.map(session => {
                  const subject = getSubject(session.subjectId);
                  if (!subject) return null;

                  return (
                    <SessionBlock
                      key={session.id}
                      session={session}
                      subject={subject}
                      onPress={() => onSessionPress(session)}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderDayHeader()}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTimeGrid()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingVertical: spacing.sm,
  },
  timeColumnHeader: {
    width: TIME_COLUMN_WIDTH,
  },
  dayHeader: {
    width: DAY_WIDTH,
    alignItems: 'center',
  },
  dayName: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  dayNumber: {
    ...typography.body,
    fontWeight: '600',
  },
  todayText: {
    color: colors.primary,
  },
  todayNumber: {
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
  },
  timeCell: {
    height: HOUR_HEIGHT,
    justifyContent: 'flex-start',
    paddingTop: 2,
    paddingRight: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    fontSize: 10,
  },
  dayColumn: {
    width: DAY_WIDTH,
    borderLeftWidth: 1,
    borderLeftColor: colors.glassBorder,
  },
  hourCell: {
    height: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    padding: 1,
  },
});
