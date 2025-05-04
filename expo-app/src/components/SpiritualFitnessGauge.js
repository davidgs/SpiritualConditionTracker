import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const SpiritualFitnessGauge = ({ value = 0, width = 300, height = 120, maxValue = 10 }) => {
  const { theme } = useTheme();
  
  // Convert to 0-100 scale
  const scaledValue = Math.round((value / maxValue) * 100);
  
  // Normalize value between 0 and 1 for calculations
  const normalizedValue = Math.min(Math.max(scaledValue, 0), 100) / 100;
  
  // Calculate colors based on the value
  const getColor = (value) => {
    if (value < 0.3) return '#f44336'; // Red for low values
    if (value < 0.6) return '#ff9800'; // Orange for medium values
    if (value < 0.8) return '#2196F3'; // Blue for good values
    return '#4CAF50'; // Green for excellent values
  };
  
  const getLabel = (value) => {
    if (value < 0.3) return 'Needs Work';
    if (value < 0.6) return 'Improving';
    if (value < 0.8) return 'Good';
    return 'Excellent';
  };
  
  const barColor = getColor(normalizedValue);
  const gaugeLabel = getLabel(normalizedValue);
  
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Large Value Display */}
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: barColor }]}>
          {scaledValue}
        </Text>
        <Text style={[styles.statusLabel, { color: barColor }]}>
          {gaugeLabel}
        </Text>
      </View>
      
      {/* Gauge Bar Container */}
      <View style={styles.gaugeContainer}>
        {/* Background Track */}
        <View 
          style={[
            styles.track, 
            { 
              backgroundColor: theme.isDark ? '#333333' : '#f0f0f0',
              width: width - 40,
            }
          ]}
        />
        
        {/* Colored Fill Bar */}
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: barColor,
              width: Math.max(normalizedValue * (width - 40), 10), // Minimum visible width
            }
          ]}
        />
        
        {/* Tick marks at 0, 50, and 100 */}
        <View style={[styles.tickContainer, { width: width - 40 }]}>
          <Text style={[styles.tickLabel, { color: theme.textSecondary }]}>0</Text>
          <Text style={[styles.tickLabel, { color: theme.textSecondary }]}>100</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  valueText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },
  track: {
    height: 24,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  progressBar: {
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: 0,
    left: 20,
  },
  tickContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginHorizontal: 20,
  },
  tickLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SpiritualFitnessGauge;