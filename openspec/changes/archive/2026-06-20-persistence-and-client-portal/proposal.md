# Proposal — Database Persistence & Client Portal Module

## Why
Currently, all page mutations (leave requests, chat messages, ideas, problem solutions) are lost on logout or reload because the app uses in-memory mock datasets. Additionally, clients need a way to track project progress (deadline, gap, completed tasks, roadblocks) and submit change requests directly.

## What Changes
Implement localStorage synchronization for all mock data tables, add a Client role, restrict sidebar navigation/routes for clients via Middleware, and build a simplified dynamic Client project portal where they can monitor progress and submit feature/change requests.
