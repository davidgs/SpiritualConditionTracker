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
- **Web**: Fallback support for development and testing

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
- **Local Development**: Webpack dev server with hot reload
- **Database**: SQLite with in-memory fallback for web development
- **Testing**: Component-based testing with React Testing Library

### Mobile Deployment
- **iOS Build**: Capacitor sync → Xcode → App Store or TestFlight
- **Android Build**: Capacitor sync → Android Studio → Google Play Store
- **Web Fallback**: Static file serving for demo/testing purposes

### Build Process
1. `npm run build` - Production webpack build with optimizations
2. `npx cap sync ios` - Sync web assets to iOS project
3. `npx cap open ios` - Open in Xcode for native build
4. Native compilation and code signing for distribution

## Changelog
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.