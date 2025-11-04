# Smart Course UI - User Flow Implementation

This document explains the complete user flow implementation for the Smart Course application.

## User Flow Overview

```
User Opens App
│
├─ Not Authenticated?
│  └─ → /login or /signup
│
└─ Authenticated?
   │
   ├─ Profile Missing/Incomplete?
   │  └─ → /profile/setup (with skip option)
   │
   └─ Profile Complete?
      │
      ├─ First Login (no courses)?
      │  └─ → /onboarding → /dashboard (empty state)
      │
      └─ Has Courses?
         └─ → /dashboard (with courses)
            │
            ├─ GENERATING courses?
            │  └─ Show progress cards
            │
            ├─ READY courses?
            │  └─ Show continue learning
            │
            └─ FAILED courses?
               └─ Show retry option
```

## Implementation Details

### 1. **Authentication Layer**
- **Routes**: `/login`, `/register`
- **Components**: 
  - `LoginForm` - Handles user login
  - `AuthForm` - Handles user registration
- **Storage**: JWT token and user data stored in localStorage
- **Redirect**: After successful login, users are redirected to `/dashboard`

### 2. **Protected Routes**
- **Component**: `ProtectedRoute`
- **Function**: Checks for authentication token before allowing access to protected routes
- **Behavior**: Redirects to `/login` if not authenticated

### 3. **App Initialization**
- **Component**: `AppInitializer`
- **Purpose**: Determines the correct route based on user state
- **Logic**:
  1. Fetches user profile and course data
  2. Checks if profile is complete
  3. Checks if user has any courses
  4. Redirects accordingly:
     - Incomplete profile → `/profile/setup`
     - Complete profile + no courses → `/onboarding`
     - Complete profile + has courses → `/dashboard`

### 4. **Profile Setup**
- **Route**: `/profile/setup`
- **Component**: `ProfileSetup`
- **Features**:
  - Form with essential profile fields (name, grade level, language)
  - Skip option to proceed without completing profile
  - Save & Continue button navigates to onboarding
- **Sections**:
  - Identity (name, email, grade)
  - Preferences (timezone, learning style)
  - AI Profile (pace, tone)

### 5. **Onboarding**
- **Route**: `/onboarding`
- **Component**: `Onboarding`
- **Features**:
  - Multi-step welcome tour (4 steps)
  - Skip option to jump directly to dashboard
  - Introduction to app features
- **Steps**:
  1. Welcome message
  2. Personalized learning explanation
  3. AI-generated content overview
  4. Progress tracking info

### 6. **Dashboard**
- **Route**: `/dashboard`
- **Component**: `Dashboard`
- **Features**:
  - Shows all user courses categorized by status
  - Create new course button
  - Logout button
- **States**:
  - **Empty State**: No courses exist
    - Call-to-action to create first course
    - Link to update profile
  - **Courses View**: Courses exist
    - Separated sections for different statuses:
      - **Generating**: Shows progress animation
      - **Ready**: Shows "Continue Learning" button
      - **Failed**: Shows error and retry option

### 7. **Course Creation**
- **Route**: `/course/create`
- **Component**: `CourseCreationForm`
- **Form Fields**:
  - Topic (required)
  - Grade Level (required)
  - Number of Lessons (1-20)
  - Source Filter (all/academic/practical)
- **API Integration**: Calls `POST /courses` endpoint
- **Behavior**: Redirects to dashboard after successful submission

### 8. **Course View**
- **Route**: `/course/:courseId`
- **Component**: `CourseView`
- **Features**:
  - Displays course details
  - Lists all lessons with:
    - Lesson number and title
    - Description
    - Key concepts (badges)
    - Learning objectives (list)
    - Start lesson button
  - Shows error message for failed courses
- **API Integration**: Calls `GET /courses/:courseId`

## API Clients

### CourseClient
Located at: `src/lib/api-client/course-client.ts`

**Methods**:
- `getCoursesForUser(userId)` - Get all courses for a user
- `getCourseById(courseId)` - Get detailed course content
- `createCourse(request)` - Create a new course
- `getLessonsForCourse(courseId)` - Get all lessons for a course
- `getLessonById(lessonId)` - Get a specific lesson

### UserClient
Located at: `src/features/user-profile/api-client/user-client.ts`

