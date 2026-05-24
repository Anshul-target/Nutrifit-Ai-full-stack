# Onboarding System - Setup & Testing Guide

## 📋 Overview

The onboarding system is a multi-step modal that collects user profile information and generates personalized nutrition plans using Google Gemini AI (gemini-2.0-flash model). After onboarding, users see a fully personalized dashboard with AI-generated meals and nutrition recommendations.

## 🔧 Implementation Summary

### Backend Components

**User Model Updates** (`server/models/User.js`)

- Added `onboardingDone` (Boolean, default false)
- Added `profile` object with: age, weight, height, gender, goal, activityLevel, dietaryPreference
- Added `dashboardData` object with: dailySummary, macroBreakdown, activePlan, meals, nutritionTips, progressPercentages

**Nutrition Planner Service** (`server/services/nutritionPlanner.js`)

- `generatePersonalizedNutrition(userProfile)` function
- Builds detailed prompt from user profile
- Calls Gemini 2.0 Flash AI model
- Parses JSON response safely (removes markdown wrappers)
- Returns structured nutrition plan

**Onboarding Routes** (`server/routes/onboarding.js`)

- `POST /api/onboarding/complete` - Accepts profile data, calls Gemini, saves to DB
- `GET /api/onboarding/dashboard` - Returns onboardingDone status and dashboardData

**Server Setup** (`server/server.js`)

- Imported and mounted onboarding routes
- Available at `/api/onboarding/...`

### Frontend Components

**OnboardingModal** (`src/components/OnboardingModal.jsx`)

- 3-step form with progress bar:
  - Step 1: Age, Weight (kg), Height (cm), Gender
  - Step 2: Goal, Activity Level
  - Step 3: Dietary Preference
- Client-side validation
- Calls backend on submit
- Uses `updateUser()` from context to persist data

**Updated AuthContext** (`src/context/AuthContext.jsx`)

- Added `updateUser(updates)` function
- Updates both state and localStorage
- Called when onboarding completes

**Updated DashboardPage** (`src/pages/DashboardPage.jsx`)

- Fetches dashboard data on mount via `GET /api/onboarding/dashboard`
- Shows `OnboardingModal` if `onboardingDone === false`
- Renders personalized dashboard with AI data if `onboardingDone === true`
- All hardcoded data replaced with dynamic values from Gemini

## 🚀 Running the Full Stack

### 1. Start Backend Node Server

```bash
cd d:\aNutrifit\ Ai1\server
npm run dev
```

Should see: "🚀 Server is running on http://localhost:5000"

### 2. Start Frontend React Dev Server

```bash
cd d:\aNutrifit\ Ai1
npm run dev
```

Should see: "VITE v5.x.x ready in xxx ms" at http://localhost:5173 or 5175

## 🧪 Testing the Onboarding Flow

### Test 1: New User Signup → Onboarding Modal

**Steps:**

1. Open http://localhost:5173
2. Click "Sign Up"
3. Create account with:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
4. Should be redirected to `/dashboard`
5. **OnboardingModal should appear** (3-step form)

**Expected:**

- Modal visible with "Welcome to NutriFit AI 🎯"
- Progress bar at Step 1 of 3
- Fields: Age, Weight, Height, Gender dropdown

### Test 2: Complete Step 1 (Physical Stats)

**Steps:**

1. Fill in:
   - Age: 28
   - Weight: 75.5
   - Height: 180
   - Gender: Male
2. Click "Next"

**Expected:**

- Form validates (no errors)
- Progress bar moves to Step 2 of 3
- New step shows Goal and Activity Level

### Test 3: Complete Step 2 (Goals & Activity)

**Steps:**

1. Select:
   - Goal: Muscle Gain
   - Activity Level: Very Active
2. Click "Next"

**Expected:**

- Progress bar moves to Step 3 of 3
- New step shows Dietary Preference
- "Ready to Create Your Plan!" message appears

### Test 4: Complete Step 3 (Dietary Preference)

**Steps:**

1. Select:
   - Dietary Preference: Non-Vegetarian
2. Click "Complete Onboarding"

