import { gapi } from 'gapi-script';

// Google API configuration
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual Google API key
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual Google client ID
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar';

// Initialize the Google API client
export const initGoogleApi = () => {
  return new Promise<void>((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error('Error initializing Google API client:', error);
          reject(error);
        });
    });
  });
};

// Check if the user is signed in to Google
export const isSignedInToGoogle = () => {
  return gapi.auth2?.getAuthInstance()?.isSignedIn.get() || false;
};

// Sign in to Google
export const signInToGoogle = async () => {
  try {
    if (!gapi.auth2) {
      await initGoogleApi();
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn();
    return { success: true, user };
  } catch (error: any) {
    console.error('Error signing in to Google:', error);
    return { success: false, error: error.message };
  }
};

// Sign out from Google
export const signOutFromGoogle = async () => {
  try {
    if (!gapi.auth2) {
      await initGoogleApi();
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out from Google:', error);
    return { success: false, error: error.message };
  }
};

// Add a task to Google Calendar
export const addTaskToCalendar = async (task: {
  title: string;
  description?: string;
  dueDate?: Date;
  reminders?: number[]; // minutes before the event
}) => {
  try {
    if (!isSignedInToGoogle()) {
      await signInToGoogle();
    }
    
    if (!task.dueDate) {
      return { success: false, error: 'Task must have a due date to be added to Calendar' };
    }
    
    // Format task for Google Calendar
    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: task.dueDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(task.dueDate.getTime() + 30 * 60000).toISOString(), // Default 30 min duration
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: (task.reminders || [30]).map((minutes) => ({
          method: 'popup',
          minutes,
        })),
      },
    };
    
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    
    return { success: true, event: response.result };
  } catch (error: any) {
    console.error('Error adding task to Google Calendar:', error);
    return { success: false, error: error.message };
  }
};

// Get events from Google Calendar for a date range
export const getCalendarEvents = async (timeMin: Date, timeMax: Date) => {
  try {
    if (!isSignedInToGoogle()) {
      await signInToGoogle();
    }
    
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return { success: true, events: response.result.items };
  } catch (error: any) {
    console.error('Error getting events from Google Calendar:', error);
    return { success: false, error: error.message };
  }
};

// Update an event in Google Calendar
export const updateCalendarEvent = async (eventId: string, updates: any) => {
  try {
    if (!isSignedInToGoogle()) {
      await signInToGoogle();
    }
    
    // First, get the current event
    const getResponse = await gapi.client.calendar.events.get({
      calendarId: 'primary',
      eventId,
    });
    
    const currentEvent = getResponse.result;
    const updatedEvent = { ...currentEvent, ...updates };
    
    const updateResponse = await gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: updatedEvent,
    });
    
    return { success: true, event: updateResponse.result };
  } catch (error: any) {
    console.error('Error updating event in Google Calendar:', error);
    return { success: false, error: error.message };
  }
};

// Delete an event from Google Calendar
export const deleteCalendarEvent = async (eventId: string) => {
  try {
    if (!isSignedInToGoogle()) {
      await signInToGoogle();
    }
    
    await gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event from Google Calendar:', error);
    return { success: false, error: error.message };
  }
}; 