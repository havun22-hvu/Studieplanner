import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { Header, Button, Input, Card, ColorPicker, Modal, DatePicker } from '@/components/common';
import { TaskItem } from '@/components/TaskItem';
import { useSubjects } from '@/store';
import { colors, typography, spacing, subjectColors } from '@/constants/theme';
import type { StudyTask, TaskUnit } from '@/types';

export function SubjectDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { subjectId } = route.params || {};

  const { subjects, getSubject, addSubject, updateSubject, deleteSubject, addTask, updateTask, deleteTask, toggleTaskCompleted } = useSubjects();

  const existingSubject = subjectId ? getSubject(subjectId) : null;
  const isNew = !existingSubject;

  // Subject form state
  const [name, setName] = useState(existingSubject?.name || '');
  const [color, setColor] = useState(existingSubject?.color || subjectColors[0]);
  const [examDate, setExamDate] = useState(existingSubject?.examDate || format(new Date(), 'yyyy-MM-dd'));

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAmount, setTaskAmount] = useState('');
  const [taskUnit, setTaskUnit] = useState<TaskUnit>('blz');
  const [taskMinutes, setTaskMinutes] = useState('');

  const tasks = existingSubject?.tasks || [];

  useEffect(() => {
    if (existingSubject) {
      setName(existingSubject.name);
      setColor(existingSubject.color);
      setExamDate(existingSubject.examDate);
    }
  }, [existingSubject]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Fout', 'Vul een naam in');
      return;
    }

    try {
      if (isNew) {
        await addSubject({ name: name.trim(), color, examDate });
      } else {
        await updateSubject(subjectId, { name: name.trim(), color, examDate });
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      const msg = error?.message || String(error);
      Alert.alert('Fout', `Kon vak niet opslaan: ${msg}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Vak verwijderen',
      `Weet je zeker dat je "${name}" wilt verwijderen? Alle taken worden ook verwijderd.`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            await deleteSubject(subjectId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const openTaskModal = (task?: StudyTask) => {
    if (task) {
      setEditingTask(task);
      setTaskDescription(task.description);
      setTaskAmount(task.plannedAmount.toString());
      setTaskUnit(task.unit);
      setTaskMinutes(task.estimatedMinutes.toString());
    } else {
      setEditingTask(null);
      setTaskDescription('');
      setTaskAmount('');
      setTaskUnit('blz');
      setTaskMinutes('');
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskDescription.trim() || !taskAmount || !taskMinutes) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    const taskData = {
      description: taskDescription.trim(),
      plannedAmount: parseInt(taskAmount, 10),
      unit: taskUnit,
      estimatedMinutes: parseInt(taskMinutes, 10),
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else if (subjectId) {
      await addTask(subjectId, taskData);
    }

    setShowTaskModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Taak verwijderen',
      'Weet je zeker dat je deze taak wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: () => deleteTask(subjectId, taskId),
        },
      ]
    );
  };

  const renderDeleteButton = () => {
    if (isNew) return null;
    return (
      <TouchableOpacity onPress={handleDelete}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={isNew ? 'Nieuw vak' : name}
        showBack
        onBack={() => navigation.goBack()}
        rightIcon={renderDeleteButton()}
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.formSection}>
            <Input
              label="Naam"
              value={name}
              onChangeText={setName}
              placeholder="Bijv. Nederlands"
            />

            <View style={styles.field}>
              <Text style={styles.label}>Kleur</Text>
              <ColorPicker value={color} onChange={setColor} />
            </View>

            <DatePicker
              label="Toetsdatum"
              value={examDate}
              onChange={setExamDate}
            />

            <Button
              title="Opslaan"
              onPress={handleSave}
              fullWidth
              style={styles.saveButton}
            />

            {!isNew && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Taken</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={() => toggleTaskCompleted(subjectId, item.id)}
            onPress={() => openTaskModal(item)}
          />
        )}
        ListFooterComponent={
          !isNew ? (
            <Button
              title="+ Taak toevoegen"
              onPress={() => openTaskModal()}
              variant="ghost"
              style={styles.addTaskButton}
            />
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      <Modal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? 'Taak bewerken' : 'Nieuwe taak'}
      >
        <Input
          label="Beschrijving"
          value={taskDescription}
          onChangeText={setTaskDescription}
          placeholder="Bijv. Hoofdstuk 1-3"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Hoeveelheid"
              value={taskAmount}
              onChangeText={setTaskAmount}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Eenheid</Text>
            <View style={styles.unitButtons}>
              {(['blz', 'opdrachten', 'min video'] as TaskUnit[]).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    taskUnit === unit && styles.unitButtonActive,
                  ]}
                  onPress={() => setTaskUnit(unit)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      taskUnit === unit && styles.unitButtonTextActive,
                    ]}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Input
          label="Geschatte tijd (minuten)"
          value={taskMinutes}
          onChangeText={setTaskMinutes}
          placeholder="90"
          keyboardType="numeric"
        />

        <View style={styles.modalButtons}>
          {editingTask && (
            <Button
              title="Verwijderen"
              onPress={() => {
                setShowTaskModal(false);
                handleDeleteTask(editingTask.id);
              }}
              variant="danger"
              style={styles.deleteButton}
            />
          )}
          <Button
            title="Opslaan"
            onPress={handleSaveTask}
            fullWidth={!editingTask}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  formSection: {
    padding: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  addTaskButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  deleteIcon: {
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  unitButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  unitButtonTextActive: {
    color: colors.textInverse,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  deleteButton: {
    flex: 1,
  },
});
