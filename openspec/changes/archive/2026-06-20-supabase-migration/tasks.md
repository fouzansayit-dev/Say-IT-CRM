## 1. Setup & Backend
- [x] 1.1 Install `@supabase/supabase-js` package
- [x] 1.2 Create `.env` template
- [x] 1.3 Create `lib/supabase.ts` client initialization

## 2. Authentication & Guards
- [x] 2.1 Refactor `lib/data.ts` async database queries and auth handlers
- [x] 2.2 Update `app/login/page.tsx` async sign-in triggers
- [x] 2.3 Align Next.js `middleware.ts` cookie checks

## 3. Dynamic Database Sync
- [x] 3.1 Refactor `/client` workspace to fetch projects and request changes dynamically
- [x] 3.2 Add project creation modal form and filter lists on `/projects` page
- [x] 3.3 Connect ideas, problems, and solutions pages to Supabase tables
- [x] 3.4 Establish real-time postgres INSERT channels on chat page

## 4. Verification
- [x] 4.1 Validate change using openspec validation tool
- [x] 4.2 Validate Next.js production build compiler
- [x] 4.3 Archive OpenSpec change spec
