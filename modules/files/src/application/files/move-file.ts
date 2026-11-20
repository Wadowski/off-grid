// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import { readAsUser } from "../read-as-user.js";
import { writeAsUser } from "../write-as-user.js";
import type { FilesOutcome, MoveFileInput, MoveOutcome } from "../../types.js";
import { InvalidMoveError } from "../errors/invalid-move-error.js";
import { moveAcrossOwners } from "./move-across-owners.js";
import { moveWithinDrive } from "./move-within-drive.js";
import { readMovePlan } from "./read-move-plan.js";

export const moveFile = async (
  db: ModuleDatabase,
  storage: FileStorage,
  userId: string,
  fileId: string,
  input: MoveFileInput,
): Promise<FilesOutcome<MoveOutcome>> => {
  const planned = await readAsUser(db, userId, (tx) => readMovePlan(tx, fileId, input));
  if (planned.outcome === "not-found") {
    return planned;
  }
  const plan = planned.value;
  if (plan.kind === "no-op") {
    return { outcome: "found", value: { file: plan.file, crossOwnerNotice: false } };
  }
  if (plan.kind === "same-drive") {
    const moved = await writeAsUser(db, userId, async (tx) => {
      const fresh = await readMovePlan(tx, fileId, input);
      if (fresh.outcome === "not-found") {
        return null;
      }
      if (fresh.value.kind === "same-drive") {
        return moveWithinDrive(tx, fresh.value);
      }
      if (fresh.value.kind === "no-op") {
        return fresh.value.file;
      }
      throw new InvalidMoveError();
    });
    return moved === null
      ? { outcome: "not-found" }
      : { outcome: "found", value: { file: moved, crossOwnerNotice: false } };
  }
  const moved = await moveAcrossOwners(db, storage, userId, plan);
  return { outcome: "found", value: { file: moved, crossOwnerNotice: true } };
};
