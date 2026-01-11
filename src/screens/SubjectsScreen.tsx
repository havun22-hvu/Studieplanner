import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header, EmptyState } from '@/components/common';
import { SubjectCard } from '@/components/SubjectCard';
import { useSubjects } from '@/store';
import { colors, spacing, borders, shadows } from '@/constants/theme';

export function SubjectsScreen() {
  const navigation = useNavigation<any>();
  const { subjects, isLoading } = useSubjects();

  const handleSubjectPress = (subjectId: string) => {
    navigation.navigate('SubjectDetail', { subjectId });
  };

  const handleAddPress = () => {
    navigation.navigate('SubjectDetail', { subjectId: null });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  if (subjects.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Vakken"
          rightIcon={<Text style={styles.settingsIcon}>⚙️</Text>}
          onRightPress={handleSettingsPress}
        />
        <EmptyState
          icon="📚"
          title="Nog geen vakken"
          description="Voeg je eerste vak toe om te beginnen met plannen"
          actionLabel="+ Vak toevoegen"
          onAction={handleAddPress}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Vakken"
        rightIcon={<Text style={styles.settingsIcon}>⚙️</Text>}
        onRightPress={handleSettingsPress}
      />

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubjectCard
            subject={item}
            onPress={() => handleSubjectPress(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
  settingsIcon: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borders.radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.textInverse,
    lineHeight: 32,
  },
});
