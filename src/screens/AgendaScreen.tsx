import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, getWeek } from 'date-fns';
import { nl } from 'date-fns/locale';
import { WeekView } from '@/components/WeekView';
import { Shelf } from '@/components/Shelf';
import { useSubjects, useSessions } from '@/store';
import { colors, typography, spacing } from '@/constants/theme';

export function AgendaScreen() {
  const navigation = useNavigation<any>();
  const { subjects } = useSubjects();
  const {
    sessions,
    selectedWeek,
    getSessionsForWeek,
    getShelfSessions,
    nextWeek,
    prevWeek,
  } = useSessions();

  const weekSessions = getSessionsForWeek(selectedWeek);
  const shelfSessions = getShelfSessions();
  const weekNumber = getWeek(selectedWeek, { weekStartsOn: 1 });

  const handleSessionPress = (session: any) => {
    navigation.navigate('Timer', { sessionId: session.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevWeek} style={styles.navButton}>
          <Text style={styles.navIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.weekTitle}>Week {weekNumber}</Text>

        <TouchableOpacity onPress={nextWeek} style={styles.navButton}>
          <Text style={styles.navIcon}>→</Text>
        </TouchableOpacity>
      </View>

      <Shelf
        sessions={shelfSessions}
        subjects={subjects}
        onSessionPress={handleSessionPress}
      />

      <WeekView
        sessions={weekSessions}
        subjects={subjects}
        weekStart={selectedWeek}
        onSessionPress={handleSessionPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  weekTitle: {
    ...typography.h3,
  },
});
