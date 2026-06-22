## 1. Setup & Navigation
- [x] 1.1 Filter sidebar navigation options in layout.tsx by user.role
- [x] 1.2 Validate that the sidebar dynamically updates on role change/login

## 2. Page Restrictions & Access Denied states
- [x] 2.1 Add access check to employees/page.tsx (allow super_admin, hr_admin)
- [x] 2.2 Add access check to reports/page.tsx (allow super_admin, hr_admin)
- [x] 2.3 Add access check to projects/page.tsx (allow all except hr_admin)
- [x] 2.4 Add access check to problems/page.tsx (allow all except hr_admin)

## 3. HR Attendance & Leave Dashboard
- [x] 3.1 Implement all pending leave requests list for HR Admin in attendance/page.tsx
- [x] 3.2 Implement live "Approve" and "Reject" actions on leave requests
- [x] 3.3 Ensure approved leaves update correctly in mock data arrays

## 4. Verification & Validation
- [x] 4.1 Validate OpenSpec change proposal via openspec validate
- [x] 4.2 Run production build validation to verify type safety
