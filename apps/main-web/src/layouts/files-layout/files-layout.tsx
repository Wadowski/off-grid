// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet, useOutletContext, useParams } from "react-router-dom";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { useDrives } from "../../files/use-drives.js";
import type { ShellContext } from "../../types.js";
import { DriveSwitcher } from "./components/drive-switcher/drive-switcher.js";
import { toActiveDriveId } from "./to-active-drive-id.js";
import { filesLayoutContentStyle, filesLayoutStyle } from "./styles.js";

export const FilesLayout = () => {
  const { driveId } = useParams();
  const narrow = useIsNarrow();
  const shell = useOutletContext<ShellContext | undefined>();
  const expectedFamilyCount = shell?.families.length ?? 0;
  const { drives, status, errorTextId, refresh } = useDrives(true, expectedFamilyCount);
  const activeDriveId = toActiveDriveId(driveId, drives);

  return (
    <div style={filesLayoutStyle(narrow)} data-testid="files-layout">
      {!narrow && (
        <DriveSwitcher
          drives={drives}
          status={status}
          errorTextId={errorTextId}
          activeDriveId={activeDriveId}
          onRetry={() => void refresh()}
        />
      )}
      <div style={filesLayoutContentStyle}>
        <Outlet />
      </div>
    </div>
  );
};
