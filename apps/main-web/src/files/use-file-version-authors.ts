// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback } from "react";
import { useSession } from "../session/use-session.js";
import { toMemberName } from "./to-member-name.js";
import { useDrives } from "./use-drives.js";
import { useFamilyMembers } from "./use-family-members.js";
import type { FileEntry } from "./types.js";

export const useFileVersionAuthors = (
  driveId: FileEntry["driveId"],
): ((userId: string) => string | null) => {
  const drives = useDrives(true);
  const drive = drives.drives.find((listed) => listed.id === driveId) ?? null;
  const members = useFamilyMembers(drive?.familyId ?? null);
  const session = useSession();
  const viewer = session.status === "signedIn" ? session.user : null;
  return useCallback(
    (userId: string) => toMemberName(userId, members.members, viewer),
    [members.members, viewer],
  );
};
