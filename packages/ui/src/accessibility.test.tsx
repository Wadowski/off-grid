// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { renderWithI18n } from "../test/render-with-i18n.js";
import { Button, Card, Checkbox, FileCard, FileRow, FileTypeIcon, TextField } from "./index.js";
import { VisuallyHidden } from "./visually-hidden/visually-hidden.js";

const AXE_RUN_TIMEOUT_MS = 30_000;

describe("accessibility", () => {
  it(
    "has no axe violations for the shared components",
    async () => {
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
    },
    AXE_RUN_TIMEOUT_MS,
  );

  it(
    "has no axe violations for file rows, cards and icons with and without actions",
    async () => {
      const { container } = renderWithI18n(
        <main>
          <FileTypeIcon kind="video" labelled />
          <FileRow name="Policy.pdf" kind="pdf" sizeBytes={2_800_000} modifiedAt={new Date()} />
          <FileRow
            name="Holiday photos"
            kind="folder"
            itemCount={184}
            onActivate={() => undefined}
            trailing={<Button variant="secondary">More</Button>}
          />
          <FileCard name="Budget.xlsx" kind="spreadsheet" sizeBytes={120_000} selected />
          <FileCard
            name="Photo.jpg"
            kind="image"
            sizeBytes={900_000}
            onActivate={() => undefined}
            trailing={<Checkbox label="Select Photo.jpg" />}
          />
          <FileCard name="Notes" kind="folder" itemCount={1} onActivate={() => undefined} />
        </main>,
      );

      const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

      expect(results.violations).toEqual([]);
    },
    AXE_RUN_TIMEOUT_MS,
  );
});
