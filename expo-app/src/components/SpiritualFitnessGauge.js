import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const SpiritualFitnessGauge = ({ value = 0, width = 300, height = 80, maxValue = 10 }) => {
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
  
  const barColor = getColor(normalizedValue);
  
  // Create the ticks for the gauge
  const renderTicks = () => {
    const ticks = [];
    const numTicks = 10; // One tick per unit
    const tickSpacing = (width - 40) / numTicks;
    
    for (let i = 0; i <= numTicks; i++) {
      const tickX = 20 + (i * tickSpacing);
      const isMajorTick = i % 2 === 0;
      
      ticks.push(
        <View
          key={i}
          style={{
            position: 'absolute',
            left: tickX,
            top: height * 0.45,
            width: 1,
            height: isMajorTick ? 10 : 6,
            backgroundColor: theme.textSecondary,
            opacity: 0.7,
          }}
        />
      );
      
      if (isMajorTick) {
        ticks.push(
          <Text
            key={`label-${i}`}
            style={{
              position: 'absolute',
              left: tickX - 8,
              top: height * 0.45 + 12,
              fontSize: 10,
              color: theme.textSecondary,
            }}
          >
            {i}
          </Text>
        );
      }
    }
    
    return ticks;
  };
  
  // Calculate the position of the marker
  const markerPosition = 20 + (normalizedValue * (width - 40));
  
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Value Display */}
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: theme.text }]}>
          {value.toFixed(2)}
        </Text>
        <Text style={[styles.maxValueText, { color: theme.textSecondary }]}>
          / {maxValue.toFixed(1)}
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
            width: normalizedValue * (width - 40),
            marginLeft: 20,
          }
        ]}
      />
      
      {/* Add Ticks */}
      {renderTicks()}
      
      {/* Marker */}
      <View 
        style={[
          styles.marker, 
          { 
            left: markerPosition - 8,
            backgroundColor: theme.isDark ? '#ffffff' : '#333333',
            borderColor: barColor,
          }
        ]}
      />
      
      {/* Temperature-like Gradient Indicator */}
      <View style={[styles.gradientContainer, { width: width - 40, marginLeft: 20 }]}>
        <View style={[styles.gradientSegment, { backgroundColor: '#f44336' }]} />
        <View style={[styles.gradientSegment, { backgroundColor: '#ff9800' }]} />
        <View style={[styles.gradientSegment, { backgroundColor: '#2196F3' }]} />
        <View style={[styles.gradientSegment, { backgroundColor: '#4CAF50' }]} />
      </View>
      
      {/* Labels */}
      <View style={[styles.labelContainer, { width: width - 30 }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Low</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>High</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 15,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  maxValueText: {
    fontSize: 14,
    marginLeft: 2,
  },
  track: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 50,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 50,
  },
  marker: {
    position: 'absolute',
    top: 45,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gradientContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: 65,
    opacity: 0.7,
    overflow: 'hidden',
  },
  gradientSegment: {
    flex: 1,
    height: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 10,
  },
});

export default SpiritualFitnessGauge;