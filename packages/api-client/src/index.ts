// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export { ApiError } from "./api-error.js";
export { createAdminClient } from "./admin-client.js";
export { createAuthClient } from "./auth-client.js";
export { createCalendarClient } from "./calendar-client.js";
export { createFilesClient } from "./files-client.js";
export { createNotificationsClient } from "./notifications-client.js";
export { subscribeNotifications } from "./subscribe-notifications.js";
export { createRelationsClient } from "./relations-client.js";
export { createSystemClient } from "./system-client.js";
export { createFamilyClient } from "./family-client.js";
export { createApiClient } from "./create-api-client.js";
export { sendUploadXhr } from "./send-upload-xhr.js";
export type {
  FileContentOptions,
  Notification,
  NotificationListOptions,
  SignInInput,
  SubscribeNotificationsOptions,
  UploadFileInput,
  UploadProgressHandler,
  UploadTransport,
} from "./types.js";
export type { components, paths } from "./generated/schema.js";
