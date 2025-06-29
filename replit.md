# Spiritual Condition Tracker - Replit Development Guide

## Overview

The Spiritual Condition Tracker is a comprehensive mobile application designed for individuals in Alcoholics Anonymous (AA) recovery programs. It provides tools for tracking spiritual activities, managing sponsor/sponsee relationships, monitoring meetings, and calculating spiritual fitness scores based on recovery activities.

## System Architecture

### Frontend Architecture
- **Framework**: React 19.1.0 with TypeScript
- **UI Library**: Material-UI (MUI) v7.1.1 with custom theming
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Bundle Management**: Webpack with code splitting and lazy loading
- **Performance**: Lazy-loaded components (Dashboard, Meetings, Profile, SponsorSponsee)

### Backend Architecture
- **Database**: SQLite with Capacitor SQLite plugin for mobile
- **Data Layer**: Centralized DatabaseService with proper initialization and error handling
- **State Management**: React Context API (AppDataContext) for global state
- **Services**: Dedicated service classes for database operations

### Mobile Platform Support
- **iOS**: Full Capacitor integration with Xcode project configuration
- **Android**: Capacitor support with Android-specific configurations
- **Development**: Webpack build only - no web deployment (iOS-only app)

## Key Components

### Core Components
1. **App.tsx**: Main application component with lazy loading and routing
2. **Dashboard**: Primary interface showing spiritual fitness metrics and recent activities
3. **Meetings**: Meeting management with QR code sharing capabilities
4. **Profile**: User profile management with preferences and theme selection
5. **SponsorSponsee**: Comprehensive sponsor/sponsee relationship management

### Database Components
- **DatabaseService**: Centralized database operations with queue management
- **sqliteLoader**: iOS-specific SQLite initialization using CapacitorSQLite
- **Database Tables**: Users, activities, meetings, sponsors, sponsees, action_items

### Context Providers
- **AppDataProvider**: Global state management for activities, meetings, and user data
- **MuiThemeProvider**: Material-UI theme management with dark mode support

## Data Flow

### Data Architecture
1. **Single User App**: Designed for personal use with one primary user
2. **Activity Tracking**: All recovery activities stored in centralized activities table
3. **Relationship Management**: Separate tables for sponsors and sponsees with contact tracking
4. **Action Items**: Unified action item system with sponsor/sponsee associations
5. **Spiritual Fitness**: Algorithmic calculation based on activity frequency and type

### Key Data Flows
- User activities → Activity log → Spiritual fitness calculation
- Sponsor contacts → Contact details → Action items
- Meeting data → QR code generation → Sharing functionality
- User preferences → Theme system → UI rendering

## External Dependencies

### Core Dependencies
- **@capacitor/core**: v7.2.0 - Mobile platform integration
- **@capacitor-community/sqlite**: v7.0.0 - SQLite database for mobile
- **@mui/material**: v7.1.1 - UI component library
- **@mui/x-date-pickers**: v8.5.0 - Date/time selection components
- **react-router-dom**: v7.6.0 - Navigation and routing
- **chart.js**: v4.4.9 - Data visualization for metrics
- **qrcode**: v1.5.4 - QR code generation for meeting sharing

### Development Dependencies
- **webpack**: Bundle management with code splitting
- **babel**: TypeScript and React compilation
- **typescript**: v5.8.3 - Type safety and development tooling

### Mobile Platform Dependencies
- **iOS**: Xcode project with CocoaPods for native dependencies
- **Android**: Gradle build system with Android SDK requirements

## Deployment Strategy

### Development Environment
- **Local Development**: Webpack build process for iOS deployment
- **Database**: SQLite via CapacitorSQLite plugin (iOS-only)
- **Testing**: iOS device/simulator testing only

### Mobile Deployment
- **iOS Build**: Capacitor sync → Xcode → App Store or TestFlight
- **Android Build**: Capacitor sync → Android Studio → Google Play Store
- **Web Fallback**: Static file serving for demo/testing purposes

### Build Process
1. `npm run build` - Production webpack build with optimizations
2. `npx cap sync ios` - Sync web assets to iOS project
3. `npx cap open ios` - Open in Xcode for native build
4. Native compilation and code signing for distribution
5. TestFlight deployment for user testing

