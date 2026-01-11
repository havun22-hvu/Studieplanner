import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card, Button, EmptyState, Modal, Input } from '@/components/common';
import { api } from '@/services/api';
import { colors, typography, spacing } from '@/constants/theme';

interface Student {
  id: number;
  name: string;
  student_code: string;
  is_studying: boolean;
  last_activity?: string;
}

export function MentorDashboardScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadStudents = async () => {
    try {
      const data = await api.getMentorStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStudents();
  };

  const handleAddStudent = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Fout', 'Vul een code in');
      return;
    }

    setIsAdding(true);
    try {
      await api.acceptStudent(inviteCode.trim());
      setShowAddModal(false);
      setInviteCode('');
      loadStudents();
      Alert.alert('Succes', 'Leerling gekoppeld!');
    } catch (error: any) {
      if (error.status === 404) {
        Alert.alert('Fout', 'Ongeldige of verlopen code');
      } else {
        Alert.alert('Fout', 'Kon leerling niet koppelen');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <Card style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>{item.name}</Text>
        <View style={[styles.statusDot, item.is_studying && styles.statusActive]} />
      </View>
      <Text style={styles.statusText}>
        {item.is_studying ? '🟢 Studeert nu' : '⚪ Niet actief'}
      </Text>
      {item.last_activity && (
        <Text style={styles.lastActivity}>
          Laatst actief: {new Date(item.last_activity).toLocaleDateString('nl-NL')}
        </Text>
      )}
    </Card>
  );

  if (students.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Mijn leerlingen" />
        <EmptyState
          icon="👥"
          title="Geen leerlingen"
          description="Koppel je eerste leerling via een invite code"
          actionLabel="+ Leerling koppelen"
          onAction={() => setShowAddModal(true)}
        />
        <AddStudentModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          inviteCode={inviteCode}
          setInviteCode={setInviteCode}
          onAdd={handleAddStudent}
          isAdding={isAdding}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Mijn leerlingen" />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStudent}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          <Button
            title="+ Leerling koppelen"
            onPress={() => setShowAddModal(true)}
            variant="ghost"
            style={styles.addButton}
          />
        }
      />

      <AddStudentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
        onAdd={handleAddStudent}
        isAdding={isAdding}
      />
    </SafeAreaView>
  );
}

function AddStudentModal({
  visible,
  onClose,
  inviteCode,
  setInviteCode,
  onAdd,
  isAdding,
}: {
  visible: boolean;
  onClose: () => void;
  inviteCode: string;
  setInviteCode: (code: string) => void;
  onAdd: () => void;
  isAdding: boolean;
}) {
  return (
    <Modal visible={visible} onClose={onClose} title="Leerling koppelen">
      <Text style={styles.modalText}>
        Vraag je leerling om een invite code te genereren in de app.
      </Text>
      <Input
        label="Invite code"
        value={inviteCode}
        onChangeText={setInviteCode}
        placeholder="ABC123"
        autoCapitalize="characters"
      />
      <Button
        title="Koppelen"
        onPress={onAdd}
        loading={isAdding}
        fullWidth
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  studentCard: {
    marginBottom: spacing.md,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  studentName: {
    ...typography.h3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textSecondary,
  },
  statusActive: {
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.bodySmall,
    marginBottom: spacing.xs,
  },
  lastActivity: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addButton: {
    marginTop: spacing.md,
  },
  modalText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
