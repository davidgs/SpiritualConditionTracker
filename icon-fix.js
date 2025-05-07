/**
 * Direct icon rendering fix for React Native Web
 * This creates a global function to explicitly apply icon fonts
 */

(function() {
  // Create the icon fix script
  console.log('[Icon Fix] Initializing icon fix for React Native Web');
  
  // This function will be called after the page loads
  function fixReactNativeIcons() {
    console.log('[Icon Fix] Applying icon fixes');
    
    // Create style tags with font faces for all icon fonts
    const fontStyle = document.createElement('style');
    fontStyle.textContent = `
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url('/fonts/MaterialCommunityIcons.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      
      @font-face {
        font-family: 'FontAwesome';
        src: url('/fonts/FontAwesome.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      
      @font-face {
        font-family: 'Ionicons';
        src: url('/fonts/Ionicons.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      
      @font-face {
        font-family: 'MaterialIcons';
        src: url('/fonts/MaterialIcons.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      
      /* Override the React Native Web font loading */
      [class^="expoicon-"], [class*=" expoicon-"] {
        font-family: MaterialCommunityIcons !important;
      }
      
      /* Direct fixes for specific icon classes */
      .rmwc-icon, .material-icons {
        font-family: 'MaterialIcons' !important;
      }
      
      .fa, .fab, .fal, .far, .fas {
        font-family: 'FontAwesome' !important;
      }
      
      .ion, .ionicons, .ion-md, .ion-ios {
        font-family: 'Ionicons' !important;
      }
      
      /* Fix for SVG icons with 0 dimensions */
      svg[width="0"], svg[height="0"] {
        width: 24px !important;
        height: 24px !important;
      }
    `;
    document.head.appendChild(fontStyle);
    
    // Preload the fonts to ensure they're loaded before use
    const fonts = [
      { family: 'MaterialCommunityIcons', url: '/fonts/MaterialCommunityIcons.ttf' },
      { family: 'FontAwesome', url: '/fonts/FontAwesome.ttf' },
      { family: 'Ionicons', url: '/fonts/Ionicons.ttf' },
      { family: 'MaterialIcons', url: '/fonts/MaterialIcons.ttf' }
    ];
    
    fonts.forEach(font => {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.href = font.url;
      preload.as = 'font';
      preload.type = 'font/ttf';
      preload.crossOrigin = 'anonymous';
      document.head.appendChild(preload);
      
      // Also try to load font directly
      new FontFace(font.family, `url(${font.url})`, {
        style: 'normal',
        weight: 'normal'
      }).load().then(loadedFont => {
        document.fonts.add(loadedFont);
        console.log(`[Icon Fix] Font loaded: ${font.family}`);
      }).catch(err => {
        console.error(`[Icon Fix] Error loading font ${font.family}:`, err);
      });
    });
    
    // Direct fix for Vector Icons component rendering
    // This patch targets the specific areas where icon fonts are used
    setTimeout(() => {
      console.log('[Icon Fix] Applying direct component fixes');
      
      // Find all icon elements and fix their font family
      const iconElements = document.querySelectorAll('[class*="icon"], [data-icon], .fa, .material-icons, i');
      iconElements.forEach(el => {
        // Try to detect what icon font is being used
        if (el.className.includes('material') || el.className.includes('mdi')) {
          el.style.fontFamily = 'MaterialCommunityIcons';
        } else if (el.className.includes('fa')) {
          el.style.fontFamily = 'FontAwesome';
        } else if (el.className.includes('ion')) {
          el.style.fontFamily = 'Ionicons';
        }
        
        // Force redraw of the element
        el.style.display = 'none';
        setTimeout(() => { el.style.display = ''; }, 10);
      });
      
      // For empty SVGs (common with vector icons), fix their dimensions
      const svgs = document.querySelectorAll('svg');
      svgs.forEach(svg => {
        if (svg.getAttribute('width') === '0' || svg.getAttribute('height') === '0') {
          svg.setAttribute('width', '24');
          svg.setAttribute('height', '24');
        }
      });
    }, 1000);
  }
  
  // Run the fix when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixReactNativeIcons);
  } else {
    fixReactNativeIcons();
  }
  
  // Also run the fix when dynamic content might be loaded
  window.addEventListener('load', fixReactNativeIcons);
  
  // Run again after a delay to catch any dynamically loaded content
  setTimeout(fixReactNativeIcons, 2000);
})();