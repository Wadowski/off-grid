// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Outlet } from "react-router-dom";
import {
  authCardStyle,
  authLayoutFooterStyle,
  authLayoutMainStyle,
  authLayoutStyle,
} from "./styles.js";

export const AuthLayout = () => (
  <div style={authLayoutStyle}>
    <main style={authLayoutMainStyle}>
      <Text variant="brand" textId="appName" />
      <section style={authCardStyle}>
        <Outlet />
      </section>
    </main>
    <footer style={authLayoutFooterStyle}>
      <Text variant="status" textId="authLayout.footer" />
    </footer>
  </div>
);
