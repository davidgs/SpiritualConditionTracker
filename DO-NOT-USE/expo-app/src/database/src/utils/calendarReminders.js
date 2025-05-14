import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request calendar permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestCalendarPermissions = async () => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return status === 'granted';
};

/**
 * Get default calendar for reminders
 * @returns {Promise<string>} Calendar ID
 */
export const getDefaultCalendarId = async () => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Try to find the default calendar
    const defaultCalendar = calendars.find(
      cal => 
        (Platform.OS === 'ios' && cal.source && cal.source.name === 'Default') ||
        (Platform.OS === 'android' && cal.accessLevel === Calendar.CalendarAccessLevel.OWNER)
    );
    
    // If no default calendar, just use the first one that allows modifications
    return defaultCalendar?.id || 
           calendars.find(cal => cal.allowsModifications)?.id || 
           null;
  } catch (error) {
    console.error('Error getting calendars:', error);
    return null;
  }
};

/**
 * Create a new AA recovery calendar
 * @returns {Promise<string>} Calendar ID
 */
export const createRecoveryCalendar = async () => {
  try {
    const calendarSource = Platform.OS === 'ios'
      ? await Calendar.getSourcesAsync()
          .then(sources => sources.find(source => source.type === Calendar.SourceType.LOCAL))
      : { isLocalAccount: true, name: 'AA Recovery', type: Calendar.SourceType.LOCAL };
    
    if (!calendarSource) {
      throw new Error('No calendar source available');
    }
    
    const newCalendarID = await Calendar.createCalendarAsync({
      title: 'AA Recovery',
      color: '#3b82f6',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: calendarSource.id,
      source: calendarSource,
      name: 'AARecoveryCalendar',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    
    return newCalendarID;
  } catch (error) {
    console.error('Error creating calendar:', error);
    throw error;
  }
};

/**
 * Get or create a calendar for AA Recovery events
 * @returns {Promise<string>} Calendar ID
 */
export const getOrCreateRecoveryCalendar = async () => {
  try {
    // Check for existing recovery calendar
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const recoveryCalendar = calendars.find(cal => 
      cal.title === 'AA Recovery' || cal.name === 'AARecoveryCalendar'
    );
    
    if (recoveryCalendar) {
      return recoveryCalendar.id;
    }
    
    // Create new calendar if none exists
    return await createRecoveryCalendar();
  } catch (error) {
    console.error('Error getting or creating recovery calendar:', error);
    
    // Fall back to default calendar
    return await getDefaultCalendarId();
  }
};

/**
 * Add meeting to calendar
 * @param {Object} meeting - Meeting object
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Event ID
 */
export const addMeetingToCalendar = async (meeting, options = {}) => {
  try {
    const { 
      reminderMinutes = 30, 
      notes = '',
      recurrence = null 
    } = options;
    
    // Ensure we have calendar permissions
    const calendarPermission = await requestCalendarPermissions();
    if (!calendarPermission) {
      throw new Error('Calendar permission not granted');
    }
    
    // Get calendar ID
    const calendarId = await getOrCreateRecoveryCalendar();
    if (!calendarId) {
      throw new Error('No calendar available');
    }
    
    // Format meeting details
    const meetingTitle = `AA Meeting: ${meeting.name || 'Unnamed Meeting'}`;
    
    // Format location
    const location = [
      meeting.location,
      meeting.address,
      meeting.city,
      meeting.state
    ].filter(Boolean).join(', ');
    
    // Calculate start and end time
    const meetingDay = meeting.day;
    const meetingTime = meeting.time || '19:00'; // Default to 7 PM if no time provided
    
    // Determine day of week number (0 = Sunday, 1 = Monday, etc.)
    const daysOfWeek = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    // Default to today if day not specified
    const dayNumber = daysOfWeek[meetingDay?.toLowerCase()] ?? new Date().getDay();
    
    // Calculate the next occurrence of this day
    const today = new Date();
    const meetingDate = new Date(today);
    
    // Set to the next occurrence of the meeting day
    const daysUntilMeeting = (dayNumber + 7 - today.getDay()) % 7;
    meetingDate.setDate(today.getDate() + (daysUntilMeeting === 0 ? 7 : daysUntilMeeting));
    
    // Set meeting time
    const [hours, minutes] = meetingTime.split(':').map(Number);
    meetingDate.setHours(hours || 19, minutes || 0, 0, 0);
    
    // Create end time (default to 1 hour later if not specified)
    const endDate = new Date(meetingDate);
    endDate.setHours(endDate.getHours() + 1);
    
    // Format notes
    const eventNotes = [
      notes,
      meeting.types ? `Meeting Type: ${meeting.types.join(', ')}` : '',
    ].filter(Boolean).join('\n\n');
    
    // Create event details
    const eventDetails = {
      title: meetingTitle,
      location,
      notes: eventNotes,
      startDate: meetingDate,
      endDate: endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: [{ relativeOffset: -reminderMinutes }], // Reminder minutes before event
    };
    
    // Add recurrence rule if specified
    if (recurrence === 'weekly') {
      eventDetails.recurrenceRule = {
        frequency: Calendar.Frequency.WEEKLY,
        interval: 1,
        endDate: null, // No end date = repeats forever
      };
    }
    
    // Create the event
    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
    return eventId;
  } catch (error) {
    console.error('Error adding meeting to calendar:', error);
    throw error;
  }
};

/**
 * Schedule a local notification for a meeting
 * @param {Object} meeting - Meeting object
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Notification ID
 */
export const scheduleMeetingNotification = async (meeting, options = {}) => {
  try {
    const { reminderMinutes = 30 } = options;
    
    // Ensure we have notification permissions
    const notificationPermission = await requestNotificationPermissions();
    if (!notificationPermission) {
      throw new Error('Notification permission not granted');
    }
    
    // Format meeting details
    const meetingTitle = meeting.name || 'AA Meeting';
    
    // Format location
    const location = [
      meeting.location,
      meeting.address,
      meeting.city,
      meeting.state
    ].filter(Boolean).join(', ');
    
    // Calculate start time (same as in addMeetingToCalendar)
    const meetingDay = meeting.day;
    const meetingTime = meeting.time || '19:00';
    
    const daysOfWeek = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const dayNumber = daysOfWeek[meetingDay?.toLowerCase()] ?? new Date().getDay();
    
    const today = new Date();
    const meetingDate = new Date(today);
    
    const daysUntilMeeting = (dayNumber + 7 - today.getDay()) % 7;
    meetingDate.setDate(today.getDate() + (daysUntilMeeting === 0 ? 7 : daysUntilMeeting));
    
    const [hours, minutes] = meetingTime.split(':').map(Number);
    meetingDate.setHours(hours || 19, minutes || 0, 0, 0);
    
    // Calculate notification time (X minutes before meeting)
    const notificationDate = new Date(meetingDate);
    notificationDate.setMinutes(notificationDate.getMinutes() - reminderMinutes);
    
    // Ensure notification time is in the future
    if (notificationDate <= new Date()) {
      // If in the past, schedule for next week
      notificationDate.setDate(notificationDate.getDate() + 7);
    }
    
    // Create notification content
    const notificationContent = {
      title: `Upcoming AA Meeting: ${meetingTitle}`,
      body: `Your meeting will start in ${reminderMinutes} minutes${location ? ` at ${location}` : ''}`,
      data: { meetingId: meeting.id || 'unknown', type: 'meeting-reminder' },
    };
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: notificationDate,
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling meeting notification:', error);
    throw error;
  }
};

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - Notification ID to cancel
 * @returns {Promise<void>}
 */
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
    throw error;
  }
};

/**
 * Get all scheduled notifications
 * @returns {Promise<Array>} Array of scheduled notifications
 */
export const getAllScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    throw error;
  }
};