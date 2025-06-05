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
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
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
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 2,
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
          },
          '& .MuiTab-root': {
            color: theme.palette.text.secondary,
            fontWeight: 'normal',
            textTransform: 'none',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              fontWeight: 'bold',
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