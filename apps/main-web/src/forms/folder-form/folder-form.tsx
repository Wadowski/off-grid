// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { FolderNameField } from "./components/folder-name-field/folder-name-field.js";
import { NEW_FOLDER_FORM_COPY } from "./constants.js";
import { folderFormActionsStyle, folderFormStyle } from "./styles.js";
import type { FolderFormProps, FolderNameErrorTextId } from "./types.js";
import { validateFolderName } from "./validate-folder-name.js";

export const FolderForm = ({
  status,
  errorTextId,
  onSubmit,
  onCancel,
  copy = NEW_FOLDER_FORM_COPY,
  initialName = "",
  initialSelectionEnd,
}: FolderFormProps) => {
  const [name, setName] = useState(initialName);
  const [nameErrorTextId, setNameErrorTextId] = useState<FolderNameErrorTextId | undefined>(
    undefined,
  );
  const isSubmitting = status === "submitting";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameError = validateFolderName(name);
    setNameErrorTextId(nameError === undefined ? undefined : copy.nameErrorTextIds[nameError]);
    if (nameError !== undefined || isSubmitting) {
      return;
    }
    await onSubmit(name.trim());
  };

  return (
    <form
      data-testid={`${copy.testIdPrefix}-form`}
      style={folderFormStyle}
      onSubmit={handleSubmit}
      noValidate
    >
      <FolderNameField
        copy={copy}
        value={name}
        errorTextId={nameErrorTextId}
        selectionEnd={initialSelectionEnd}
        onChange={setName}
      />
      {errorTextId === null ? null : (
        <div role="alert">
          <Text variant="error" textId={errorTextId} />
        </div>
      )}
      <div style={folderFormActionsStyle}>
        <Button
          type="button"
          variant="ghost"
          data-testid={`${copy.testIdPrefix}-cancel`}
          onClick={onCancel}
        >
          <Text variant="action" textId={copy.cancelTextId} />
        </Button>
        <Button
          type="submit"
          variant="primary"
          data-testid={`${copy.testIdPrefix}-submit`}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <Text
            variant="action"
            textId={isSubmitting ? copy.submittingTextId : copy.submitTextId}
          />
        </Button>
      </div>
    </form>
  );
};
