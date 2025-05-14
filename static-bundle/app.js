// Simple JavaScript for the Spiritual Condition Tracker

document.addEventListener('DOMContentLoaded', function() {
  console.log('Spiritual Condition Tracker app loaded');
  
  // You could add interactive functionality here
  // For now, just display the current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Add a date element
  const header = document.querySelector('.header');
  const dateElement = document.createElement('p');
  dateElement.textContent = dateStr;
  dateElement.style.fontSize = '14px';
  dateElement.style.opacity = '0.7';
  dateElement.style.marginTop = '10px';
  header.appendChild(dateElement);
  
  // Add click handlers to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      this.style.transform = 'scale(1.02)';
      this.style.transition = 'transform 0.2s';
      
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });
  });
});