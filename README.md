# InfiniteBZ - Community Event Platform

InfiniteBZ is a comprehensive event management platform tailored for local communities (currently Chennai). It aggregates events from multiple sources (like Eventbrite) and allows users to create and manage their own listing directly on the platform.

## Features

*   **Aggregated Feed**: Automatically scrapes and displays tech and networking events from external sources.
*   **User Events**: detailed "Create Event" wizard for users to host their own meetups.
*   **My Events Dashboard**: A personalized dashboard for organizers to track active events and registrations.
*   **Rich Event Details**: Premium, immersive event detail views with agenda, speakers, and location maps.
*   **Authentication**: Secure JWT-based signup and login system.
*   **Admin Analytics**: Backend stats for track platform growth.

## Tech Stack

### Frontend
*   **React (Vite)**: Fast, modern UI library.
*   **Tailwind CSS**: For a sleek, dark-themed responsive design.
*   **Lucide React**: Beautiful, consistent iconography.

### Backend
*   **FastAPI**: High-performance Python framework.
*   **SQLModel / SQLAlchemy**: Async ORM for Postgres interaction.
*   **PostgreSQL**: Robust relational database.
*   **Playwright**: For advanced web scraping capabilities.
*   **APScheduler**: For background tasks and data synchronization.

## Setup & Run

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   PostgreSQL Database

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv (Windows: .\venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
playwright install
python run.py
```
*   Server runs on `http://localhost:8000`
*   Docs available at `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*   App runs on `http://localhost:5173` (or similar port)

## Project Structure
*   `/backend`: FastAPI application, database models, and scraper logic.
*   `/frontend`: React application, components, and assets.

## License
MIT

## Latest Updates (Jan 2026) -> "Antigravity" Refactor

### Create Event Page Overhaul
*   **Split-Screen Layout**: Implemented a responsive 60/40 grid layout with a scrollable form and sticky live preview.
*   **Antigravity Design**: Floating dock, glassmorphism effects, glowing borders, and smooth slide-down animations.
*   **Pro Features**:
    *   **Ticketing**: Support for Free vs Paid events, capacity limits, and registration deadlines.
    *   **Smart Location**: Dynamic toggle between Physical Venue and Virtual Meeting Link.
    *   **Time Zone**: Persistent time zone selector for global event planning.
    *   **Rich Text**: Custom WYSIWYG editor with Lucide-icon toolbar for event descriptions.

# SettingsPage Component

A comprehensive user profile settings page component built with React for the Infinite_BZ application.

## Overview

The SettingsPage component allows authenticated users to manage their profile information, upload profile pictures, and view their account statistics. It provides a clean, modern interface with real-time validation and profile completion tracking.

## Features

### Profile Management
- **Personal Information Editing**: First name, last name, email, phone, job title, company, and bio
- **Profile Image Upload**: Support for image uploads with validation (type and size)
- **Real-time Preview**: Instant profile image preview before saving
- **Auto-population**: Automatically fills fields with Google OAuth data and existing profile data

### User Statistics
- **Profile Completion Percentage**: Calculates completion based on filled fields
- **Account Status**: Shows active/inactive status with visual indicators
- **Activity Metrics**:
  - Events attended count
  - Auto-registrations count
  - Linked accounts count

### UI/UX Features
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Consistent with the application's dark theme
- **Success Feedback**: Shows confirmation message after successful saves
- **Navigation**: Back to dashboard button for easy navigation

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `user` | Object | Yes | User object containing authentication data (email, full_name, is_active) |
| `onNavigate` | Function | Yes | Navigation callback function to handle page transitions |


```

## State Management

The component manages the following state:

- `formData`: Object containing all form field values
- `profileImagePreview`: Base64 string for image preview
- `showSuccessMessage`: Boolean to control success message display

## API Integration

### Fetch Profile Data
- **Endpoint**: `GET /api/v1/user/profile`
- **Headers**: Authorization Bearer token
- **Purpose**: Loads existing profile data on component mount

### Update Profile Data
- **Endpoint**: `PUT /api/v1/user/profile`
- **Headers**: Authorization Bearer token, Content-Type application/json
- **Body**: Profile data object
- **Purpose**: Saves updated profile information

## Validation

### Image Upload Validation
- **File Type**: Must be an image (checked via MIME type)
- **File Size**: Maximum 5MB
- **Error Handling**: User-friendly error messages for invalid uploads

### Form Validation
- Relies on browser-native validation for email and phone fields
- All fields are optional but contribute to profile completion percentage

## Dependencies

- **React**: Core framework
- **Lucide React**: Icons (ArrowLeft, Check, X)
- **Tailwind CSS**: Styling framework

## Styling

- Uses Tailwind CSS classes for responsive design
- Dark theme with slate color palette
- Gradient backgrounds for profile image placeholders
- Hover effects and transitions for interactive elements

## Accessibility

- Proper label associations for form inputs
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly icons and text

## Performance Considerations

- Lazy loading of profile data
- Efficient image preview using FileReader API
- Minimal re-renders through proper state management
- Base64 image handling for instant preview

## Error Handling

- Network request error handling with try-catch blocks
- User-friendly error messages for failed operations
- Console logging for debugging purposes

## Future Enhancements

Potential improvements for the component:

- Password change functionality
- Account deletion option
- Two-factor authentication settings
- Notification preferences
- Privacy settings
- Data export functionality

## Component Structure

```
SettingsPage/
├── Profile Card (Left Sidebar)
│   ├── Profile Image
│   ├── Image Upload
│   ├── User Info Display
│   ├── Profile Completion
│   └── Statistics Cards
└── Settings Form (Right Content)
    ├── Success Message
    └── Personal Information Form
        ├── Name Fields
        ├── Contact Fields
        ├── Professional Fields
        └── Bio Field
