// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

export const AppShell = () => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: tokens.font.family.base,
        background: "var(--og-color-bg)",
        color: "var(--og-color-fg)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space[4],
          padding: tokens.space[4],
          background: "var(--og-color-surface)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: tokens.font.weight.semibold,
            fontSize: tokens.font.size.lg,
          }}
        >
          {t("appName")}
        </p>
        <nav aria-label={t("appName")} data-testid="app-nav">
          <p style={{ margin: 0, fontSize: tokens.font.size.sm }}>{t("navPlaceholder")}</p>
        </nav>
      </header>
      <main style={{ maxWidth: "40rem", margin: "0 auto", padding: tokens.space[5] }}>
        <Outlet />
      </main>
    </div>
  );
};
