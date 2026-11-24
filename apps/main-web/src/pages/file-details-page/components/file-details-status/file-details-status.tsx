// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { fileDetailsStatusLinkStyle, fileDetailsStatusStyle } from "./styles.js";
import type { FileDetailsStatusProps } from "./types.js";

export const FileDetailsStatus = (props: FileDetailsStatusProps) => {
  if (props.status === "loading") {
    return (
      <div style={fileDetailsStatusStyle} data-testid="file-details-loading">
        <Text variant="body" textId="files.folder.loading" />
      </div>
    );
  }
  return (
    <div style={fileDetailsStatusStyle} data-testid="file-details-failed">
      <Text variant="error" role="alert" textId={props.errorTextId ?? "files.errors.failed"} />
      <Button
        type="button"
        variant="secondary"
        onClick={() => void props.onRetry()}
        data-testid="file-details-retry"
      >
        <Text variant="action" textId="files.folder.retry" />
      </Button>
      <Link to="/files" className="og-focusable" style={fileDetailsStatusLinkStyle}>
        <Text variant="action" textId="files.drives.backToFiles" />
      </Link>
    </div>
  );
};
