// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildOpenApiDocument } from "./build-open-api-document.js";
import { filesErrorCodeSchema } from "./files-error-code-schema.js";
import { renderOpenApi } from "./render-open-api.js";

describe("buildOpenApiDocument", () => {
  it("publishes the shared HTTP schemas as components", () => {
    const document = buildOpenApiDocument();

    expect(document.openapi).toBe("3.1.0");
    expect(Object.keys(document.components.schemas).sort()).toEqual([
      "AccessGroupId",
      "AccountCreated",
      "AccountProfile",
      "ActiveFamily",
      "AdminUser",
      "AdminUserList",
      "Breadcrumb",
      "Calendar",
      "CalendarList",
      "ChangePasswordRequest",
      "CreateAccountRequest",
      "CreateCalendarEventRequest",
      "CreateCalendarRequest",
      "CreateCrossEntityLinkRequest",
      "CreateFamilyRequest",
      "CreateFolderRequest",
      "CreateUploadRequest",
      "CrossEntityLink",
      "CrossEntityLinkList",
      "Drive",
      "DriveList",
      "EmailCodeRequest",
      "ErrorResponse",
      "EventGuestList",
      "Family",
      "FamilyId",
      "FamilyList",
      "File",
      "FileDetails",
      "FileList",
      "FileListItem",
      "FileVersion",
      "FileVersionList",
      "FilesErrorCode",
      "InstanceSettings",
      "InstanceSettingsUpdate",
      "InviteEventGuestRequest",
      "MailSettings",
      "MailSettingsRequest",
      "MoveFileRequest",
      "MoveFileResult",
      "NotificationList",
      "NotificationsMarkAllRead",
      "PasswordConfirmationRequest",
      "PasswordRecoveryOptions",
      "PasswordRecoveryRequest",
      "PasswordResetIssued",
      "PasswordResetRequest",
      "RecoveryCodeIssued",
      "RegistrationStatus",
      "RenameFileRequest",
      "SelectActiveFamilyRequest",
      "SessionAccess",
      "SessionList",
      "SignInRequest",
      "SignedIn",
      "SystemUpdate",
      "SystemUpdateApplyResult",
      "SystemUpdateCheck",
      "SystemUpdateNightly",
      "SystemVersion",
      "Timestamp",
      "UpdateCalendarRequest",
      "UpdateProfileRequest",
      "Upload",
      "UploadLimit",
      "UserId",
    ]);
  });
});

describe("buildOpenApiDocument calendar paths", () => {
  it("publishes the calendar routes with their operation ids", () => {
    const { paths } = buildOpenApiDocument();

    expect(Object.keys(paths).sort()).toEqual([
      "/calendars",
      "/calendars/{id}",
      "/calendars/{id}/events",
      "/drives",
      "/drives/{id}/children",
      "/drives/{id}/files",
      "/drives/{id}/folders",
      "/drives/{id}/trash",
      "/events/{id}/guests",
      "/events/{id}/guests/{guestUserId}",
      "/files/upload-limit",
      "/files/{id}",
      "/files/{id}/children",
      "/files/{id}/content",
      "/files/{id}/move",
      "/files/{id}/restore",
      "/files/{id}/trash",
      "/files/{id}/versions",
      "/files/{id}/versions/{versionId}",
      "/files/{id}/versions/{versionId}/content",
      "/files/{id}/versions/{versionId}/restore",
      "/links",
      "/links/{id}",
      "/me/notifications",
      "/me/notifications/read-all",
      "/me/notifications/stream",
      "/me/notifications/{notificationId}/read",
      "/system/update",
      "/system/update/apply",
      "/system/update/check",
      "/system/update/nightly",
      "/system/updater/nightly",
      "/system/version",
      "/uploads",
      "/uploads/{id}",
    ]);
    expect(paths["/events/{id}/guests"].post.operationId).toBe("inviteEventGuest");
    expect(paths["/events/{id}/guests"].get.operationId).toBe("listEventGuests");
    expect(paths["/events/{id}/guests/{guestUserId}"].delete.operationId).toBe("removeEventGuest");
    expect(paths["/calendars/{id}/events"].post.operationId).toBe("createCalendarEvent");
    expect(paths["/calendars"].get.operationId).toBe("listCalendars");
    expect(paths["/calendars"].post.operationId).toBe("createCalendar");
    expect(paths["/calendars/{id}"].patch.operationId).toBe("updateCalendar");
    expect(paths["/calendars/{id}"].delete.operationId).toBe("removeCalendar");
    expect(paths["/me/notifications"].get.operationId).toBe("listNotifications");
    expect(
      paths["/me/notifications"].get.parameters.map(
        (parameter: { name: string }) => parameter.name,
      ),
    ).toEqual(["cursor", "limit", "category", "unread"]);
    expect(paths["/me/notifications/{notificationId}/read"].post.operationId).toBe(
      "markNotificationRead",
    );
    expect(paths["/me/notifications/read-all"].post.operationId).toBe("markAllNotificationsRead");
    expect(paths["/system/updater/nightly"].get.operationId).toBe("getSystemUpdaterNightly");
    expect(paths["/me/notifications/stream"].get.operationId).toBe("streamNotifications");
    expect(Object.keys(paths["/me/notifications/stream"].get.responses["200"].content)).toEqual([
      "text/event-stream",
    ]);
    expect(paths["/me/notifications/stream"].get.responses["401"]).toBeDefined();
  });
});

describe("renderOpenApi", () => {
  it("is deterministic", () => {
    expect(renderOpenApi()).toBe(renderOpenApi());
  });

  it("matches the committed openapi.json", () => {
    const committed = readFileSync(new URL("../openapi.json", import.meta.url), "utf8");

    expect(committed).toBe(renderOpenApi());
  });
});

describe("buildOpenApiDocument files error codes", () => {
  it("names only codes that filesErrorCodeSchema defines", () => {
    const { paths } = buildOpenApiDocument();
    const filesPaths = Object.fromEntries(
      Object.entries(paths).filter(([path]) => /^\/(drives|files|uploads)(\/|$)/.test(path)),
    );
    const codes = new Set(
      [...JSON.stringify(filesPaths).matchAll(/\b([A-Z][A-Z0-9_]+): /g)].map((match) => match[1]),
    );

    expect(codes.size).toBeGreaterThan(0);
    for (const code of codes) {
      expect(filesErrorCodeSchema.options).toContain(code);
    }
  });
});
