## Context

We need to restrict layout options and views based on user login role (Admin, HR, or Employee) to prevent unauthorized access and customize each dashboard to the department's needs.

## Goals / Non-Goals

**Goals:**
- Dynamically filter sidebar navigation items by user role.
- Implement flat "Access Denied" panels on restricted routes.
- Build a functional leave request approval panel for HR Admins.

**Non-Goals:**
- Implementing a persistent server-side JWT session validation backend.
- Designing separate layout structures for mobile vs desktop views.

## Decisions

### 1. Client-Side Access Protection
- **Choice**: Display a clean "Access Denied" state inside the layout page wrapper for restricted paths rather than automatic client redirects.
- **Rationale**: Keeps the route history stable and provides clear feedback to the user when they access unauthorized pages.

### 2. HR Management in Attendance
- **Choice**: For the `hr_admin` role, render a list of all pending leave requests from `MOCK_LEAVE_REQUESTS` in `attendance/page.tsx` with action buttons to update the status in memory.
- **Rationale**: Makes the HR department login functional, enabling live leave approvals directly from the dashboard.

### 3. Role-Based Navigation Configuration
- **Choice**: Define route authorization maps directly in layout sidebar rendering.
- **Rationale**: Simple, highly maintainable, and prevents unnecessary layout flashes.

## Risks / Trade-offs

- **Risk**: Hardcoded mock arrays do not persist across page reloads.
- **Mitigation**: Standardize all mocks to save state changes to `localStorage` or session variables where appropriate.