**Expected:**

- Button changes to "Creating Plan..."
- API calls backend:
  - POST http://localhost:5000/api/onboarding/complete
  - Sends: { age, weight, height, gender, goal, activityLevel, dietaryPreference }
- Backend:
  - Calls Gemini AI (gemini-2.0-flash)
  - Generates nutrition plan
  - Saves to MongoDB User document
  - Sets onboardingDone: true
  - Returns dashboardData
- Frontend:
  - Modal closes
  - Dashboard page loads
  - Shows personalized content

### Test 5: Personalized Dashboard

**Expected to see:**

1. **Header Section:**
   - Greeting: "Welcome back, John Doe"
   - Active plan: Name from AI (e.g., "Lean Muscle Builder")
   - Subtitle: Tailored for "muscle gain" and "non-vegetarian"

2. **Daily Summary Cards:**
   - Daily calories: Value from Gemini (e.g., 2500)
   - Protein: Value with percentage from Gemini (e.g., 200g, 30%)
   - Hydration: Value from Gemini (e.g., 3.5L)

3. **Macro Breakdown:**
   - Protein: Grams + percentage from Gemini
   - Carbs: Grams + percentage from Gemini
   - Fats: Grams + percentage from Gemini
   - Progress bars showing percentages

4. **Personalized Tips:**
   - 3 tips specific to user's goal
   - Dynamic icons (💡, 🎯, ⚡)
   - From AI response

5. **Meals for Today:**
   - 3 meals from AI (breakfast, lunch, dinner)
   - Each with: Name, Calories, Description, Ingredients
   - Example: "Protein Oatmeal Bowl" (450 cal)

6. **Progress Tracking:**
   - Progress bars for:
     - Calorie tracking
     - Protein intake
     - Hydration
   - All starting at 0%

### Test 6: Returning User (Already Onboarded)

**Steps:**

1. Log out from dashboard
2. Log in again with same credentials
3. Navigate to dashboard

**Expected:**

- `GET /api/onboarding/dashboard` called
- Returns `onboardingDone: true`
- OnboardingModal does NOT appear
- Dashboard loads directly with existing data

### Test 7: Backend API Testing (cURL)

**Get Dashboard Data:**

```bash
curl -X GET http://localhost:5000/api/onboarding/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response:
{
  "success": true,
  "onboardingDone": true,
  "profile": {
    "age": 28,
    "weight": 75.5,
    "height": 180,
    "gender": "Male",
    "goal": "Muscle Gain",
    "activityLevel": "Very Active",
    "dietaryPreference": "Non-Vegetarian"
  },
  "dashboardData": {
    "dailySummary": {
      "calories": 2500,
      "protein": 200,
      "hydration": 3.5
    },
    "macroBreakdown": {
      "protein": { "grams": 200, "percentage": 30 },
      "carbs": { "grams": 350, "percentage": 50 },
      "fats": { "grams": 85, "percentage": 20 }
    },
    "activePlan": "Lean Muscle Builder",
    "meals": [
      { "name": "...", "calories": ..., "description": "...", "ingredients": [...] },
      ...
    ],
    "nutritionTips": ["...", "...", "..."],
    "progressPercentages": {
      "protein": 0,
      "calories": 0,
      "hydration": 0
    }
  }
}
```

**Complete Onboarding (Manual):**

```bash
curl -X POST http://localhost:5000/api/onboarding/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "weight": 80,
    "height": 175,
    "gender": "Female",
    "goal": "Weight Loss",
    "activityLevel": "Moderately Active",
    "dietaryPreference": "Vegetarian"
  }'

# Expected response:
{
  "success": true,
  "message": "Onboarding completed successfully",
  "dashboardData": { ... },
  "profile": { ... }
}
```

### Test 8: Error Handling

**Missing Required Fields:**

1. In onboarding modal, try to click "Next" without filling fields
2. Should show error: "Please fill in all fields"

**Invalid Age:**

1. Enter Age: 150
2. Click "Next"
3. Should show error: "Please enter a valid age"

**Gemini API Error:**

