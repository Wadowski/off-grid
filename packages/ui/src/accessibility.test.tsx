// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { renderWithI18n } from "../test/render-with-i18n.js";
import {
  Button,
  Card,
  Checkbox,
  FileCard,
  FileRow,
  FilePickerButton,
  FileTable,
  FileTableRow,
  Menu,
  FileTypeIcon,
  FloatingPanel,
  ProgressBar,
  TextField,
} from "./index.js";
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
    "has no axe violations for the upload progress and the floating panel",
    async () => {
      const { container } = renderWithI18n(
        <main>
          <FloatingPanel placement="corner" labelledBy="upload-panel-title">
            <h2 id="upload-panel-title">Uploads</h2>
            <ProgressBar label="Holiday.txt" percent={42} />
            <FilePickerButton ariaLabel="Upload" onFilesPicked={() => undefined}>
              Upload
            </FilePickerButton>
          </FloatingPanel>
        </main>,
      );

      const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

      expect(results.violations).toEqual([]);
    },
    AXE_RUN_TIMEOUT_MS,
  );

  it(
    "has no axe violations for an open actions menu",
    async () => {
      const { container } = renderWithI18n(
        <main>
          <Menu
            label="Actions for Policy.pdf"
            triggerTestId="file-actions-trigger"
            menuTestId="file-actions-menu"
            items={[
              {
                id: "open",
                textId: "files.entryActions.open",
                icon: "open_in_new",
                tone: "default",
                testId: "file-action-open",
                onSelect: () => undefined,
              },
              {
                id: "delete",
                textId: "files.entryActions.delete",
                icon: "delete",
                tone: "danger",
                testId: "file-action-delete",
                onSelect: () => undefined,
              },
            ]}
          />
        </main>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Actions for Policy.pdf" }));

      const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

      expect(results.violations).toEqual([]);
    },
    AXE_RUN_TIMEOUT_MS,
  );

  it(
    "has no axe violations for the desktop file table",
    async () => {
      const { container } = renderWithI18n(
        <main>
          <FileTable isBusy={false}>
            <FileTableRow
              name="Holiday photos"
              kind="folder"
              itemCount={184}
              onActivate={() => undefined}
            />
            <FileTableRow
              name="Policy.pdf"
              kind="pdf"
              sizeBytes={2_800_000}
              modifiedAt={new Date()}
              selected
              onActivate={() => undefined}
            />
          </FileTable>
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
