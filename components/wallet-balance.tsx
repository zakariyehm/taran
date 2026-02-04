import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function WalletBalance() {
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [showBalance, setShowBalance] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Chart data points for the line graph
  const chartPoints = [
    { x: 0, y: 60 },
    { x: 20, y: 40 },
    { x: 40, y: 70 },
    { x: 60, y: 45 },
    { x: 80, y: 80 },
    { x: 100, y: 50 },
    { x: 120, y: 85 },
    { x: 140, y: 65 },
    { x: 160, y: 90 },
    { x: 180, y: 70 },
    { x: 200, y: 95 },
    { x: 220, y: 75 },
    { x: 240, y: 85 },
  ];

  // Create SVG path from points
  const createPath = () => {
    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const xc = (chartPoints[i].x + chartPoints[i - 1].x) / 2;
      const yc = (chartPoints[i].y + chartPoints[i - 1].y) / 2;
      path += ` Q ${chartPoints[i - 1].x} ${chartPoints[i - 1].y} ${xc} ${yc}`;
    }
    path += ` T ${chartPoints[chartPoints.length - 1].x} ${chartPoints[chartPoints.length - 1].y}`;
    return path;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Wallet Balance */}
      <View style={styles.balanceContainer}>
        <View style={styles.walletLabel}>
          <Text style={[styles.walletText, { color: colors.secondaryText }]}>WALLET</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
            <Ionicons 
              name={showBalance ? "eye-outline" : "eye-off-outline"} 
              size={16} 
              color={colors.secondaryText} 
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.balance, { color: colors.text }]}>
          {showBalance ? '$42,821.81' : '••••••'}
        </Text>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.border }]}>
        <Ionicons name="refresh" size={20} color={colors.secondaryText} />
      </TouchableOpacity>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg height="140" width="280" style={styles.chart}>
          <Path
            d={createPath()}
            fill="none"
            stroke={colors.chartLine}
            strokeWidth="2.5"
          />
        </Svg>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSelector}>
        {['1D', '1W', '1M', '1Y'].map((period) => {
          const isSelected = selectedPeriod === period;
          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                { 
                  backgroundColor: isSelected ? colors.buttonSelectedBg : colors.border,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.buttonSelectedBg : 'transparent',
                },
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: isSelected ? colors.buttonSelectedText : colors.secondaryText },
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    position: 'relative',
  },
  balanceContainer: {
    marginBottom: 16,
  },
  walletLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  walletText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  balance: {
    fontSize: 40,
    fontWeight: '300',
    letterSpacing: -1,
  },
  refreshButton: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    height: 140,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    marginLeft: -10,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
