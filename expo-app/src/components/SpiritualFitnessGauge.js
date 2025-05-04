import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const SpiritualFitnessGauge = ({ value = 0, size = 200, thickness = 20, maxValue = 10 }) => {
  const { theme } = useTheme();
  
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max(value, 0), maxValue) / maxValue;
  
  // Calculate angles for the arc (in degrees)
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + (totalAngle * normalizedValue);
  
  // Calculate colors based on the value
  const getColor = (value) => {
    if (value < 0.3) return '#f44336'; // Red for low values
    if (value < 0.6) return '#ff9800'; // Orange for medium values
    if (value < 0.8) return '#2196F3'; // Blue for good values
    return '#4CAF50'; // Green for excellent values
  };
  
  const arcColor = getColor(normalizedValue);
  
  // Calculate coordinates for the arc
  const radius = (size - thickness) / 2;
  const center = size / 2;
  
  // Convert angle to radians and calculate position
  const angleToRadians = (angle) => ((angle - 90) * Math.PI) / 180;
  
  const calculateArcPoint = (angle) => {
    const rad = angleToRadians(angle);
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };
  
  const start = calculateArcPoint(startAngle);
  const end = calculateArcPoint(valueAngle);
  
  // Create gauge ticks
  const renderTicks = () => {
    const ticks = [];
    const numTicks = 27; // Number of ticks (one per 10 degrees)
    
    for (let i = 0; i <= numTicks; i++) {
      const tickAngle = startAngle + (totalAngle * (i / numTicks));
      const isLongTick = i % 3 === 0;
      const tickRadius = isLongTick ? radius - 5 : radius - 2;
      const tickStart = calculateArcPoint(tickAngle);
      const tickEnd = {
        x: center + (tickRadius * Math.cos(angleToRadians(tickAngle))),
        y: center + (tickRadius * Math.sin(angleToRadians(tickAngle))),
      };
      
      // Determine if tick should be colored (within the current value range)
      const isColored = tickAngle <= valueAngle;
      
      ticks.push(
        <View
          key={i}
          style={{
            position: 'absolute',
            width: isLongTick ? 3 : 1.5,
            height: isLongTick ? 10 : 5,
            backgroundColor: isColored ? arcColor : theme.textSecondary,
            borderRadius: 1,
            left: tickEnd.x,
            top: tickEnd.y,
            transform: [
              { translateX: -1 },
              { translateY: -1 },
              { rotate: `${tickAngle}deg` },
            ],
          }}
        />
      );
      
      // Add labels for major ticks
      if (isLongTick && i % 6 === 0) {
        const labelValue = (maxValue * (i / numTicks)).toFixed(1);
        const labelRadius = radius - 25;
        const labelPos = {
          x: center + (labelRadius * Math.cos(angleToRadians(tickAngle))),
          y: center + (labelRadius * Math.sin(angleToRadians(tickAngle))),
        };
        
        ticks.push(
          <Text
            key={`label-${i}`}
            style={{
              position: 'absolute',
              fontSize: 10,
              color: theme.textSecondary,
              left: labelPos.x,
              top: labelPos.y,
              transform: [
                { translateX: -8 },
                { translateY: -5 },
              ],
            }}
          >
            {labelValue}
          </Text>
        );
      }
    }
    
    return ticks;
  };
  
  // Create the needle
  const needleLength = radius - 10;
  const needleWidth = 4;
  
  const needlePoint = {
    x: center + (needleLength * Math.cos(angleToRadians(valueAngle))),
    y: center + (needleLength * Math.sin(angleToRadians(valueAngle))),
  };
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background arc */}
      <View
        style={[
          styles.arc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: theme.isDark ? '#333333' : '#EEEEEE',
          },
        ]}
      />
      
      {/* Colored arc - we'll use a half circle and rotate/clip it */}
      <View
        style={[
          styles.valueArc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderTopColor: arcColor,
            transform: [
              { rotate: `${startAngle}deg` },
              { scaleX: normalizedValue * (totalAngle / 180) },
            ],
          },
        ]}
      />
      
      {/* Ticks */}
      {renderTicks()}
      
      {/* Needle */}
      <View
        style={[
          styles.needle,
          {
            width: needleLength,
            height: needleWidth,
            left: center,
            top: center,
            transform: [
              { translateY: -needleWidth / 2 },
              { rotate: `${valueAngle}deg` },
              { translateX: needleWidth / 2 },
            ],
            backgroundColor: theme.text,
          },
        ]}
      />
      
      {/* Needle center */}
      <View
        style={[
          styles.needleCenter,
          {
            width: thickness,
            height: thickness,
            borderRadius: thickness / 2,
            left: center - thickness / 2,
            top: center - thickness / 2,
            backgroundColor: arcColor,
            borderColor: theme.text,
          },
        ]}
      />
      
      {/* Value Text */}
      <Text style={[styles.valueText, { color: theme.text }]}>
        {value.toFixed(2)}
      </Text>
      <Text style={[styles.maxValueText, { color: theme.textSecondary }]}>
        / {maxValue.toFixed(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    position: 'absolute',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  valueArc: {
    position: 'absolute',
    transform: [{ rotate: '-135deg' }],
  },
  needle: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    borderRadius: 4,
    transformOrigin: 'left center',
  },
  needleCenter: {
    position: 'absolute',
    borderWidth: 2,
  },
  valueText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
  },
  maxValueText: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default SpiritualFitnessGauge;