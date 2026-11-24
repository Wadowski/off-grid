// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const NULL_BODY_STATUSES = [101, 103, 204, 205, 304];

export const xhrResponse = (request: XMLHttpRequest): Response => {
  const body = NULL_BODY_STATUSES.includes(request.status) ? null : request.responseText;
  return new Response(body, { status: request.status, statusText: request.statusText });
};
