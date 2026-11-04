// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Outlet } from "react-router-dom";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { LanguageLabel } from "./components/language-label/language-label.js";
import {
  authLayoutStyle,
  backdropStyle,
  blobPrimaryStyle,
  blobSecondaryStyle,
  brandMarkStyle,
  cardStyle,
  footerStyle,
  glassOverlayStyle,
  glassTintStyle,
  headerRowStyle,
  headerStyle,
  mainStyle,
} from "./styles.js";

export const AuthLayout = () => {
  const narrow = useIsNarrow();

  return (
    <div style={authLayoutStyle}>
      {!narrow && (
        <div aria-hidden="true" style={backdropStyle}>
          <div style={blobPrimaryStyle} />
          <div style={blobSecondaryStyle} />
          <div style={glassOverlayStyle}>
            <div style={glassTintStyle} />
          </div>
        </div>
      )}
      <header style={headerStyle(narrow)}>
        <div style={headerRowStyle}>
          <div style={brandMarkStyle}>
            <MaterialIcon name="deployed_code" size="18px" color="var(--og-color-primary)" filled />
          </div>
          <Text variant="brand" textId="appName" />
        </div>
        {narrow && <LanguageLabel />}
      </header>
      <main style={mainStyle(narrow)}>
        <section style={cardStyle(narrow)}>
          <Outlet />
        </section>
      </main>
      <footer style={footerStyle(narrow)}>
        {!narrow && <LanguageLabel />}
        <Text variant="status" textId="authLayout.footer" />
      </footer>
    </div>
  );
};
