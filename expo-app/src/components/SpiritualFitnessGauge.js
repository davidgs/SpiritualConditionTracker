import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Svg, { Circle, G } from 'react-native-svg';

/**
 * SpiritualFitnessGauge component displays the spiritual fitness score
 * either as a circular gauge (doughnut) or as a horizontal bar gauge
 */
const SpiritualFitnessGauge = ({ 
  value = 0, 
  width = 300, 
  height = 120, 
  maxValue = 100,
  style = 'horizontal', // 'horizontal' or 'doughnut'
  size = 200 // Used for doughnut style
}) => {
  const { theme } = useTheme();
  
  // Normalize value to 0-100 scale
  const normalizedValue = Math.min(Math.max(Math.round((value / maxValue) * 100), 0), 100);
  
  // Calculate colors based on the value
  const getColor = (value) => {
    if (value < 30) return '#f44336'; // Red for low values
    if (value < 60) return '#ff9800'; // Orange for medium values
    if (value < 80) return '#4F86C6'; // Blue for good values
    return '#4CAF50'; // Green for excellent values
  };
  
  const getLabel = (value) => {
    if (value < 30) return 'Needs Work';
    if (value < 60) return 'Improving';
    if (value < 80) return 'Good';
    return 'Excellent';
  };
  
  const barColor = getColor(normalizedValue);
  const gaugeLabel = getLabel(normalizedValue);
  
  // Render doughnut-style gauge
  if (style === 'doughnut') {
    // Circle parameters
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const fillPercent = normalizedValue / 100;
    const fillOffset = circumference * (1 - fillPercent);
    
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
                stroke={barColor}
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
            <Text style={[styles.valueText, { color: barColor }]}>
              {normalizedValue}
            </Text>
          </View>
        </View>
        
        {/* Label */}
        <Text style={[styles.statusLabel, { color: barColor }]}>
          {gaugeLabel}
        </Text>
      </View>
    );
  }
  
  // Default: render horizontal-style gauge
  // Calculate the width of the progress bar
  const progressWidth = Math.max((normalizedValue / 100) * (width - 40), 10); // at least 10px wide
  
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Score display */}
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreValue, { color: barColor }]}>
          {normalizedValue}
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
  // Horizontal gauge styles
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
  },
  // Doughnut gauge styles
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