## Changelog
- June 29, 2025: **NEW FEATURE** - Added comprehensive Contacts component for full address book functionality
  - **NEW: Contacts navigation tab** - Added between Meetings and Sponsorship tabs in bottom navigation
  - **NEW: Full address book interface** - Manage all contacts beyond just sponsors/sponsees (friends, family, AA members, professionals)
  - **NEW: Relationship categorization** - Filter contacts by relationship type with dedicated tabs
  - **NEW: Contact recording system** - Log interactions with any contact (calls, meetings, coffee, service work)
  - **NEW: Unified database integration** - Uses same people + contacts tables as sponsor/sponsee system
  - **ENHANCED: Navigation structure** - Updated BottomNavBar with Contacts icon and routing
  - Contact management supports: add/edit/delete contacts, track contact history, relationship-based filtering
  - Integrates seamlessly with existing unified people + contacts database architecture
- June 29, 2025: **CRITICAL FIX** - Fixed database table errors in unified architecture
  - **FIXED: "no such table: sponsee_contacts" errors** - Updated DatabaseService to use unified contacts table
  - **FIXED: getAllSponseeContacts method** - Now queries unified people + contacts tables instead of old sponsee_contacts
  - **FIXED: getAllSponsorContacts method** - Converted to use unified architecture with backward compatibility
  - **FIXED: "activities has no column named completed"** - Added missing completed column to activities table schema
  - **REFACTORED: Centralized database schema** - sqliteLoader.ts now uses TABLE_DEFINITIONS from tables.ts instead of hardcoded SQL
  - **FIXED: "no such table: sponsor_contacts/sponsee_contacts" errors** - Updated SponsorSponsee component to use unified DatabaseService methods
  - **MAINTAINED: Legacy interface compatibility** - Existing components continue to work with unified data
  - **RESOLVED: FontAwesome icons missing** - Fixed by Xcode clean and rebuild (build cache issue)
  - App now successfully runs with unified people + contacts architecture without database errors
- June 29, 2025: **BREAKING CHANGE** - Unified People + Contacts Architecture
  - **🚨 BREAKING CHANGE: Unified People + Contacts Architecture** - Complete database restructure requires app deletion/reinstall
  - **NEW: People table** - Unified address book for all contacts (sponsors, sponsees, members, friends, family)
  - **NEW: Contacts table** - Unified interaction records linked to people (eliminates sponsor_contacts/sponsee_contacts)
  - **SIMPLIFIED: Sponsors/Sponsees tables** - Now reference people table instead of duplicating contact info
  - **SIMPLIFIED: Action items table** - Single contactId/personId references instead of multiple foreign keys
  - **ELIMINATED: All ALTER TABLE statements** - Clean schema creation without migration complexity
  - **MAJOR CLEANUP: Activities table data duplication** - Removed redundant sponsor/contact/action item fields from activities table
  - **FIXED: Critical database schema alignment** - Resolved mismatch between User interface and users table schema
  - **FIXED: Database schema initialization errors** - Removed redundant ALTER TABLE statements causing "duplicate column name" errors
  - **FIXED: Test data creation for sponsors/sponsees** - Restored comprehensive test data generator to create sponsors, sponsees, contacts, and action items
  - **FIXED: Test data generator** - Now uses DatabaseService directly instead of requiring non-existent AppDataContext functions
  - Created complete TypeScript interfaces matching all SQLite tables exactly
  - Added types for: User, Activity, Meeting, ActionItem, Sponsor, Sponsee, SponsorContact, SponseeContact
  - Updated all database functions (DatabaseService, AppDataContext) to use proper Insert/Update types
  - Created comprehensive Insert/Update utility types for all database operations  
  - Enhanced type safety with strict enum definitions for ActivityType, ContactType, etc.
  - Test data generator now creates: sponsors, sponsees, sponsor contacts, sponsee contacts, action items, meetings, and activities
  - Database initialization completes without errors, full sponsor/sponsee ecosystem functional
