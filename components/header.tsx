import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Header() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.scanButton, { backgroundColor: colors.border }]}>
          <Ionicons name="scan-outline" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
