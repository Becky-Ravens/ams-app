import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const Badge = ({ status, style }) => {
  const getBadgeColor = () => {
    switch (status.toLowerCase()) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#F44336';
      case 'late':
        return '#FFC107';
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBadgeColor() }, style]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