- June 24, 2025: Fixed action item display and data deletion issues
  - Root cause: Action items appearing twice in Activity List and not completing properly
  - Enhanced AppDataContext loadActivities() to properly enrich activities with actionItemData
  - Fixed ActivityList handleToggleActionItemComplete() to handle multiple data locations
  - Added duplicate filtering based on actionItemId to prevent duplicate action items
  - Added automatic activity reload after action item updates for proper synchronization
  - Fixed Action Item component displaying hardcoded "Action Item" instead of actual titles
  - Fixed formatting issue: removed "Sponsor Action:" prefix causing unwanted line breaks
  - Enhanced sponsor name enrichment logic with comprehensive fallback checking
  - Added title cleanup in both context enrichment and display logic
  - Moved sponsor name formatting logic into ActionItem component where it belongs
  - ActivityList now passes clean data (type, sponsorName, sponsorContacts) to ActionItem
  - ActionItem component handles title cleanup and sponsor attribution internally
  - Proper separation of concerns: ActivityList manages data, ActionItem manages display
  - Action items now display as "Practice daily meditation (from John S.)" using First Name, Last initial format
  - Fixed checkbox and delete button vertical alignment - positioned at top of action item content
  - Action items complete properly from Activity List and sync with Sponsorship page
  - Enhanced data deletion to use DROP/CREATE approach for complete data cleanup
  - Added comprehensive table discovery to ensure all tables are dropped during reset
  - Fixed sponsor contact and action item data not being deleted during "Reset All Data"
  - CRITICAL FIX: Stopped action items from being incorrectly saved to activities table
  - Action items now properly stored ONLY in action_items table, not duplicated in activities
  - Removed erroneous activity record creation for action items (proper data architecture)
  - Added comprehensive TypeScript typing to ActivityList.tsx and ActionItem.tsx components
  - Properly typed all function parameters, return types, and interface definitions
  - Enhanced type safety with strict typing for Activity, ActionItem, and SponsorData interfaces
  - Fixed onClick handler typing and improved component prop validation
  - CRITICAL BUG FIX: Fixed sponsor name formatting showing "Joe J." instead of "Joe B."
  - Root cause: Double-formatting of sponsor names (formatted once upstream, then again in component)
  - Added check to prevent re-formatting already formatted names (containing periods)
  - Sponsor names now correctly display as "First Name, Last initial" format
  - Enhanced ActionItem component to use separate firstName/lastName fields when available
  - Fixed name concatenation issue in AppDataContext causing "David G. Simmons" formatting problems
  - Added improved regex pattern to detect already-formatted names more precisely
  - CRITICAL FIX: Fixed action items not appearing in activity list after data architecture changes
  - Root cause: Filtering logic in AppDataContext was excluding sponsor_action_item activities
  - Updated filter to properly include sponsor action items while excluding sponsee action items
- June 23, 2025: Cleaned up unused imports and variables in Profile.tsx
  - Removed unused imports: ThemeSelector, PopoverColorPicker, DatePicker components
  - Removed unused variables: darkMode, allowMessages, formatPhoneNumberForInput
  - Fixed TypeScript errors and improved code maintainability
- June 23, 2025: Improved Profile screen spacing and formatting
  - Tightened spacing between sobriety counter, App Settings, and Personal Information sections
  - Reduced field spacing within Personal Information component
  - Added proper spacing between Personal Information and Danger Zone sections
- June 23, 2025: Restored phone number formatting functionality
  - Root cause: Commit cefeb64d replaced MuiTelInput with basic TextField, losing international formatting
  - Reverted Profile.tsx phone input to use MuiTelInput with country selection and proper formatting
  - Phone numbers now display properly formatted instead of raw unformatted text
- June 23, 2025: Restored meeting functionality to June 11th working state
  - Root cause: Database schema was simplified between June 11-23, breaking complex meeting functionality
  - Restored database schema to June 11th working version (commit 6e2c7333) with all complex columns
  - Restored MeetingFormCore data mapping to save complex meeting data properly
  - Added DROP/CREATE logic to fix existing database tables with incorrect schema
  - Complex meeting features (multiple days/times, addresses, home groups) now functional
- June 23, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.