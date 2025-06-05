import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactPersonTabsProps } from '../../types/ContactPerson';

export default function ContactPersonTabs({
  persons,
  currentTab,
  onTabChange,
  addLabel,
  children
}: ContactPersonTabsProps) {
  const theme = useTheme();

  return (
    <Box>
      <Tabs 
        value={currentTab} 
        onChange={onTabChange}
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
        {persons.map((person, index) => (
          <Tab 
            key={person.id || index} 
            label={person.name || `Person ${index + 1}`}
          />
        ))}
        <Tab label={addLabel} />
      </Tabs>
      
      {children}
    </Box>
  );
}