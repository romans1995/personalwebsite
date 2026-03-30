# Roman Stavinsky Personal Website

Premium personal brand site with:

- public recruiter-facing website
- hidden private admin panel
- Firebase Auth for owner login
- Firestore for editable site content
- Cloudinary image uploads for profile/project/company visuals
- Framer Motion + Tailwind for premium UI and motion

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- Firebase Auth
- Firestore
- Cloudinary
- React Router

## Features

### Public site

- premium dark visual design
- dynamic content loaded from Firestore
- premium hero with real profile photo support
- dynamic experience, projects, case studies, contact, and visibility toggles

### Private admin

- hidden route not linked in public UI
- protected by Firebase Authentication
- protected by Firestore rules via `admins/{uid}` authorization
- edit all existing website content
- upload profile image
- upload project screenshots/images
- upload optional company visuals for experience cards
- add / delete / reorder repeatable items

## Hidden admin routes

- login: `/studio/login`
- dashboard: `/studio`

These routes are not linked in the public UI.

## Environment variables

Copy `.env.example` to `.env` and fill in your Firebase web app values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_CLOUDINARY_BASE_FOLDER=
```

## Firebase setup

### 1. Create Firebase project

Create a Firebase project and add a Web App.

### 2. Enable Authentication

Enable **Email / Password** in Firebase Authentication.

### 3. Enable Firestore Database

Create Firestore in production mode.

### 4. Configure Cloudinary

In Cloudinary:

1. Create or use your Cloudinary account
2. Create an unsigned upload preset (Settings → Upload → Upload presets)
3. Set the preset name in `VITE_CLOUDINARY_UPLOAD_PRESET`
4. Add your cloud name to `VITE_CLOUDINARY_CLOUD_NAME`

### 5. Deploy security rules

This repo includes:

- `firestore.rules`
- `firebase.json`

Deploy them with Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## First admin setup

Because the dashboard is owner-only, admin access is controlled by an `admins` collection.

### Step A — create your auth user

In Firebase Console:

1. Open Authentication
2. Add a user manually with your email/password

### Step B — create your admin authorization doc

In Firestore, create this document manually:

- Collection: `admins`
- Document ID: your Firebase Auth user UID

Suggested fields:

```json
{
	"email": "stavinskyroman@gmail.com",
	"role": "owner"
}
```

Only users with an `admins/{uid}` document can access:

- write access to `siteContent/main`
- the protected dashboard route

Image uploads are sent to Cloudinary and only the returned secure URL is stored in Firestore.

### Step C — initialize content

After signing in to `/studio/login`, open `/studio` and click:

- `Initialize content`

This seeds Firestore with the current site content model from the existing website.

## Content architecture

The public site reads from one Firestore document:

- `siteContent/main`

If Firestore is empty, the app falls back to the local default content derived from the existing site data.

### Editable sections in admin

- Hero
- About
- Skills
- Experience
- Projects
- Case Studies
- Contact
- Settings / Visibility / SEO / Navigation labels

## Local development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Deploying

This is a static frontend and can be deployed to:

- Firebase Hosting
- Vercel
- Netlify
- Cloudflare Pages

Important:

1. add the Firebase environment variables in your hosting platform
2. add the Cloudinary environment variables in your hosting platform
3. deploy Firestore rules
4. ensure your Firebase web app domain is authorized in Firebase Authentication

## File overview

- `src/pages/PublicSitePage.jsx` — public website composition
- `src/pages/AdminLoginPage.jsx` — private login page
- `src/pages/AdminDashboardPage.jsx` — editable admin dashboard
- `src/context/AuthContext.jsx` — auth state and admin check
- `src/services/siteContentService.js` — Firestore content read/write
- `src/services/storageService.js` — Cloudinary image uploads
- `src/data/defaultSiteContent.js` — default content model seeded from the existing site
- `firestore.rules` — Firestore security rules

## Notes

- The admin route is hidden from the public UI, but security is enforced by authentication and Firebase rules.
- No fake faces or fake screenshots are used. Uploaded images are real owner-managed media.
- If no profile image or project image is uploaded yet, the site uses premium visual fallbacks.

## Security

- See [SECURITY.md](SECURITY.md) for hardening details, CSP/header recommendations, residual risks, and backend upgrade path for signed uploads.
