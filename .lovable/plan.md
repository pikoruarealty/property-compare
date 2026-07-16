# Pikorua — Onboarding & Quiz System (Complete Logic + Handoff Prompt)

This plan has two parts:
1. A full written explanation of how the app's entry / onboarding / quiz flow works today (usable as a handoff prompt for another AI or dev).
2. A concrete change: add a **State → City** step to the quiz that auto-grows as new property locations are added to the catalog.

---

## Part 1 — How the entrance flow works today

### 1.1 Phases (state machine)
Defined in `src/context/OnboardingContext.tsx` as `OnboardingPhase`:

`idle → auth → welcome → site-preview → quiz → complete`

The current phase lives in `OnboardingContext` and drives what the `OnboardingOverlay` renders. The overlay is a full-screen modal shown only when `phase ∈ {auth, welcome, quiz}`. In `idle`, `site-preview`, and `complete`, the homepage is fully interactive.

### 1.2 Trigger points (what advances the phase)

Implemented in `src/components/onboarding/OnboardingOverlay.tsx`:

- **idle → auth**: user scrolls the homepage past `scrollY > 200px`. This is the "gate" — the site is browsable for the first ~one screen; the moment they start exploring, auth appears.
- **auth → welcome**: fires from `AuthFlow` after the profile is saved (`setPhase("welcome")`).
- **welcome → site-preview**: user clicks *Explore the collection →* in `WelcomeCard`. Overlay closes; homepage is visible again.
- **site-preview → quiz**: next scroll of >40px from the current position (one-shot). This is the second gate: they get a taste of the site, then the quiz interrupts.
- **quiz → complete**: user finishes Q3 (`completeOnboarding` in `PropertyQuiz`). Overlay closes for good; results are saved.

Body scroll is locked while the overlay is active (`phase ∈ {auth, welcome, quiz}`).

### 1.3 Is it compulsory?
Yes, effectively. There is no "Skip" button on auth or the quiz, and the overlay has no close X except in **edit mode** (when the user re-opens the quiz later from account settings). The only way past `auth` is to complete auth; the only way past `quiz` is to answer all 3 questions.

### 1.4 Auth flow (`src/components/onboarding/AuthFlow.tsx`)
Four sub-steps, tracked by a progress-dot row:

1. **details** — Full name + email. Validated locally (name non-empty, email regex).
2. **phone** — Country picker (India, USA, UK, UAE, Australia) + number. `+91` requires exactly 10 digits; others require ≥6. Calls `sendOtp` server function → returns a `sessionId`.
3. **otp** — 6-digit code, auto-advances between boxes, auto-submits when all 6 filled. Shake animation on wrong code. 30-second resend cooldown. Calls `verifyOtp` → returns a `verificationToken`.
4. **profession** — Salaried / Business owner / Investor / Other. Business & Investor reveal an optional "Business / company name" field. Calls `upsertProfileAfterOtp` with `{name, email, profession, businessName, verificationToken}`, which creates/updates the `profiles` row keyed by phone and starts a server session. On success → `setPhase("welcome")`.

### 1.5 Welcome card (`WelcomeCard.tsx`)
Purely presentational: greets by first name, shows the "23 curated residences across Ahmedabad" line, one CTA → `setPhase("site-preview")`.

### 1.6 Quiz (`src/components/onboarding/PropertyQuiz.tsx`)
Three questions, one screen each, horizontal slide transitions, progress bar at top ("Question X of 3").

- **Q1 — Property type** *(multi-select, required ≥1)*
  Options: Bungalow, Apartment, Penthouse, Duplex, Plots. Icon tiles in a 3-column grid, gold checkmark badge when selected.
- **Q2 — BHK / size** *(multi-select, max 2)*
  Options: 2, 3, 4, 5, 6, 7. Selecting a 3rd triggers a toast "You can choose up to 2 BHK options." Stored as e.g. `"3 BHK"`.
- **Q3 — Budget** *(single-select range + sub-range)*
  Ranges: ₹1–5 Cr, ₹6–10 Cr, ₹11–15 Cr, ₹16–20 Cr, ₹21 Cr+.
  Each range (except ₹21 Cr+) expands to sub-bands in ~₹2 Cr steps (e.g. ₹1–5 Cr → ₹1–2 / ₹3–4 / ₹5 Cr). Sub-range required unless top band.

Finish → `completeOnboarding(answers)`:
- Sets phase = `complete`.
- Persists to `localStorage` (`pikorua:quiz-answers`, `pikorua:onboarding-complete`).
- Fires `saveQuizAnswers` server function to write `quiz_answers` JSONB on the profile.

### 1.7 Persistence & session
`OnboardingContext` uses two layers:
- **Optimistic local cache** in `localStorage` — instant hydrate on reload (`pikorua:user-profile`, `pikorua:quiz-answers`, `pikorua:onboarding-complete`).
- **Server truth** via `getSessionProfile` on mount — if server returns a profile the local cache is refreshed and phase = `complete`; if server returns null the local cache is cleared and phase = `idle` (onboarding runs again).

Sign-out (`signOut`) calls `signOutProfile` server fn and wipes both caches → back to `idle`.

Editing preferences later: `openQuizForEdit()` sets `quizEditMode = true` and re-opens the quiz pre-filled from current answers; in edit mode a close (X) button is shown and the finish button reads *Save preferences*.

---

## Part 2 — New requirement: State + City step in the quiz

