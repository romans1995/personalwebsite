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
VITE_GA_MEASUREMENT_ID=
VITE_CLARITY_PROJECT_ID=
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
2. Create an unsigned upload preset (Settings â†’ Upload â†’ Upload presets)
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

### Step A â€” create your auth user

In Firebase Console:

1. Open Authentication
2. Add a user manually with your email/password

### Step B â€” create your admin authorization doc

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

### Step C â€” initialize content

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

## Google Analytics 4 (GA4)

GA4 is integrated with route-aware page tracking and custom event tracking.
This app sends SPA `page_view` events manually through React Router, so GA4 automatic browser-history pageviews should be disabled to avoid double-counting route changes.

### 1. Get your Measurement ID

In Google Analytics:

1. Open **Admin**
2. Under **Data collection and modification**, choose **Data streams**
3. Open your web stream
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Set environment variable

Add this to `.env` (and in your hosting platform env vars):

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

GA4 only initializes when this variable is present.

### 3. Disable duplicate SPA pageviews

In your GA4 web data stream:

1. Open **Admin**
2. Open **Data streams**
3. Select your web stream
4. Open **Enhanced measurement**
5. Open the page-view advanced settings
6. Turn off browser history based page changes

This prevents GA4 Enhanced Measurement from sending its own SPA route-change `page_view` events on top of the manual React Router tracking in this app.

### 4. Verify page views and events

1. Run your site and navigate between routes (/, /studio/login, /studio)
2. In GA4, open **Reports -> Realtime**
3. Confirm you see:
   - page_view events as routes change
   - custom events listed below after link/button clicks

For local debugging, you can also inspect browser devtools console/network for gtag requests.
### Tracked custom events

- `hero_cta_click`
- `project_click`
- `contact_click`
- `social_click`
- `linkedin_post_click`
- `admin_login_view`

Implementation files:

- `src/lib/analytics.js` (centralized analytics utility)
- `src/components/AnalyticsPageTracker.jsx` (React Router page view tracker)

## Microsoft Clarity

Clarity is loaded through the same centralized analytics layer as GA4.
It loads only when `VITE_CLARITY_PROJECT_ID` is present, and this implementation is scoped to production builds so local development does not start session recording.

### 1. Get your Clarity project ID

In Microsoft Clarity:

1. Sign in at `clarity.microsoft.com`
2. Open your project
3. Go to **Settings -> Setup**
4. Copy the project ID from the install snippet or tracking code

### 2. Set environment variable

Add this to `.env` and to your production hosting environment:

```bash
VITE_CLARITY_PROJECT_ID=your_clarity_project_id
```

Clarity only loads when this value exists.

### 3. Verify Clarity is working

1. Deploy or run a production build with `VITE_CLARITY_PROJECT_ID` set
2. Open the site in a browser and navigate through a few pages
3. In Clarity, check the project dashboard for an active recording or session within the next few minutes

If you need to verify in the browser, confirm the page loads a request to `https://www.clarity.ms/tag/...`.

## File overview

- `src/pages/PublicSitePage.jsx` â€” public website composition
- `src/pages/AdminLoginPage.jsx` â€” private login page
- `src/pages/AdminDashboardPage.jsx` â€” editable admin dashboard
- `src/context/AuthContext.jsx` â€” auth state and admin check
- `src/services/siteContentService.js` â€” Firestore content read/write
- `src/services/storageService.js` â€” Cloudinary image uploads
- `src/data/defaultSiteContent.js` â€” default content model seeded from the existing site
- `firestore.rules` â€” Firestore security rules

## Notes

- The admin route is hidden from the public UI, but security is enforced by authentication and Firebase rules.
- No fake faces or fake screenshots are used. Uploaded images are real owner-managed media.
- If no profile image or project image is uploaded yet, the site uses premium visual fallbacks.

## Security

- See [SECURITY.md](SECURITY.md) for hardening details, CSP/header recommendations, residual risks, and backend upgrade path for signed uploads.
