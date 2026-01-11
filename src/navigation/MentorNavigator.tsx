import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MentorDashboardScreen, SettingsScreen } from '@/screens';
import { colors } from '@/constants/theme';
import type { MentorTabParamList, SettingsStackParamList } from './types';

const Tab = createBottomTabNavigator<MentorTabParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

export function MentorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 12,
          paddingTop: 8,
          paddingHorizontal: 16,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 8,
        },
      }}
    >
      <Tab.Screen
        name="Students"
        component={MentorDashboardScreen}
        options={{
          tabBarLabel: 'Leerlingen',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Instellingen',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
