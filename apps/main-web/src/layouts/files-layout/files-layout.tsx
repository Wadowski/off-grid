// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet, useOutletContext, useParams } from "react-router-dom";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { useDrives } from "../../files/use-drives.js";
import type { ShellContext } from "../../types.js";
import { DriveSwitcher } from "./components/drive-switcher/drive-switcher.js";
import type { DriveSwitcherProps } from "./components/drive-switcher/types.js";
import { toActiveDriveId } from "./to-active-drive-id.js";
import {
  filesLayoutAsideStyle,
  filesLayoutContentStyle,
  filesLayoutStyle,
} from "./styles.js";

export const FilesLayout = () => {
  const { driveId } = useParams();
  const narrow = useIsNarrow();
  const shell = useOutletContext<ShellContext | undefined>();
  const expectedFamilyCount = shell?.families.length ?? 0;
  const { drives, status, errorTextId, refresh } = useDrives(true, expectedFamilyCount);
  const switcher: DriveSwitcherProps = {
    drives,
    status,
    errorTextId,
    activeDriveId: toActiveDriveId(driveId, drives),
    onRetry: () => void refresh(),
  };

  return (
    <div style={filesLayoutStyle(narrow)} data-testid="files-layout">
      <div style={filesLayoutContentStyle}>
        <Outlet context={switcher} />
      </div>
      {!narrow && (
        <div style={filesLayoutAsideStyle}>
          <DriveSwitcher {...switcher} />
        </div>
      )}
    </div>
  );
};
