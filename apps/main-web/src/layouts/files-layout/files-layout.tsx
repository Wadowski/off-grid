// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useRef, useState } from "react";
import { Outlet, useLocation, useOutletContext, useParams } from "react-router-dom";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { useDrives } from "../../files/use-drives.js";
import { FileDetailsPanel } from "../../pages/files-page/components/file-details-panel/file-details-panel.js";
import { focusSelectedRow } from "../../pages/files-page/components/folder-contents/focus-selected-row.js";
import type { ShellContext } from "../../types.js";
import { DriveSwitcher } from "./components/drive-switcher/drive-switcher.js";
import type { DriveSwitcherProps } from "./components/drive-switcher/types.js";
import { toActiveDriveId } from "./to-active-drive-id.js";
import { toSelectedFileId } from "./to-selected-file-id.js";
import type { FileSelection, FilesOutletContext } from "./types.js";
import { filesLayoutAsideStyle, filesLayoutContentStyle, filesLayoutStyle } from "./styles.js";

export const FilesLayout = () => {
  const { driveId } = useParams();
  const location = useLocation();
  const narrow = useIsNarrow();
  const shell = useOutletContext<ShellContext | undefined>();
  const expectedFamilyCount = shell?.families.length ?? 0;
  const { drives, status, errorTextId, refresh } = useDrives(true, expectedFamilyCount);
  const [selection, setSelection] = useState<FileSelection | null>(null);
  const [filesChangedCount, setFilesChangedCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedFileId = toSelectedFileId(selection, location.pathname, narrow);
  const switcher: DriveSwitcherProps = {
    drives,
    status,
    errorTextId,
    activeDriveId: toActiveDriveId(driveId, drives),
    onRetry: () => void refresh(),
  };
  const context: FilesOutletContext = {
    ...switcher,
    selectedFileId,
    filesChangedCount,
    onSelectFile: (fileId) => setSelection({ pathname: location.pathname, fileId }),
    onClearSelection: () => setSelection(null),
  };
  const onFileChanged = () => setFilesChangedCount((count) => count + 1);
  const closeDetails = () => {
    focusSelectedRow(contentRef.current);
    setSelection(null);
  };

  return (
    <div style={filesLayoutStyle(narrow, selectedFileId !== null)} data-testid="files-layout">
      <div ref={contentRef} style={filesLayoutContentStyle}>
        <Outlet context={context} />
      </div>
      {!narrow && (
        <div style={filesLayoutAsideStyle}>
          {selectedFileId === null ? (
            <DriveSwitcher {...switcher} />
          ) : (
            <FileDetailsPanel
              fileId={selectedFileId}
              onClose={closeDetails}
              onFileChanged={onFileChanged}
            />
          )}
        </div>
      )}
    </div>
  );
};
