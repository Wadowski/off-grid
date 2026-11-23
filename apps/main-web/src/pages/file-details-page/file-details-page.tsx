import { driveIdSchema, fileIdSchema } from "@offgrid/contracts";
import { useParams } from "react-router-dom";
import { FileNotFound } from "../../errors/file-not-found/file-not-found.js";
import { useFileDetailsScreen } from "../../files/use-file-details-screen.js";
import { FileDetailsContent } from "./components/file-details-content/file-details-content.js";
import { FileDetailsFrame } from "./components/file-details-frame/file-details-frame.js";

export const FileDetailsPage = () => {
  const { driveId: rawDriveId, fileId: rawFileId } = useParams();
  const driveId = driveIdSchema.safeParse(rawDriveId).data ?? null;
  const fileId = fileIdSchema.safeParse(rawFileId).data ?? null;
  const screen = useFileDetailsScreen(driveId, fileId);

  if (driveId === null || fileId === null) {
    return (
      <FileDetailsFrame backTarget={null}>
        <FileNotFound />
      </FileDetailsFrame>
    );
  }
  return <FileDetailsContent driveId={driveId} screen={screen} />;
};
