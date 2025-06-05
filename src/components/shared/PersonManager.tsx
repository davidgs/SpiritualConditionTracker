import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonCard from './PersonCard';
import ContactPersonForm from './ContactPersonForm';
import { ContactPerson } from '../../types/ContactPerson';
import { usePersonDelete } from '../../hooks/usePersonDelete';

interface PersonManagerProps {
  personType: 'sponsor' | 'sponsee';
  persons: ContactPerson[];
  contacts: any[];
  currentTab: number;
  onTabChange: (event: any, newValue: number) => void;
  onEdit: (person: ContactPerson) => void;
  onAddContact: (person: ContactPerson) => void;
  onRefresh: () => void;
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${index}-tabpanel`}
      aria-labelledby={`${index}-tab`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PersonManager({
  personType,
  persons,
  contacts,
  currentTab,
  onTabChange,
  onEdit,
  onAddContact,
  onRefresh
}: PersonManagerProps) {
  const theme = useTheme();
  const { deletePerson } = usePersonDelete({
    personType,
    onSuccess: onRefresh
  });

  const handleTabChange = (event, newValue) => {
    // If the "+ Add" tab is clicked, open the form
    if (newValue === persons.length) {
      onEdit(null); // null means adding new person
      return;
    }
    onTabChange(event, newValue);
  };

  const getPersonContacts = (personId) => {
    const foreignKey = personType === 'sponsor' ? 'sponsorId' : 'sponseeId';
    return contacts.filter(contact => contact[foreignKey] === personId);
  };

  if (persons.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 6, 
        px: 3,
        margin: '16px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="body1" sx={{ color: theme.palette.text.primary, mb: 3 }}>
          You haven't added any {personType}s yet.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => onEdit(null)}
          startIcon={<i className="fa-solid fa-plus"></i>}
        >
          Add {personType === 'sponsor' ? 'Sponsor' : 'Sponsee'}
        </Button>
      </Box>
    );
  }

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
        {persons.map((person, index) => (
          <Tab 
            key={person.id || index} 
            label={`${person.name} ${person.lastName || ''}`.trim()}
          />
        ))}
        <Tab label={`+ Add ${personType === 'sponsor' ? 'Sponsor' : 'Sponsee'}`} />
      </Tabs>

      {persons.map((person, index) => (
        <TabPanel key={person.id || index} value={currentTab} index={index}>
          <PersonCard
            person={person}
            onEdit={onEdit}
            onDelete={deletePerson}
            onAddContact={onAddContact}
            contacts={getPersonContacts(person.id)}
          />
        </TabPanel>
      ))}
    </Box>
  );
}