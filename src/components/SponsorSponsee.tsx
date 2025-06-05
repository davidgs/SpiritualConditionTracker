import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DatabaseService from '../services/DatabaseService';
import ContactPersonForm from './shared/ContactPersonForm';
import SubTabComponent from './shared/SubTabComponent';
import SponsorContactFormPage from './SponsorContactFormPage';
import SponseeContactFormPage from './SponseeContactFormPage';
import { ContactCard } from './ContactCard';
import { ContactPerson } from '../types/ContactPerson';
import { formatDateForDisplay } from '../utils/dateUtils';

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

  // Debug state changes
  useEffect(() => {
    console.log('Sponsors state updated:', sponsors, 'Length:', sponsors.length);
  }, [sponsors]);

  useEffect(() => {
    console.log('Sponsees state updated:', sponsees, 'Length:', sponsees.length);
  }, [sponsees]);

  // Form state
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSponseeContactForm, setShowSponseeContactForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ContactPerson | null>(null);
  const [editingContact, setEditingContact] = useState(null);
  const [editingActionItem, setEditingActionItem] = useState(null);
  const [personFormType, setPersonFormType] = useState<'sponsor' | 'sponsee'>('sponsor');
  const [selectedSponseeForContact, setSelectedSponseeForContact] = useState(null);

  // Load data
  const loadSponsors = async () => {
    try {
      const sponsorData = await databaseService.getAll('sponsors');
      console.log('Raw sponsor data:', sponsorData);
      const filteredSponsors = sponsorData.filter(sponsor => sponsor.userId === user?.id);
      setSponsors(filteredSponsors as ContactPerson[]);
      console.log('Filtered sponsors:', filteredSponsors.length, 'for user:', user?.id);
    } catch (error) {
      console.error('Failed to load sponsors:', error);
    }
  };

  const loadSponsees = async () => {
    try {
      const sponseeData = await databaseService.getAll('sponsees');
      console.log('Raw sponsee data:', sponseeData);
      const filteredSponsees = sponseeData.filter(sponsee => sponsee.userId === user?.id);
      setSponsees(filteredSponsees as ContactPerson[]);
      console.log('Filtered sponsees:', filteredSponsees.length, 'for user:', user?.id);
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
      console.log('SponsorSponsee: Loading data for user:', user.id, 'Type:', typeof user.id);
      loadSponsors();
      loadSponsees();
      loadSponsorContacts();
      loadSponseeContacts();
    } else {
      console.log('SponsorSponsee: No user ID available, user object:', user);
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
      const relatedContacts = contacts.filter(c => c[foreignKey] === personId);
      
      for (const contact of relatedContacts) {
        await databaseService.remove(contactTable, contact.id);
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
      setEditingContact(null);
      setShowContactForm(true);
    } else {
      // This is a sponsee
      setSelectedSponseeForContact(person);
      setEditingContact(null);
      setShowSponseeContactForm(true);
    }
  };

  const handleAddContactWithActionItem = async (contactData) => {
    try {
      await databaseService.add('sponsor_contacts', {
        ...contactData,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setShowContactForm(false);
      await loadSponsorContacts();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add sponsor contact:', error);
      alert('Failed to add contact');
    }
  };

  const handleAddSponseeContactWithActionItem = async (contactData) => {
    try {
      await databaseService.add('sponsee_contacts', {
        ...contactData,
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

  const handleToggleActionItem = async (actionItemId) => {
    try {
      const actionItem = activities.find(item => item.id === actionItemId);
      if (actionItem) {
        const updatedItem = { ...actionItem, completed: !actionItem.completed };
        await onSaveActivity(updatedItem);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle action item:', error);
    }
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 3, fontWeight: 'bold' }}>
        Sponsor & Sponsees
      </Typography>

      <Tabs 
        value={currentTab} 
        onChange={(event, newValue) => setCurrentTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Sponsor" />
        <Tab label="Sponsees" />
      </Tabs>

      {/* Sponsor Tab */}
      <TabPanel value={currentTab} index={0}>
        {console.log('Rendering sponsor tab with sponsors:', sponsors, 'Length:', sponsors.length)}
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
              onToggleActionItem={handleToggleActionItem}
              theme={theme}
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
              onToggleActionItem={handleToggleActionItem}
              theme={theme}
            />
          )}
        />
      </TabPanel>

      {/* Forms */}
      <ContactPersonForm
        open={showPersonForm}
        onClose={() => {
          setShowPersonForm(false);
          setEditingPerson(null);
        }}
        onSubmit={handlePersonSubmit}
        initialData={editingPerson}
        title={personFormType === 'sponsor' ? 'Add Sponsor' : 'Add Sponsee'}
        submitLabel={editingPerson ? 'Update' : 'Add'}
      />
      
      <SponsorContactFormPage
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setEditingActionItem(null);
          setEditingContact(null);
        }}
        onSubmit={handleAddContactWithActionItem}
        userId={user ? user.id : null}
        initialData={editingContact ? editingContact : null}
        details={editingActionItem ? {
          dueDate: editingActionItem.dueDate,
          notes: editingActionItem.notes
        } : null}
      />

      <SponseeContactFormPage
        open={showSponseeContactForm}
        onClose={() => {
          setShowSponseeContactForm(false);
          setEditingContact(null);
          setSelectedSponseeForContact(null);
        }}
        onSubmit={handleAddSponseeContactWithActionItem}
        userId={user ? user.id : null}
        sponseeId={selectedSponseeForContact?.id}
        initialData={editingContact ? editingContact : null}
      />
    </div>
  );
}