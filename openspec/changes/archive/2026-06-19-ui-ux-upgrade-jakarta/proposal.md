## Why

The current application utilizes a dark glassmorphic design that can cause high cognitive load and visual fatigue, which does not align with the desired look and feel of a premium, senior-developer-built B2B SaaS workforce/HR management dashboard. This change implements a bright, clean, minimal light-mode UI using the Plus Jakarta Sans font and a Flat Design aesthetic as recommended by the design system, improving usability, accessibility (WCAG AA), and visual appeal.

## What Changes

- Complete visual upgrade of the application to a clean light-mode-first aesthetic.
- Replacement of dark-mode/glassmorphism UI with clean cards, minimal borders, and typography-focused design.
- Integration of the Plus Jakarta Sans font globally.
- Elimination of emojis for icons, replacing them completely with Lucide-react/SVG icons.
- Addition of smooth transitions (150-300ms) on all interactive elements.
- Ensuring a WCAG AA compliant text contrast ratio.

## Capabilities

### New Capabilities
- `ui-ux-redesign`: Implement a unified, production-ready light mode interface with professional SaaS elements, typography, and interactive polish across all application modules.

### Modified Capabilities

## Impact

This change affects all frontend views in the application, including:
- globals.css (for core design tokens and elements)
- App layout shell and routing transitions
- Auth / Login screen
- Dashboard, Attendance, Employees, Projects, Ideas Board, Chat, Problems, and Reports screens.
- All SVG / Lucide icons and hover transitions.
