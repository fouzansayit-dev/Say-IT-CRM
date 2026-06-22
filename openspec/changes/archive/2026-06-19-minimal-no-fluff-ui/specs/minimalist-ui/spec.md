## ADDED Requirements

### Requirement: Zero Shadow Cards
The application's cards, buttons, and panels SHALL have no drop-shadows or vertical offsets.

#### Scenario: Verify shadow styling
- **WHEN** checking card styling on the dashboard
- **THEN** CSS box-shadow evaluates to "none" and hover transforms are disabled

### Requirement: Grayscale Avatars
All employee avatar blocks SHALL render with a uniform light gray background (`#F1F5F9`) and dark text, and MUST NOT use multi-colored backgrounds.

#### Scenario: Verify employee avatar lists
- **WHEN** loading the employee list
- **THEN** all avatars have a `#F1F5F9` background and `#475569` text

### Requirement: Iconless KPI Stats
All dashboard KPI card components SHALL render only the metrics, labels, and trends, and MUST NOT show decorative category icons.

#### Scenario: Loading KPI cards
- **WHEN** viewing the stats row
- **THEN** no icons are displayed in the KPI containers

### Requirement: Clean Thin Borders
All form elements, table rows, and modals SHALL render with flat `1px` borders and MUST NOT use colorful focus glows.

#### Scenario: Focusing on an input field
- **WHEN** focusing on an input field
- **THEN** the border evaluates to a simple border with no shadow rings
