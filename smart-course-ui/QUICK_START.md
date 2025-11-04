# Quick Start Guide - Smart Course UI Flow

## 🎯 What Was Implemented

A complete user flow system for the Smart Course application that automatically routes users based on their authentication status, profile completion, and course availability.

## 🚀 Key Features

### 1. **Smart Auto-Navigation**
- Users are automatically routed to the appropriate screen based on their state
- No manual navigation needed after login

### 2. **Complete User Journey**
```
Login → Profile Check → Onboarding → Dashboard → Course Management
```

### 3. **Course Status Management**
- **GENERATING**: Shows progress animation
- **READY**: Click to view and start learning
- **FAILED**: Shows error with retry option

## 📁 New Files Created

### Components
1. `src/components/ProtectedRoute.tsx` - Authentication guard
2. `src/components/AppInitializer.tsx` - Smart routing logic
3. `src/features/dashboard/components/Dashboard.tsx` - Main dashboard
4. `src/features/dashboard/components/CourseCard.tsx` - Course display card
5. `src/features/dashboard/components/EmptyState.tsx` - No courses state
6. `src/features/onboarding/components/Onboarding.tsx` - Welcome tour
7. `src/features/profile-setup/components/ProfileSetup.tsx` - Profile completion
8. `src/features/course-creation/components/CourseCreationForm.tsx` - Create course
9. `src/features/course-view/components/CourseView.tsx` - View course details

### Hooks
1. `src/hooks/auth-hooks/useAuthGuard.ts` - Authentication management
2. `src/features/dashboard/hooks/useCourses.ts` - Course data fetching
3. `src/features/dashboard/hooks/useUserProfile.ts` - Profile checking

### API Clients
1. `src/lib/api-client/course-client.ts` - Course API integration

### Updated Files
1. `src/routes/router.tsx` - Complete route structure
2. `src/components/authentication/login-form.tsx` - Enhanced login flow

## 🔄 User Flow Paths

### Path 1: New User
```
1. User opens app → Redirected to /login
2. User logs in → Token saved
3. No profile? → /profile/setup
4. Complete/skip profile → /onboarding
5. View welcome tour → /dashboard (empty state)
6. Click "Create Course" → /course/create
7. Fill form & submit → /dashboard (course generating)
```

### Path 2: Returning User (Incomplete Profile)
```
1. User logs in
2. AppInitializer checks profile
3. Profile incomplete → /profile/setup
4. After completing → /onboarding or /dashboard
```

### Path 3: Returning User (With Courses)
```
1. User logs in
2. AppInitializer checks profile & courses
3. Profile complete + has courses → /dashboard
4. View courses by status (Generating/Ready/Failed)
5. Click ready course → /course/:courseId
6. View lessons and start learning
```

## 🎨 UI States

### Dashboard States
1. **Loading**: Skeleton loaders while fetching data
2. **Empty**: No courses - shows create course CTA
3. **With Courses**: Organized by status in separate sections

### Course Card States
1. **Generating**: Progress bar animation, non-interactive
2. **Ready**: Clickable, "Continue Learning" button
3. **Failed**: Error message, retry button

## 🔧 Configuration

### Backend Integration
The app expects these API endpoints:

**Auth Service:**
- POST `/auth/login` - User login
- POST `/auth/register` - User registration

**User Service:**
- GET `/user-service/profile` - Get user profile
- PATCH `/user-service/profile` - Update profile

**Learning Service (from your Java reference):**
- GET `/courses/user/:userId` - Get user's courses
- GET `/courses/:courseId` - Get course details
- POST `/courses` - Create new course
- GET `/courses/:courseId/lessons` - Get course lessons
- GET `/courses/lessons/:lessonId` - Get lesson details

### Environment Setup
```env
VITE_API_BASE=http://localhost:8080/api
```

## 🧪 Testing the Implementation

### Test 1: First-Time User Flow
```bash
1. Navigate to http://localhost:5173
2. Should redirect to /login
3. Login with test credentials
4. Should see profile setup screen
5. Fill or skip profile
6. See onboarding tour
7. Land on empty dashboard
```

### Test 2: Create Course Flow
```bash
1. On dashboard, click "Create New Course"
2. Fill in:
   - Topic: "Introduction to React"
   - Grade Level: "Undergraduate"
   - Lessons: 8
   - Source: "All Sources"
3. Submit
4. Should redirect to dashboard
5. New course should appear in "Generating" section
```

### Test 3: View Course
```bash
1. Wait for course status to change to "READY"
2. Click on the course card
3. Should navigate to /course/:id
4. See course details and lesson list
5. Each lesson shows key concepts and objectives
```

## 🎓 Key Technical Decisions

### 1. Route Protection
- `ProtectedRoute` wrapper checks authentication
- Redirects to login if token missing

### 2. Smart Initialization
- `AppInitializer` checks user state once
- Determines correct route automatically
- Shows loading state during checks

### 3. State Management
- Authentication: localStorage
- User data: React Query (already implemented)
- Course data: Custom hooks with React state
- Forms: React Hook Form (already implemented)

### 4. API Client Pattern
- Centralized axios instance with interceptors
- Automatic token injection
- Type-safe interfaces

## 📝 Important Notes

1. **Login Response**: The login API should return both `accessToken` and `user` object
   ```typescript
   {
     accessToken: "jwt-token",
     user: {
       id: "uuid",
       email: "user@example.com",
       full_name: "John Doe"
     }
   }
   ```

2. **Profile Completion Check**: Checks for these fields:
   - fullName
   - gradeLevel  
   - preferredLanguage

3. **Course Status**: Backend should return one of:
   - "GENERATING"
   - "READY"
   - "FAILED"

4. **UUID Generation**: Using custom UUID generator (no external dependency)

## 🐛 Troubleshooting

### Issue: Stuck on loading screen
- Check if API endpoints are accessible
- Verify token is in localStorage
- Check browser console for errors

### Issue: Redirects to login after successful login
- Ensure login response includes `user` object
- Check if user data is saved to localStorage

### Issue: AppInitializer keeps redirecting
- Check profile API response structure
- Verify profile fields match expected format
- Check console for API errors

## 🚀 Next Steps

To run the application:

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Access at
http://localhost:5173
```

## 📞 Integration Checklist

- [ ] Backend APIs are running
- [ ] CORS is configured for frontend origin
- [ ] Login endpoint returns user object
- [ ] Profile endpoints work correctly
- [ ] Course endpoints match expected format
- [ ] Environment variables are set
- [ ] Token authentication is working

## 🎉 Summary

Your React app now has:
✅ Complete authentication flow
✅ Smart auto-navigation based on user state
✅ Profile setup with skip option
✅ Onboarding tour
✅ Dashboard with course status management
✅ Course creation form
✅ Course detail view
✅ Integration with your Java Learning Service
✅ Type-safe API clients
✅ Proper error handling
✅ Loading states throughout

The flow matches exactly what you requested with automatic routing, profile checking, and course status management!
