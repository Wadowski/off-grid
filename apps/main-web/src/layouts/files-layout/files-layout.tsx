// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet } from "react-router-dom";
import { filesLayoutStyle } from "./styles.js";

export const FilesLayout = () => (
  <div style={filesLayoutStyle} data-testid="files-layout">
    <Outlet />
  </div>
);
