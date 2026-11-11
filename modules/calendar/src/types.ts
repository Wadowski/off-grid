// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { CurrentUserId } from "@offgrid/http";
import type { HandlerContext } from "@offgrid/event-bus";

export type SubscriberClient = HandlerContext["tx"];

export interface CalendarRecord {
  readonly calendarId: string;
  readonly name: string;
  readonly color: string;
  readonly familyId: string | null;
  readonly userId: string | null;
  readonly isDefault: boolean;
}

export type CalendarOutcome<Value> =
  { readonly outcome: "found"; readonly value: Value } | { readonly outcome: "not-found" };

export interface CalendarRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
}
