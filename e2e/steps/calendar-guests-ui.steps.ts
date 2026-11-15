// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  createGuestAccount,
  createTodayEvent,
  inviteGuestToEvent,
  joinFamilyAsGuest,
} from "../support/factories/calendar-event-details.js";
import { findEventIdByTitle } from "../support/factories/calendar-guest-ui.js";
import { eventsState } from "../support/factories/calendar-events.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { bearer, memberSessionOf } from "../support/family-sessions.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";
import { calendarIdOf } from "../support/world-calendar-id.js";

const { Given, When, Then } = createBdd(test);

const FEATURE = "calendar-guests-ui";
const CALENDAR_PATH = "/calendar";
const NEW_EVENT_PATH = "/calendar/event/new";
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const GUESTS_SECTION = "event-guests-section";

const pathOf = (page: Page): string => new URL(page.url()).pathname;

const modal = (page: Page): Locator => page.getByTestId("new-event-modal");

const detailsOf = (page: Page): Locator =>
  page.getByTestId("event-details-modal").or(page.getByTestId("event-details-page"));

const benOf = (world: ScenarioWorld) => {
  const guest = world.eventDetails?.guest;
  expect(guest, "Ben must join the family before this step").toBeDefined();
  return guest?.session.userId ?? "";
};

const eventDetailsOf = (world: ScenarioWorld) => {
  world.eventDetails ??= { eventIds: {} };
  return world.eventDetails;
};

const rememberEvent = (world: ScenarioWorld, title: string, id: string): void => {
  eventDetailsOf(world).eventIds[title] = id;
};

const openFromSidebar = async (page: Page): Promise<void> => {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(`${webBaseUrl()}${CALENDAR_PATH}`);
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await expect.poll(() => pathOf(page)).toBe(NEW_EVENT_PATH);
  await expect(modal(page)).toBeVisible();
};

const shownTimeZone = (page: Page): Promise<string> =>
  modal(page)
    .getByText("Time zone", { exact: true })
    .locator("xpath=following-sibling::*[1]")
    .innerText();

