// Simple script to create a basic app experience
window.onload = function() {
  const root = document.getElementById('root');
  
  // Clear loading spinner
  root.innerHTML = '';
  
  // Create app structure
  const header = document.createElement('header');
  header.style.padding = '20px';
  header.style.backgroundColor = '#3498db';
  header.style.color = 'white';
  header.style.textAlign = 'center';
  
  const title = document.createElement('h1');
  title.textContent = 'Spiritual Condition Tracker';
  header.appendChild(title);
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Your AA Recovery Dashboard';
  header.appendChild(subtitle);
  
  const content = document.createElement('div');
  content.style.padding = '30px';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.alignItems = 'center';
  
  const welcomeCard = document.createElement('div');
  welcomeCard.style.backgroundColor = 'white';
  welcomeCard.style.borderRadius = '8px';
  welcomeCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  welcomeCard.style.padding = '20px';
  welcomeCard.style.marginBottom = '20px';
  welcomeCard.style.width = '100%';
  welcomeCard.style.maxWidth = '500px';
  
  const welcomeTitle = document.createElement('h2');
  welcomeTitle.textContent = 'Welcome to Your Recovery Journey';
  welcomeTitle.style.color = '#2c3e50';
  welcomeCard.appendChild(welcomeTitle);
  
  const welcomeText = document.createElement('p');
  welcomeText.textContent = 'This app helps you track your spiritual condition and recovery progress. Log your daily activities, track meetings, and monitor your spiritual fitness.';
  welcomeText.style.color = '#7f8c8d';
  welcomeCard.appendChild(welcomeText);
  
  content.appendChild(welcomeCard);
  
  const statsCard = document.createElement('div');
  statsCard.style.backgroundColor = 'white';
  statsCard.style.borderRadius = '8px';
  statsCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  statsCard.style.padding = '20px';
  statsCard.style.width = '100%';
  statsCard.style.maxWidth = '500px';
  
  const statsTitle = document.createElement('h2');
  statsTitle.textContent = 'Your Recovery Stats';
  statsTitle.style.color = '#2c3e50';
  statsCard.appendChild(statsTitle);
  
  const statsContent = document.createElement('div');
  statsContent.style.display = 'flex';
  statsContent.style.justifyContent = 'space-between';
  
  const createStat = (label, value) => {
    const stat = document.createElement('div');
    stat.style.textAlign = 'center';
    stat.style.padding = '10px';
    
    const statValue = document.createElement('div');
    statValue.textContent = value;
    statValue.style.fontSize = '24px';
    statValue.style.fontWeight = 'bold';
    statValue.style.color = '#3498db';
    stat.appendChild(statValue);
    
    const statLabel = document.createElement('div');
    statLabel.textContent = label;
    statLabel.style.fontSize = '14px';
    statLabel.style.color = '#7f8c8d';
    stat.appendChild(statLabel);
    
    return stat;
  };
  
  statsContent.appendChild(createStat('Sobriety', '2.45 years'));
  statsContent.appendChild(createStat('Meetings', '128'));
  statsContent.appendChild(createStat('Spiritual Fitness', '85%'));
  
  statsCard.appendChild(statsContent);
  content.appendChild(statsCard);
  
  // Add footer
  const footer = document.createElement('footer');
  footer.style.marginTop = 'auto';
  footer.style.padding = '20px';
  footer.style.backgroundColor = '#f8f9fa';
  footer.style.textAlign = 'center';
  footer.style.color = '#7f8c8d';
  footer.textContent = 'Spiritual Condition Tracker - AA Recovery App';
  
  // Append all sections to root
  root.appendChild(header);
  root.appendChild(content);
  root.appendChild(footer);
  
  // Set root styles
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.minHeight = '100vh';
};