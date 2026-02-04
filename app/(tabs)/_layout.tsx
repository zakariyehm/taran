import HomeIcon from '@/components/icons/home-icon';
import SettingsIcon from '@/components/icons/settings-icon';
import SwapIcon from '@/components/icons/swap-icon';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'dark'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'dark'].background,
          borderTopColor: Colors[colorScheme ?? 'dark'].border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <HomeIcon size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipients"
        options={{
          title: 'Recipients',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: ({ color }) => (
            <SwapIcon size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kyc"
        options={{
          title: 'KYC',
          tabBarIcon: ({ color }) => (
            <Ionicons name="shield-checkmark" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: 'Manage',
          tabBarIcon: ({ color }) => (
            <SettingsIcon size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