1. Remove or invalidate `GOOGLE_API_KEY` from `.env`
2. Try to complete onboarding
3. Should show error: "Failed to generate personalized nutrition plan"
4. Modal stays visible

**Invalid Token:**

1. Manually remove token from localStorage
2. Refresh dashboard
3. Should redirect to login

### Test 9: Data Persistence

**Steps:**

1. Complete onboarding with profile data
2. Refresh page (F5)
3. Expected: Dashboard loads immediately with same data
4. Log out
5. Log back in
6. Expected: Dashboard shows same personalized data from MongoDB

## 📊 Data Flow Diagram

```
User Signup
    ↓
Navigate to Dashboard
    ↓
Fetch GET /api/onboarding/dashboard
    ↓
onboardingDone == false?
    ├─ YES → Show OnboardingModal
    │         User fills 3 steps
    │         Submit POST /api/onboarding/complete
    │         ↓
    │         Backend builds prompt
    │         Calls Gemini 2.0 Flash
    │         Parses JSON response
    │         Saves to MongoDB (User.dashboardData, User.onboardingDone=true)
    │         Returns dashboardData
    │         ↓
    │         Frontend calls updateUser()
    │         Modal closes
    │         Dashboard re-renders with data
    │
    └─ NO → Show personalized dashboard
            Render with User.dashboardData
```

## 🔐 Environment Configuration

Make sure `.env` in server folder has:

```env
GOOGLE_API_KEY=your_actual_google_api_key
GEMINI_MODEL=gemini-2.0-flash
```

To get GOOGLE_API_KEY:

1. Go to https://aistudio.google.com/app/apikey
2. Create new API key
3. Paste into `.env`

## 🐛 Troubleshooting

### Modal doesn't appear after signup

- Check browser console for errors
- Verify `onboardingDone` is false in MongoDB User document
- Check if `GET /api/onboarding/dashboard` returns correct status

### "Failed to generate personalized nutrition plan"

- Check GOOGLE_API_KEY is valid
- Check gemini-2.0-flash model is available in your region
- Check API key has Generative AI API enabled
- Check backend logs for Gemini error message

### Dashboard shows blank/no data

- Check network tab for 404/500 errors on API calls
- Verify token is in localStorage
- Check MongoDB connection is working
- Verify dashboardData was saved in User document

### Form validation errors

- Check all fields meet requirements:
  - Age: 13-120
  - Weight: 20-300 kg
  - Height: 100-250 cm
  - All dropdowns have values

### Meals not displaying

- Check dashboardData.meals array in MongoDB
- Verify Gemini returned proper JSON with meals array
- Check MealCard component props match data structure

## ✅ Verification Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend dev server running (port 5173/5175)
- [ ] MongoDB connected locally or via URI
- [ ] GOOGLE_API_KEY configured in .env
- [ ] Can create new account (signup page works)
- [ ] Dashboard route shows onboarding modal for new users
- [ ] Can fill 3-step onboarding form
- [ ] Submit button calls backend API
- [ ] Gemini generates nutrition plan (check server logs)
- [ ] Data saves to MongoDB (check collections)
- [ ] Dashboard renders with personalized data
- [ ] Returning users skip onboarding modal
- [ ] All meal data displays correctly
- [ ] Tips display from AI response
- [ ] Progress bars render

## 📝 Key Files Modified

- `server/models/User.js` - Added onboarding fields
- `server/services/nutritionPlanner.js` - NEW Gemini integration
- `server/routes/onboarding.js` - NEW backend routes
- `server/server.js` - Added onboarding routes
- `src/context/AuthContext.jsx` - Added updateUser function
- `src/components/OnboardingModal.jsx` - NEW modal component
- `src/pages/DashboardPage.jsx` - Complete rewrite for AI data

## 🎯 Next Steps (Optional)

1. **Meal Regeneration** - Allow users to regenerate meals while keeping profile
2. **Profile Updates** - Add page to edit profile after onboarding
3. **Progress Tracking** - Update progress percentages as user logs meals
4. **Analytics** - Track which plans/meals are most popular
5. **Multiple Plans** - Generate alternative meal plans to choose from
