## Context

The current light layout still uses shadows (`--shadow-md`, etc.) and multi-colored user initials/avatars. The goal is to move to an ultra-clean, high-density, flat border layout with zero decorative fluff.

## Goals / Non-Goals

**Goals:**
- Eliminate all card/button shadows (`box-shadow: none` globally).
- Strip out hover scaling (`transform: translateY(-1px)`).
- Use flat slate colors for secondary cards and UI elements.
- Standardize all user avatars to simple light-gray backgrounds (`#F1F5F9`) and dark-slate text (`#475569`).
- Standardize stats panels to show clean numbers, labels, and borders only, with no icons.

**Non-Goals:**
- Modifying routing or page-level client-side logic.
- Introducing a visual theme customizer.

## Decisions

### 1. Grayscale Card Architecture
- **Choice**: All cards use `bg-surface`, `border border-border`, and `shadow-none` with no transform modifications on hover.
- **Rationale**: Strips out visual noise ("fluff"), creating a sleek dashboard that feels functional and professional.

### 2. Standardization of Avatars
- **Choice**: Remove all rainbow colors (`avatar-blue`, `avatar-rose`, etc.) and replace with a standard `.avatar` style: background `#F1F5F9`, text `#475569`, border `1px solid #E2E8F0`.
- **Rationale**: Keeps lists uniform, clean, and minimizes distracting colored bubbles.

### 3. Removal of Auxiliary Icons in Stats
- **Choice**: Remove decorative icons (e.g. `FolderKanban`, `Calendar`, etc.) from stats panels.
- **Rationale**: Keeps the focus purely on numerical metrics and labels, keeping the design utility-focused.

## Risks / Trade-offs

- **Risk**: The UI could feel too plain or sparse.
- **Mitigation**: Ensure high-quality typography sizing and precise border spacing (e.g. `Plus Jakarta Sans` with clean tracking/weight hierarchy) so it remains clean and professional.
