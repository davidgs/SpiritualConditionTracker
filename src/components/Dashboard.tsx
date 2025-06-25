import React, { useState, useRef, useEffect, useMemo } from 'react';
import logoImg from '../assets/logo-small.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import { useTheme } from '@mui/material/styles';
import ActivityList from './ActivityList';
import SpiritualFitnessModal from './SpiritualFitnessModal';
import LogActivityModal from './LogActivityModal';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Paper, Box, Typography, IconButton, Button } from '@mui/material';
import { User, Activity, Meeting } from '../types/database';
import { calculateSpiritualFitnessScore, getSpiritualFitnessBreakdown } from '../utils/SpiritualFitness';
import DatabaseService from '../services/DatabaseService';
import { createTestData } from '../utils/testDataGenerator';
import { useAppData } from '../contexts/AppDataContext';

interface DashboardProps {
  setCurrentView: (view: string) => void;
  user: User | null;
  activities: Activity[];
  meetings: Meeting[];
  onSave: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTimeframeChange: (timeframe: number) => void;
  currentTimeframe: number;
  onUpdateActionItem?: (actionItemId: string, status: 'completed' | 'deleted') => void;
  onNavigateToSponsorContact?: (contactId: string) => void;
}

export default function Dashboard({ setCurrentView, user, activities, meetings = [], onSave, onSaveMeeting, onTimeframeChange, currentTimeframe, onUpdateActionItem, onNavigateToSponsorContact }: DashboardProps) {

  // Get DatabaseService instance for contact operations
  const databaseService = DatabaseService.getInstance();

  // Get data loading functions from context
  const { loadActivities, loadActionItems } = useAppData();

  // Handler for saving sponsor contacts from LogActivityModal
  const handleSaveSponsorContact = async (contactData: any, actionItems: any[] = []) => {
    try {
      // Save the sponsor contact
      const savedContact = await databaseService.add('sponsor_contacts', {
        ...contactData,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Save action items if any - to action_items table ONLY
      if (actionItems && actionItems.length > 0 && savedContact && (savedContact as any).id) {
        for (const actionItem of actionItems) {
          await databaseService.add('action_items', {
            title: actionItem.title,
            text: actionItem.text || actionItem.title,
            notes: actionItem.notes || '',
            contactId: (savedContact as any).id,
            sponsorId: selectedSponsorForContact?.id,
            sponsorName: selectedSponsorForContact?.name,
            dueDate: actionItem.dueDate || contactData.date,
            completed: 0,
            type: 'sponsor_action_item',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      console.log('Sponsor contact saved successfully:', savedContact);
    } catch (error) {
      console.error('Failed to save sponsor contact:', error);
      alert('Failed to save sponsor contact');
    }
  };

  // Handler for saving sponsee contacts from LogActivityModal
  const handleSaveSponseeContact = async (contactData: any, actionItems: any[] = []) => {
    try {
      // Save the sponsee contact to the correct table
      const savedContact = await databaseService.add('sponsee_contacts', {
        ...contactData,
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
            type: 'sponsee_action_item', // Mark as sponsee action item for categorization
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      console.log('Sponsee contact saved successfully:', savedContact);
    } catch (error) {
      console.error('Failed to save sponsee contact:', error);
      alert('Failed to save sponsee contact');
    }
  };

  // Test data generation handler
  const handleCreateTestData = async () => {
    if (!user?.id) {
      console.error('No user ID available for test data creation');
      return;
    }

    try {
      console.log('[ Dashboard ] Starting test data creation...');
      const results = await createTestData(user.id);
      console.log('[ Dashboard ] Test data creation completed:', results);

      // Reload activities and action items to show new data
      console.log('[ Dashboard ] Reloading activities and action items after test data creation...');
      await loadActivities();
      await loadActionItems();

      // Show results to user
      alert(`Comprehensive test data created successfully!\n\nUser Profile: ${results.userProfileUpdated ? 'Updated' : 'Not updated'}\nMeetings: ${results.meetingsCreated}\nActivities: ${results.activitiesCreated}\nSponsors: ${results.sponsorsCreated}\nSponsees: ${results.sponseesCreated}\nSponsor Contacts: ${results.sponsorContactsCreated}\nSponsee Contacts: ${results.sponseeContactsCreated}\nAction Items: ${results.actionItemsCreated}\n\nCheck all tabs to see the comprehensive test data including profile, meetings, activities, and sponsor/sponsee relationships.`);

    } catch (error) {
      console.error('[ Dashboard ] Failed to create test data:', error);
      alert('Failed to create test data. Check console for details.');
    }
  };

  // Get theme from MUI theme provider
  const { mode } = useAppTheme();
  const darkMode = mode === 'dark';

  // State for controlling modal visibility and score timeframe
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [activityDaysFilter, setActivityDaysFilter] = useState<number>(7);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  // Use timeframe from props instead of local state
  const scoreTimeframe = currentTimeframe;
  // const [spiritualFitness, setSpiritualFitness] = useState<number>(5);
  const [currentScore, setCurrentScore] = useState<number>(0);

  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  // Log spiritualFitness prop for debugging
//  console.log('[ Dashboard.js ] Dashboard initial spiritualFitness:', spiritualFitness);

  // Log current score state
//  console.log('[ Dashboard.js ] Dashboard currentScore state:', currentScore);

  // log current time frame
//  console.log('[ Dashboard.js ] Dashboard currentTimeframe:', currentTimeframe);
//  console.log('[ Dashboard.js ] Dashboard scoreTimeframe:', scoreTimeframe);

  // Format score to 2 decimal places for display
  const formattedScore: string = currentScore > 0 ? currentScore.toFixed(2) : '0.00';

//  console.log('[ Dashboard.js ] Dashboard formattedScore for display:', formattedScore);

  // Use MUI theme for colors
  const muiTheme = useTheme();

  // Determine color based on score using theme palette
  const getScoreColor = (score: number): string => {
    if (score < 30) return muiTheme.palette.error.main; // Red
    if (score < 75) return muiTheme.palette.warning.main; // Yellow/Amber
    return muiTheme.palette.success.main; // Green
  };

  // Calculate progress percentage, capped at 100%
   const progressPercent = Math.min(currentScore, 100);
//  console.log('[ Dashboard.js ] Dashboard progressPercent:', progressPercent);

  // Effect to calculate spiritual fitness when activities change
  useEffect(() => {
//    console.log('[ Dashboard.js ] Dashboard useEffect [activities] triggered - calculating spiritual fitness');
    const scoreBreak = getSpiritualFitnessBreakdown(activities, scoreTimeframe);
//    console.log('[ Dashboard.js ] Dashboard scoreBreak:', scoreBreak);
    const newScore: number = calculateSpiritualFitnessScore(activities, scoreTimeframe);
 //   console.log('[ Dashboard.js: 71 ] Dashboard newScore:', newScore);
    setCurrentScore(newScore);
  }, [activities, scoreTimeframe]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowScoreModal(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, buttonRef]);

  // Function to cycle through timeframe options
  const cycleTimeframe = () => {
    let newTimeframe;
    switch(scoreTimeframe) {
      case 7: newTimeframe = 30; break;
      case 30: newTimeframe = 60; break;
      case 60: newTimeframe = 90; break;
      case 90: newTimeframe = 180; break;
      case 180: newTimeframe = 365; break;
      default: newTimeframe = 7;
    }

    // Call the parent's timeframe change handler - the parent handles persistence properly
    onTimeframeChange(newTimeframe);
  };

  // Format number with thousands separator
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate sobriety information using pure JavaScript (no database calls)
  // Fixed to handle timezone issues properly
  const sobrietyDays = useMemo(() => {
    if (!user?.sobrietyDate) return 0;

    // Get the date string in YYYY-MM-DD format
    const dateStr = user.sobrietyDate.includes('T') ? user.sobrietyDate.split('T')[0] : user.sobrietyDate;

    // Parse date components to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const sobrietyDate = new Date(year, month - 1, day); // month is 0-indexed

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = todayDate.getTime() - sobrietyDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [user?.sobrietyDate]);

  const sobrietyYears = useMemo(() => {
    if (!user?.sobrietyDate) return 0;

    // Get the date string in YYYY-MM-DD format
    const dateStr = user.sobrietyDate.includes('T') ? user.sobrietyDate.split('T')[0] : user.sobrietyDate;

    // Parse date components to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const sobrietyDate = new Date(year, month - 1, day); // month is 0-indexed

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = todayDate.getTime() - sobrietyDate.getTime();
    const years = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(years * 100) / 100; // Round to 2 decimal places
  }, [user?.sobrietyDate]);

  // Determine whether to show years or days more prominently
  const showYearsProminent = sobrietyYears >= 1;

  // Handle activity clicks for sponsor contacts and action items
  const handleActivityClick = (activity: Activity, action: string) => {
    console.log('Activity clicked:', activity, 'Action:', action);

    if (activity.type === 'sponsor-contact') {
      // Navigate to sponsor contact details page
      if (onNavigateToSponsorContact && (activity as any).contactId) {
        onNavigateToSponsorContact((activity as any).contactId);
      }
    } else if (activity.type === 'action-item') {
      if (action === 'complete' && onUpdateActionItem) {
        onUpdateActionItem(String(activity.id), 'completed');
      } else if (action === 'delete' && onUpdateActionItem) {
        onUpdateActionItem(String(activity.id), 'deleted');
      }
    }
  };

  return (
    <Box sx={{ px: 1, pb: 3, pt: 0, maxWidth: 'md', mx: 'auto' }}>
      {/* Sobriety Section - Full Width */}
      <Paper
          elevation={1}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 1,
            textAlign: 'center',
            border: 1,
            borderColor: 'divider',
            borderLeft: 4,
            borderLeftColor: 'success.main',
            mb: 1.5,
          }}
          data-tour="sobriety-counter-box"
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'text.primary',
              mb: 0.5,
              textAlign: 'center'
            }}
          >
            Sobriety
          </Typography>

          {/* Add sobriety date display */}
          {user?.sobrietyDate && (
            <Typography
              variant="body2"
              sx={{
                fontSize: '1rem',
                color: 'text.secondary',
                mb: 0.5,
                textAlign: 'center'
              }}
            >
              Since {formatDateForDisplay(user.sobrietyDate)}
            </Typography>
          )}

          {showYearsProminent ? (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.5, justifyContent: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '1.9rem',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mr: 0.5,
                    lineHeight: 1.1
                  }}
                >
                  {sobrietyYears.toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.5rem',
                    color: 'text.secondary',
                    lineHeight: 1.1
                  }}
                >
                  years
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.5rem',
                  color: 'primary.main',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  alignmentBaseline: 'middle'
                }}
              >
                {formatNumber(sobrietyDays)} days
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.5, justifyContent: 'center' }}>
                <Typography
                  data-tour="sobriety-days"
                  variant="h4"
                  sx={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mr: 0.5,
                    lineHeight: 1.1
                  }}
                >
                  {formatNumber(sobrietyDays)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.25rem',
                    color: 'text.secondary',
                    lineHeight: 1.1
                  }}
                >
                  days
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.25rem',
                  color: 'primary.main',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  alignmentBaseline: 'middle'
                }}
              >
                {sobrietyYears.toFixed(2)} years
              </Typography>
            </Box>
          )}
      </Paper>
        <Paper
          elevation={1}
          sx={{
            p: 1,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderLeft: 4,
            borderLeftColor: 'primary.main',
            mb: 1.5,
          }}
          data-tour="spiritual-fitness-score"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 600,
                m: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Spiritual Fitness
              <Box
                component="button"
                onClick={() => setShowScoreModal(!showScoreModal)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  p: '0 0 0 4px',
                  position: 'relative',
                  top: '-5px',
                  color: 'primary.main'
                }}
                aria-label="Show how spiritual fitness is calculated"
              >
                <i className="fa-solid fa-question"></i>
              </Box>
            </Typography>
          </Box>

          {/* Score display with dynamic color */}
          <Typography
            variant="h4"
            sx={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              mb: 0.5,
              color: getScoreColor(currentScore),
              lineHeight: 1.1
            }}
          >
            {formattedScore}
          </Typography>

          {/* Gradient progress bar with mask - thicker version with no markers */}
          <Box sx={{
            position: 'relative',
            height: '32px',
            width: '100%',
            borderRadius: '12px',
            background: (theme) => `linear-gradient(
              90deg,
              ${theme.palette.error.main} 0%,
              ${theme.palette.error.light} 25%,
              ${theme.palette.warning.main} 50%,
              ${theme.palette.success.light} 75%,
              ${theme.palette.success.main} 100%
            )`,
            mb: '6px',
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? 'inset 0 1px 2px rgba(0,0,0,0.2)'
              : 'inset 0 1px 2px rgba(0,0,0,0.1)'
          }}
            data-tour="spiritual-fitness-display"
