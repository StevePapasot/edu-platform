# EduPlatform Setup Guide

## First-Time Setup

After logging in for the first time, you need to initialize the course data in Firestore:

1. **Log in** to the application using the authentication modal
2. You will be automatically redirected to the **Dashboard**
3. Click on the **"Συνέχεια Μαθήματος"** button on the course card
4. If you see **"Δεν υπάρχουν διαθέσιμα μαθήματα"**, click the **"Αρχικοποίηση Δεδομένων"** button
5. Alternatively, navigate directly to `/init-data` and click **"Initialize Data"**
6. Wait for the initialization to complete
7. Return to the **Dashboard** or navigate to `/study` to start learning

## Application Flow

### For New Users
1. Visit the home page (`/`)
2. Click **"Login"** or **"ΞΕΚΙΝΗΣΕ ΤΗ ΜΑΘΗΣΗ"**
3. Sign up or log in with email/password
4. Get redirected to `/dashboard`
5. Initialize course data (one-time setup)
6. Start studying!

### For Returning Users
1. Visit the home page (`/`) - automatically redirected to `/dashboard`
2. Click **"Συνέχεια Μαθήματος"** to go to `/study`
3. Continue from where you left off

## Pages

### `/` - Home Page
- Landing page for non-authenticated users
- Redirects logged-in users to `/dashboard`

### `/dashboard` - Dashboard
- Shows "My Courses" section
- Displays available courses with progress tracking
- Primary destination after login

### `/study` - Study Page
- Left sidebar: Chapter and lesson navigation
- Main content: Theory content and quiz exercises
- Mark lessons as complete
- Track your progress

### `/init-data` - Data Initialization
- One-time setup page
- Initializes course structure, chapters, lessons, and quizzes in Firestore
- Only needs to be visited once per Firebase project

## Features

- **Firebase Authentication**: Secure email/password authentication
- **Firestore Database**: All course data and user progress stored in Firestore
- **Progress Tracking**: Mark lessons as complete and track your learning journey
- **Interactive Quizzes**: Test your knowledge with instant feedback
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Greek Language**: Fully localized in Greek

## Course Structure

The platform includes one course: **Ηλεκτροτεχνία Γ' ΕΠΑΛ** (Electrical Engineering for 3rd Year EPAL)

### Chapters:
1. **Εναλλασσόμενο Ρεύμα** (Alternating Current)
   - 1.1 Ορισμοί και Βασικές Έννοιες
   - 1.2 Επαγωγική Αντίσταση
   - 1.3 Χωρητική Αντίσταση

2. **Κυκλώματα R-L-C** (R-L-C Circuits)
   - 2.1 Σειριακά Κυκλώματα RLC
   - 2.2 Παράλληλα Κυκλώματα RLC

3. **Τριφασικά Συστήματα** (Three-Phase Systems)
   - 3.1 Εισαγωγή στα Τριφασικά
   - 3.2 Σύνδεση Αστέρα και Τριγώνου

## Technical Details

- **Framework**: Next.js 13 (App Router)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
