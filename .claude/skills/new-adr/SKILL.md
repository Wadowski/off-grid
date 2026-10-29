---
name: new-adr
description: Create the next numbered architecture decision record from the ADR template and add it to the index. Use when a decision changes or a new architecture choice is made, when CLAUDE.md's Definition of Done requires an ADR, or when the user asks to record a decision.
---

# new-adr

Architecture decisions live in `docs/adr/`, one file per decision. Read [docs/adr/README.md](../../../docs/adr/README.md) for the process and statuses.

## Steps

1. **Find the next number.** Read the index table in `docs/adr/README.md`. The next number is one above the highest number used, including retired ones. Numbers are never reused, and `0004` stays "intentionally skipped".
   Verify: `ls docs/adr | sort | tail -3` shows the highest existing number, and the new number is one higher.

2. **Create the file.** Copy `docs/adr/0000-template.md` to `docs/adr/NNNN-short-slug.md`. Use a short kebab-case slug that names the decision. Set the title and **Status** to `Proposed`.
   Verify: `head -3 docs/adr/NNNN-*.md` shows the title and `Proposed`.

3. **Write the sections.** Fill in Context (the forces and constraints, neutral), Decision (active voice, "We will ..."), and Consequences (trade-offs and follow-up work). Link related ADRs and rules instead of copying them.
   Verify: each of the three headings has content; `pnpm format:check` passes.

4. **Update the index.** Add a row to the table in `docs/adr/README.md` in the same change, in number order.
   Verify: the new number appears once in the index table.

5. **Supersede if it replaces a decision.** An accepted record is immutable except for its status. To change one, write the new record, then set the old record's status to `Superseded by NNNN` and update its index row.
   Verify: `grep -rn "Superseded by NNNN" docs/adr` finds the old record.

6. **Set the final status.** Keep `Proposed` until the decision is agreed and implemented; then set `Accepted`. Update the index row to match.
   Verify: the status in the file and in the index are identical.

## Do not

- Edit the substance of an accepted record. Supersede it.
- Reuse a retired number.
- Leave the index out of date.
