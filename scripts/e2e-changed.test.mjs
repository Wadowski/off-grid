// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { grepFor, planChanged } from "./e2e-changed.mjs";

const ctx = (overrides = {}) => ({
  knownModules: new Set(["calendar", "family", "files", "identity"]),
  featuresForStep: () => [],
  importersOf: () => [],
  ...overrides,
});

const titles = {
  "e2e/features/files/new-folder-dialog.feature": "Creating a folder from the Files page",
};
const featureTitle = (path) => titles[path] ?? path;

describe("planChanged", () => {
  it("runs only the @ui scenarios of the file module for a files UI change", () => {
    const plan = planChanged(["apps/main-web/src/files/use-create-folder.ts"], ctx());

    assert.deepEqual(plan, {
      mode: "scoped",
      directFeatures: [],
      uiModules: ["files"],
      backendModules: [],
      reasons: [],
    });
    assert.equal(grepFor(plan, featureTitle), "(?=.*@module:(files)\\b)(?=.*@ui\\b)");
  });

  it("maps a page directory to its module", () => {
    const plan = planChanged(["apps/main-web/src/pages/files-page/files-page.tsx"], ctx());

    assert.deepEqual(plan.uiModules, ["files"]);
  });

  it("maps a shared form to the modules that import it", () => {
    const plan = planChanged(
      ["apps/main-web/src/forms/folder-form/folder-form.tsx"],
      ctx({
        importersOf: () => [
          "apps/main-web/src/files/components/new-folder-dialog/new-folder-dialog.tsx",
        ],
      }),
    );

    assert.deepEqual(plan.uiModules, ["files"]);
    assert.equal(plan.mode, "scoped");
  });

  it("runs the full suite when a shared form is used outside any module", () => {
    const plan = planChanged(
      ["apps/main-web/src/forms/folder-form/folder-form.tsx"],
      ctx({
        importersOf: () => ["apps/main-web/src/app-shell/shell.tsx"],
      }),
    );

    assert.equal(plan.mode, "full");
    assert.equal(grepFor(plan, featureTitle), null);
  });

  it("runs every scenario of a changed backend module, with its consumers", () => {
    const plan = planChanged(["modules/family/src/application/create-family.ts"], ctx());

    assert.deepEqual(plan.backendModules, ["calendar", "family"]);
    assert.equal(grepFor(plan, featureTitle), "@module:(calendar|family)\\b");
  });

  it("runs a changed feature file whole, matched by its title", () => {
    const plan = planChanged(["e2e/features/files/new-folder-dialog.feature"], ctx());

    assert.deepEqual(plan.directFeatures, ["e2e/features/files/new-folder-dialog.feature"]);
    assert.equal(grepFor(plan, featureTitle), "Creating a folder from the Files page");
  });

  it("maps a steps file to the feature it is named after", () => {
    const plan = planChanged(
      ["e2e/steps/new-folder-dialog.steps.ts"],
      ctx({
        featuresForStep: () => ["e2e/features/files/new-folder-dialog.feature"],
      }),
    );

    assert.deepEqual(plan.directFeatures, ["e2e/features/files/new-folder-dialog.feature"]);
  });

  it("keeps the UI and backend scopes separate when both change", () => {
    const plan = planChanged(
      ["apps/main-web/src/files/create-folder.ts", "modules/files/src/http/routes.ts"],
      ctx(),
    );

    assert.deepEqual(plan.uiModules, ["files"]);
    assert.deepEqual(plan.backendModules, ["files"]);
    assert.equal(
      grepFor(plan, featureTitle),
      "(?=.*@module:(files)\\b)(?=.*@ui\\b)|@module:(files)\\b",
    );
  });

  it("takes the catalog as text only and leaves the scope to the components", () => {
    const plan = planChanged(["apps/main-web/src/i18n/catalogs/en.ts"], ctx());

    assert.equal(plan.mode, "none");
    assert.equal(plan.reasons.length, 1);
  });

  it("runs the full suite for shared code and unknown paths", () => {
    for (const file of [
      "packages/ui/src/button.tsx",
      "packages/event-bus/src/deliver-one.ts",
      "apps/main-server/src/server.ts",
      "pnpm-lock.yaml",
      "something/new.ts",
    ]) {
      assert.equal(planChanged([file], ctx()).mode, "full", file);
    }
  });

  it("treats a scripts-only package.json change as a note, and a dependency change as full", () => {
    const scriptsOnly = planChanged(["package.json"], ctx({ onlyScriptsChanged: () => true }));
    assert.equal(scriptsOnly.mode, "none");

    const dependencies = planChanged(["package.json"], ctx({ onlyScriptsChanged: () => false }));
    assert.equal(dependencies.mode, "full");
  });

  it("treats repo tooling as a note, not a full run", () => {
    const plan = planChanged(["scripts/e2e-changed.mjs", "scripts/e2e-changed.test.mjs"], ctx());

    assert.equal(plan.mode, "none");
    assert.equal(plan.reasons.length, 2);
  });

  it("runs nothing for documentation and agent configuration", () => {
    const plan = planChanged(
      ["docs/adr/0030-new.md", ".claude/skills/linear-issue/SKILL.md", "README.md"],
      ctx(),
    );

    assert.equal(plan.mode, "none");
    assert.equal(grepFor(plan, featureTitle), null);
  });
});
