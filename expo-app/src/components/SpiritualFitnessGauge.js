import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Svg, { Circle, G } from 'react-native-svg';

const SpiritualFitnessGauge = ({ value = 0, size = 200, maxValue = 10 }) => {
  const { theme } = useTheme();
  
  // Convert to 0-100 scale
  const scaledValue = Math.round((value / maxValue) * 100);
  
  // Calculate colors based on the value
  const getColor = (value) => {
    if (value < 30) return '#f44336'; // Red for low values
    if (value < 60) return '#ff9800'; // Orange for medium values
    if (value < 80) return '#2196F3'; // Blue for good values
    return '#4CAF50'; // Green for excellent values
  };
  
  const getLabel = (value) => {
    if (value < 30) return 'Needs Work';
    if (value < 60) return 'Improving';
    if (value < 80) return 'Good';
    return 'Excellent';
  };
  
  // Circle parameters
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillPercent = scaledValue / 100;
  const fillOffset = circumference * (1 - fillPercent);
  
  const color = getColor(scaledValue);
  const gaugeLabel = getLabel(scaledValue);
  
  return (
    <View style={[styles.container, { width: size, height: size + 40 }]}>
      <View style={styles.circleContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            {/* Background Circle */}
            <Circle
              cx={size/2}
              cy={size/2}
              r={radius}
              stroke={theme.isDark ? '#333333' : '#E4E9F2'}
              strokeWidth={strokeWidth}
              fill="none"
            />
            
            {/* Progress Circle */}
            <Circle
              cx={size/2}
              cy={size/2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={fillOffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        {/* Value in center */}
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color }]}>
            {scaledValue}
          </Text>
        </View>
      </View>
      
      {/* Label */}
      <Text style={[styles.statusLabel, { color }]}>
        {gaugeLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 10,
  }
});

export default SpiritualFitnessGauge;