// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { sendUploadXhr } from "./send-upload-xhr.js";

const FakeXMLHttpRequest = class {
  method = "";
  url = "";
  headers: Record<string, string> = {};
  withCredentials = false;
  status = 0;
  statusText = "";
  responseText = "";
  body: unknown = undefined;
  upload: { onprogress: ((event: { loaded: number; total: number }) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;

  constructor() {
    requests.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  send(body: unknown) {
    this.body = body;
  }

  abort() {
    this.onabort?.();
  }
};

const requests: InstanceType<typeof FakeXMLHttpRequest>[] = [];

const lastRequest = () => {
  const request = requests.at(-1);
  if (request === undefined) {
    throw new Error("No request was opened.");
  }
  return request;
};

const BLOB = new Blob(["hello"], { type: "text/plain" });

describe("sendUploadXhr", () => {
  afterEach(() => {
    requests.length = 0;
    vi.unstubAllGlobals();
  });

  it("opens a POST with the headers, credentials and body", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);

    const pending = sendUploadXhr("http://localhost/api/drives/1/files", {
      method: "POST",
      headers: { authorization: "Bearer token", "x-offgrid-file-name": "a.txt" },
      body: BLOB,
    });
    const request = lastRequest();
    request.status = 201;
    request.responseText = '{"id":"1"}';
    request.onload?.();

    const response = await pending;
    expect(request.method).toBe("POST");
    expect(request.url).toBe("http://localhost/api/drives/1/files");
    expect(request.headers).toEqual({
      authorization: "Bearer token",
      "x-offgrid-file-name": "a.txt",
    });
    expect(request.withCredentials).toBe(true);
    expect(request.body).toBe(BLOB);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: "1" });
  });

  it("reports the upload progress as loaded and total bytes", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);
    const onProgress = vi.fn();

    void sendUploadXhr("http://localhost/api/x", {
      method: "POST",
      headers: {},
      body: BLOB,
      onProgress,
    });
    lastRequest().upload.onprogress?.({ loaded: 2, total: 5 });

    expect(onProgress).toHaveBeenCalledWith(2, 5);
  });

  it("aborts the request when the signal fires and rejects with an abort error", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);
    const controller = new AbortController();

    const pending = sendUploadXhr("http://localhost/api/x", {
      method: "POST",
      headers: {},
      body: BLOB,
      signal: controller.signal,
    });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("rejects without opening a request when the signal is already aborted", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);
    const controller = new AbortController();
    controller.abort();

    await expect(
      sendUploadXhr("http://localhost/api/x", {
        method: "POST",
        headers: {},
        body: BLOB,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(requests).toHaveLength(0);
  });

  it("rejects on a network error", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);

    const pending = sendUploadXhr("http://localhost/api/x", {
      method: "POST",
      headers: {},
      body: BLOB,
    });
    lastRequest().onerror?.();

    await expect(pending).rejects.toThrow(TypeError);
  });

  it("returns an error status as a response", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);

    const pending = sendUploadXhr("http://localhost/api/x", {
      method: "POST",
      headers: {},
      body: BLOB,
    });
    const request = lastRequest();
    request.status = 413;
    request.statusText = "Payload Too Large";
    request.responseText = '{"code":"PAYLOAD_TOO_LARGE","message":"Too big."}';
    request.onload?.();

    const response = await pending;
    expect(response.status).toBe(413);
    expect(response.ok).toBe(false);
  });
});
