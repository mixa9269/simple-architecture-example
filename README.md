# simple-architecture-example

Homework projects for the **Simple Architecture** online bootcamp (React).

## AI rules

Architecture rules for Claude Code live in [`.claude/rules`](.claude/rules):

- View layer = JSX + `usePresenter()` only
- All component logic lives in `usePresenter` and smaller hooks
- Max 120 lines per file (enforced by ESLint)
- Tree-shaped component folders that mirror the UI
- `components/` folders hold reusable components only

Course materials are kept locally in `course-materials/` (git-ignored).