**Methods**:
- `getUserProfile()` - Get current user's profile
- `updateUserProfile(request)` - Update user profile

## Custom Hooks

### useAuthGuard
- Checks authentication status
- Provides user data
- Handles logout

### useCourses
- Fetches all courses for a user
- Filters courses by status
- Provides refetch functionality
- Returns:
  - `courses` - All courses
  - `generatingCourses` - Courses being generated
  - `readyCourses` - Ready to view courses
  - `failedCourses` - Failed courses
  - `hasCourses` - Boolean flag

### useUserProfile
- Fetches user profile
- Determines if profile is complete
- Checks essential fields: fullName, gradeLevel, preferredLanguage

## Route Structure

```
/
├── /login (public)
├── /register (public)
└── (protected routes)
    ├── /profile/setup
    ├── /onboarding
    ├── /dashboard
    ├── /user (full profile edit)
    ├── /course/create
    └── /course/:courseId
```

## State Management

- **Authentication**: localStorage (token + user object)
- **Profile Data**: React Query (TanStack Query)
- **Course Data**: React hooks with local state
- **Form State**: React Hook Form

## Key Features

### 1. **Smart Routing**
- AppInitializer handles automatic navigation based on user state
- No manual intervention needed after login

### 2. **Course Status Handling**
- **GENERATING**: Progress indicator, non-clickable
- **READY**: Clickable card, navigation to course view
- **FAILED**: Error display with retry option

### 3. **Empty States**
- Thoughtful messaging for first-time users
- Clear call-to-action buttons
- Multiple entry points (create course, update profile)

### 4. **Profile Flexibility**
- Users can skip profile setup
- Essential fields checked for completeness
- Can update profile anytime from dashboard

### 5. **Responsive Design**
- Grid layout for course cards (1/2/3 columns)
- Mobile-friendly forms
- Consistent spacing and styling

## Next Steps / Future Enhancements

1. **Lesson View Component**: Display individual lesson content
2. **Progress Tracking**: Track lesson completion status
3. **Course Retry Logic**: Implement retry mechanism for failed courses
4. **Real-time Updates**: WebSocket for course generation status
5. **Search & Filter**: Filter courses by topic, status, or date
6. **Course Deletion**: Allow users to delete courses
7. **Settings Page**: Additional user preferences
8. **Notifications**: Notify when course generation completes

## File Structure

```
src/
├── components/
│   ├── authentication/
│   │   ├── auth-form.tsx
│   │   └── login-form.tsx
│   ├── ui/ (shadcn components)
│   ├── AppInitializer.tsx
│   └── ProtectedRoute.tsx
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   └── EmptyState.tsx
│   │   └── hooks/
│   │       ├── useCourses.ts
│   │       └── useUserProfile.ts
│   ├── onboarding/
│   │   └── components/
│   │       └── Onboarding.tsx
│   ├── profile-setup/
│   │   └── components/
│   │       └── ProfileSetup.tsx
│   ├── course-creation/
│   │   └── components/
│   │       └── CourseCreationForm.tsx
│   ├── course-view/
│   │   └── components/
│   │       └── CourseView.tsx
│   └── user-profile/
│       ├── api-client/
│       ├── components/
│       └── hooks/
├── hooks/
│   └── auth-hooks/
│       ├── useAuth.ts
│       ├── useLogin.ts
│       └── useAuthGuard.ts
├── lib/
│   └── api-client/
│       ├── general-api-client.ts
│       └── course-client.ts
└── routes/
    └── router.tsx
```

## Testing the Flow

1. **First Time User**:
   - Register → Login → Profile Setup (or skip) → Onboarding → Dashboard (empty)
   
2. **Returning User with Incomplete Profile**:
   - Login → Profile Setup → Onboarding → Dashboard
   
3. **Returning User with Courses**:
   - Login → Dashboard (shows courses)
   
4. **Create Course Flow**:
   - Dashboard → Create Course → Fill Form → Submit → Dashboard (see generating course)

## Environment Variables

Make sure to set:
```
VITE_API_BASE=<your-backend-api-url>
```

## Dependencies

Key dependencies used:
- react-router-dom (routing)
- react-hook-form (forms)
- @tanstack/react-query (data fetching)
- axios (HTTP client)
- shadcn/ui components (UI)
- tailwindcss (styling)
