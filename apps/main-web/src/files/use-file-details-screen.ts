// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useDrives } from "./use-drives.js";
import { useFamilyMembers } from "./use-family-members.js";
import { useFileDetails } from "./use-file-details.js";
import { useFileVersions } from "./use-file-versions.js";
import { useSession } from "../session/use-session.js";
import type { Drive, FileEntry, FileDetailsScreenState } from "./types.js";

export const useFileDetailsScreen = (
  driveId: Drive["id"] | null,
  fileId: FileEntry["id"] | null,
): FileDetailsScreenState => {
  const details = useFileDetails(fileId, fileId !== null);
  const drives = useDrives(driveId !== null);
  const session = useSession();
  const readyFileId =
    details.status === "ready" && details.file !== null && !details.file.isFolder
      ? details.file.id
      : null;
  const versions = useFileVersions(readyFileId, readyFileId !== null);
  const drive = drives.drives.find((listed) => listed.id === driveId) ?? null;
  const members = useFamilyMembers(drive?.familyId ?? null);
  const viewer = session.status === "signedIn" ? session.user : null;

  return {
    details,
    versions,
    drive,
    drivesStatus: drives.status,
    members: members.members,
    membersStatus: members.status,
    refreshMembers: members.refresh,
    viewer,
  };
};