>
            <Box sx={{
              borderRadius: '0 8px 8px 0',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#374151' : '#F3F4F6',
              position: 'absolute',
              right: 0,
              bottom: 0,
              top: 0,
              width: `${100 - progressPercent}%`
            }}></Box>
          </Box>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            fontSize: '1.25rem',
            color: 'text.secondary'
          }}>
            <Typography variant="body2" sx={{ fontSize: 'inherit' }}>{scoreTimeframe}-day score</Typography>
            <IconButton
              onClick={cycleTimeframe}
              size="small"
              sx={{
                padding: '2px',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Change timeframe"
              data-tour="spiritual-fitness-time"
            >
              <i className="fa-solid fa-shuffle"></i>
            </IconButton>
          </Box>
          {/* "How is this calculated" button removed - now using the icon in the header */}

          {/* Render modal at the end of the Dashboard component body to avoid positioning issues */}
        </Paper>

      {/* Recent Activities Section */}
      <Paper
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderLeft: 4,
          borderLeftColor: 'info.main',
          mb: 1.5,
          // No fixed height or overflow here - the entire page scrolls
        }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0.5
        }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'text.primary',
              paddingRight: '0.15rem'
            }}
          >Activities</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Activity type filter */}
            <Box
              component="select"
              sx={{
                bgcolor: 'transparent',
                border: 1,
                borderColor: 'divider',
                borderRadius: 0.25,
                color: 'text.primary',
                padding: '0.15rem 0.5rem',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              defaultValue="all"
              onChange={(e) => {
                const filter = e.target.value;
                setActivityTypeFilter(filter);
              }}
            >
              <option value="all">All</option>
              <option value="prayer">Prayer</option>
              <option value="meditation">Meditation</option>
              <option value="literature">Reading</option>
              <option value="meeting">Meetings</option>
              <option value="call">Calls</option>
              <option value="service">Service</option>
            </Box>

            {/* Activity timeframe selector */}
            <Box
              component="select"
              sx={{
                bgcolor: 'transparent',
                border: 1,
                borderColor: 'divider',
                borderRadius: 0.25,
                color: 'text.primary',
                padding: '0.15rem 0.5rem',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              defaultValue="7"
              onChange={(e) => {
                const days = parseInt(e.target.value, 10);
                setActivityDaysFilter(days);
                // This will update when we connect the state to ActivityList
              }}
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="0">All time</option>
            </Box>

            {/* Log new activity button */}
            {/* Button to open activity modal */}
            <Button
              onClick={() => setShowActivityModal(true)}
              data-tour="log-activity-btn"
              variant="contained"
              color="primary"
              startIcon={<i className="fa-solid fa-plus" />}
              size="small"
              sx={{
                fontSize: '.9rem',
                textTransform: 'none',
                borderRadius: '20px',
                px: 1,
                py: 0.25,
                minWidth: 'auto'
              }}
            >
              Log
            </Button>

          </Box>
        </Box>

        {/* Use the reusable ActivityList component */}
        <ActivityList
          activities={activities}
          darkMode={darkMode}
          limit={30}
          maxDaysAgo={activityDaysFilter === 0 ? null : activityDaysFilter}
          filter={activityTypeFilter}
          showDate={true}
          onActivityClick={handleActivityClick}
          meetings={meetings}
        />
      </Paper>

      {/* Material UI Dialog for Spiritual Fitness */}
      <SpiritualFitnessModal
        open={showScoreModal}
        onClose={() => setShowScoreModal(false)}
      />

      {/* Activity Log Modal */}
      <LogActivityModal
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={onSave}
        onSaveMeeting={onSaveMeeting}
        onSaveSponsorContact={handleSaveSponsorContact}
        onSaveSponseeContact={handleSaveSponseeContact}
        meetings={meetings}
      />

      {/* Test Data Button - Development Only - HIDDEN */}
     <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleCreateTestData}
          variant="outlined"
          color="secondary"
          sx={{
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: '8px',
            px: 2,
            py: 1
          }}
        >
          Create Test Data
        </Button>
      </Box>
    </Box>
  );
}