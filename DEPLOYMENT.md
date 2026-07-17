# BenQ Education LMS Deployment

## Recommended Targets

- Frontend: Vercel, Netlify, or Render Static Site
- Backend: Render Web Service or Railway Node service
- Database: Neon, Supabase Postgres, Railway Postgres, or Render Postgres
- File sharing: external shared links from Google Drive, OneDrive, etc.

## Backend

Root directory:

```text
backend
```

Build command:

```bash
npm ci && npm run prisma:generate
```

Start command:

```bash
npm start
```

Required environment variables:

```text
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ character secret>
SCHOOL_SETUP_SECRET=<16+ character private setup password>
CLIENT_ORIGIN=https://your-frontend-domain.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mailer@example.com
SMTP_PASS=<smtp password or app password>
MAIL_FROM="BenQ Education <mailer@example.com>"
REDIS_URL=redis://...
CACHE_ENABLED=true
CACHE_TTL_SECONDS=60
```

Credential emails for teacher/student account creation use SMTP. `SMTP_SECURE=true` is usually for port `465`; `SMTP_SECURE=false` is usually for port `587`.
Redis is optional at runtime, but should be configured for production dashboards, analytics, calendar, and list caching.

After database migrations exist, run this during deploy:

```bash
npm run prisma:deploy
```

For the current schema-push workflow, run Prisma sync manually before release.

## Frontend

Root directory:

```text
frontend
```

Build command:

```bash
npm ci && npm run build
```

Publish directory:

```text
dist
```

Required environment variable:

```text
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

SPA refresh support is already configured for Vercel and Netlify-style static hosting.

## Release Smoke

1. Open the deployed frontend.
2. Open `/api/health` on the backend and confirm `status` is `ok`.
3. Open `/api/ready` on the backend and confirm `status` is `ready`.
4. Log in as admin, teacher, and student.
5. Refresh deep routes such as `/admin/classes`, `/teacher/assignments`, and `/student/classes`.
6. Visit `/school-setup` while logged out and confirm a wrong setup password is rejected.
7. Create one assignment as a teacher with a shared resource link.
8. Submit one shared resource link as a student.
9. Grade the submission as a teacher.
10. Confirm the student can see grade and feedback.
11. Reset one teacher/student password from the admin portal and confirm the new password works.
