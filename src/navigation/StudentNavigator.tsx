import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  SubjectsScreen,
  SubjectDetailScreen,
  AgendaScreen,
  TimerScreen,
  SettingsScreen,
} from '@/screens';
import { colors } from '@/constants/theme';
import type {
  StudentTabParamList,
  SubjectsStackParamList,
  AgendaStackParamList,
  SettingsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const SubjectsStack = createStackNavigator<SubjectsStackParamList>();
const AgendaStack = createStackNavigator<AgendaStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

function SubjectsStackNavigator() {
  return (
    <SubjectsStack.Navigator screenOptions={{ headerShown: false }}>
      <SubjectsStack.Screen name="SubjectsList" component={SubjectsScreen} />
      <SubjectsStack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
    </SubjectsStack.Navigator>
  );
}

function AgendaStackNavigator() {
  return (
    <AgendaStack.Navigator screenOptions={{ headerShown: false }}>
      <AgendaStack.Screen name="AgendaView" component={AgendaScreen} />
      <AgendaStack.Screen name="Timer" component={TimerScreen} />
    </AgendaStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

export function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 56,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Subjects"
        component={SubjectsStackNavigator}
        options={{
          tabBarLabel: 'Vakken',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaStackNavigator}
        options={{
          tabBarLabel: 'Planning',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📅</Text>
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
