// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { FolderNameField } from "./components/folder-name-field/folder-name-field.js";
import { folderFormActionsStyle, folderFormStyle } from "./styles.js";
import type { FolderFormProps, FolderNameErrorTextId } from "./types.js";
import { validateFolderName } from "./validate-folder-name.js";

export const FolderForm = ({ status, errorTextId, onSubmit, onCancel }: FolderFormProps) => {
  const [name, setName] = useState("");
  const [nameErrorTextId, setNameErrorTextId] = useState<FolderNameErrorTextId | undefined>(
    undefined,
  );
  const isSubmitting = status === "submitting";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameError = validateFolderName(name);
    setNameErrorTextId(nameError);
    if (nameError !== undefined || isSubmitting) {
      return;
    }
    await onSubmit(name.trim());
  };

  return (
    <form data-testid="new-folder-form" style={folderFormStyle} onSubmit={handleSubmit} noValidate>
      <FolderNameField value={name} errorTextId={nameErrorTextId} onChange={setName} />
      {errorTextId === null ? null : (
        <div role="alert">
          <Text variant="error" textId={errorTextId} />
        </div>
      )}
      <div style={folderFormActionsStyle}>
        <Button type="button" variant="ghost" data-testid="new-folder-cancel" onClick={onCancel}>
          <Text variant="action" textId="files.newFolder.cancel" />
        </Button>
        <Button
          type="submit"
          variant="primary"
          data-testid="new-folder-submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <Text
            variant="action"
            textId={isSubmitting ? "files.newFolder.creating" : "files.newFolder.create"}
          />
        </Button>
      </div>
    </form>
  );
};
