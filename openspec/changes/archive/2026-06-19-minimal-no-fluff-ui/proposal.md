## Why

The current light Flat Design, while functional, still includes decorative elements such as visual card shadows, multi-colored icons/badges, hover scaling animations, and layout accents. The user has requested a strictly clean, minimal layout with no "fluff" and design, meaning all embellishments should be removed in favor of a clean, high-density, grayscale-first dashboard utilizing thin gray borders, uniform slate-gray avatars, and simple blue highlighting strictly for primary active states and CTAs.

## What Changes

- Removal of all CSS drop shadows and hover transforms (scaling/translations).
- Transition to flat grayscale/slate surfaces with a `1px` border (`#E2E8F0` or `#F1F5F9`).
- Conversion of color-coded employee avatars to a standardized, clean slate-gray circle layout.
- Removal of decorative icons from dashboard stats and headers.
- Standardizing Recharts tooltip styling, grid lines, and axis ticks to clean light-theme borders.

## Capabilities

### New Capabilities
- `minimalist-ui`: Redesign all screen panels and layout elements to a high-density, flat grayscale border-only styling.

### Modified Capabilities

## Impact

This affects the global stylesheet (`globals.css`) and all app view routes, modifying elements to use a strict utility-first aesthetic.
