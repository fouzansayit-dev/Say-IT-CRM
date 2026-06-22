## Context

The current frontend codebase uses a dark mode glassmorphism theme (`glass-card`, `bg-black/50`, etc.) with aurora gradient accents and Inter fonts. The user requested a bright, clean, minimal B2B SaaS workforce dashboard. We will leverage the UI/UX Pro Max Flat Design specification, centering on a light-theme layout with the Plus Jakarta Sans typography.

## Goals / Non-Goals

**Goals:**
- Shift the default page layout and global HTML state from dark to light mode.
- Update global CSS theme values (`globals.css`) to use Flat Design tokens (primary blue `#2563EB`, background `#F8FAFC`, text `#1E293B`, CTA orange `#F97316`).
- Implement Plus Jakarta Sans globally as the heading and body typeface.
- Refactor the app shell, sidebar, and cards to use solid light surfaces, crisp borders, and minimal shadows.
- Remove all dark/gradient overlays, glassmorphic effects, and neon colors.

**Non-Goals:**
- Introducing user-facing dark-mode toggle options (the app will default strictly to light mode as requested).
- Making API or routing structural changes.
- Changing mock data models or page features.

## Decisions

### 1. Light Mode Default
- **Choice**: Remove the `dark` class from `<html>` in `layout.tsx` and change default background to `#F8FAFC`.
- **Rationale**: Clean, bright, and professional B2B SaaS dashboard styling requires a light mode interface to maintain high text contrast (WCAG AA) and minimize visual fatigue during prolonged usage.

### 2. Typography Pairing
- **Choice**: Use Plus Jakarta Sans globally via Google Fonts import.
- **Rationale**: Plus Jakarta Sans provides a friendly, modern, and clean aesthetic specifically suited for modern SaaS dashboards and data displays.

### 3. Surface & Depth Architecture
- **Choice**: Replace `glass-card` styles with flat cards (`bg-white`, `border border-border`, `shadow-sm` or `shadow-md`).
- **Rationale**: Simplifies styling, eliminates heavy blur filters which are performance-intensive on some browsers, and aligns with the Flat Design philosophy.

### 4. Icons & Interactions
- **Choice**: Standardize on Lucide React SVG icons. All interactive elements (buttons, links, avatars) will use a smooth `transition-all duration-200` with `cursor-pointer`.
- **Rationale**: Ensures visual consistency and prevents layout-shifting animations or jarring state jumps.

## Risks / Trade-offs

- **Risk**: Hardcoded Tailwind classes (e.g. `text-white/80`, `border-white/5`, `bg-black/10`) in page-level components could break or render poorly on a white background.
- **Mitigation**: Perform a comprehensive review of all page files to replace dark-theme classes with clean, standard light-theme tailwind or custom CSS utility classes.
