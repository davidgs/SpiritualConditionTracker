import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  IconButton,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DatabaseService from '../services/DatabaseService';
import SubTabComponent from './shared/SubTabComponent';
import PersonFormDialog from './shared/PersonFormDialog';
import ContactFormDialog from './shared/ContactFormDialog';
import { ContactCard } from './ContactCard';
import { ContactPerson } from '../types/ContactPerson';
import { Contact } from '../types/database';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SponsorSponsee({ user, onUpdate, onSaveActivity, activities = [] }) {
  const theme = useTheme();
  const databaseService = DatabaseService.getInstance();

  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  const [currentSponsorTab, setCurrentSponsorTab] = useState(0);
  const [currentSponseeTab, setCurrentSponseeTab] = useState(0);

  // Data state
  const [sponsors, setSponsors] = useState<ContactPerson[]>([]);
  const [sponsees, setSponsees] = useState<ContactPerson[]>([]);
  const [sponsorContacts, setSponsorContacts] = useState([]);
  const [sponseeContacts, setSponseeContacts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSponseeContactForm, setShowSponseeContactForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ContactPerson | null>(null);
  const [editingContact, setEditingContact] = useState(null);
  const [editingActionItem, setEditingActionItem] = useState(null);
  const [personFormType, setPersonFormType] = useState<'sponsor' | 'sponsee'>('sponsor');
  const [selectedSponseeForContact, setSelectedSponseeForContact] = useState(null);
  const [selectedSponsorForContact, setSelectedSponsorForContact] = useState(null);

  // Load data - FIXED: Show all sponsors/sponsees since there's only one user
  const loadSponsors = async () => {
    try {
      const sponsorData = await databaseService.getAll('sponsors');
      setSponsors(sponsorData as ContactPerson[]);
    } catch (error) {
      console.error('Failed to load sponsors:', error);
    }
  };

  const loadSponsees = async () => {
    try {
      const sponseeData = await databaseService.getAll('sponsees');
      setSponsees(sponseeData as ContactPerson[]);
    } catch (error) {
      console.error('Failed to load sponsees:', error);
    }
  };

  const loadSponsorContacts = async () => {
    try {
      const contacts = await databaseService.getAll('sponsor_contacts');
      setSponsorContacts(contacts);
    } catch (error) {
      console.error('Failed to load sponsor contacts:', error);
    }
  };

  const loadSponseeContacts = async () => {
    try {
      const contacts = await databaseService.getAll('sponsee_contacts');
      setSponseeContacts(contacts);
    } catch (error) {
      console.error('Failed to load sponsee contacts:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSponsors();
      loadSponsees();
      loadSponsorContacts();
      loadSponseeContacts();
    }
  }, [user?.id, refreshKey]);

  // Delete handler
  const handleDeletePerson = async (personType: 'sponsor' | 'sponsee', personId: string | number) => {
    if (!personId) {
      console.error(`No ${personType} ID provided for deletion`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${personType}?`)) {
      return;
    }

    try {
      const contactTable = personType === 'sponsor' ? 'sponsor_contacts' : 'sponsee_contacts';
      const personTable = personType === 'sponsor' ? 'sponsors' : 'sponsees';
      const foreignKey = personType === 'sponsor' ? 'sponsorId' : 'sponseeId';

      // Delete related contacts first
      const contacts = await databaseService.getAll(contactTable);
      const relatedContacts = contacts.filter((c: any) => c[foreignKey] === personId);
      
      for (const contact of relatedContacts) {
        await databaseService.remove(contactTable, (contact as any).id);
      }
      
      // Delete the person
      await databaseService.remove(personTable, personId);
      
      // Refresh data
      if (personType === 'sponsor') {
        await loadSponsors();
        await loadSponsorContacts();
      } else {
        await loadSponsees();
        await loadSponseeContacts();
      }
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error(`Failed to delete ${personType}:`, error);
      alert(`Failed to delete ${personType}`);
    }
  };

  // Edit handlers
  const handleEditSponsor = (sponsor: ContactPerson | null) => {
    setEditingPerson(sponsor);
    setPersonFormType('sponsor');
    setShowPersonForm(true);
  };

  const handleEditSponsee = (sponsee: ContactPerson | null) => {
    setEditingPerson(sponsee);
    setPersonFormType('sponsee');
    setShowPersonForm(true);
  };

  // Form submission handlers
  const handlePersonSubmit = async (personData: ContactPerson) => {
    try {
      const tableMap = {
        sponsor: 'sponsors',
        sponsee: 'sponsees'
      };

      const table = tableMap[personFormType];
      const dataToSave = {
        ...personData,
        userId: user?.id,
        updatedAt: new Date().toISOString()
      };

      if (editingPerson?.id) {
        await databaseService.update(table, editingPerson.id, dataToSave);
      } else {
        await databaseService.add(table, {
          ...dataToSave,
          createdAt: new Date().toISOString()
        });
      }

      setShowPersonForm(false);
      setEditingPerson(null);
      
      // Refresh data
      if (personFormType === 'sponsor') {
        await loadSponsors();
      } else {
        await loadSponsees();
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save person:', error);
      alert('Failed to save person');
    }
  };

  // Contact handlers
  const handleAddContact = (person: ContactPerson) => {
    if (sponsors.some(s => s.id === person.id)) {
      // This is a sponsor
      setSelectedSponsorForContact(person);
      setEditingContact(null);
      setShowContactForm(true);
    } else {
      // This is a sponsee
      setSelectedSponseeForContact(person);
      setEditingContact(null);
      setShowSponseeContactForm(true);
    }
  };

  const handleAddContactWithActionItem = async (contactData, actionItems = []) => {
    try {
      // Save the contact first
      const savedContact = await databaseService.add('sponsor_contacts', {
        ...contactData,
        sponsorId: selectedSponsorForContact?.id,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Save action items if any
      if (actionItems && actionItems.length > 0 && savedContact && (savedContact as any).id) {
        for (const actionItem of actionItems) {
          await databaseService.add('action_items', {
            title: actionItem.title,
            text: actionItem.text || actionItem.title,
            notes: actionItem.notes || '',
            contactId: (savedContact as any).id,
            dueDate: actionItem.dueDate || contactData.date,
            completed: 0,
            type: 'todo', // Default type since we removed categorization
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      setShowContactForm(false);
      setSelectedSponsorForContact(null);
      await loadSponsorContacts();
      setRefreshKey(prev => prev + 1);
      
      // Reload activities to show new sponsor contact and action items in dashboard
      if (onSaveActivity) {
        // Trigger activity reload through parent component
        const refreshActivity = { type: 'refresh', id: Date.now() };
        await onSaveActivity(refreshActivity);
      }
    } catch (error) {
      console.error('Failed to add sponsor contact:', error);
      alert('Failed to add contact');
    }
  };

  const handleAddSponseeContactWithActionItem = async (contactData) => {
    try {
      await databaseService.add('sponsee_contacts', {
        ...contactData,
        sponseeId: selectedSponseeForContact?.id,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setShowSponseeContactForm(false);
      setSelectedSponseeForContact(null);
      await loadSponseeContacts();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add sponsee contact:', error);
      alert('Failed to add contact');
    }
  };

  const handleToggleActionItem = async (actionItem) => {
    try {
      if (actionItem.deleted) {
        // Handle delete operation
        await databaseService.remove('action_items', actionItem.id);
        console.log('Action item deleted:', actionItem.id);
      } else {
        // Handle toggle completion
        const updatedItem = { 
          ...actionItem, 
          completed: actionItem.completed ? 0 : 1,
          updatedAt: new Date().toISOString()
        };
        await databaseService.update('action_items', actionItem.id, updatedItem);
        console.log('Action item toggled:', actionItem.id, 'completed:', updatedItem.completed);
      }
      setRefreshKey(prev => prev + 1);
      // Reload activities to reflect changes
      if (onSaveActivity) {
        // Trigger activity reload through parent component
        const dummyActivity = { type: 'refresh', id: Date.now() };
        await onSaveActivity(dummyActivity);
      }
    } catch (error) {
      console.error('Failed to update action item:', error);
      alert('Failed to update action item');
    }
  };

  return (
    <div style={{ padding: '0 16px 20px 16px' }}>
      <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 3, fontWeight: 'bold' }}>
        Sponsors & Sponsees
      </Typography>

      <Tabs 
        value={currentTab} 
        onChange={(event, newValue) => setCurrentTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Sponsors" />
        <Tab label="Sponsees" />
      </Tabs>

      {/* Sponsor Tab */}
      <TabPanel value={currentTab} index={0}>
        <SubTabComponent
          persons={sponsors}
          personType="sponsor"
          contacts={sponsorContacts}
          actionItems={activities || []}
          currentTab={currentSponsorTab}
          onTabChange={(event, newValue) => setCurrentSponsorTab(newValue)}
          onAddPerson={() => handleEditSponsor(null)}
          onEditPerson={handleEditSponsor}
          onDeletePerson={(id) => handleDeletePerson('sponsor', id)}
          onAddContact={handleAddContact}
          onToggleActionItem={handleToggleActionItem}
          addLabel="+ Add Sponsor"
          emptyMessage="No sponsors added yet."
          renderContactCard={(contact, index) => (
            <ContactCard
              key={contact.id || index}
              contact={contact}
              theme={theme}
              refreshKey={refreshKey}
              onContactClick={() => {}}
              onEditContact={(contact) => {
                setEditingContact(contact);
                setSelectedSponsorForContact(sponsors.find(s => s.id === contact.sponsorId) || null);
                setShowContactForm(true);
              }}
            />
          )}
        />
      </TabPanel>

      {/* Sponsee Tab */}
      <TabPanel value={currentTab} index={1}>
        <SubTabComponent
          persons={sponsees}
          personType="sponsee"
          contacts={sponseeContacts}
          actionItems={activities || []}
          currentTab={currentSponseeTab}
          onTabChange={(event, newValue) => setCurrentSponseeTab(newValue)}
          onAddPerson={() => handleEditSponsee(null)}
          onEditPerson={handleEditSponsee}
          onDeletePerson={(id) => handleDeletePerson('sponsee', id)}
          onAddContact={handleAddContact}
          onToggleActionItem={handleToggleActionItem}
          addLabel="+ Add Sponsee"
          emptyMessage="No sponsees added yet."
          renderContactCard={(contact, index) => (
            <ContactCard
              key={contact.id || index}
              contact={contact}
              theme={theme}
              refreshKey={refreshKey}
              onContactClick={() => {}}
              onEditContact={(contact) => {
                setEditingContact(contact);
                setSelectedSponseeForContact(sponsees.find(s => s.id === contact.sponseeId) || null);
                setShowSponseeContactForm(true);
              }}
            />
          )}
        />
      </TabPanel>

      {/* Forms */}
      <PersonFormDialog
        open={showPersonForm}
        onClose={() => {
          setShowPersonForm(false);
          setEditingPerson(null);
        }}
        onSave={handlePersonSubmit}
        title={editingPerson ? 
          `Edit ${personFormType === 'sponsor' ? 'Sponsor' : 'Sponsee'}` : 
          `Add ${personFormType === 'sponsor' ? 'Sponsor' : 'Sponsee'}`
        }
        initialData={editingPerson}
      />

      {/* Sponsor Contact Form */}
      <ContactFormDialog
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setEditingContact(null);
          setSelectedSponsorForContact(null);
        }}
        onSave={handleAddContactWithActionItem}
        title={editingContact ? 'Edit Sponsor Contact' : 'Add Sponsor Contact'}
        initialData={editingContact}
      />

      {/* Sponsee Contact Form */}
      <ContactFormDialog
        open={showSponseeContactForm}
        onClose={() => {
          setShowSponseeContactForm(false);
          setEditingContact(null);
          setSelectedSponseeForContact(null);
        }}
        onSave={handleAddSponseeContactWithActionItem}
        title={editingContact ? 'Edit Sponsee Contact' : 'Add Sponsee Contact'}
        initialData={editingContact}
      />
    </div>
  );
}