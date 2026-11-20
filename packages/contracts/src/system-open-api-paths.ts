// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const jsonContent = (schemaName: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${schemaName}` } },
});

const errorResponse = (description: string) => ({
  description,
  content: jsonContent("ErrorResponse"),
});

const unauthenticated = errorResponse("UNAUTHENTICATED: the request has no signed-in person.");

const accessDenied = errorResponse("ACCESS_DENIED: the signed-in person is not an instance admin.");

const updaterUnavailable = errorResponse(
  "UPDATER_UNAVAILABLE: the updater is not configured, is unreachable or did not answer in time.",
);

const releaseSourceUnreachable = errorResponse(
  "RELEASE_SOURCE_UNREACHABLE: the updater could not read the release source. UPDATER_ERROR: the updater answered with something this server cannot use.",
);

const currentVersionUnknown = errorResponse(
  "CURRENT_VERSION_UNKNOWN: the running version is not a release version, so updates cannot be checked.",
);

const validationFailed = errorResponse(
  "VALIDATION_FAILED: the request body does not match the request schema.",
);

export const systemOpenApiPaths = {
  "/system/version": {
    get: {
      operationId: "getSystemVersion",
      responses: {
        "200": { description: "", content: jsonContent("SystemVersion") },
      },
    },
  },
  "/system/update": {
    get: {
      operationId: "getSystemUpdate",
      responses: {
        "200": {
          description:
            "The running version, the last check, the last update run and the nightly setting. No outbound call is made.",
          content: jsonContent("SystemUpdate"),
        },
        "401": unauthenticated,
        "403": accessDenied,
      },
    },
  },
  "/system/update/check": {
    post: {
      operationId: "checkSystemUpdate",
      responses: {
        "200": {
          description: "The result of a fresh check against the release source, now stored.",
          content: jsonContent("SystemUpdateCheck"),
        },
        "401": unauthenticated,
        "403": accessDenied,
        "409": currentVersionUnknown,
        "502": releaseSourceUnreachable,
        "503": updaterUnavailable,
      },
    },
  },
  "/system/update/apply": {
    post: {
      operationId: "applySystemUpdate",
      responses: {
        "202": {
          description: "The update run has started.",
          content: jsonContent("SystemUpdateApplyResult"),
        },
        "401": unauthenticated,
        "403": accessDenied,
        "409": errorResponse(
          "NO_UPDATE_AVAILABLE: no newer release exists. UPDATE_NOT_ALLOWED: the running version is below the minimum this release accepts. UPDATE_ALREADY_RUNNING: an update run is active. CURRENT_VERSION_UNKNOWN: the running version is not a release version.",
        ),
        "502": releaseSourceUnreachable,
        "503": updaterUnavailable,
      },
    },
  },
  "/system/update/nightly": {
    put: {
      operationId: "setSystemUpdateNightly",
      requestBody: { required: true, content: jsonContent("SystemUpdateNightly") },
      responses: {
        "200": {
          description: "The stored nightly setting.",
          content: jsonContent("SystemUpdateNightly"),
        },
        "400": validationFailed,
        "401": unauthenticated,
        "403": accessDenied,
      },
    },
  },
  "/system/updater/nightly": {
    get: {
      operationId: "getSystemUpdaterNightly",
      description:
        "Read by the updater with the shared updater bearer token, never by a browser or a signed-in person. The token is compared in constant time.",
      responses: {
        "200": {
          description: "The stored nightly setting.",
          content: jsonContent("SystemUpdateNightly"),
        },
        "401": errorResponse("UNAUTHENTICATED: the bearer token is missing or wrong."),
        "503": updaterUnavailable,
      },
    },
  },
};
