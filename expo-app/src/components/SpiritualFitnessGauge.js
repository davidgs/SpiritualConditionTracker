import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const SpiritualFitnessGauge = ({ value = 0, width = 300, height = 140, maxValue = 10 }) => {
  const { theme } = useTheme();
  
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max(value, 0), maxValue) / maxValue;
  
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
  
  // Create major ticks for the gauge (only 0, 5, and 10)
  const renderTicks = () => {
    const ticks = [];
    const majorTicks = [0, 5, 10]; // Only show 0, 5, and 10 marks
    const barWidth = width - 40;
    
    majorTicks.forEach(tickValue => {
      const tickPosition = 20 + (tickValue / maxValue) * barWidth;
      
      ticks.push(
        <View
          key={tickValue}
          style={{
            position: 'absolute',
            left: tickPosition,
            top: 80,
            width: 2,
            height: 10,
            backgroundColor: theme.textSecondary,
          }}
        />
      );
      
      ticks.push(
        <Text
          key={`label-${tickValue}`}
          style={{
            position: 'absolute',
            left: tickPosition - 5,
            top: 92,
            fontSize: 16,
            fontWeight: '500',
            color: theme.textSecondary,
          }}
        >
          {tickValue}
        </Text>
      );
    });
    
    return ticks;
  };
  
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Large Value Display */}
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: barColor }]}>
          {value.toFixed(2)}
        </Text>
        <Text style={[styles.statusLabel, { color: barColor }]}>
          {gaugeLabel}
        </Text>
      </View>
      
      {/* Background Track */}
      <View 
        style={[
          styles.track, 
          { 
            backgroundColor: theme.isDark ? '#333333' : '#f0f0f0',
            width: width - 40,
            marginLeft: 20,
            marginRight: 20,
          }
        ]}
      />
      
      {/* Colored Progress Bar */}
      <View 
        style={[
          styles.progressBar, 
          { 
            backgroundColor: barColor,
            width: Math.max(normalizedValue * (width - 40), 20), // Minimum visible bar size
            marginLeft: 20,
          }
        ]}
      />
      
      {/* Add Ticks */}
      {renderTicks()}
      
      {/* Gradient Indicator Below Bar */}
      <View style={[styles.gradientContainer, { width: width - 40, marginLeft: 20 }]}>
        <View style={[styles.gradientSegment, { backgroundColor: '#f44336' }]} />
        <View style={[styles.gradientSegment, { backgroundColor: '#ff9800' }]} />
        <View style={[styles.gradientSegment, { backgroundColor: '#2196F3' }]} />
        <View style={[styles.gradientSegment, { backgroundColor: '#4CAF50' }]} />
      </View>
      
      {/* Labels */}
      <View style={[styles.labelContainer, { width: width - 30 }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Needs Work</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Excellent</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 25,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  valueText: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5,
  },
  track: {
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: 80,
  },
  progressBar: {
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: 80,
  },
  gradientContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 105,
    overflow: 'hidden',
  },
  gradientSegment: {
    flex: 1,
    height: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SpiritualFitnessGauge;