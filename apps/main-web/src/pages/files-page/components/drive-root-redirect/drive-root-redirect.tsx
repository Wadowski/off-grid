// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Navigate, useParams } from "react-router-dom";
import { toFolderPath } from "../../../../files/to-folder-path.js";

// The route "/files/:driveId" always provides the drive id.
type DriveRootParams = { driveId: string };

export const DriveRootRedirect = () => {
  const { driveId } = useParams() as DriveRootParams;
  return <Navigate to={toFolderPath(driveId)} replace />;
};
