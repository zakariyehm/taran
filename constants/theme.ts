/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#283D5F';
const tintColorDark = '#A3E972';

export const AppColors = {
  primaryLight: '#01C7FF',
  primaryDark: '#A3E972',
  welcomeBackground: '#232F49',
  white: '#fff',
  black: '#000',
};

export const Colors = {
  light: {
    text: '#11181C',
    primary: AppColors.primaryLight,
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#f5f5f5',
    border: '#e0e0e0',
    secondaryText: '#666',
    chartLine: '#007AFF',
    buttonSelectedBg: '#0698D9',
    buttonSelectedText: '#fff',
  },
  dark: {
    text: '#ECEDEE',
    primary: AppColors.primaryDark,
    background: '#1a1a1a',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    card: '#2a2a2a',
    border: '#3a3a3a',
    secondaryText: '#888',
    chartLine: '#A3E972',
    buttonSelectedBg: '#0698D9',
    buttonSelectedText: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
