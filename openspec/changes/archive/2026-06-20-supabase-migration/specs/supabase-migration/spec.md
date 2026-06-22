# Supabase Migration Specification

## Purpose
Integrate real authentication using Supabase and sync database entities (projects, tasks, chat, ideas, problems, changes) to Postgres tables.

## ADDED Requirements

### Requirement: Supabase Auth
The application SHALL verify credentials asynchronously via Supabase Auth.

#### Scenario: Real login check
Given a user enters valid email and password
When they click login
Then session tokens and profiles roles are written to cookies and browser storage.

### Requirement: Database Integrations
Data lists (projects, tasks, problems, ideas, chat) SHALL be retrieved from Postgres.

#### Scenario: Dynamic PM project creation
Given a manager is logged in
When they submit the New Project modal form
Then a new record is inserted into the projects table.
