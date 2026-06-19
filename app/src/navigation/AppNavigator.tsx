import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import FlashcardsScreen from '../screens/FlashcardsScreen';
import LessonsScreen from '../screens/LessonsScreen';
import QuizScreen from '../screens/QuizScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();

const TEAL = '#0B7B8C';
const GRAY = '#9CA3AF';

const ICONS: Record<string, string> = {
  Home: '🏠',
  Cards: '📚',
  Lessons: '📖',
  Quiz: '✏️',
  Chat: '💬',
};

function makeTabIcon(label: string): BottomTabNavigationOptions['tabBarIcon'] {
  return ({ focused }) => (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{ICONS[label]}</Text>
      <Text style={{ fontSize: 10, color: focused ? TEAL : GRAY, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E7EB',
            height: 70,
            paddingBottom: 8,
          },
        }}
      >
        <Tab.Screen name="Home"    component={HomeScreen}       options={{ tabBarIcon: makeTabIcon('Home') }} />
        <Tab.Screen name="Cards"   component={FlashcardsScreen} options={{ tabBarIcon: makeTabIcon('Cards') }} />
        <Tab.Screen name="Lessons" component={LessonsScreen}    options={{ tabBarIcon: makeTabIcon('Lessons') }} />
        <Tab.Screen name="Quiz"    component={QuizScreen}       options={{ tabBarIcon: makeTabIcon('Quiz') }} />
        <Tab.Screen name="Chat"    component={ChatScreen}       options={{ tabBarIcon: makeTabIcon('Chat') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
