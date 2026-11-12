// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { CurrentUserId } from "@offgrid/http";
import type { CALENDAR_COLORS } from "@offgrid/contracts";
import type { EventBus } from "@offgrid/event-bus";

export interface CalendarSubscriberContext {
  readonly eventBus: EventBus;
  readonly db: ModuleDatabase;
}

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

export interface CalendarEventRecord {
  readonly eventId: string;
  readonly calendarId: string;
  readonly familyId: string | null;
  readonly userId: string | null;
  readonly title: string;
  readonly location: string | null;
  readonly description: string | null;
  readonly isAllDay: boolean;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly version: number;
}

export interface NewCalendarEvent {
  readonly eventId: string;
  readonly calendarId: string;
  readonly familyId?: string;
  readonly userId?: string;
  readonly title: string;
  readonly location: string | null;
  readonly description: string | null;
  readonly isAllDay: boolean;
  readonly startsAt: Date;
  readonly endsAt: Date;
}

export interface CalendarEventChanges {
  readonly title?: string;
  readonly location?: string | null;
  readonly description?: string | null;
  readonly calendarId?: string;
  readonly isAllDay?: boolean;
  readonly startsAt?: Date;
  readonly endsAt?: Date;
}

export type NewCalendarEventInput =
  | {
      readonly isAllDay: false;
      readonly title: string;
      readonly location?: string;
      readonly description?: string;
      readonly startsAt: string;
      readonly endsAt: string;
    }
  | {
      readonly isAllDay: true;
      readonly title: string;
      readonly location?: string;
      readonly description?: string;
      readonly startDate: string;
      readonly endDate: string;
    };
