import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/store';
import { AuthScreen } from '@/screens';
import { StudentNavigator } from './StudentNavigator';
import { MentorNavigator } from './MentorNavigator';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    // Could show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : user?.role === 'mentor' ? (
          <Stack.Screen name="MentorMain" component={MentorNavigator} />
        ) : (
          <Stack.Screen name="StudentMain" component={StudentNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
