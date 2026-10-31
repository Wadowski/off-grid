// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { unlistedWipFiles } from "./check-wip-tags.mjs";

const WIP_FEATURE = `@smoke @module:family @wip
Feature: Create a family
`;
const DONE_FEATURE = `@smoke
Feature: Health
`;
const FEATURE_PATH = "e2e/features/family/create-family.feature";

describe("unlistedWipFiles", () => {
  it("passes when no touched feature carries @wip", () => {
    const features = { "e2e/features/system/health.feature": DONE_FEATURE };
    assert.deepEqual(unlistedWipFiles(features, ""), []);
  });

  it("fails a touched @wip feature when the PR body does not mention it", () => {
    const features = { [FEATURE_PATH]: WIP_FEATURE };
    const body = "## Open `@wip` scenarios\n\nNone\n\n## How it was tested\n";
    assert.deepEqual(unlistedWipFiles(features, body), [FEATURE_PATH]);
  });

  it("passes when the open-scenarios section names the file", () => {
    const features = { [FEATURE_PATH]: WIP_FEATURE };
    const body = `## Open \`@wip\` scenarios\n\n- ${FEATURE_PATH}: waiting on the family API\n\n## How it was tested\n`;
    assert.deepEqual(unlistedWipFiles(features, body), []);
  });

  it("accepts the bare file name in the open-scenarios section", () => {
    const features = { [FEATURE_PATH]: WIP_FEATURE };
    const body = "## Open `@wip` scenarios\n\n- create-family.feature, blocked\n";
    assert.deepEqual(unlistedWipFiles(features, body), []);
  });

  it("does not accept a mention outside the open-scenarios section", () => {
    const features = { [FEATURE_PATH]: WIP_FEATURE };
    const body = `## Summary\n\nTouches ${FEATURE_PATH}\n\n## Open \`@wip\` scenarios\n\nNone\n`;
    assert.deepEqual(unlistedWipFiles(features, body), [FEATURE_PATH]);
  });

  it("ignores the word @wip in a scenario title or step text", () => {
    const features = {
      "e2e/features/system/health.feature": `@smoke\nFeature: Health\n  Scenario: Note about @wip tags\n    Given the stack is up\n`,
    };
    assert.deepEqual(unlistedWipFiles(features, ""), []);
  });
});
