## Goal
Persist user profile + quiz answers to a database so returning users skip login and can view/edit their info in an Account section.

## Approach
Keep the existing 2Factor.in phone OTP flow (no change to login UX). Enable Lovable Cloud purely as the datastore + session layer. Phone number is the unique identity.

## Steps

### 1. Enable Lovable Cloud
Provision Postgres + edge for storing profiles.

### 2. Database schema (migration)
- `profiles` table
  - `id uuid pk default gen_random_uuid()`
  - `phone text unique not null` (E.164, e.g. `+919876543210`)
  - `name text`, `email text`, `profession text`, `business_name text`
  - `quiz_answers jsonb`
  - `created_at`, `updated_at`
- RLS: service-role only (writes happen from server functions after OTP verify; no direct client access since we don't use Supabase Auth).
- Proper GRANTs to `service_role`.

### 3. Session cookie (returning-user detection)
Use TanStack Start's encrypted `useSession` cookie (`pikorua-session`, 60-day maxAge) holding `{ profileId, phone }`. Set on successful OTP verify. New server fn `getSessionProfile()` returns the full profile if cookie is valid → frontend skips the whole onboarding overlay.

### 4. Server functions (`src/lib/profile.functions.ts`)
- `upsertProfileAfterOtp({ phone, name, email, profession, businessName })` — called at end of AuthFlow; upserts by phone, sets session cookie, returns profile.
- `saveQuizAnswers({ answers })` — reads cookie, updates `quiz_answers`.
- `getSessionProfile()` — reads cookie, returns profile or null.
- `signOut()` — clears cookie.

Modify existing `verifyOtp` to NOT finalize — finalize happens in `upsertProfileAfterOtp` so we have full details.

### 5. Frontend wiring
- `OnboardingContext`: on mount, call `getSessionProfile()`. If profile exists → set phase to `complete`, hydrate `userProfile` + `quizAnswers`. Removes reliance on localStorage as source of truth (keep as fast cache).
- `AuthFlow` profession step → call `upsertProfileAfterOtp` instead of just local state.
- `PropertyQuiz` completion → call `saveQuizAnswers`.

### 6. Account section
- New route `src/routes/account.tsx` — luxury card showing name, email, phone, profession, business, quiz preferences, with "Edit preferences" (reopens quiz) and "Sign out" buttons.
- Add "Account" link + avatar circle (initials) in `SiteHeader`, visible only when signed in.

## Out of scope
- No Supabase Auth users table (we own identity via phone + OTP).
- No password reset, no email verify.
- No admin panel.

Confirm and I'll build it.