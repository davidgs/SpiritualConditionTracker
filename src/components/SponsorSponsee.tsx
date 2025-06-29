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
import { AddIcon } from '../utils/muiOptimizations';
import { useTheme } from '@mui/material/styles';
import DatabaseService from '../services/DatabaseService';
import SubTabComponent from './shared/SubTabComponent';
import PersonFormDialog from './shared/PersonFormDialog';
import ContactFormDialog from './shared/ContactFormDialog';
import { ContactCard } from './ContactCard';
import { ContactPerson } from '../types/ContactPerson';
import { Contact } from '../types/database';

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
            py: 1,
            px: .5,
            backgroundColor: theme.palette.background.paper,
            // border: `1px solid ${theme.palette.divider}`,
            borderTop: 'none',
            borderRadius: '8px 8px 8px 8px',
            minHeight: '200px'
          }}
        >
          {children}
        </Box>
      )}
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
      // Use unified DatabaseService method instead of direct table query
      const sponsorContacts = await databaseService.getAllSponsorContacts();
      console.log('[loadSponsorContacts] Loaded sponsor contacts using unified architecture:', sponsorContacts.length);
      setSponsorContacts(sponsorContacts);
    } catch (error) {
      console.error('Failed to load sponsor contacts:', error);
    }
  };

  const loadSponseeContacts = async () => {
    try {
      // Use unified DatabaseService method instead of direct table query
      const sponseeContacts = await databaseService.getAllSponseeContacts();
      console.log('[loadSponseeContacts] Loaded sponsee contacts using unified architecture:', sponseeContacts.length);
      setSponseeContacts(sponseeContacts);
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
        // Delete related action items first
        const actionItems = await databaseService.getAll('action_items');
        const contactActionItems = actionItems.filter((item: any) => {
          if (personType === 'sponsor') {
            return item.sponsorContactId === contact.id;
          } else {
            return item.sponseeContactId === contact.id;
          }
        });

        for (const actionItem of contactActionItems) {
          await databaseService.remove('action_items', actionItem.id);
        }

        // Delete related activities
        const activities = await databaseService.getAll('activities');
        const contactActivities = activities.filter((activity: any) => {
          if (personType === 'sponsor') {
            return activity.sponsorId === personId;
          } else {
            return activity.sponseeId === personId;
          }
        });

        for (const activity of contactActivities) {
          await databaseService.remove('activities', activity.id);
        }

        // Now delete the contact
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
  const handleAddSponsorContact = (person: ContactPerson) => {
    setSelectedSponsorForContact(person);
    setEditingContact(null);
    setShowContactForm(true);
  };

  const handleAddSponseeContact = (person: ContactPerson) => {
    setSelectedSponseeForContact(person);
    setEditingContact(null);
    setShowSponseeContactForm(true);
  };

  const handleContactWithActionItems = async (contactData, actionItems = [], personType: 'sponsor' | 'sponsee') => {
    try {
      console.log(`[handleContactWithActionItems] Processing ${personType} contact:`, contactData);

      const isSponsee = personType === 'sponsee';
      const contactTable = isSponsee ? 'sponsee_contacts' : 'sponsor_contacts';
      const foreignKey = isSponsee ? 'sponseeId' : 'sponsorId';
      const selectedPerson = isSponsee ? selectedSponseeForContact : selectedSponsorForContact;
      const actionItemType = isSponsee ? 'sponsee_action_item' : 'sponsor_action_item';

      // Save the contact first
      const savedContact = await databaseService.add(contactTable, {
        ...contactData,
        [foreignKey]: selectedPerson?.id,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log(`[handleContactWithActionItems] Saved ${personType} contact to ${contactTable}:`, savedContact);

      // Create activity record for the contact
      const contactActivityData: any = {
        userId: user?.id || 'default_user',
        type: isSponsee ? 'sponsee-contact' : 'sponsor-contact',
        date: contactData.date,
        notes: contactData.note,
        duration: contactData.duration,
        personCalled: `${selectedPerson?.name} ${selectedPerson?.lastName || ''}`.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isSponsee) {
        contactActivityData.sponseeContactId = (savedContact as any).id;
        contactActivityData.sponseeId = selectedPerson?.id;
      } else {
        contactActivityData.sponsorContactId = (savedContact as any).id;
        contactActivityData.sponsorId = selectedPerson?.id;
      }

      console.log(`[handleContactWithActionItems] Creating activity record for ${personType} contact:`, contactActivityData);
      await databaseService.add('activities', contactActivityData);

      // Save action items if any
      if (actionItems && actionItems.length > 0 && savedContact && (savedContact as any).id) {
        console.log(`[handleContactWithActionItems] Saving ${actionItems.length} action items as type: ${actionItemType}`);
        for (const actionItem of actionItems) {
          const baseActionItemData = {
            title: actionItem.title,
            text: actionItem.text || actionItem.title,
            notes: actionItem.notes || '',
            contactId: (savedContact as any).id,
            dueDate: actionItem.dueDate || contactData.date,
            completed: 0,
            type: actionItemType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Add sponsor/sponsee specific association
          const actionItemData = isSponsee ? {
            ...baseActionItemData,
            sponseeId: selectedPerson?.id,
            sponseeName: selectedPerson?.name
          } : {
            ...baseActionItemData,
            sponsorId: selectedPerson?.id,
            sponsorName: selectedPerson?.name
          };

          console.log(`[handleContactWithActionItems] Action item data for ${personType}:`, actionItemData);

          // Save action item to master table ONLY
          const savedActionItem = await databaseService.add('action_items', actionItemData);
          console.log(`[handleContactWithActionItems] Saved action item to action_items table:`, savedActionItem);

          // DO NOT create activities table records for action items
          // Action items are standalone and referenced by activities via actionItemId when needed
        }
      }

      // Reset form state
      if (isSponsee) {
        setShowSponseeContactForm(false);
        setSelectedSponseeForContact(null);
        await loadSponseeContacts();
      } else {
        setShowContactForm(false);
        setSelectedSponsorForContact(null);
        await loadSponsorContacts();
      }

      setRefreshKey(prev => prev + 1);

      // Reload activities to show new contact and action items in dashboard
      if (onSaveActivity) {
        const refreshActivity = { type: 'refresh', id: Date.now() };
        await onSaveActivity(refreshActivity);
      }

      console.log(`[handleContactWithActionItems] Successfully completed ${personType} contact save`);
    } catch (error) {
      console.error(`Failed to add ${personType} contact:`, error);
      alert(`Failed to add ${personType} contact`);
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
      <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 'bold' }}>
        Sponsors & Sponsees
      </Typography>

      <Tabs
        value={currentTab}
        onChange={(event, newValue) => setCurrentTab(newValue)}
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
            borderRadius: '8px 8px 8px 8px',
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
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Sponsors
              {sponsors.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSponsor(null);
                  }}
                  sx={{
                    padding: '2px',
                    color: 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Sponsees
              {sponsees.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSponsee(null);
                  }}
                  sx={{
                    padding: '2px',
                    color: 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          }
        />
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
          onAddContact={handleAddSponsorContact}
          onToggleActionItem={handleToggleActionItem}
          addLabel="+ Add Sponsor"
          emptyMessage="No sponsors added yet."
          renderContactCard={(contact, index) => (
            <ContactCard
              key={contact.id || index}
              contact={contact}
              theme={theme}
              refreshKey={refreshKey}
              sponsorId={contact.sponsorId}
              personType="sponsor"
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
          onAddContact={handleAddSponseeContact}
          onToggleActionItem={handleToggleActionItem}
          addLabel="+ Add Sponsee"
          emptyMessage="No sponsees added yet."
          renderContactCard={(contact, index) => (
            <ContactCard
              key={contact.id || index}
              contact={contact}
              theme={theme}
              refreshKey={refreshKey}
              sponseeId={contact.sponseeId}
              personType="sponsee"
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
        onSave={(contactData, actionItems) => handleContactWithActionItems(contactData, actionItems, 'sponsor')}
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
        onSave={(contactData, actionItems) => handleContactWithActionItems(contactData, actionItems, 'sponsee')}
        title={editingContact ? 'Edit Sponsee Contact' : 'Add Sponsee Contact'}
        initialData={editingContact}
      />
    </div>
  );
}