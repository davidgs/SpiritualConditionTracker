// Spiritual Condition Tracker App

document.addEventListener('DOMContentLoaded', function() {
  console.log('Spiritual Condition Tracker App loaded');
  
  // Get current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Add date to header
  const header = document.querySelector('header');
  const dateElement = document.createElement('p');
  dateElement.textContent = dateStr;
  dateElement.style.fontSize = '14px';
  dateElement.style.opacity = '0.7';
  dateElement.style.marginTop = '10px';
  header.appendChild(dateElement);
  
  // Setup basic interactions
  document.getElementById('prayerBtn').addEventListener('click', function() {
    alert('Prayer session logged: 20 minutes');
  });
  
  document.getElementById('meetingBtn').addEventListener('click', function() {
    alert('Meeting attendance logged: AA Big Book Study');
  });
  
  document.getElementById('readingBtn').addEventListener('click', function() {
    alert('Reading session logged: 30 minutes');
  });
  
  // Simulate data from our app
  let localData = {
    sobrietyDays: 894, // 2.45 years
    meetingsAttended: 128,
    spiritualFitness: 85,
    activities: [
      { type: 'prayer', date: '2025-05-13', duration: 20 },
      { type: 'meeting', date: '2025-05-12', name: 'Big Book Study' },
      { type: 'reading', date: '2025-05-11', duration: 30 }
    ]
  };
  
  // Store the data in localStorage (for web)
  localStorage.setItem('spiritualTrackerData', JSON.stringify(localData));
  
  console.log('App data initialized');
});