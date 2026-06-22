## Why

The current system renders the exact same navigation items and access permissions to all logged-in accounts regardless of their role or department. Employees can access financial data, budgets, employee directories, and reports, while HR Admins cannot approve or manage employee leave requests. Adding role-based access control (RBAC) secures sensitive data and ensures users only see tools and views relevant to their department (Super Admin, HR, or Employee).

## What Changes

1. **Role-Based Navigation**:
   - Filter sidebar navigation options in `(app)/layout.tsx` based on the user's logged-in role.
   - **Admin / Super Admin (`super_admin`)**: Access to Dashboard, Projects, Ideas Board, Chat, Problems, Reports, and Employees.
   - **HR / HR Admin (`hr_admin`)**: Access to Dashboard, Attendance, Employees, Chat, and Reports.
   - **Employees / Managers (`employee`, `project_manager`, `department_manager`)**: Access to Dashboard, Attendance, Projects, Ideas Board, Chat, and Problems.

2. **Route Protection**:
   - Implement client-side protection on sensitive pages (`employees`, `reports`, `projects`, `problems`) to display an "Access Denied" card if a user tries to access a route they do not have permission for.

3. **HR Leave Approval Dashboard**:
   - Modify `attendance/page.tsx` for HR Admins:
     - Replace "My Leave Requests" with "Pending Leave Requests" from all employees.
     - Provide flat, minimal buttons for HR Admins to "Approve" or "Reject" requests, modifying the mock data in real time.

4. **Stats Page Filters**:
   - Restrict reports metrics viewable by non-HR/Admin roles.

## Impact

This restricts route visibility and secures sensitive platform views, creating distinct user experiences for Admin, HR, and Employees.
