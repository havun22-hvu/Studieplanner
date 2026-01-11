import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Card, Button } from '@/components/common';
import { useAuth } from '@/store';
import { api } from '@/services/api';
import { colors, typography, spacing } from '@/constants/theme';

export function StatsScreen() {
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPremium) {
      loadStats();
    } else {
      setIsLoading(false);
    }
  }, [isPremium]);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Statistieken" />
        <View style={styles.lockedContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>Premium Functie</Text>
          <Text style={styles.lockedText}>
            Statistieken zijn alleen beschikbaar voor premium gebruikers.
          </Text>
          <Button
            title="Upgrade naar Premium"
            onPress={() => Linking.openURL('https://havun.nl/studieplanner/premium')}
            style={styles.upgradeButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Statistieken" />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <Text style={styles.loadingText}>Laden...</Text>
        ) : stats ? (
          <>
            <Card style={styles.card}>
              <Text style={styles.statLabel}>Totale studietijd deze week</Text>
              <Text style={styles.statValue}>{stats.totalHoursWeek || 0} uur</Text>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.statLabel}>Sessies voltooid</Text>
              <Text style={styles.statValue}>{stats.sessionsCompleted || 0}</Text>
            </Card>
            <Card style={styles.card}>
              <Text style={styles.statLabel}>Gemiddelde sessieduur</Text>
              <Text style={styles.statValue}>{stats.avgSessionMinutes || 0} min</Text>
            </Card>
          </>
        ) : (
          <Text style={styles.errorText}>Kon statistieken niet laden</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  statLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  loadingText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.danger,
    marginTop: spacing.xl,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  lockedTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  lockedText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  upgradeButton: {
    minWidth: 200,
  },
});
