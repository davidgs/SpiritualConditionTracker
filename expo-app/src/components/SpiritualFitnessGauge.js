import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const SpiritualFitnessGauge = ({ value = 0, width = 300, height = 120, maxValue = 10 }) => {
  const { theme } = useTheme();
  
  // Convert to 0-100 scale
  const scaledValue = Math.round((value / maxValue) * 100);
  
  // Calculate colors based on the value (0-100 scale)
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
  
  const barColor = getColor(scaledValue);
  const gaugeLabel = getLabel(scaledValue);
  
  // Calculate the width of the progress bar
  const progressWidth = Math.max((scaledValue / 100) * (width - 40), 10); // at least 10px wide
  
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Score display */}
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreValue, { color: barColor }]}>
          {scaledValue}
        </Text>
        <Text style={[styles.scoreLabel, { color: barColor }]}>
          {gaugeLabel}
        </Text>
      </View>
      
      {/* Gauge bar */}
      <View style={styles.gaugeContainer}>
        {/* Background track */}
        <View 
          style={[
            styles.track, 
            { 
              backgroundColor: theme.isDark ? '#333333' : '#f0f0f0',
              width: width - 40
            }
          ]}
        />
        
        {/* Colored progress bar */}
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: barColor,
              width: progressWidth
            }
          ]}
        />
        
        {/* Scale labels */}
        <View style={[styles.scaleContainer, { width: width - 40 }]}>
          <Text style={[styles.scaleLabel, { color: theme.textSecondary }]}>0</Text>
          <Text style={[styles.scaleLabel, { color: theme.textSecondary }]}>100</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 15
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    width: '100%'
  },
  track: {
    height: 20,
    borderRadius: 10,
    marginHorizontal: 20
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    left: 20
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginHorizontal: 20
  },
  scaleLabel: {
    fontSize: 14,
    fontWeight: '500'
  }
});

export default SpiritualFitnessGauge;