### 2.1 Goal
Add a **Location** question so the quiz asks *"Where are you looking?"* with:
- First a **State** picker.
- Then a dependent **City** picker (only cities that exist within the chosen state).

Today the catalog only has Gujarat → Ahmedabad, so today's quiz will show exactly one state (Gujarat) and one city (Ahmedabad). When new properties from new states/cities are added to `src/data/properties.ts`, the options must appear automatically — no code edits to the quiz.

### 2.2 Where the options come from (auto-scaling)
Derive from the property catalog at build time, not a hardcoded list:

1. In `src/data/properties.ts` ensure every property has `state` and `city` fields (already have `city`/location; add `state` where missing, defaulting to `"Gujarat"`).
2. Create `src/lib/locations.ts` that exports:
   - `getAvailableLocations()` → `{ state: string; cities: string[] }[]` computed by grouping the properties list.
   - `getStates()` and `getCitiesForState(state)` helpers.
3. `PropertyQuiz` imports these; the UI just maps over them. Adding a new property with `state: "Maharashtra", city: "Mumbai"` automatically adds *Maharashtra* to the state list and *Mumbai* under it — no quiz edits required.

### 2.3 Quiz UX changes
- Progress becomes **Question 1 of 4** (was 3 of 3). Update the `q` state type to `1 | 2 | 3 | 4` and the `(q / 3) * 100` progress math to `/ 4`.
- Insert **Q1 = Location**, shift current Q1/Q2/Q3 to Q2/Q3/Q4.
- Q1 layout:
  - Row of state pill-tiles (single-select). With only one state today it renders as a single pre-selected tile.
  - Below it, city tiles for the chosen state (single-select; required to proceed). If the state has only one city, auto-select it and enable *Next question →* immediately.
  - When only one state exists, still show it (not hidden) so the user sees "State: Gujarat" — makes the future multi-state UX obvious.

### 2.4 Data model changes
Extend `QuizAnswers` in `OnboardingContext.tsx`:

```ts
export interface QuizAnswers {
  state: string;
  city: string;
  bhk: string[];
  propertyType: string[];
  budgetRange: string;
  budgetSub: string;
}
```

- Server-side `saveQuizAnswers` already stores the whole object as JSONB (`profiles.quiz_answers`), so no migration is needed — new fields flow through automatically.
- Backward-compat: when hydrating from local/server, treat missing `state`/`city` as `undefined` and, if the quiz is re-opened in edit mode, pre-select the only available state/city.

### 2.5 Downstream filtering
`src/lib/preference-filter.ts` (used by `PreferencePanel` / suggestions) should also read `state` + `city` to narrow which properties show — currently it filters on BHK/type/budget only. Small addition: pass through `city` (and `state` when we have multi-state data) as an extra filter.

### 2.6 Files to touch (build phase)
- `src/data/properties.ts` — add `state: "Gujarat"` to existing entries if missing.
- `src/lib/locations.ts` — **new**, derives state/city options from properties.
- `src/context/OnboardingContext.tsx` — extend `QuizAnswers` type.
- `src/components/onboarding/PropertyQuiz.tsx` — 4-question flow, new Q1 UI, progress math.
- `src/lib/preference-filter.ts` — optional filter by city.
- No DB migration; JSONB accepts the new keys.

### 2.7 Reusable handoff prompt (copy-paste for another AI)

> **Context:** In our React + TanStack Start real-estate app "Pikorua", onboarding is a phase machine (`idle → auth → welcome → site-preview → quiz → complete`) stored in `OnboardingContext`. The `OnboardingOverlay` renders a modal for `auth | welcome | quiz`. Auth triggers on first scroll past 200px; the quiz triggers on the next scroll of >40px after the user dismisses the welcome card. Both are compulsory (no skip). Auth has 4 sub-steps: details (name/email) → phone (country + number) → 6-digit OTP → profession. Server fns: `sendOtp`, `verifyOtp`, `upsertProfileAfterOtp`, `getSessionProfile`, `saveQuizAnswers`, `signOutProfile`. Profile is persisted in Supabase `profiles` (phone as key, `quiz_answers` JSONB) and mirrored to `localStorage` under `pikorua:*` keys for instant hydrate.
>
> The quiz today has 3 questions: (1) property type multi-select, (2) BHK multi-select capped at 2, (3) budget range + sub-range. Finishing calls `completeOnboarding(answers)` which sets phase=complete, writes localStorage, and calls `saveQuizAnswers`.
>
> **Task:** Add a new first quiz question, "Where are you looking?", that asks for **State** then **City**. Both must be derived from the property catalog (`src/data/properties.ts`) — never hardcoded. Add a `src/lib/locations.ts` helper that groups properties by `state` and returns `{state, cities[]}[]`. The quiz becomes 4 questions; update the progress bar (`q/4`), the `q` union type, and shift existing questions. Extend `QuizAnswers` with `state: string; city: string`. Today only Gujarat/Ahmedabad exists so the UI shows one state and one city (auto-selected, user just clicks Next). When new properties from other states/cities are added later, the picker must show them automatically with no further edits. Also thread `city` into `src/lib/preference-filter.ts` so suggestions respect the chosen city. No DB migration needed (JSONB). Preserve edit-mode behavior (`quizEditMode`, close X, "Save preferences" label).

---

Approve this plan and I'll (a) leave Part 1 as documentation and (b) implement Part 2 (the auto-scaling State→City step) in build mode.
