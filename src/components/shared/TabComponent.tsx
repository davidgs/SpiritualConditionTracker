import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TabItem {
  id: string | number;
  label: string;
  content: React.ReactNode;
}

interface TabComponentProps {
  items: TabItem[];
  currentTab: number;
  onTabChange: (event: any, newValue: number) => void;
  addTabLabel?: string;
  onAddClick?: () => void;
}

function TabPanel({ children, value, index, ...other }) {
  const theme = useTheme();
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box 
          sx={{ 
            py: 2,
            px: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${theme.palette.divider}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            minHeight: '200px'
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export default function TabComponent({ 
  items, 
  currentTab, 
  onTabChange, 
  addTabLabel,
  onAddClick 
}: TabComponentProps) {
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    // If clicking the add tab and onAddClick is provided
    if (newValue === items.length && onAddClick) {
      onAddClick();
      return;
    }
    onTabChange(event, newValue);
  };

  return (
    <Box>
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 0,
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
            height: 3,
          },
          '& .MuiTabs-scrollButtons': {
            color: theme.palette.primary.main,
          },
          '& .MuiTab-root': {
            color: theme.palette.text.secondary,
            fontWeight: 'normal',
            textTransform: 'none',
            border: `1px solid transparent`,
            borderRadius: '8px 8px 0 0',
            margin: '0 2px',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease-in-out',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderBottom: `1px solid ${theme.palette.background.paper}`,
              marginBottom: '-1px',
              position: 'relative',
              zIndex: 1,
            },
            '&:hover:not(.Mui-selected)': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      >
        {items.map((item, index) => (
          <Tab 
            key={item.id} 
            label={item.label}
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
          />
        ))}
        {addTabLabel && (
          <Tab 
            label={addTabLabel} 
            id={`tab-add`}
            aria-controls={`tabpanel-add`}
            data-tour={addTabLabel === "+ Add Sponsor" ? "add-sponsor-btn" : addTabLabel === "+ Add Sponsee" ? "add-sponsee-btn" : undefined}
          />
        )}
      </Tabs>

      {items.map((item, index) => (
        <TabPanel key={item.id} value={currentTab} index={index}>
          {item.content}
        </TabPanel>
      ))}
    </Box>
  );
}