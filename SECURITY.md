# Security Notes

This document covers the practical security model for this frontend-heavy architecture.

## Current security posture

- **Authentication**: Firebase Auth (Email/Password)
- **Authorization**: Firestore rules + `admins/{uid}` check
- **Content storage**: Firestore (`siteContent/main`)
- **Media uploads**: Cloudinary unsigned preset uploads (client-side)

## Enforced protections in code

- `/studio` is protected by auth and admin role checks.
- Non-authenticated users are redirected to `/studio/login`.
- Authenticated non-admin users are blocked from admin dashboard actions.
- Firestore writes are sanitized before persistence.
- Admin form save validates content structure and URL fields.
- User-provided URLs are normalized before rendering to prevent `javascript:` links.
- User-provided image URLs are constrained to Cloudinary `https://res.cloudinary.com/...`.
- Cloudinary uploads are constrained client-side:
  - allowed MIME types: JPEG, PNG, WEBP, AVIF, GIF
  - max file size: 5MB
  - folder path normalized to known prefixes (`profile`, `projects/*`, `experience/*`, `misc`)

## Firestore rules intent

- Public read: **only** `siteContent/main`
- Content write: admin only
- Admin documents: read only by self/admin, never writable from client

## Recommended deployment security headers

Set these at hosting/CDN level.

## Content-Security-Policy (recommended baseline)

Adjust if your host requires additional origins.

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://res.cloudinary.com;
font-src 'self' data:;
connect-src 'self' https://firestore.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://api.cloudinary.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

## Additional headers

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
```

## Residual risks (honest)

### Medium: unsigned Cloudinary preset abuse
Unsigned presets can be abused if discovered. Client-side checks help UX but are not a true security boundary.

**Mitigations to apply in Cloudinary dashboard:**
- Use a dedicated preset only for this site.
- Restrict allowed formats.
- Set max file size.
- Restrict transformations.
- Enable moderation or review if needed.
- Monitor usage and set quota alerts.

### Medium: frontend-only trust boundary
All admin UI validation runs client-side and can be bypassed by custom clients. Firestore rules enforce write auth, but deeper semantic validation would require a backend.

### Low: public content read model
`siteContent/main` is intentionally public for website rendering. Do not store secrets there.

## Stronger upgrade path (requires backend)

For higher assurance, move uploads to a server endpoint or Cloud Function:
- verify Firebase ID token server-side
- verify admin claim/doc server-side
- generate **signed Cloudinary upload signature** with short TTL
- optionally scan files or enforce stricter policy
- return only approved URL to client
