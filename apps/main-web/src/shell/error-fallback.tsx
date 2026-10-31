// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button } from "@offgrid/ui";
import type { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

export const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation();

  return (
    <div role="alert" data-testid="error-fallback" style={{ padding: "1rem" }}>
      <p>{t("errors.unexpected")}</p>
      <Button onClick={resetErrorBoundary}>{t("errors.retry")}</Button>
    </div>
  );
};
