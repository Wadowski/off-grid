// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createAbortError } from "./create-abort-error.js";
import { xhrResponse } from "./xhr-response.js";
import type { UploadTransport } from "./types.js";

export const sendUploadXhr: UploadTransport = (url, init) =>
  new Promise<Response>((resolve, reject) => {
    if (init.signal?.aborted === true) {
      reject(createAbortError());
      return;
    }
    const request = new XMLHttpRequest();
    request.open(init.method, url);
    request.withCredentials = true;
    for (const [name, value] of Object.entries(init.headers)) {
      request.setRequestHeader(name, value);
    }
    request.upload.onprogress = (event) => {
      init.onProgress?.(event.loaded, event.total);
    };
    request.onload = () => resolve(xhrResponse(request));
    request.onerror = () => reject(new TypeError("The upload failed because the network failed."));
    request.onabort = () => reject(createAbortError());
    init.signal?.addEventListener("abort", () => request.abort(), { once: true });
    request.send(init.body);
  });
