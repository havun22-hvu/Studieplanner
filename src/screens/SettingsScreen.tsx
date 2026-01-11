import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header, Card, Button, Modal, Input } from '@/components/common';
import { useAuth } from '@/store';
import { api } from '@/services/api';
import { colors, typography, spacing, borders } from '@/constants/theme';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const isPremium = user?.isPremium || false;

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await api.generateInviteCode();
      setInviteCode(result.code);
      setInviteExpiry(result.expiresAt);
      setShowInviteModal(true);
    } catch (error) {
      Alert.alert('Fout', 'Kon geen code genereren');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatsPress = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium',
        'Statistieken zijn alleen beschikbaar voor premium gebruikers.',
        [
          { text: 'Annuleren', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => Linking.openURL('https://havun.nl/studieplanner/premium'),
          },
        ]
      );
      return;
    }
    navigation.navigate('Stats');
  };

  const handleLogout = () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Uitloggen', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Instellingen" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile section */}
        <Text style={styles.sectionTitle}>PROFIEL</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Naam</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>
              {user?.role === 'student' ? 'Student' : 'Mentor'}
            </Text>
          </View>
          {user?.studentCode && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Code</Text>
                <Text style={styles.value}>{user.studentCode}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Premium section */}
        <Text style={styles.sectionTitle}>PREMIUM</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.value, isPremium && styles.premiumValue]}>
              {isPremium ? 'Actief' : 'Gratis'}
            </Text>
          </View>
          {!isPremium && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.row}
                onPress={() => Linking.openURL('https://havun.nl/studieplanner/premium')}
              >
                <Text style={styles.linkLabel}>Upgrade naar Premium</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Stats section (premium) */}
        <Text style={styles.sectionTitle}>
          STATISTIEKEN {!isPremium && '🔒'}
        </Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleStatsPress}>
            <Text style={[styles.label, !isPremium && styles.locked]}>
              Bekijk statistieken
            </Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Mentor section (for students) */}
        {user?.role === 'student' && (
          <>
            <Text style={styles.sectionTitle}>MENTOR KOPPELING</Text>
            <Card style={styles.card}>
              <TouchableOpacity
                style={styles.row}
                onPress={handleGenerateCode}
                disabled={isGenerating}
              >
                <Text style={styles.label}>
                  {isGenerating ? 'Genereren...' : 'Code genereren'}
                </Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Logout */}
        <Button
          title="Uitloggen"
          onPress={handleLogout}
          variant="ghost"
          style={styles.logoutButton}
        />
      </ScrollView>

      <Modal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Code"
      >
        <Text style={styles.codeLabel}>Deel deze code met je mentor:</Text>
        <View style={styles.codeBox}>
          <Text style={styles.code}>{inviteCode}</Text>
        </View>
        <Text style={styles.expiry}>
          Geldig tot: {new Date(inviteExpiry).toLocaleString('nl-NL')}
        </Text>
        <Button
          title="Sluiten"
          onPress={() => setShowInviteModal(false)}
          fullWidth
          style={styles.closeButton}
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
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  label: {
    ...typography.body,
  },
  value: {
    ...typography.body,
    color: colors.textSecondary,
  },
  premiumValue: {
    color: colors.success,
    fontWeight: '600',
  },
  linkLabel: {
    ...typography.body,
    color: colors.primary,
  },
  arrow: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  locked: {
    color: colors.textSecondary,
  },
  logoutButton: {
    marginTop: spacing.xxl,
  },
  codeLabel: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  codeBox: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borders.radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  code: {
    ...typography.h1,
    letterSpacing: 4,
    color: colors.primary,
  },
  expiry: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  closeButton: {
    marginTop: spacing.md,
  },
});
