# Proposal — Proper Authentication & Server-Side Middleware Guards

## Why
The current application uses mock client-side validation that bypasses actual password checks and performs route redirections in layout code, which can cause hydration flashes and allows easy client-side bypass.

## What Changes
Introduce Next.js middleware checking secure cookies for authentication, and enforce exact password matches during login.
