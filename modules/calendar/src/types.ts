// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { CurrentUserId } from "@offgrid/http";
import type { CALENDAR_COLORS } from "@offgrid/contracts";
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

export type CalendarColor = (typeof CALENDAR_COLORS)[number];

export interface NewCalendarInput {
  readonly name: string;
  readonly color: CalendarColor;
  readonly familyId?: string;
}

export interface NewCalendar {
  readonly calendarId: string;
  readonly familyId?: string;
  readonly userId?: string;
  readonly name: string;
  readonly color: CalendarColor;
}

export interface CalendarChangeInput {
  readonly name?: string;
  readonly color?: CalendarColor;
}

export type RemoveCalendarOutcome =
  | { readonly outcome: "found"; readonly value: CalendarRecord }
  | { readonly outcome: "not-found" }
  | { readonly outcome: "default-calendar" };

export interface MembershipChange {
  readonly familyId: string;
  readonly userId: string;
  readonly sourceVersion: number;
  readonly isMember: boolean;
}
