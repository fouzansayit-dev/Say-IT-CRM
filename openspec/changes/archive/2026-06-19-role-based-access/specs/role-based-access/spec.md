# Role-Based Access Specification

## Purpose
Ensure that navigation items and page views are customized and restricted based on the logged-in user's role (Super Admin, HR Admin, or Employee).

## ADDED Requirements

### Requirement: Role-Based Navigation Filtering
The application layout SHALL dynamically filter the sidebar navigation links depending on the authenticated user's role.

#### Scenario: Sidebar items for Employees
- **WHEN** an employee logs in (e.g. `emp@sayit.com`)
- **THEN** the sidebar links do NOT include "Employees" or "Reports"

#### Scenario: Sidebar items for HR Admin
- **WHEN** an HR admin logs in (e.g. `hr@sayit.com`)
- **THEN** the sidebar links do NOT include "Projects" or "Problems"

---

### Requirement: Page Access Restrictions
Restricted pages SHALL render an "Access Denied" view if accessed by a user who does not have permissions for that route.

#### Scenario: Employee attempts to view Reports
- **WHEN** an employee visits the `/reports` page
- **THEN** the page displays a flat "Access Denied" card with no data

---

### Requirement: HR Leave Management
The HR admin user SHALL be able to view and manage leave request approvals from the attendance panel.

#### Scenario: HR approves a leave request
- **WHEN** the HR admin clicks "Approve" on a pending leave request
- **THEN** the request status changes to "approved" and updates the employee's history
