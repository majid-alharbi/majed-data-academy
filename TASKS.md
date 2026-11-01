# Tasks

Each task is sized for one branch / one PR. Pick one, branch as `codex/<task>`, keep CI green.

## Done in v0.1

- [x] Project setup: Vite + React + TS + Tailwind, GitHub Pages base path, HashRouter
- [x] CI (PRs) and deploy (main) workflows; deploy only after typecheck + tests + build
- [x] Engines with tests: relational algebra, SQL (sql.js), ERD→RM mapping, normalization
- [x] 6 chapters / 17 lessons from the source summary, each with all learning stages
- [x] 130 reviewed questions (mcq, tf, scenario, essay, fix, math/RA, sql, mapping)
- [x] Labs: algebra, SQL (Monaco), ERD + mapping drill, normalization
- [x] Exam simulator, question bank filters, progress dashboard (localStorage)

## Next

### Content
- [ ] Grow the bank toward 500 questions — **quality over count**: each new question needs an explanation and, for RA/SQL, an executable reference answer. Priorities: ch3 ERD scenarios, ch4 mapping, ch2 joins.
- [ ] More SQL exercises: joins with aliases, LEFT JOIN, set operators, date arithmetic.
- [ ] Division (÷) in relational algebra — engine + lesson note (not in the summary; label as إثراء).

### Labs
- [ ] ERD editor: let students build their own diagram (add entity/attribute/relationship) and map it with `mapErdToRm`.
- [ ] RM answer checker: student types `Table(PK, cols)` per table; compare to `mapErdToRm` output.
- [ ] Normalization drill: generate a table + FDs and ask for the normal form / decomposition.
- [ ] Self-host Monaco (remove the jsDelivr runtime fetch).

### Platform
- [ ] Split the main bundle (KaTeX/content) below 500 kB.
- [ ] Export/import progress file (export exists; import missing).
- [ ] Spaced-repetition review list from wrong answers.
- [ ] Accessibility pass (keyboard-only ERD controls, screen-reader labels for tables).
- [ ] UI tests (Playwright) for the main flows: lesson → quiz → progress, exam.
