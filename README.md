# Student Finance Tracker

An accessible, responsive finance tracker for students, built with vanilla HTML, CSS and JavaScript (ES modules). No frameworks.

**Theme:** Student Finance Tracker (light, calm colour palette)
**Author:** YOUR-USERNAME
**Contact:** YOUR-EMAIL
**Live site:** https://jimmyshimwa.github.io/student-finance-tracker/student-finance-tracker/ 
**DEMO video:** 
## 1. Sections

1. About: purpose, GitHub link, email
2. Dashboard: stats, 7-day trend, spending cap
3. Records: table (desktop), cards (mobile), sort, regex search
4. Add / Edit form with inline validation
5. Settings: categories, cap, currencies, import/export

## 2. Data model

Each record:

    {
      "id": "txn_0001",
      "description": "Lunch at cafeteria",
      "amount": 12.50,
      "category": "Food",
      "date": "2025-09-29",
      "createdAt": "2025-09-29T12:00:00.000Z",
      "updatedAt": "2025-09-29T12:00:00.000Z"
    }

Rules: `id` is unique; every change is auto-saved to localStorage.
Default categories: Food, Books, Transport, Entertainment, Fees, Other (editable).

## 3. Validation rules (regex)

| Field | Pattern |
|---|---|
| Description | `^\S(?:.*\S)?$` |
| Amount | `^(0\|[1-9]\d*)(\.\d{1,2})?$` |
| Date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` |
| Category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` |
| Advanced (duplicate words) | `\b(\w+)\s+\1\b` |

## 4. Accessibility plan

- Landmarks: header, nav, main, section, footer
- One h1, headings in order
- Every input has a bound label
- Visible focus styles, skip-to-content link
- role="status" / aria-live for messages and errors
- Cap message: aria-live="polite" when under, "assertive" when exceeded
- Full keyboard-only operation
- Good colour contrast (WCAG AA, 4.5:1 for text)
- Mobile-first, breakpoints at 360px, 768px, 1024px

## 5. Wireframes (mobile first)

    ABOUT                     DASHBOARD
    +-------------------+     +-------------------+
    | [Logo]  [Menu]    |     | [Logo]  [Menu]    |
    |-------------------|     |-------------------|
    | About             |     | Dashboard         |
    | Purpose text      |     | [Total] [Sum]     |
    | GitHub | Email    |     | [Top category]    |
    |                   |     | 7-day bars ||||   |
    |                   |     | Cap: 120 left     |
    +-------------------+     +-------------------+

    RECORDS (mobile)          RECORDS (desktop)
    +-------------------+     +--------------------------------------+
    | Search [_____] Aa |     | Search [__________] [x] Ignore case   |
    | Sort [date v]     |     | Date | Description | Category | Amt   |
    | +---------------+ |     | ---------------------------------   |
    | | Lunch  12.50  | |     | 2025-09-29 | Lunch | Food | 12.50   |
    | | Food 09-29    | |     |            [Edit] [Delete]          |
    | | [Edit][Delete]| |     +--------------------------------------+
    | +---------------+ |
    +-------------------+

    ADD / EDIT FORM           SETTINGS
    +-------------------+     +-------------------+
    | Description       |     | Categories        |
    | [______________]  |     | Cap / target      |
    | error message     |     | Base currency     |
    | Amount [_______]  |     | Rates: USD, EUR   |
    | Category [v]      |     | [Export] [Import] |
    | Date [_______]    |     +-------------------+
    | [Save] [Cancel]   |
    +-------------------+

## 6. Milestones

M1 spec | M2 HTML/CSS | M3 validation | M4 render/sort/search | M5 stats/cap | M6 persistence/import/export/settings | M7 polish/audit/docs
