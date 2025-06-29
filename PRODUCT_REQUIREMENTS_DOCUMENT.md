# Spiritual Condition Tracker - Product Requirements Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Target Users](#target-users)
4. [Core Features](#core-features)
5. [Technical Architecture](#technical-architecture)
6. [User Interface Design](#user-interface-design)
7. [Data Management](#data-management)
8. [Platform Compatibility](#platform-compatibility)
9. [Security & Privacy](#security--privacy)
10. [Performance Requirements](#performance-requirements)
11. [Success Metrics](#success-metrics)

---

## Executive Summary

The Spiritual Condition Tracker is a comprehensive mobile application designed specifically for individuals in Alcoholics Anonymous (AA) recovery programs. The app provides tools for tracking spiritual fitness, managing recovery activities, maintaining sponsor/sponsee relationships, and organizing meeting schedules. Built with React Native and Capacitor, it delivers a native mobile experience while maintaining cross-platform compatibility.

### Key Value Propositions
- **Spiritual Fitness Scoring**: Algorithmic calculation of spiritual wellness based on recovery activities
- **Comprehensive Activity Tracking**: Prayer, meditation, literature study, meetings, and sponsor contacts
- **Meeting Management**: Schedule tracking with QR code sharing capabilities
- **Unified Contact System**: Complete address book for sponsors, sponsees, friends, family, and professionals
- **Sponsor Network**: Bidirectional sponsor/sponsee relationship management with contact tracking
- **Action Item Tracking**: Goal setting and progress monitoring with sponsor assignments
- **Privacy-First Design**: Local data storage with optional sharing features

---

## Product Overview

### Vision Statement
To provide recovering individuals with a comprehensive digital tool that supports their spiritual growth journey while maintaining the principles and traditions of Alcoholics Anonymous.

### Mission
Empower users to track, analyze, and improve their spiritual condition through structured activity logging, meaningful metrics, and community connection features.

### Core Problem Solved
Many individuals in recovery lack a systematic way to track their spiritual progress, maintain accountability with sponsors, and organize their recovery activities effectively.

---

## Target Users

### Primary User Personas

**1. Active AA Members**
- Demographics: Ages 25-65, various backgrounds
- Recovery stage: 90+ days sober
- Goals: Track spiritual progress, maintain accountability
- Pain points: Difficulty measuring spiritual growth, scattered recovery resources

**2. Sponsors**
- Demographics: 1+ years of sobriety, leadership experience
- Goals: Monitor sponsee progress, organize meeting schedules
- Pain points: Managing multiple sponsee relationships, tracking shared activities

**3. Sponsees**
- Demographics: Early to intermediate recovery (30 days - 2 years)
- Goals: Structure recovery activities, maintain sponsor contact
- Pain points: Organizing recovery tasks, measuring progress

---

## Core Features

### 1. Dashboard & Spiritual Fitness Scoring

#### Spiritual Fitness Algorithm
The app calculates a spiritual fitness score using a sophisticated algorithm:

```
Base Score: 5 points (constant)
Activity Points: Sum of weighted activities over timeframe
Consistency Points: Based on active days and regularity
Total Score = Base Score + Activity Points + Consistency Points
```

**Activity Scoring System:**
- Prayer: 3 points per session
- Meditation: 4 points per session
- Literature Study: 3 points per session
- Meeting Attendance: 5 points per meeting
- Sponsor Contact: 4 points per contact
- Service Work: 3 points per activity

**Timeframe Options:**
- 7 days (weekly view)
- 30 days (monthly view)
- 90 days (quarterly view)

#### Dashboard Features
- **Real-time Score Display**: Current spiritual fitness score with visual progress indicator
- **Score Breakdown**: Detailed analysis showing contribution from each activity type
- **Trend Analysis**: Historical score tracking with visual charts
- **Quick Actions**: Fast access to log activities and view recent entries
- **Motivational Insights**: Personalized feedback based on scoring patterns

### 2. Activity Tracking System

#### Supported Activity Types

**Prayer Tracking**
- Duration logging (1-120 minutes)
- Type selection: Personal, Group, Gratitude, Request
- Optional notes and reflections
- Daily reminder notifications

**Meditation Sessions**
- Duration tracking with timer integration
- Style selection: Mindfulness, Spiritual, Guided
- Progress tracking with session history
- Integration with popular meditation techniques

**Literature Study**
- Book/chapter selection from AA literature
- Study duration and notes
- Page tracking and bookmarks
- Sharing capabilities with sponsors

**Meeting Attendance**
- Meeting selection from user's saved meetings
- Automatic duration calculation
- Speaker notes and key takeaways
- Check-in confirmation with location services

**Sponsor/Sponsee Contacts**
- Call, text, or in-person meeting tracking
- Contact duration and type
- Topic discussion notes
- Follow-up reminders and action items

#### Activity Management
- **Bulk Entry**: Add multiple activities efficiently
- **Edit History**: Modify past entries with audit trail
- **Category Filtering**: View activities by type and date range
- **Export Functionality**: Share data with sponsors or counselors

### 3. Meeting Management

#### Meeting Database
- **Personal Meeting Schedule**: Save frequently attended meetings
- **Meeting Details**: Name, location, time, frequency, format
- **Progressive Meeting Display**: Smart form that reveals fields based on input
- **Inline Editing**: Modify existing meetings without losing context

#### Meeting Schedule Features
- **Interactive Schedule Grid**: Visual weekly/monthly meeting calendar
- **Time-based Display**: Meetings organized by day and time
- **Location Integration**: Address storage and navigation links
- **Meeting Types**: Online, in-person, hybrid format support

#### QR Code Sharing
- **Contact Information Sharing**: Generate QR codes for profile sharing
- **Meeting Details**: Share meeting information via QR codes
- **Privacy Controls**: Select which information to include in shared codes
- **Batch Generation**: Create multiple QR codes for different purposes

### 4. Unified Contact Management System

#### Complete Address Book
- **Relationship Categories**: Sponsors, sponsees, AA members, friends, family, professionals
- **Contact Profiles**: Comprehensive contact information with recovery milestones
- **Interaction Tracking**: Log phone calls, meetings, texts, coffee meetings, service work
- **Relationship Filtering**: Tabbed interface to filter contacts by relationship type
- **Contact History**: Complete timeline of all interactions with each contact

#### Contact Features
- **Add/Edit Contacts**: Full contact management with relationship categorization
- **Contact Records**: Track duration, type, and notes for each interaction
- **Quick Actions**: Fast access to add contact records, edit details, or delete contacts
- **Integration**: Seamlessly works with unified people + contacts database architecture
- **Privacy Controls**: Manage visibility and sharing of contact information

### 5. Sponsor/Sponsee Network

#### Advanced Relationship Management
- **Bidirectional Contacts**: Manage both sponsor and sponsee relationships within unified contact system
- **Specialized Workflows**: Enhanced sponsor/sponsee specific features beyond general contacts
- **Communication History**: Track all sponsor-specific interactions and conversations
- **Shared Activities**: View joint activities and progress with sponsors/sponsees

#### Sponsor Dashboard
- **Sponsee Overview**: Quick view of all sponsees' progress and activities
- **Activity Monitoring**: Track sponsee spiritual fitness scores and trends
- **Action Item Management**: Create and assign tasks to sponsees with due dates
- **Contact Integration**: Access full contact history and interaction records

#### Sponsee Features
- **Sponsor Check-ins**: Regular progress reporting with detailed activity logs
- **Assigned Tasks**: View and complete sponsor-assigned action items
- **Progress Sharing**: Optional sharing of spiritual fitness data and activity logs
- **Accountability Tools**: Reminders and milestone tracking with sponsor visibility

### 6. Action Item System

#### Task Management
- **Goal Setting**: Create specific, measurable action items
- **Priority Levels**: High, medium, low priority classification
- **Due Date Tracking**: Calendar integration with notifications
- **Progress Monitoring**: Completion status and progress updates

#### Categories
- **Personal Goals**: Individual recovery objectives
- **Sponsor Assignments**: Tasks assigned by sponsors
- **Service Commitments**: AA service work and responsibilities
- **Literature Work**: Step work and reading assignments

### 7. Profile Management

#### Personal Information
- **Basic Details**: Name, contact information, sobriety date
- **Recovery Milestones**: Sobriety anniversary tracking
- **Home Groups**: Multiple group affiliation support
- **Privacy Settings**: Control information sharing levels

#### iOS-Style Contact Integration
- **Native Autocomplete**: Browser-based contact suggestions
- **Device Integration**: Automatic country detection for phone formatting
- **Smart Form Fields**: Enhanced input fields with proper autocomplete attributes
- **Contact Synchronization**: Optional integration with device contacts

#### Preferences
- **Theme Selection**: Light/dark mode with custom color schemes
- **Notification Settings**: Customizable reminder schedules
- **Time Format**: 12/24 hour display options
- **Data Sharing**: Control sponsor access to activity data

### 8. Application Navigation & User Interface

#### Bottom Navigation Structure
The app features a five-tab bottom navigation system optimized for mobile interaction:

1. **Home (Dashboard)**: 🏠 - Main dashboard with spiritual fitness scoring and activity overview
2. **Meetings**: 📍 - Meeting schedule management and QR code sharing
3. **Contacts**: 📱 - Complete address book for all relationships (sponsors, sponsees, friends, family, professionals)
4. **Sponsorship**: 👥 - Specialized sponsor/sponsee workflows and advanced relationship management  
5. **Profile**: 👤 - User profile, preferences, and app settings

#### User Experience Flow
- **Mobile-First Design**: Optimized for thumb navigation and single-handed use
- **Progressive Disclosure**: Complex features revealed gradually based on user needs
- **Context Switching**: Seamless navigation between related features (e.g., Contacts ↔ Sponsorship)
- **Quick Actions**: Floating action buttons and inline controls for frequent tasks

### 9. Data Management & Privacy

#### Local Data Storage
- **SQLite Database**: Offline-first architecture using CapacitorSQLite
- **Web Storage Fallback**: Browser-based storage for web environments
- **Data Encryption**: Local encryption of sensitive information
- **Backup & Restore**: Export/import functionality for data portability

#### Privacy Controls
- **Granular Sharing**: Select specific data to share with sponsors
- **Anonymous Mode**: Optional data tracking without personal identifiers
- **Data Retention**: User-controlled data deletion and archiving
- **Third-party Integration**: Optional connections with external services

---

## Technical Architecture

### Frontend Technology Stack
- **Framework**: React 19.1.0 with TypeScript 5.8.3
- **Mobile Platform**: Capacitor 7.2.0 for native mobile features
- **UI Library**: Material-UI (MUI) 7.1.1 for consistent design and theming
- **State Management**: React Context API with custom hooks and centralized AppDataContext
- **Navigation**: Component-based navigation with bottom tab structure
- **Build Tool**: Webpack 5 with code splitting and lazy loading optimization
- **Charts**: Chart.js 4.4.9 for data visualization and progress tracking

### Database & Storage
- **Primary Database**: CapacitorSQLite 7.0.0 for mobile platforms with unified schema architecture
- **Unified Contact System**: People + Contacts tables replace legacy sponsor/sponsee tables
- **Schema Management**: Centralized table definitions with automated database initialization
- **Data Validation**: Comprehensive TypeScript interfaces for all database operations
- **Service Layer**: DatabaseService singleton pattern for consistent data access

### Native Features Integration
- **Platform Detection**: Automatic platform-specific feature loading
- **Plugin Management**: Capacitor plugin system for native capabilities
- **Error Handling**: Comprehensive error catching and fallback systems
- **Performance Optimization**: Lazy loading and code splitting

### Build & Deployment
- **Development Environment**: Webpack dev server with hot reload
- **Production Build**: Optimized bundling with asset compression
- **Platform Builds**: iOS (Xcode) and Android (Android Studio) compilation
- **Testing Integration**: Automated testing pipeline with Jest

---

## User Interface Design

### Design Principles
- **Mobile-First**: Optimized for mobile device interaction patterns
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **Consistency**: Material Design principles with AA recovery themes
- **Intuitive Navigation**: Clear information hierarchy and user flows

### Theme System
- **Light/Dark Modes**: Automatic system preference detection
- **Custom Colors**: User-selectable accent colors and themes
- **Typography**: Readable fonts with appropriate sizing for mobile
- **Iconography**: Consistent icon library with spiritual/recovery themes

### Responsive Design
- **Adaptive Layouts**: Responsive components for various screen sizes
- **Touch Optimization**: Minimum 44px touch targets for accessibility
- **Gesture Support**: Swipe navigation and touch-friendly interactions
- **Orientation Support**: Portrait and landscape layout adaptation

### Key UI Components
- **Dashboard Cards**: Modular information display with quick actions
- **Activity Forms**: Progressive disclosure with smart defaults
- **Meeting Calendar**: Interactive grid with time-based organization
- **Contact Lists**: Expandable contact cards with action buttons
- **Progress Charts**: Visual data representation with Chart.js integration

---

## Data Management

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  lastName TEXT,
  email TEXT,
  phoneNumber TEXT,
  sobrietyDate DATE,
  homeGroups TEXT, -- JSON array
  preferences TEXT, -- JSON object
  privacySettings TEXT, -- JSON object
  createdAt DATETIME,
  updatedAt DATETIME
);
```

#### Activities Table
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY,
  userId INTEGER,
  type TEXT NOT NULL, -- prayer, meditation, literature, meeting, sponsor
  date DATE NOT NULL,
  duration INTEGER, -- minutes
  notes TEXT,
  metadata TEXT, -- JSON for type-specific data
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

#### Meetings Table
```sql
CREATE TABLE meetings (
  id INTEGER PRIMARY KEY,
  userId INTEGER,
  name TEXT NOT NULL,
  days TEXT, -- JSON array of days
  time TEXT,
  address TEXT,
  locationName TEXT,
  onlineUrl TEXT,
  notes TEXT,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

#### People Table (Unified Contact System)
```sql
CREATE TABLE people (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT,
  phoneNumber TEXT,
  email TEXT,
  sobrietyDate TEXT,
  homeGroup TEXT,
  relationship TEXT, -- sponsor, sponsee, member, friend, family, professional
  notes TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Contacts Table (Interaction Records)
```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  personId INTEGER NOT NULL,
  contactType TEXT NOT NULL, -- call, text, meeting, coffee, service
  date TEXT NOT NULL,
  duration INTEGER, -- minutes
  topic TEXT,
  note TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personId) REFERENCES people (id) ON DELETE CASCADE
);
```

#### Sponsors Table (Legacy Compatibility)
```sql
CREATE TABLE sponsors (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  personId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personId) REFERENCES people (id) ON DELETE CASCADE
);
```

#### Sponsees Table (Legacy Compatibility)
```sql
CREATE TABLE sponsees (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  personId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personId) REFERENCES people (id) ON DELETE CASCADE
);
```

#### Action Items Table
```sql
CREATE TABLE action_items (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- high, medium, low
  dueDate TEXT,
  completed INTEGER DEFAULT 0,
  contactId INTEGER, -- Reference to contacts table
  personId INTEGER, -- Reference to people table (sponsor/sponsee)
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME,
  FOREIGN KEY (contactId) REFERENCES contacts (id) ON DELETE SET NULL,
  FOREIGN KEY (personId) REFERENCES people (id) ON DELETE SET NULL
);
```

### Data Synchronization
- **Offline-First**: All features work without internet connection
- **Conflict Resolution**: Timestamp-based conflict resolution for data merging
- **Incremental Sync**: Only sync changed data to minimize bandwidth
- **Version Control**: Track data changes for audit and rollback capabilities

---

## Platform Compatibility

### iOS Support
- **Minimum Version**: iOS 13.0+
- **Native Features**: Camera, contacts, notifications, file system
- **App Store**: Optimized for App Store submission and review
- **TestFlight**: Beta testing integration for user feedback

### Android Support
- **Minimum Version**: Android API 22 (Android 5.1)
- **Native Features**: Camera, contacts, notifications, file system
- **Google Play**: Play Store optimization and compliance
- **Progressive Web App**: PWA fallback for unsupported devices

### Web Browser Support
- **Modern Browsers**: Chrome 88+, Safari 14+, Firefox 85+, Edge 88+
- **Progressive Enhancement**: Feature detection with graceful degradation
- **Responsive Design**: Mobile-first responsive layout
- **Offline Capabilities**: Service worker for offline functionality

---

## Security & Privacy

### Data Protection
- **Local Storage**: All sensitive data stored locally on device
- **Encryption**: SQLite database encryption for sensitive information
- **No Cloud Storage**: No automatic cloud backup to protect privacy
- **User Control**: Complete user control over data sharing and export

### Privacy Features
- **Anonymous Usage**: Option to use app without personal identifying information
- **Selective Sharing**: Granular control over what data is shared with sponsors
- **Data Deletion**: Complete data removal with secure deletion
- **No Tracking**: No analytics or tracking without explicit user consent

### Security Measures
- **Input Validation**: Comprehensive input sanitization and validation
- **SQL Injection Prevention**: Parameterized queries and prepared statements
- **Cross-Platform Security**: Platform-specific security implementations
- **Regular Updates**: Security patch management and vulnerability assessment

---

## Performance Requirements

### Response Time Requirements
- **App Launch**: < 3 seconds cold start, < 1 second warm start
- **Page Navigation**: < 500ms transition between screens
- **Data Entry**: < 200ms response to user input
- **Database Queries**: < 100ms for standard operations

### Resource Utilization
- **Memory Usage**: < 100MB RAM during normal operation
- **Storage Space**: < 50MB initial installation, < 200MB with full data
- **Battery Life**: Minimal impact on device battery consumption
- **Network Usage**: Offline-first design minimizes data usage

### Scalability
- **User Data**: Support for 10+ years of daily activity data
- **Meeting Database**: Store 100+ meeting locations per user
- **Contact Management**: Support for 50+ sponsor/sponsee relationships
- **Performance Optimization**: Efficient queries and data indexing

---

## Success Metrics

### User Engagement Metrics
- **Daily Active Users**: Track consistent app usage patterns
- **Activity Logging Frequency**: Measure recovery activity engagement
- **Session Duration**: Monitor meaningful app interaction time
- **Feature Adoption**: Track usage of different app features

### Recovery Support Metrics
- **Spiritual Fitness Trends**: Monitor user progress over time
- **Meeting Attendance**: Track consistency in meeting participation
- **Sponsor Interaction**: Measure sponsor/sponsee communication frequency
- **Goal Completion**: Track action item and goal achievement rates

### Technical Performance Metrics
- **App Stability**: Monitor crash rates and error frequencies
- **Load Times**: Track app performance and responsiveness
- **User Satisfaction**: Collect feedback on app usability and effectiveness
- **Platform Distribution**: Monitor usage across different platforms

### Business Success Indicators
- **User Retention**: 30, 60, 90-day retention rates
- **App Store Ratings**: Maintain high user satisfaction ratings
- **Community Growth**: Track sponsor network expansion
- **Feature Requests**: Monitor user feedback for future development

---

## Implementation Roadmap

### Phase 1: Core Foundation (✅ COMPLETED - June 2025)
- ✅ **Unified Database Architecture**: People + Contacts tables with complete relationship management
- ✅ **Activity Tracking System**: Prayer, meditation, literature, meetings, sponsor contacts
- ✅ **Spiritual Fitness Algorithm**: Dynamic scoring with 7/30/90-day timeframes
- ✅ **Meeting Management**: Schedule tracking with QR code generation and sharing
- ✅ **Profile Management**: Sobriety tracking, preferences, theme customization
- ✅ **Navigation System**: Five-tab mobile-optimized bottom navigation structure

### Phase 2: Contact & Relationship Management (✅ COMPLETED - June 2025)
- ✅ **Complete Address Book**: Unified contact system for all relationships (sponsors, sponsees, friends, family, professionals)
- ✅ **Relationship Categorization**: Tabbed filtering by relationship type with visual categorization
- ✅ **Interaction Tracking**: Log calls, meetings, texts, coffee meetings, service work
- ✅ **Sponsor/Sponsee Workflows**: Specialized relationship management with action item assignment
- ✅ **Contact History**: Complete timeline of all interactions with detailed records
- ✅ **Action Item System**: Task assignment, tracking, and completion with sponsor integration

### Phase 3: Current Implementation Status (🔄 ACTIVE - June 2025)
**Core App Features:**
- ✅ **Dashboard**: Real-time spiritual fitness scoring with activity breakdown
- ✅ **Meetings**: Personal meeting schedule with progressive form interface
- ✅ **Contacts**: Complete address book with relationship management
- ✅ **Sponsorship**: Advanced sponsor/sponsee workflows and action items
- ✅ **Profile**: User management, preferences, data control, theme selection

**Technical Architecture:**
- ✅ **Database**: Unified SQLite schema with proper foreign key relationships
- ✅ **UI Framework**: Material-UI 7.1.1 with dark/light theme support
- ✅ **Mobile Platform**: Capacitor 7.2.0 for iOS deployment
- ✅ **TypeScript**: Complete type safety with comprehensive database interfaces
- ✅ **Performance**: Lazy loading, code splitting, optimized bundle management

### Phase 4: Enhanced Features (📋 PLANNED)
- 📱 **Advanced Analytics**: Long-term trend analysis and predictive insights
- 📱 **Enhanced QR Sharing**: Contact exchange and meeting sharing improvements
- 📱 **Notification System**: Smart reminders and milestone celebrations
- 📱 **Data Export**: Comprehensive reporting and data portability
- 📱 **Accessibility**: Enhanced screen reader support and voice navigation

### Phase 5: Community Integration (🌐 FUTURE)
- 🌐 **Cloud Synchronization**: Optional multi-device data sync
- 🌐 **Meeting Directory**: Integration with AA meeting databases
- 🌐 **Anonymous Analytics**: Peer comparison and community insights
- 🌐 **Sponsor Matching**: Newcomer support and sponsor connection system

---

## Conclusion

The Spiritual Condition Tracker represents a comprehensive and mature solution for individuals in AA recovery programs, providing essential tools for tracking spiritual progress, managing recovery activities, and maintaining accountability relationships. The application's mobile-first design, privacy-focused architecture, and evidence-based scoring system create a unique platform that supports the principles of Alcoholics Anonymous while leveraging modern technology to enhance the recovery experience.

The current implementation demonstrates sophisticated software engineering practices, including unified database architecture, complete contact management systems, cross-platform compatibility, and user-centered design principles. With its five-tab navigation structure and comprehensive relationship management capabilities, the application successfully bridges the gap between traditional recovery methods and modern digital tools, providing a mature and valuable resource for the recovery community.

**Key Achievements in Current Implementation:**
- **Complete Contact Management**: Unified address book supporting all relationship types with interaction tracking
- **Advanced Database Architecture**: People + Contacts tables with proper foreign key relationships and data integrity
- **Mature UI/UX**: Five-tab navigation with Material-UI 7.1.1 theming and responsive design
- **Comprehensive Feature Set**: All core recovery tracking features implemented and fully functional
- **TypeScript Architecture**: Complete type safety with comprehensive database interfaces and service layers

---

*This document represents the current state of the Spiritual Condition Tracker application as of June 2025. Features and specifications may evolve based on user feedback and development priorities.*