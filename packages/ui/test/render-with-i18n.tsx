// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render } from "@testing-library/react";
import i18next from "i18next";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";

const i18n = i18next.createInstance();
await i18n.init({
  lng: "en",
  resources: {
    en: {
      translation: {
        files: {
          kind: {
            folder: "Folder",
            image: "Image",
            document: "Document",
            spreadsheet: "Spreadsheet",
            pdf: "PDF",
            archive: "Archive",
            audio: "Audio",
            video: "Video",
            generic: "File",
          },
          itemCount_one: "{{count}} item",
          itemCount_other: "{{count}} items",
          date: { today: "Today {{time}}", yesterday: "Yesterday" },
          list: { label: "Folder contents" },
          table: { name: "Name", modified: "Modified", size: "Size", type: "Type" },
        },
      },
    },
  },
});

export const renderWithI18n = (element: ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
