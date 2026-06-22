# persistence-and-client-portal Specification

## Purpose
TBD - created by archiving change persistence-and-client-portal. Update Purpose after archive.
## Requirements
### Requirement: Client-Side Database Persistence
The application SHALL serialize and deserialize all mock datasets to and from `localStorage` on the client, ensuring data is not lost on reload.

#### Scenario: Submitting data and reloading
- **WHEN** a logged-in user sends a chat message or reports a problem
- **AND** the user reloads the page or logs out and back in
- **THEN** the submitted data remains visible in the corresponding pages.

---

### Requirement: Client Dashboard Portal
Clients SHALL have restricted dashboard views and be able to inspect a high-level summary of their projects, completed modules, developer roadblocks, and project deadline timelines.

#### Scenario: Client checks project status
- **WHEN** a client logs in (e.g. `client@sayit.com`)
- **THEN** the navigation sidebar only contains links to Dashboard, Projects, and Chat.
- **AND** visiting the project details page shows the deadline, schedule gap, completed tasks, and roadblock issues.

---

### Requirement: Client Change Requests
Clients SHALL be able to submit change requests for their projects, which are stored in the database.

#### Scenario: Client requests a feature change
- **WHEN** a client opens the "Request Change" modal on a project page and submits a request
- **THEN** the request is saved in the database and rendered on the project change requests list.

