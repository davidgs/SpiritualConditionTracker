import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import DatabaseService from '../services/DatabaseService';
import { Person, InsertPerson, UpdatePerson, Contact, InsertContact } from '../types/database';

const relationshipTypes = [
  { value: 'sponsor', label: 'Sponsor', icon: '🧭', color: '#4caf50' },
  { value: 'sponsee', label: 'Sponsee', icon: '🌱', color: '#2196f3' },
  { value: 'member', label: 'AA Member', icon: '👥', color: '#9c27b0' },
  { value: 'friend', label: 'Friend', icon: '💙', color: '#ff9800' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#e91e63' },
  { value: 'professional', label: 'Professional', icon: '💼', color: '#607d8b' }
];

const contactTypes = [
  { value: 'call', label: 'Phone Call' },
  { value: 'text', label: 'Text Message' },
  { value: 'meeting', label: 'In-Person Meeting' },
  { value: 'coffee', label: 'Coffee/Meal' },
  { value: 'service', label: 'Service Work' }
];

interface ContactsProps {
  setCurrentView: (view: string) => void;
}

export default function Contacts({ setCurrentView }: ContactsProps) {
  const theme = useTheme();
  const [people, setPeople] = useState<Person[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    sobrietyDate: '',
    homeGroup: '',
    notes: '',
    relationship: 'friend'
  });
  const [contactFormData, setContactFormData] = useState({
    contactType: 'call',
    date: new Date().toISOString().split('T')[0],
    note: '',
    topic: '',
    duration: 0
  });

  const databaseService = DatabaseService.getInstance();

  useEffect(() => {
    loadPeople();
    loadContacts();
  }, []);

  const loadPeople = async () => {
    try {
      const allPeople = await databaseService.getAllPeople();
      setPeople(allPeople || []);
    } catch (error) {
      console.error('Failed to load people:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const allContacts = await databaseService.getAll('contacts') as Contact[];
      setContacts(allContacts || []);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const getFilteredPeople = () => {
    if (selectedTab === 0) return people; // All contacts
    const relationshipFilter = relationshipTypes[selectedTab - 1]?.value;
    return people.filter(person => person.relationship === relationshipFilter);
  };

  const getPersonIcon = (relationship: string) => {
    const rel = relationshipTypes.find(r => r.value === relationship);
    return rel?.icon || '👤';
  };

  const getPersonColor = (relationship: string) => {
    const rel = relationshipTypes.find(r => r.value === relationship);
    return rel?.color || theme.palette.primary.main;
  };

  const handlePersonSubmit = async () => {
    try {
      if (editingPerson) {
        // Update existing person
        await databaseService.updatePerson(editingPerson.id, formData as UpdatePerson);
      } else {
        // Create new person
        await databaseService.addPerson({
          ...formData,
          userId: 'default_user',
          isActive: 1
        } as InsertPerson);
      }
      
      setShowPersonForm(false);
      setEditingPerson(null);
      resetForm();
      loadPeople();
    } catch (error) {
      console.error('Failed to save person:', error);
      alert('Failed to save contact');
    }
  };

  const handleContactSubmit = async () => {
    if (!selectedPerson) return;

    try {
      await databaseService.addContact({
        ...contactFormData,
        userId: 'default_user',
        personId: selectedPerson.id,
        date: new Date(contactFormData.date).toISOString()
      } as InsertContact);
      
      setShowContactForm(false);
      setSelectedPerson(null);
      resetContactForm();
      loadContacts();
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert('Failed to save contact record');
    }
  };

  const handleDeletePerson = async (person: Person) => {
    if (window.confirm(`Delete ${person.firstName} ${person.lastName}? This will also delete all contact records.`)) {
      try {
        await databaseService.deletePerson(person.id);
        loadPeople();
        loadContacts();
      } catch (error) {
        console.error('Failed to delete person:', error);
        alert('Failed to delete contact');
      }
    }
  };

  const openEditPerson = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      firstName: person.firstName,
      lastName: person.lastName || '',
      phoneNumber: person.phoneNumber || '',
      email: person.email || '',
      sobrietyDate: person.sobrietyDate || '',
      homeGroup: person.homeGroup || '',
      notes: person.notes || '',
      relationship: person.relationship || 'friend'
    });
    setShowPersonForm(true);
  };

  const openAddContact = (person: Person) => {
    setSelectedPerson(person);
    setShowContactForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      sobrietyDate: '',
      homeGroup: '',
      notes: '',
      relationship: 'friend'
    });
  };

  const resetContactForm = () => {
    setContactFormData({
      contactType: 'call',
      date: new Date().toISOString().split('T')[0],
      note: '',
      topic: '',
      duration: 0
    });
  };

  const getContactCount = (personId: number) => {
    return contacts.filter(contact => contact.personId === personId).length;
  };

  const filteredPeople = getFilteredPeople();

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h4" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 'bold' }}>
        Contacts
      </Typography>

      {/* Tabs for filtering by relationship */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="All" />
        {relationshipTypes.map((rel, index) => (
          <Tab 
            key={rel.value}
            label={`${rel.icon} ${rel.label}`}
          />
        ))}
      </Tabs>

      {/* Contact List */}
      {filteredPeople.length === 0 ? (
        <Card sx={{ mt: 3, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No contacts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first contact to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowPersonForm(true)}
          >
            Add Contact
          </Button>
        </Card>
      ) : (
        <List>
          {filteredPeople.map((person) => (
            <ListItem
              key={person.id}
              sx={{
                mb: 1,
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getPersonColor(person.relationship) }}>
                  {getPersonIcon(person.relationship)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {person.firstName} {person.lastName}
                    </Typography>
                    <Chip
                      label={relationshipTypes.find(r => r.value === person.relationship)?.label || 'Contact'}
                      size="small"
                      sx={{
                        bgcolor: getPersonColor(person.relationship),
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {person.phoneNumber && (
                      <Typography variant="body2" color="text.secondary">
                        📞 {person.phoneNumber}
                      </Typography>
                    )}
                    {person.email && (
                      <Typography variant="body2" color="text.secondary">
                        ✉️ {person.email}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {getContactCount(person.id)} contact records
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => openAddContact(person)}
                    title="Add contact record"
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => openEditPerson(person)}
                    title="Edit contact"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeletePerson(person)}
                    title="Delete contact"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add contact"
        sx={{ position: 'fixed', bottom: 100, right: 16 }}
        onClick={() => setShowPersonForm(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Person Dialog */}
      <Dialog
        open={showPersonForm}
        onClose={() => {
          setShowPersonForm(false);
          setEditingPerson(null);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPerson ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Box>
            
            <TextField
              fullWidth
              select
              label="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            >
              {relationshipTypes.map((rel) => (
                <MenuItem key={rel.value} value={rel.value}>
                  {rel.icon} {rel.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Sobriety Date"
                type="date"
                value={formData.sobrietyDate}
                onChange={(e) => setFormData({ ...formData, sobrietyDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Home Group"
                value={formData.homeGroup}
                onChange={(e) => setFormData({ ...formData, homeGroup: e.target.value })}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowPersonForm(false);
            setEditingPerson(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button onClick={handlePersonSubmit} variant="contained">
            {editingPerson ? 'Update' : 'Add'} Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Contact Record Dialog */}
      <Dialog
        open={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setSelectedPerson(null);
          resetContactForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Contact Record for {selectedPerson?.firstName} {selectedPerson?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                select
                label="Contact Type"
                value={contactFormData.contactType}
                onChange={(e) => setContactFormData({ ...contactFormData, contactType: e.target.value })}
              >
                {contactTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={contactFormData.date}
                onChange={(e) => setContactFormData({ ...contactFormData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Topic"
                value={contactFormData.topic}
                onChange={(e) => setContactFormData({ ...contactFormData, topic: e.target.value })}
              />
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={contactFormData.duration}
                onChange={(e) => setContactFormData({ ...contactFormData, duration: parseInt(e.target.value) || 0 })}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={contactFormData.note}
              onChange={(e) => setContactFormData({ ...contactFormData, note: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowContactForm(false);
            setSelectedPerson(null);
            resetContactForm();
          }}>
            Cancel
          </Button>
          <Button onClick={handleContactSubmit} variant="contained">
            Add Contact Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}