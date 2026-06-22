## 1. Setup & Persistence
- [x] 1.1 Add Client and Project schemas, add client to MOCK_USERS in lib/data.ts
- [x] 1.2 Implement localStorage database getters and setters
- [x] 1.3 Link demo projects and developer roadblocks in lib/data.ts

## 2. Access Controls
- [x] 2.1 Integrate Client quick-login card on login/page.tsx
- [x] 2.2 Filter navigation tabs for Client in layout.tsx
- [x] 2.3 Add client-specific routing restrictions in middleware.ts

## 3. Client Portal UI
- [x] 3.1 Refactor projects/page.tsx to filter client projects and load from client-side state
- [x] 3.2 Create projects/[id]/page.tsx dynamic routing page (Note: Unified Client Portal created under /client is restricted and used instead of exposing /projects)
- [x] 3.3 Build client dashboard interface showing deadline, gap, completed tasks, roadblocks, change requests
- [x] 3.4 Build Client change requests submission form & modal

## 4. Components Refactoring
- [x] 4.1 Update chat/page.tsx to load and persist sent messages
- [x] 4.2 Update ideas/page.tsx to load and persist submissions and votes
- [x] 4.3 Update problems/page.tsx to load and persist solutions and votes
- [x] 4.4 Update attendance/page.tsx to load from state
- [x] 4.5 Update employees/page.tsx to load from state

## 5. Verification
- [x] 5.1 Validate OpenSpec change proposal via openspec validate
- [x] 5.2 Validate Next.js production build via npm run build
- [ ] 5.3 Archive OpenSpec change
