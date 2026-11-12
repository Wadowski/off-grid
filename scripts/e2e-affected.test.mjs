// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { grepFor, planFor } from "./e2e-affected.mjs";

const tagsOf = (modules) => () => modules;

describe("planFor", () => {
  it("runs the scenarios of a changed module", () => {
    const plan = planFor(["modules/calendar/src/http/register-calendar-routes.ts"], tagsOf([]));

    assert.deepEqual(plan, { mode: "tags", modules: ["calendar"], reasons: [] });
    assert.equal(grepFor(plan), "@module:(calendar)");
  });

  it("also runs the modules that consume a changed module's events", () => {
    const plan = planFor(["modules/family/src/application/create-family.ts"], tagsOf([]));

    assert.deepEqual(plan.modules, ["calendar", "family"]);
  });

  it("runs the scenarios tagged in a changed feature file", () => {
    const plan = planFor(["e2e/features/family/invitations.feature"], tagsOf(["family"]));

    assert.deepEqual(plan.modules, ["family"]);
  });

  it("runs the full suite when a feature file has no module tag", () => {
    const plan = planFor(["e2e/features/misc/new.feature"], tagsOf([]));

    assert.equal(plan.mode, "full");
    assert.equal(grepFor(plan), null);
  });

  it("runs the full suite for shared code", () => {
    for (const file of [
      "packages/event-bus/src/deliver-one.ts",
      "apps/main-server/src/server.ts",
      "e2e/support/world.ts",
      "e2e/steps/calendar.steps.ts",
      "scripts/check-dco.mjs",
      "pnpm-lock.yaml",
    ]) {
      const plan = planFor([file], tagsOf([]));
      assert.equal(plan.mode, "full", file);
    }
  });

  it("runs the full suite for an unknown path rather than skipping it", () => {
    const plan = planFor(["something/new.ts"], tagsOf([]));

    assert.equal(plan.mode, "full");
  });

  it("runs nothing for documentation and agent configuration", () => {
    const plan = planFor(
      ["docs/adr/0030-new.md", ".claude/skills/linear-issue/SKILL.md", "README.md"],
      tagsOf([]),
    );

    assert.deepEqual(plan, { mode: "none", modules: [], reasons: [] });
    assert.equal(grepFor(plan), null);
  });

  it("combines modules and makes one grep for them", () => {
    const plan = planFor(
      ["modules/lists/src/a.ts", "modules/notes/src/b.ts", "docs/x.md"],
      tagsOf([]),
    );

    assert.equal(grepFor(plan), "@module:(lists|notes)");
  });

  it("stops at the first shared file and reports why", () => {
    const plan = planFor(["modules/notes/src/a.ts", "packages/db/src/index.ts"], tagsOf([]));

    assert.equal(plan.mode, "full");
    assert.match(plan.reasons[0], /packages\/db/);
  });
});
