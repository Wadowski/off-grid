// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { FOLDER_LOADING_PLACEHOLDER_COUNT } from "./constants.js";
import { LoadingPlaceholder } from "./components/loading-placeholder/loading-placeholder.js";
import { folderLoadingStyleFor } from "./styles.js";
import type { FolderLoadingProps } from "./types.js";

export const FolderLoading = ({ layout }: FolderLoadingProps) => {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("files.folder.loading")}
      style={folderLoadingStyleFor(layout)}
      data-testid="files-folder-loading"
    >
      {Array.from({ length: FOLDER_LOADING_PLACEHOLDER_COUNT[layout] }, (_, index) => (
        <LoadingPlaceholder key={index} layout={layout} />
      ))}
    </div>
  );
};
