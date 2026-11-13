// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarParamsSchema } from "./calendar-params-schema.js";
import { calendarEventParamsSchema } from "./calendar-event-params-schema.js";

const jsonContent = (schemaName: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } },
});

const errorResponse = (description: string) => ({
  description,
  content: jsonContent("ErrorResponse"),
});

const calendarIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: z.toJSONSchema(calendarParamsSchema.shape.id),
};

const eventIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: z.toJSONSchema(calendarEventParamsSchema.shape.id),
};

const unauthenticated = errorResponse("UNAUTHENTICATED: the request has no signed-in person.");

export const calendarOpenApiPaths = {
  "/calendars": {
    get: {
      operationId: "listCalendars",
      summary: "List the calendars the signed-in person can access",
      responses: {
        "200": {
          description: "The calendars the person can access.",
          content: jsonContent("CalendarList"),
        },
        "401": unauthenticated,
      },
    },
    post: {
      operationId: "createCalendar",
      summary: "Create a calendar",
      requestBody: { required: true, content: jsonContent("CreateCalendarRequest") },
      responses: {
        "201": { description: "The created calendar.", content: jsonContent("Calendar") },
        "400": errorResponse("VALIDATION_FAILED: the body does not match the request schema."),
        "401": unauthenticated,
        "404": errorResponse("NOT_FOUND: the family does not exist or the person is not in it."),
      },
    },
  },
  "/calendars/{id}": {
    patch: {
      operationId: "updateCalendar",
      summary: "Change the name or color of a calendar",
      parameters: [calendarIdParameter],
      requestBody: { required: true, content: jsonContent("UpdateCalendarRequest") },
      responses: {
        "200": { description: "The updated calendar.", content: jsonContent("Calendar") },
        "400": errorResponse("VALIDATION_FAILED: the id or body does not match the schema."),
        "401": unauthenticated,
        "404": errorResponse("NOT_FOUND: the calendar does not exist."),
      },
    },
    delete: {
      operationId: "removeCalendar",
      summary: "Delete a calendar",
      parameters: [calendarIdParameter],
      responses: {
        "204": { description: "The calendar was deleted." },
        "400": errorResponse("VALIDATION_FAILED: the id does not match the schema."),
        "401": unauthenticated,
        "403": errorResponse("ACCESS_DENIED: the person may not access this calendar."),
        "404": errorResponse("NOT_FOUND: the calendar does not exist."),
        "409": errorResponse("DEFAULT_CALENDAR: the default calendar cannot be deleted."),
      },
    },
  },
  "/events/{id}/guests": {
    post: {
      operationId: "inviteEventGuest",
      summary: "Invite a family member to an event the signed-in person hosts",
      parameters: [eventIdParameter],
      requestBody: { required: true, content: jsonContent("InviteEventGuestRequest") },
      responses: {
        "200": { description: "The guest was already invited. Nothing changed." },
        "201": { description: "The guest was invited." },
        "400": errorResponse(
          "VALIDATION_FAILED: the body is invalid, the guest is the host, shares no family with the host, or the event belongs to a family.",
        ),
        "401": unauthenticated,
        "403": errorResponse("FORBIDDEN: a guest of the event may not invite others."),
        "404": errorResponse("NOT_FOUND: the event does not exist or the person cannot see it."),
      },
    },
  },
} as const;
