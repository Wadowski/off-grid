// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import { createNotificationHubProvider } from "./create-notification-hub-provider.js";

const loggerStub = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(),
  }) as unknown as Logger;

describe("createNotificationHubProvider", () => {
  it("returns one shared hub for every caller", () => {
    const provide = createNotificationHubProvider(10);

    expect(provide(loggerStub())).toBe(provide(loggerStub()));
  });

  it("builds a separate hub for each provider", () => {
    const first = createNotificationHubProvider(10)(loggerStub());
    const second = createNotificationHubProvider(10)(loggerStub());

    expect(first).not.toBe(second);
  });
});
