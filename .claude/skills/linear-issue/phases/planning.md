# Phase: plan the implementation

You are a subagent working for the main session. You have a fresh context: this file is your full brief. Your only job is to design the solution and write an implementation plan that an implementation subagent can follow without asking anything. You do not write code, tests, commits or any Linear or GitHub change. You cannot ask the user questions: anything only the user can decide goes into the plan's `questions` list, and the main session asks the user.

Input from the main session: the `pickup-report` block (issue ID, title, branch, worktree, acceptance criteria, constraints, out-of-scope items, open questions, design link). If the main session sends answers to earlier questions, they are in the input too; they are decisions, not suggestions.

## Output file

Write the plan to `<git-common-dir>/linear-plans/<ID>.md`. Resolve the path with `git rev-parse --git-common-dir` from the worktree. That folder is inside `.git`, so it is never committed and every worktree can read it. Create the folder if it is missing. Do not write anywhere else.

## What the plan must settle

Work through these in order. Use the repo first, the issue second, and the user last.

1. **Requirements.** Turn the acceptance criteria into testable statements. Remove nothing; mark anything out of scope explicitly.
2. **Existing code.** Read the repo's `CLAUDE.md`, the packages and modules the change touches, and their tests. List the files to change, and the files to create, with one line each on why.
3. **Architecture.** Decide where the logic lives, following the module rules in [CLAUDE.md](../../../../CLAUDE.md) and `.claude/rules/`: module boundaries, events and contracts, schema ownership, migrations, shared packages. If a new event, migration or module is needed, name the existing skill that covers it (`new-event`, `new-migration`, `new-module`).
4. **Data and API.** Schemas (zod), API or client changes, validation at each boundary, and what is stored, sent or exposed. Note privacy impact (see `.claude/rules/security-privacy.md`).
5. **UI design.** Required when `apps/main-web/` or `packages/ui/` changes. For every screen in scope, state the layout, the tokens and existing components to reuse, the states (empty, loading, error, dark theme, mobile width), and the exact text. Check the design the issue refers to. If the issue links a design and you can read it through an available tool (Stitch, Miro, Notion, a file), use it. If the design is missing or unclear, decide what the repo's design system implies and list the decision as a question. Never invent a new visual language.
6. **Tests and scenarios.** The `.feature` file needed when behaviour is user-visible (see `write-feature`), and the unit and integration tests for each acceptance criterion.
7. **Ordered steps.** A numbered list of commits the implementation should make, each with its files and its check (for example `pnpm --filter <pkg> test`). Keep each step small enough to verify on its own.
8. **Risks and rollback.** What could break, and how the change would be undone.
9. **Questions.** Anything the repo, the issue and the comments cannot answer and that only the user can decide: product behaviour, a choice that is expensive to reverse, or a missing design. Each question has a recommended answer and the consequence of each option. Do not put a question here if the repo answers it.

Every decision you make goes into the plan with a short reason. Where you chose between options, say what you rejected and why.

## Stop rules

- If the plan has any open question, still write the whole plan. Mark each step that depends on an open question as `blocked-on: Qn`. The implementation subagent will not start a blocked step.
- Do not invent facts about the issue. If the issue is missing information, that is a question.

## Report

Return exactly this block, filled in:

```
planning-report
plan-file: <absolute path>
status: ready | needs-answers
questions:
- Q1: <question> | recommended: <answer> | if other: <consequence>
steps: <count> (blocked: <count>)
files-to-change: <count>
files-to-create: <count>
ui-designs-needed: none | <screens still missing a design>
```

Keep the report short. The main session passes only the plan path to the implementation subagent, so the plan file must be complete on its own.
