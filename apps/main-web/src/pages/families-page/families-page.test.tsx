// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../app.js";
import { DEFAULT_DEV_USER_ID, DEV_IDENTITY_USER_HEADER } from "../../constants.js";
import type { FakeResponse } from "./types.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CREATED_AT = "2026-10-31T10:00:00.000Z";

const jsonResponse = ({ status, body }: FakeResponse): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const stubApi = (responses: readonly FakeResponse[]) => {
  const queue = [...responses];
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async () => {
      const next = queue.shift();
      if (next === undefined) {
        throw new Error("Unexpected request");
      }
      return jsonResponse(next);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const fillName = (value: string) => {
  fireEvent.change(screen.getByLabelText("Family name"), { target: { value } });
};

const submitForm = () => {
  fireEvent.click(screen.getByTestId("create-family-submit"));
};

describe("Families page", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the empty state when the caller has no families", async () => {
    stubApi([{ status: 200, body: { families: [] } }]);

    render(<App />);

    expect(await screen.findByTestId("family-list-empty")).toHaveTextContent(
      "You are not in any family yet.",
    );
  });

  it("shows an alert when the family list cannot be loaded", async () => {
    stubApi([{ status: 500, body: { code: "INTERNAL", message: "Internal server error" } }]);

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your families could not be loaded.",
    );
  });

  it("shows an inline error and sends nothing when the name is blank", async () => {
    const fetchMock = stubApi([{ status: 200, body: { families: [] } }]);
    render(<App />);
    await screen.findByTestId("family-list-empty");

    fillName("   ");
    submitForm();

    expect(await screen.findByText("Enter a family name.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("creates a family and shows it in the list from one refetch", async () => {
    const fetchMock = stubApi([
      { status: 200, body: { families: [] } },
      { status: 201, body: { id: FAMILY_ID, name: "Lakeside", createdAt: CREATED_AT } },
      { status: 200, body: { families: [{ id: FAMILY_ID, name: "Lakeside" }] } },
    ]);
    render(<App />);
    await screen.findByTestId("family-list-empty");

    fillName("Lakeside");
    submitForm();

    expect(await screen.findByTestId("family-list-item")).toHaveTextContent("Lakeside");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [, postCall] = fetchMock.mock.calls;
    expect(new URL(String(postCall?.[0])).pathname).toBe("/api/families");
    expect(postCall?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ name: "Lakeside" }),
    });
    expect(new Headers(postCall?.[1]?.headers).get(DEV_IDENTITY_USER_HEADER)).toBe(
      DEFAULT_DEV_USER_ID,
    );
  });

  it("shows a failure message when the family cannot be created", async () => {
    stubApi([
      { status: 200, body: { families: [] } },
      { status: 401, body: { code: "UNAUTHENTICATED", message: "Sign in required." } },
    ]);
    render(<App />);
    await screen.findByTestId("family-list-empty");

    fillName("Lakeside");
    submitForm();

    expect(
      await screen.findByText("The family could not be created. Try again."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Family name")).toHaveValue("Lakeside");
  });
});
