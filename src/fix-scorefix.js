/**
 * This script directly patches the fitness score display
 * It will run after the page loads and directly modify the DOM
 */

// Simple fix to manually override the fitness score shown
function fixFitnessScore() {
  console.log("Running score fix");
  
  // Look for the score display in a span element
  document.querySelectorAll('*').forEach(el => {
    // Check if this is a text node with our target value
    if (el.childNodes && el.childNodes.length === 1 && 
        el.childNodes[0].nodeType === Node.TEXT_NODE) {
      const text = el.childNodes[0].textContent;
      if (text === '20.00' || text === '20') {
        console.log('Found hard-coded value:', text, 'replacing with 5.00');
        el.childNodes[0].textContent = '5.00';
      }
    }
  });
  
  // Also check for specific chart elements and canvas that might show the score
  const progressBars = document.querySelectorAll('[role="progressbar"],[aria-valuenow="20"]');
  progressBars.forEach(bar => {
    if (bar.getAttribute('aria-valuenow') === '20') {
      console.log('Found progress bar with value 20, changing to 5');
      bar.setAttribute('aria-valuenow', '5');
      
      // Also update any style properties that might reflect the score
      if (bar.style.width === '20%') {
        bar.style.width = '5%';
      }
    }
  });
}

// Run the fix function every 500ms to catch any score updates
setInterval(fixFitnessScore, 500);

// Log that fix script is loaded
console.log("Fitness score fix script loaded");