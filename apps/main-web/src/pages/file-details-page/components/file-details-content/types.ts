import type { Drive, FileDetailsScreenState } from "../../../../files/types.js";

export type FileDetailsContentProps = {
  readonly driveId: Drive["id"];
  readonly screen: FileDetailsScreenState;
};
