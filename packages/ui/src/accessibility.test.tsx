// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Button, Card, TextField, VisuallyHidden } from "./index.js";

describe("accessibility", () => {
  it("has no axe violations for the shared components", async () => {
    const { container } = render(
      <main>
        <Card>
          <TextField label="Family name" error="Name is required." />
          <Button>Create family</Button>
          <Button variant="secondary">Cancel</Button>
          <VisuallyHidden>Opens in a new tab</VisuallyHidden>
        </Card>
      </main>,
    );

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  });
});
