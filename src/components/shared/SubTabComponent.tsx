import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TabComponent from './TabComponent';
import { ContactPerson } from '../../types/ContactPerson';

interface SubTabComponentProps {
  persons: ContactPerson[];
  currentTab: number;
  onTabChange: (event: any, newValue: number) => void;
  onAddPerson: () => void;
  onEditPerson: (person: ContactPerson) => void;
  onDeletePerson: (personId: string | number) => void;
  addLabel: string;
  emptyMessage: string;
  renderPersonContent: (person: ContactPerson, index: number) => React.ReactNode;
}

export default function SubTabComponent({
  persons,
  currentTab,
  onTabChange,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  addLabel,
  emptyMessage,
  renderPersonContent
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

  // Create tab items for the TabComponent
  const tabItems = persons.map((person, index) => ({
    id: person.id || index,
    label: `${person.name} ${person.lastName || ''}`.trim(),
    content: (
      <Box>
        {/* Edit and Delete buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <IconButton 
            onClick={() => onEditPerson(person)}
            size="small"
            sx={{ color: theme.palette.primary.main }}
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </IconButton>
          
          <IconButton 
            onClick={() => onDeletePerson(person.id)}
            size="small"
            sx={{ color: theme.palette.error.main }}
          >
            <i className="fa-solid fa-trash"></i>
          </IconButton>
        </Box>

        {/* Person-specific content */}
        {renderPersonContent(person, index)}
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