const todayIsoIn = (timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const fillTodayTimes = async (page: Page): Promise<void> => {
  const today = todayIsoIn(await shownTimeZone(page));
  await page.getByLabel("Start date", { exact: true }).fill(today);
  await page.getByLabel("Start time", { exact: true }).fill("09:00");
  await page.getByLabel("End date", { exact: true }).fill(today);
  await page.getByLabel("End time", { exact: true }).fill("10:00");
};

const fillNewEvent = async (
  page: Page,
  title: string,
  calendarName: string,
  guestId: string,
): Promise<void> => {
  await openFromSidebar(page);
  await page.getByLabel("Title", { exact: true }).fill(title);
  await modal(page).locator("select").selectOption({ label: calendarName });
  await fillTodayTimes(page);
  await page.getByTestId("guest-field-add").click();
  await page.getByTestId(`guest-option-${guestId}`).click();
};

const waitForNameOf = async (world: ScenarioWorld, userId: string): Promise<void> => {
  const familyId = world.families[0]?.id ?? "";
  await expect
    .poll(
      async () => {
        const response = await world.api.get(`/api/families/${familyId}/members`, {
          headers: bearer(memberSessionOf(world)),
        });
        const members = (await response.json()) as {
          members: { userId: string; displayName: string | null }[];
        };
        return members.members.find((member) => member.userId === userId)?.displayName ?? null;
      },
      { timeout: 15_000 },
    )
    .not.toBeNull();
};

const waitUntilInvitable = async (
  world: ScenarioWorld,
  calendarName: string,
  guestUserId: string,
): Promise<void> => {
  const owner = memberSessionOf(world);
  const scratchId = await createTodayEvent(
    world.api,
    owner,
    calendarIdOf(world, calendarName),
    "Invitation readiness",
    { hour: 20 },
  );
  await inviteGuestToEvent(world.api, owner, scratchId, guestUserId);
};

Given("Cara joins the family {string} as a guest", async ({ world }, familyName: string) => {
  const family = world.families.find((candidate) => candidate.name === familyName);
  expect(family, `the family "${familyName}" must be set up first`).toBeDefined();
  const cara = await createGuestAccount(world.api, "Cara");
  await joinFamilyAsGuest(world.api, memberSessionOf(world), family?.id ?? "", cara.session);
  eventsState(world).people.Cara = cara.session;
  await waitForNameOf(world, cara.session.userId);
});

Given(
  "I have a timed event named {string} on the calendar {string} with Ben as a guest",
  async ({ world }, title: string, calendarName: string) => {
    const owner = memberSessionOf(world);
    const id = await createTodayEvent(world.api, owner, calendarIdOf(world, calendarName), title);
    await inviteGuestToEvent(world.api, owner, id, benOf(world));
    rememberEvent(world, title, id);
  },
);

Given(
  "I have a timed event named {string} on the calendar {string} with Ben and Cara as guests",
  async ({ world }, title: string, calendarName: string) => {
    const owner = memberSessionOf(world);
    const cara = eventsState(world).people.Cara;
    expect(cara, "Cara must join the family before this step").toBeDefined();
    const id = await createTodayEvent(world.api, owner, calendarIdOf(world, calendarName), title);
    await inviteGuestToEvent(world.api, owner, id, benOf(world));
    await inviteGuestToEvent(world.api, owner, id, cara?.userId ?? "");
    rememberEvent(world, title, id);
  },
);

When(
  "I create a timed event named {string} on the calendar {string} inviting Ben from the new event modal",
  async ({ page, world }, title: string, calendarName: string) => {
    await waitForNameOf(world, benOf(world));
    await waitUntilInvitable(world, calendarName, benOf(world));
    await fillNewEvent(page, title, calendarName, benOf(world));
    await page.getByRole("button", { name: "Create Event", exact: true }).click();
    await expect.poll(() => pathOf(page)).toBe(CALENDAR_PATH);
    await expect(modal(page)).toHaveCount(0);
    rememberEvent(world, title, await savedIdOf(world, title, calendarName));
  },
);

When(
  "I create a timed event named {string} on the calendar {string} inviting Ben while the invite fails",
  async ({ page, world }, title: string, calendarName: string) => {
    await waitForNameOf(world, benOf(world));
    await page.route("**/api/events/*/guests", (route) =>
      route.fulfill({ status: 500, contentType: "text/plain", body: "" }),
    );
    await fillNewEvent(page, title, calendarName, benOf(world));
    await page.getByRole("button", { name: "Create Event", exact: true }).click();
    await expect(modal(page).getByRole("alert")).toBeVisible();
    rememberEvent(world, title, await savedIdOf(world, title, calendarName));
  },
);

const savedIdOf = async (
  world: ScenarioWorld,
  title: string,
  calendarName: string,
): Promise<string> => {
  let found: string | undefined;
  await expect
    .poll(async () => {
      found = await findEventIdByTitle(
        world.api,
        memberSessionOf(world),
        calendarIdOf(world, calendarName),
        title,
      );
      return found;
    })
    .toBeDefined();
  return found ?? "";
};

When("I open the edit form of the event", async ({ page }) => {
  await detailsOf(page).getByRole("button", { name: "Edit Event", exact: true }).click();
  await expect(modal(page)).toBeVisible();
});

Then("I see Ben selected as a guest", async ({ page, world }) => {
  await expect(modal(page).getByTestId(`guest-chip-${benOf(world)}`)).toBeVisible();
});

When("I remove Ben from the guests and save the event", async ({ page, world }) => {
  await modal(page)
    .getByTestId(`guest-chip-remove-${benOf(world)}`)
    .click();
  await modal(page).getByRole("button", { name: "Save", exact: true }).click();
  await expect(modal(page)).toHaveCount(0);
});

Then("I see the guests section without Ben", async ({ page, world }) => {
  await expect(detailsOf(page).getByTestId(`event-guest-${benOf(world)}`)).toHaveCount(0);
  await captureScreen(page, "details guests after removal", FEATURE);
});

Then("I see the guests section listing Ben", async ({ page, world }) => {
  await expect(detailsOf(page).getByTestId(GUESTS_SECTION)).toContainText("Ben");
  await expect(detailsOf(page).getByTestId(`event-guest-${benOf(world)}`)).toBeVisible();
  await captureScreen(page, "details guests for a guest", FEATURE);
});

Then("I see the guests section listing Cara", async ({ page, world }) => {
  const cara = eventsState(world).people.Cara;
  await expect(detailsOf(page).getByTestId(GUESTS_SECTION)).toContainText("Cara");
  await expect(detailsOf(page).getByTestId(`event-guest-${cara?.userId ?? ""}`)).toBeVisible();
});

When(
  "I choose the calendar {string} in the new event modal",
  async ({ page }, calendarName: string) => {
    await modal(page).locator("select").selectOption({ label: calendarName });
  },
);

Then(
  "I see the guest field is unavailable with the hint {string}",
  async ({ page }, hint: string) => {
    await expect(modal(page).getByText(hint, { exact: true })).toBeVisible();
    await expect(modal(page).getByTestId("guest-field-add")).toHaveCount(0);
  },
);

Then(
  "the event {string} is saved on the calendar {string}",
  async ({ world }, title: string, calendarName: string) => {
    await expect
      .poll(() =>
        findEventIdByTitle(
          world.api,
          memberSessionOf(world),
          calendarIdOf(world, calendarName),
          title,
        ),
      )
      .toBeDefined();
  },
);
