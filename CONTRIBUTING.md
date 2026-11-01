# Contributing (humans and Codex)

## Branches

- `main` is what students see. Every push to `main` is deployed automatically.
- **Never commit directly to `main`.** Codex and other contributors work on their own branch, e.g. `codex/<short-task-name>`.
- Open a pull request into `main`. The `CI` workflow runs type check, tests and build on the branch.
- **Do not merge a PR until CI is green** and a human has reviewed content changes. Recommended: enable branch protection on `main` requiring the `check` job.

## Before pushing

```bash
npm run typecheck
npm test
npm run build
```

## Quality rules (from the project brief)

- No fake buttons: every control must do something real.
- No demo numbers shown as real results; progress starts at zero and comes only from the student's actions.
- No question with a wrong answer. Objective answers must be checkable; RA/SQL solutions are executed in tests.
- Relational algebra symbols must be correct (σ π ρ ∪ ∩ − × ⋈, ∧ ∨ ¬).
- ERD diagrams must use correct Chen notation and must not overlap (tested).
- No user data leaves the browser. No API keys or secrets anywhere in the repo.
- Content follows «ملخص مبسط لإدارة بيانات الأعمال». Anything beyond it is labeled **إثراء**. Where the summary disagrees with standard references, keep the standard rule and show a visible note (see the 1:1 mapping note).

## Arabic / RTL

The app is `dir="rtl"`. Wrap code, SQL, RA expressions and tables of data in `dir="ltr"`.
