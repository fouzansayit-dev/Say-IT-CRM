# proper-authentication Specification

## Purpose
TBD - created by archiving change proper-authentication. Update Purpose after archive.
## Requirements
### Requirement: Password Authentication
The login function MUST match the entered password against the user's defined password in the mock data store.

#### Scenario: Login with incorrect password
- **WHEN** a user enters `admin@sayit.com` and password `wrongpassword`
- **THEN** the application displays "Invalid email or password" and blocks access.

#### Scenario: Login with correct password
- **WHEN** a user enters `admin@sayit.com` and password `adminpassword`
- **THEN** the application sets `sayit_auth_token` and `sayit_user_role` cookies and redirects to `/dashboard`.

---

### Requirement: Middleware Route Protection
All application routes under `(app)` pages MUST require the `sayit_auth_token` cookie to be present, otherwise redirecting to `/login` immediately.

#### Scenario: Unauthorized visit to dashboard
- **WHEN** a visitor navigates directly to `/dashboard` without `sayit_auth_token` cookie
- **THEN** the server redirects them to `/login` immediately.

