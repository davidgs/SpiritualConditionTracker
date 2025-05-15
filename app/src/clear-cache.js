// Add a timestamp to force browser to reload the bundle
document.addEventListener('DOMContentLoaded', () => {
  const scriptElement = document.querySelector('script[src*="bundle.js"]');
  if (scriptElement) {
    const originalSrc = scriptElement.getAttribute('src');
    const timestamp = new Date().getTime();
    scriptElement.setAttribute('src', `${originalSrc}?t=${timestamp}`);
  }
});