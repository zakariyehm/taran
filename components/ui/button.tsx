import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { AppColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const getPrimaryColor = (colorScheme: 'light' | 'dark' | null) =>
  Colors[colorScheme ?? 'dark'].primary;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'white' | 'light';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  flex?: boolean;
  disabled?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  style,
  flex,
  disabled = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const primaryColor = Colors[colorScheme ?? 'dark'].primary;
  const isPrimary = variant === 'primary';
  const isWhite = variant === 'white';
  const isLight = variant === 'light';

  const disabledBg = '#4A4A5A';
  const disabledText = '#8A8A9A';

  const buttonStyle = [
    styles.button,
    disabled && { backgroundColor: disabledBg, borderColor: disabledBg, borderWidth: 1 },
    !disabled && isPrimary && { backgroundColor: primaryColor },
    !disabled && variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: primaryColor,
    },
    !disabled && (isWhite || isLight) && { backgroundColor: AppColors.white },
    flex && styles.flex,
  ];

  const textStyle = [
    styles.text,
    disabled && { color: disabledText },
    !disabled && isPrimary && styles.primaryText,
    !disabled && (variant === 'outline' || isLight) && { color: primaryColor },
    !disabled && isWhite && styles.whiteButtonText,
  ];

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && (
        <Ionicons
          name={icon}
          size={22}
          color={disabled ? disabledText : isLight ? primaryColor : isWhite ? AppColors.black : isPrimary ? AppColors.white : primaryColor}
          style={styles.iconLeft}
        />
      )}
      <Text style={textStyle}>{title}</Text>
      {icon && iconPosition === 'right' && (
        <Ionicons
          name={icon}
          size={22}
          color={disabled ? disabledText : isLight ? primaryColor : isWhite ? AppColors.black : isPrimary ? AppColors.white : primaryColor}
          style={styles.iconRight}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 4,
  },
  flex: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  whiteButtonText: {
    color: AppColors.black,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
