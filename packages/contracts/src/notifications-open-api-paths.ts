// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { notificationListQuerySchema } from "./notification-list-query-schema.js";
import { uuidSchema } from "./uuid-schema.js";

const jsonContent = (schemaName: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } },
});

const errorResponse = (description: string) => ({
  description,
  content: jsonContent("ErrorResponse"),
});

const unauthenticated = errorResponse("UNAUTHENTICATED: the request has no signed-in person.");

const notFound = errorResponse(
  "NOT_FOUND: the notification does not exist or it is not the signed-in person's.",
);

const validationFailed = errorResponse(
  "VALIDATION_FAILED: a query value does not match the request schema (including an unknown category or an unread value other than true), or the cursor is not one the server issued.",
);

const listQueryParameters = [
  {
    name: "cursor",
    in: "query",
    required: false,
    description:
      "The cursor from the previous page's nextCursor. Omit it for the first page. It is opaque.",
    schema: z.toJSONSchema(notificationListQuerySchema.shape.cursor.unwrap()),
  },
  {
    name: "limit",
    in: "query",
    required: false,
    description: "The number of notifications per page.",
    schema: z.toJSONSchema(notificationListQuerySchema.shape.limit),
  },
  {
    name: "category",
    in: "query",
    required: false,
    description:
      "Only the notifications of this category. Omit it to list every category. Filters combine with unread.",
    schema: z.toJSONSchema(notificationListQuerySchema.shape.category.unwrap()),
  },
  {
    name: "unread",
    in: "query",
    required: false,
    description:
      "Set to true to list only unread notifications. Other values are rejected. The unreadCount field always counts the whole inbox.",
    schema: z.toJSONSchema(notificationListQuerySchema.shape.unread.unwrap()),
  },
];

const notificationIdParameter = {
  name: "notificationId",
  in: "path",
  required: true,
  schema: z.toJSONSchema(uuidSchema),
};

export const notificationsOpenApiPaths = {
  "/me/notifications": {
    get: {
      operationId: "listNotifications",
      summary:
        "List the signed-in person's notifications, newest first, one page at a time. total counts the notifications that match the filters; unreadCount counts the whole inbox.",
      parameters: listQueryParameters,
      responses: {
        "200": {
          description: "One page of notifications.",
          content: jsonContent("NotificationList"),
        },
        "400": validationFailed,
        "401": unauthenticated,
      },
    },
  },
  "/me/notifications/{notificationId}/read": {
    post: {
      operationId: "markNotificationRead",
      summary: "Mark one of the signed-in person's notifications as read",
      parameters: [notificationIdParameter],
      responses: {
        "204": {
          description: "The notification is marked read. Re-marking keeps the first read time.",
        },
        "401": unauthenticated,
        "404": notFound,
      },
    },
  },
};
