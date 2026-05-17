# edu-platform

# 🎓 EduPlatform — Greek Education SaaS

A multi-tenant B2B tutoring platform built for private tutors and small educational centers (φροντιστήρια) in Greece. Teachers manage courses, chapters, lessons (video/text/PDF/quiz), live Zoom rooms, and track student analytics — all scoped to their organization.

🔗 **Live Demo:** [https://greek-eduplatform-re-fc99.bolt.host/](https://greek-eduplatform-re-fc99.bolt.host/)

---

## ✨ Features

### For Students
- Sign up with an organization invite code
- Choose school type, grade, orientation, and sector (full Greek education system support)
- Browse courses filtered by grade
- Watch video lessons, read theory (rich text), view PDFs in-browser, and take multiple-choice quizzes
- Track progress per course with completion percentages
- Retry quizzes with full answer review and explanations
- Join live Zoom rooms scheduled by the teacher
- Update profile settings with instant dashboard refresh
- Password reset via email

### For Teachers (Admin)
- **Builder Pro** admin panel with 4-step workflow: Courses → Chapters → Lessons → Live Rooms
- Upload content in 4 formats: 🎥 Video (YouTube/Vimeo URL), 📝 Rich Text (with AI generation via Gemini), 📄 PDF (Cloudinary upload), ❓ Quiz (manual + AI-generated)
- Edit and delete lessons with cascade deletion (chapters → lessons → progress → live rooms)
- Quiz builder with drag-to-reorder, 4-choice questions, correct answer marking, and optional explanations
- AI-powered quiz generation (3/5/10 questions) and AI theory writing via Google Gemini
- Schedule and manage live Zoom/Teams/Webex rooms per course
- **Teacher Analytics dashboard** with:
  - Overview cards (total students, completions, quiz average, active %)
  - Per-course statistics with progress bars
  - Full student table with search, sortable columns, and pagination

### For Super Admin (Platform Owner)
- Cross-organization access to all data
- Promote users to admin role
- Create and manage organizations with invite codes
- Suspend/reactivate organizations
- Override any security rule

### Platform-Wide
- Multi-tenant architecture — each organization's data is fully isolated
- Firestore security rules enforce org-level access control
- XSS protection via DOMPurify on all rendered HTML content
- Toast notifications for all user actions (react-hot-toast)
- RSS news feed from Greek education news (esos.gr)
- Interactive quiz challenges and study guidance on the landing page
- Fully localized in Greek 🇬🇷

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 13 (App Router) |
| **Language** | TypeScript |
| **Auth** | Firebase Authentication (email/password) |
| **Database** | Cloud Firestore (NoSQL) |
| **File Storage** | Cloudinary (PDFs + images) |
| **AI** | Google Gemini API (quiz generation + theory writing) |
| **Styling** | Tailwind CSS + tailwindcss-animate |
| **Icons** | Lucide React |
| **Rich Text** | ReactQuill |
| **Notifications** | react-hot-toast |
| **Security** | DOMPurify (XSS), Firestore Security Rules (RBAC) |
| **Hosting** | Netlify |
| **Version Control** | GitHub |

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx                    # Root layout with Toaster
│   ├── page.tsx                      # Landing page (public)
│   ├── admin/
│   │   ├── page.tsx                  # Builder Pro admin panel
│   │   └── analytics/
│   │       └── page.tsx              # Teacher analytics dashboard
│   ├── dashboard/
│   │   ├── page.tsx                  # Student dashboard
│   │   ├── course/
│   │   │   └── [courseId]/
│   │   │       └── page.tsx          # Course detail (chapters + lessons)
│   │   ├── lesson/
│   │   │   └── [lessonId]/
│   │   │       └── page.tsx          # Lesson viewer (video/text/PDF/quiz)
│   │   └── live/
│   │       └── page.tsx              # Student live rooms page
│   └── api/
│       └── generate/
│           └── route.ts              # Gemini AI API endpoint
├── src/
│   ├── components/
│   │   ├── LessonEditorModal.tsx     # Edit lesson modal (all types)
│   │   ├── QuizBuilder.tsx           # Quiz creation + AI generation
│   │   ├── QuizPlayer.tsx            # Quiz taking + scoring + review
│   │   ├── SettingsModal.tsx         # Student profile settings
│   │   ├── SubjectCard.tsx           # Course card component
│   │   └── RichTextEditor.tsx        # ReactQuill wrapper
│   ├── data/
│   │   └── greekEducation.ts         # Full Greek education system data
│   ├── lib/
│   │   └── firebase.ts              # Firebase initialization
│   └── services/
│       └── courseService.ts          # Firestore CRUD helpers
├── components/
│   └── OnboardingModal.tsx           # Auth + signup + onboarding flow
└── public/
```

---

## 🏗️ Architecture

### Multi-Tenant Data Model

```
organizations
  └── orgId, name, inviteCode, status

users
  └── uid, email, role, schoolType, grade, orientation, sector, orgId

courses
  └── title, categoryId, gradeId, orgId, orientationId, sectorId

chapters
  └── title, courseId, orgId, order

lessons
  └── title, type (video|text|pdf|quiz), content, courseId, chapterId, orgId, order
  └── questions[] (for quiz type)

userProgress
  └── docId: {userId}_{lessonId}
  └── userId, lessonId, courseId, completed, completedAt, quizAttempt

live_rooms
  └── title, url, courseId, teacherId, orgId, isActive
```

### Role-Based Access Control

| Role | Permissions |
|------|------------|
| **student** | Read own org's courses/lessons, write own progress, update own profile |
| **admin** | All student permissions + CRUD courses/chapters/lessons/live rooms within own org |
| **superAdmin** | Full access across all organizations, promote users, manage orgs |

### Security Rules Summary

- Users cannot elevate their own role
- Users cannot change their orgId once set
- Students can only read/write their own progress
- All content queries are scoped to the user's orgId
- Organization creation/modification is superAdmin only
- Composite indexes defined for multi-field queries

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Spark plan works, Blaze recommended for production)
- Cloudinary account (free tier)
- Google Gemini API key (for AI features)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/edu-platform.git
cd edu-platform
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password sign-in method
3. Create a **Firestore Database** in production mode
4. Copy the security rules from the project (see `firestore.rules`)
5. Create composite indexes:
   - `lessons`: courseId (asc) + orgId (asc)
   - `chapters`: courseId (asc) + orgId (asc)
   - `lessons`: chapterId (asc) + orgId (asc)
   - `userProgress`: courseId (asc) + userId (asc)

### 4. Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Create two unsigned upload presets:
   - `eduplatform_images` — for image uploads (image/upload endpoint)
   - `eduplatform_pdfs` — for PDF uploads (raw/upload endpoint)
3. Enable **PDF and ZIP file delivery** in Settings → Security

### 5. Create Your First Organization

In Firestore, manually create a document in the `organizations` collection:

```json
{
  "orgId": "org_myschool",
  "name": "My School",
  "inviteCode": "MYCODE123",
  "status": "active"
}
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Create a Super Admin

1. Sign up through the app
2. In Firestore, find your user document in the `users` collection
3. Change `role` from `"student"` to `"superAdmin"`
4. Refresh the app — you'll now see the Admin Panel button

---

## 📦 Deployment (Netlify)

The project is configured for Netlify deployment:

1. Connect your GitHub repo to Netlify
2. Set build command: `npx next build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

The `netlify.toml` is already configured with the `@netlify/plugin-nextjs` plugin.

---

## 🇬🇷 Greek Education System Support

The platform supports the full Greek education structure:

- **Γυμνάσιο (Middle School)** — Α', Β', Γ' classes
- **ΓΕΛ (General High School)** — Α', Β', Γ' classes with orientations (Ανθρωπιστικές, Θετικές, Οικονομίας)
- **ΕΠΑΛ (Vocational High School)** — Α', Β', Γ' classes with sectors (Πληροφορικής, Ηλεκτρολογίας, Μηχανολογίας, etc.)
- **C-ΕΠΑΛ (Evening Vocational)** — Full sector support

All school types, grades, orientations, and sectors are defined in `src/data/greekEducation.ts`.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👤 Author

**Stavros Papasotiropoulos**

- LinkedIn: [linkedin.com/in/stavros-papasotiropoulos-b35302200](https://www.linkedin.com/in/stavros-papasotiropoulos-b35302200/)

---

<p align="center">
  <strong>Built with ❤️ in Greece</strong>
</p>
