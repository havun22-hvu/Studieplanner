import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, PinInput } from '@/components/common';
import { useAuth } from '@/store';
import { colors, typography, spacing } from '@/constants/theme';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('');
  const [isMentor, setIsMentor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Vul je naam in');
      return;
    }

    if (pincode.length !== 4) {
      setError('Pincode moet 4 cijfers zijn');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(name.trim(), pincode);
      } else {
        await register(name.trim(), pincode, isMentor ? 'mentor' : 'student');
      }
    } catch (err: any) {
      if (err.status === 401) {
        setError('Naam of pincode onjuist');
      } else if (err.status === 422) {
        setError('Deze naam is al in gebruik');
      } else {
        setError('Er ging iets mis. Probeer het opnieuw.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPincode('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Studieplanner</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welkom terug!' : 'Maak een account'}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Naam"
              value={name}
              onChangeText={setName}
              placeholder="Je naam"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <View style={styles.pinContainer}>
              <Text style={styles.pinLabel}>Pincode</Text>
              <PinInput
                value={pincode}
                onChangeText={setPincode}
              />
            </View>

            {!isLogin && (
              <TouchableOpacity
                style={styles.mentorToggle}
                onPress={() => setIsMentor(!isMentor)}
              >
                <View style={[styles.checkbox, isMentor && styles.checkboxChecked]}>
                  {isMentor && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.mentorLabel}>Ik ben mentor/ouder</Text>
              </TouchableOpacity>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={isLogin ? 'Inloggen' : 'Registreren'}
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
            />

            <TouchableOpacity onPress={toggleMode} style={styles.switchButton}>
              <Text style={styles.switchText}>
                {isLogin ? 'Nog geen account? ' : 'Al een account? '}
                <Text style={styles.switchLink}>
                  {isLogin ? 'Registreren' : 'Inloggen'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  pinContainer: {
    marginBottom: spacing.md,
  },
  pinLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  mentorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  mentorLabel: {
    ...typography.body,
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  switchButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  switchText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
