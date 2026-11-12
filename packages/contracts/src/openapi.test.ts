// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildOpenApiDocument } from "./build-open-api-document.js";
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
      "Calendar",
      "CalendarList",
      "ChangePasswordRequest",
      "CreateAccountRequest",
      "CreateCalendarRequest",
      "CreateFamilyRequest",
      "EmailCodeRequest",
      "ErrorResponse",
      "Family",
      "FamilyId",
      "FamilyList",
      "InstanceSettings",
      "InstanceSettingsUpdate",
      "MailSettings",
      "MailSettingsRequest",
      "NotificationList",
      "PasswordConfirmationRequest",
      "PasswordRecoveryOptions",
      "PasswordRecoveryRequest",
      "PasswordResetIssued",
      "PasswordResetRequest",
      "RecoveryCodeIssued",
      "RegistrationStatus",
      "SelectActiveFamilyRequest",
      "SessionAccess",
      "SessionList",
      "SignInRequest",
      "SignedIn",
      "Timestamp",
      "UpdateCalendarRequest",
      "UpdateProfileRequest",
      "UserId",
    ]);
  });
});

describe("buildOpenApiDocument calendar paths", () => {
  it("publishes the calendar routes with their operation ids", () => {
    const { paths } = buildOpenApiDocument();

    expect(Object.keys(paths).sort()).toEqual(["/calendars", "/calendars/{id}"]);
    expect(paths["/calendars"].get.operationId).toBe("listCalendars");
    expect(paths["/calendars"].post.operationId).toBe("createCalendar");
    expect(paths["/calendars/{id}"].patch.operationId).toBe("updateCalendar");
    expect(paths["/calendars/{id}"].delete.operationId).toBe("removeCalendar");
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
