// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useFileContent } from "../../../../../../use-file-content.js";
import { filePreviewBodyStyle, filePreviewStatusStyle } from "./styles.js";
import { PREVIEWERS } from "./previewer-registry.js";
import type { FilePreviewBodyProps } from "./types.js";

export const FilePreviewBody = ({ file, download }: FilePreviewBodyProps) => {
  const { state, retry } = useFileContent(file);

  if (state.status === "ready") {
    const Previewer = PREVIEWERS[state.kind];
    return (
      <div style={filePreviewBodyStyle}>
        <Previewer objectUrl={state.objectUrl} name={file.name} download={download} />
      </div>
    );
  }
  if (state.status === "loading") {
    return (
      <div style={filePreviewBodyStyle}>
        <Text
          variant="body"
          role="status"
          textId="files.preview.loading"
          data-testid="file-preview-loading"
        />
      </div>
    );
  }
  if (state.status === "failed") {
    return (
      <div style={{ ...filePreviewBodyStyle, ...filePreviewStatusStyle }}>
        <Text
          variant="error"
          role="alert"
          textId={state.errorTextId}
          data-testid="file-preview-error"
        />
        <Button type="button" variant="secondary" onClick={retry} data-testid="file-preview-retry">
          <Text variant="action" textId="files.preview.retry" />
        </Button>
      </div>
    );
  }
  return (
    <div style={{ ...filePreviewBodyStyle, ...filePreviewStatusStyle }}>
      <Text
        variant="body"
        textId="files.preview.unsupported"
        data-testid="file-preview-unsupported"
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => void download()}
        data-testid="file-preview-unsupported-download"
      >
        <Text variant="action" textId="files.details.actions.download" />
      </Button>
    </div>
  );
};
