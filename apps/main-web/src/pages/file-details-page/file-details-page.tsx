// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema, fileIdSchema } from "@offgrid/contracts";
import { useParams } from "react-router-dom";
import { useFileDetails } from "../../files/use-file-details.js";
import { FileDetailsContent } from "./components/file-details-content/file-details-content.js";
import { FileDetailsFrame } from "./components/file-details-frame/file-details-frame.js";
import { FileNotFound } from "../../errors/file-not-found/file-not-found.js";

export const FileDetailsPage = () => {
  const { driveId: rawDriveId, fileId: rawFileId } = useParams();
  const driveId = driveIdSchema.safeParse(rawDriveId).data ?? null;
  const fileId = fileIdSchema.safeParse(rawFileId).data ?? null;
  const details = useFileDetails(fileId, driveId !== null && fileId !== null);

  if (driveId === null || fileId === null) {
    return (
      <FileDetailsFrame backTarget={null}>
        <FileNotFound />
      </FileDetailsFrame>
    );
  }
  return <FileDetailsContent driveId={driveId} details={details} />;
};
