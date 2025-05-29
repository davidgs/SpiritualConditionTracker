import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Spiritual Condition Tracker</h1>
      <p>App is working! This is a simplified version to test basic functionality.</p>
      <div style={{ marginTop: '20px' }}>
        <button style={{ 
          backgroundColor: '#dc2626', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          marginRight: '10px'
        }}>
          Cancel (Red)
        </button>
        <button style={{ 
          backgroundColor: '#16a34a', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px'
        }}>
          Save (Green)
        </button>
      </div>
    </div>
  );
}

export default App;