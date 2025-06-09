// Quick test of the color function
const getActivityColor = (type) => {
  console.log('Getting color for type:', type);
  switch (type) {
    case 'prayer': 
      return {
        background: '#e8f5e8',
        icon: '#2e7d32',
        backgroundDark: '#1b5e20',
        iconDark: '#4caf50'
      };
    case 'meditation': 
      return {
        background: '#f3e5f5',
        icon: '#7b1fa2',
        backgroundDark: '#4a148c',
        iconDark: '#ba68c8'
      };
    default: 
      return {
        background: '#f5f5f5',
        icon: '#616161',
        backgroundDark: '#424242',
        iconDark: '#bdbdbd'
      };
  }
};

// Test the function
console.log('Prayer color:', getActivityColor('prayer'));
console.log('Meditation color:', getActivityColor('meditation'));