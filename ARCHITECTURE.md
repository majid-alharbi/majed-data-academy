# Architecture

Static single-page app (React 18 + TypeScript + Vite + Tailwind), deployed to GitHub Pages under `/majed-data-academy/`. No backend, no accounts, no API keys. All state is in the browser.

## Layout

```
src/
  engines/            Pure, framework-free logic. Every engine has unit tests.
    algebra/          Relational algebra: parser → AST → evaluator with step trace → LaTeX
    sql/              sql.js (SQLite/WASM) wrapper, Oracle→SQLite shims, result comparison
    erd/              ERD model, ERD→relational mapping rules, example diagrams
    normalization/    FDs: closure, candidate keys, 2NF/3NF/BCNF analysis, minimal cover, 3NF synthesis
  content/            Course data (no JSX)
    chapters/         One file per chapter of the source summary
    questions/        Question bank (helpers: mc, tf, essay, ra, sql)
    sampleDb.ts       Business sample DB shared by the algebra lab, SQL lab and graded questions
    hrDb.ts           Simplified Oracle HR subset so the summary's SQL examples run as written
    types.ts          Block / Activity / Lesson / Chapter / Question schemas
    content.test.ts   Validates every lesson, question answer, RA/SQL solution and activity preset
  lib/                progress store (localStorage), grading, KaTeX/rich text, sql.js loader
  components/         UI: QuestionCard, workbenches (RA, SQL, ERD, normalization), activities
  pages/              Dashboard, Courses, Lesson, Labs (+4 lab pages), QuestionBank, Exam, Progress
```

## Engine interfaces (stable — extend, don't break)

```ts
// algebra
evaluate(src: string, db: Database): { relation: Relation; latex: string; steps: Step[] }
relationsEqual(a: Relation, b: Relation): boolean   // same attribute names (any order) + same tuple set
sampleDatabase(): Database

// sql
createDatabase(SQL: SqlJsStatic): sql.js Database   // schema + sample rows
runQuery(db, sql): QueryResult | null               // applies oracleToSqlite()
compareResults(actual, expected, ordered): { ok, message }

// erd
mapErdToRm(model: ErdModel): RmTable[]              // each table carries Arabic notes naming the rule used

// normalization
analyze(attrs, fds): { keys, prime, normalForm, violations }
synthesize3NF(attrs, fds): { attributes, key }[]
closure(attrs, fds): string[]

// grading (src/lib/grading.ts)
grade(q: Question, r: StudentResponse): Promise<Graded>
```

## Key decisions

- **HashRouter**: GitHub Pages has no rewrites; hash URLs make every deep link work after refresh.
- **Auto-grading by execution**: RA and SQL answers are executed and compared to the reference solution's result on the sample data (not string matching). The UI says "verified on the platform data".
- **Essays are self-assessed** against a model answer and rubric — never presented as machine-graded.
- **One sample DB** feeds the algebra lab, SQL lab and graded questions, so results are consistent everywhere.
- **Lazy loading**: labs, React Flow and Monaco load on demand. Monaco itself is fetched from jsDelivr by `@monaco-editor/react`; the SQL lab falls back to a textarea while it loads.
- **Progress** is versioned (`majed-data-academy:progress:v1`); bump the version and migrate if the shape changes.

## Adding content

- New lesson: add to a chapter file; give it `sourcePages`, all stages, and an `activity`. `content.test.ts` enforces ≥3 questions per lesson.
- New question: use helpers in `content/questions/helpers.ts`. For `ra`/`sql`, the reference answer must return rows (tested).
- New ERD example: add to `engines/erd/examples.ts`; `layout.test.ts` fails if any shapes overlap.
