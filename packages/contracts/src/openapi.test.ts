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
      "AdminUser",
      "AdminUserList",
      "ChangePasswordRequest",
      "CreateAccountRequest",
      "CreateFamilyRequest",
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
      "PasswordResetIssued",
      "PasswordResetRequest",
      "RecoveryCodeIssued",
      "RegistrationStatus",
      "SessionAccess",
      "SessionList",
      "SignInRequest",
      "SignedIn",
      "Timestamp",
      "UpdateProfileRequest",
      "UserId",
    ]);
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
