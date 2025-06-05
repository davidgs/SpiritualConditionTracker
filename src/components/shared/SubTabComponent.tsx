import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TabComponent from './TabComponent';
import PersonPage from './PersonPage';
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

  // If no persons, show empty state
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
          {emptyMessage}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={onAddPerson}
          startIcon={<i className="fa-solid fa-plus"></i>}
        >
          {addLabel}
        </Button>
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
      <PersonPage
        person={person}
        personType={personType}
        contacts={getPersonContacts(person.id)}
        actionItems={actionItems}
        onAddContact={onAddContact}
        onEditPerson={onEditPerson}
        onDeletePerson={onDeletePerson}
        onEditContact={onEditContact}
        onToggleActionItem={onToggleActionItem}
        renderContactCard={renderContactCard}
      />
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