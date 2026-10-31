// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import type { FallbackProps } from "react-error-boundary";
import { errorFallbackStyle } from "./styles.js";

export const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => (
  <div role="alert" data-testid="error-fallback" style={errorFallbackStyle}>
    <Text variant="error" textId="errors.unexpected" />
    <Button onClick={resetErrorBoundary}>
      <Text variant="action" textId="errors.retry" />
    </Button>
  </div>
);
