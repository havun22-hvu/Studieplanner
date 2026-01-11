import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header, Button, Modal, Input } from '@/components/common';
import { TimerDisplay } from '@/components/TimerDisplay';
import { useTimer, useSubjects, useSessions } from '@/store';
import { api } from '@/services/api';
import { useAuth } from '@/store';
import { colors, typography, spacing } from '@/constants/theme';
import type { PlannedSession } from '@/types';

export function TimerScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { sessionId } = route.params || {};

  const { isAuthenticated } = useAuth();
  const { subjects, getSubject } = useSubjects();
  const { sessions, updateSession, addSession } = useSessions();
  const {
    timerState,
    activeSession,
    elapsedSeconds,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  } = useTimer();

  // Find session and subject
  const session = sessions.find(s => s.id === sessionId);
  const subject = session ? getSubject(session.subjectId) : null;

  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [amountDone, setAmountDone] = useState('');
  const [completedPercent, setCompletedPercent] = useState(100);
  const [knowledgeRating, setKnowledgeRating] = useState<number | null>(null);

  if (!session || !subject) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Timer" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Sessie niet gevonden</Text>
        </View>
      </SafeAreaView>
    );
  }

  const plannedSeconds = session.minutesPlanned * 60;
  const task = subject.tasks.find(t => t.id === session.taskId);

  const handleStart = async () => {
    await startTimer(session);
  };

  const handlePause = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleStop = () => {
    Alert.alert(
      'Stoppen',
      'Weet je zeker dat je wilt stoppen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Stoppen',
          onPress: async () => {
            const result = await stopTimer();
            setAmountDone(session.amountPlanned.toString());
            setShowResultModal(true);
          },
        },
      ]
    );
  };

  const handleSaveResult = async () => {
    const minutesActual = Math.ceil(elapsedSeconds / 60) || 1;
    const amountActual = parseInt(amountDone, 10) || session.amountPlanned;
    const completed = completedPercent === 100;

    // Update session
    await updateSession(session.id, {
      minutesActual,
      amountActual,
      completed,
      knowledgeRating: knowledgeRating || undefined,
    });

    // If not 100% completed, create new session for remainder
    if (!completed && completedPercent < 100) {
      const remainingAmount = Math.ceil(session.amountPlanned * (1 - completedPercent / 100));
      const remainingMinutes = Math.ceil(session.minutesPlanned * (1 - completedPercent / 100));

      await addSession({
        date: session.date,
        hour: null, // Goes to shelf
        subjectId: session.subjectId,
        taskId: session.taskId,
        minutesPlanned: remainingMinutes,
        amountPlanned: remainingAmount,
        unit: session.unit,
      });
    }

    // Notify server
    if (isAuthenticated) {
      try {
        await api.stopSession({
          session_id: session.id,
          minutes_actual: minutesActual,
          amount_actual: amountActual,
          knowledge_rating: knowledgeRating || undefined,
          completed,
        });
      } catch (error) {
        console.error('Error stopping session on server:', error);
      }
    }

    setShowResultModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Timer" showBack onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.sessionInfo}>
          <View style={[styles.colorDot, { backgroundColor: subject.color }]} />
          <Text style={styles.subjectName}>{subject.name}</Text>
        </View>

        {task && (
          <Text style={styles.taskName}>{task.description}</Text>
        )}

        <Text style={styles.details}>
          {session.amountPlanned} {session.unit} · {session.minutesPlanned} min
        </Text>

        <TimerDisplay
          elapsedSeconds={isRunning ? elapsedSeconds : 0}
          plannedSeconds={plannedSeconds}
          isRunning={isRunning}
        />

        <View style={styles.buttons}>
          {!isRunning ? (
            <Button
              title="▶ Start"
              onPress={handleStart}
              size="large"
              fullWidth
            />
          ) : (
            <>
              <Button
                title={isPaused ? '▶ Hervat' : '⏸ Pauze'}
                onPress={handlePause}
                variant="secondary"
                size="large"
                style={styles.halfButton}
              />
              <Button
                title="⏹ Stop"
                onPress={handleStop}
                variant="danger"
                size="large"
                style={styles.halfButton}
              />
            </>
          )}
        </View>
      </View>

      <Modal
        visible={showResultModal}
        onClose={() => {}}
        title="Sessie voltooid"
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultSubject}>{subject.name} - {task?.description}</Text>
          <Text style={styles.resultTime}>
            Tijd: {Math.ceil(elapsedSeconds / 60)} min
          </Text>
        </View>

        <Input
          label="Hoeveel gedaan?"
          value={amountDone}
          onChangeText={setAmountDone}
          keyboardType="numeric"
          placeholder={session.amountPlanned.toString()}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Percentage voltooid: {completedPercent}%</Text>
          <View style={styles.percentButtons}>
            {[25, 50, 75, 100].map((pct) => (
              <Button
                key={pct}
                title={`${pct}%`}
                onPress={() => setCompletedPercent(pct)}
                variant={completedPercent === pct ? 'primary' : 'secondary'}
                size="small"
              />
            ))}
          </View>
        </View>

        {completedPercent < 100 && (
          <Text style={styles.remainderNote}>
            Er wordt een nieuw blok aangemaakt voor het restant.
          </Text>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Hoe goed ken je het? (optioneel)</Text>
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <Button
                key={rating}
                title={rating.toString()}
                onPress={() => setKnowledgeRating(rating)}
                variant={knowledgeRating === rating ? 'primary' : 'ghost'}
                size="small"
                style={styles.ratingButton}
              />
            ))}
          </View>
        </View>

        <Button
          title="Opslaan"
          onPress={handleSaveResult}
          fullWidth
          style={styles.saveButton}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sessionInfo: {
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
  subjectName: {
    ...typography.h2,
  },
  taskName: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  details: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.xl,
  },
  halfButton: {
    flex: 1,
  },
  resultHeader: {
    marginBottom: spacing.lg,
  },
  resultSubject: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  resultTime: {
    ...typography.body,
    color: colors.textSecondary,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  percentButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  remainderNote: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  ratingButton: {
    width: 40,
    paddingHorizontal: 0,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
