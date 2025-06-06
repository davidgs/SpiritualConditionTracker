import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TabComponent from './TabComponent';
import { ContactPerson } from '../../types/ContactPerson';

interface SubTabComponentProps {
  persons: ContactPerson[];
  personType: 'sponsor' | 'sponsee';
  contacts: any[];
  actionItems: any[];
  currentTab: number;
  onTabChange: (event: any, newValue: number) => void;
  onAddPerson: () => void;
  onEditPerson: (person: ContactPerson) => void;
  onDeletePerson: (personId: string | number) => void;
  onAddContact: (person: ContactPerson) => void;
  onEditContact?: (contact: any) => void;
  onToggleActionItem?: (actionItem: any) => void;
  addLabel: string;
  emptyMessage: string;
  renderContactCard?: (contact: any, index: number) => React.ReactNode;
}

export default function SubTabComponent({
  persons,
  personType,
  contacts,
  actionItems,
  currentTab,
  onTabChange,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  onAddContact,
  onEditContact,
  onToggleActionItem,
  addLabel,
  emptyMessage,
  renderContactCard
}: SubTabComponentProps) {
  const theme = useTheme();

  console.log(`SubTabComponent ${personType}:`, 'persons:', persons, 'length:', persons.length);

  // If no persons, show empty state
  if (persons.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 3, 
        px: 2,
        margin: '8px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          {emptyMessage}
        </Typography>
        
        <IconButton 
          color="primary"
          onClick={onAddPerson}
          sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          <i className="fa-solid fa-plus"></i>
        </IconButton>
      </Box>
    );
  }

  // Helper function to get contacts for a specific person
  const getPersonContacts = (personId: string | number) => {
    const foreignKey = personType === 'sponsor' ? 'sponsorId' : 'sponseeId';
    return contacts.filter(contact => contact[foreignKey] === personId);
  };

  // Create tab items for the TabComponent
  const tabItems = persons.map((person, index) => ({
    id: person.id || index,
    label: `${person.name} ${person.lastName || ''}`.trim(),
    content: (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          {person.name} {person.lastName}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Phone: {person.phoneNumber || 'Not provided'}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Email: {person.email || 'Not provided'}
        </Typography>
        {person.notes && (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Notes: {person.notes}
          </Typography>
        )}
      </Box>
    )
  }));

  return (
    <TabComponent
      items={tabItems}
      currentTab={currentTab}
      onTabChange={onTabChange}
      addTabLabel={addLabel}
      onAddClick={onAddPerson}
    />
  );
}