// Script to identify all hard-coded colors in SponsorSponsee.tsx that need replacement
// This will help us systematically replace them with proper MUI theme values

const hardCodedColors = [
  // Hard-coded color patterns to replace
  "darkMode ? '#f3f4f6' : '#1f2937'", // -> theme.palette.text.primary
  "darkMode ? '#9ca3af' : '#6b7280'", // -> theme.palette.text.secondary  
  "darkMode ? '#d1d5db' : '#4b5563'", // -> theme.palette.text.primary
  "darkMode ? '#93c5fd' : '#3b82f6'", // -> theme.palette.primary.main
  "darkMode ? '#f87171' : '#ef4444'", // -> theme.palette.error.main
  "darkMode ? '#a78bfa' : '#8b5cf6'", // -> theme.palette.secondary.main
  "darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)'", // -> theme.palette.background.paper
  "darkMode ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.1)'", // -> theme.shadows[2]
  "color: darkMode ? '#9ca3af' : '#6b7280'", // -> color: theme.palette.text.secondary
  "color: darkMode ? '#93c5fd' : '#3b82f6'", // -> color: theme.palette.primary.main
  "backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'", // -> backgroundColor: theme.palette.primary.light
];

console.log("Hard-coded colors to replace:", hardCodedColors);