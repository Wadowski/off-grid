// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  createCalendarWithColor,
  createGuestAccount,
  createTodayEvent,
  inviteGuestToEvent,
  joinFamilyAsGuest,
} from "../support/factories/calendar-event-details.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { memberSessionOf } from "../support/family-sessions.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";
import { calendarIdOf } from "../support/world-calendar-id.js";
import { signInThroughUi } from "../support/web-session.js";

const { Given, When, Then } = createBdd(test);

const FEATURE = "calendar-event-details";
const VIEWS_FEATURE = "calendar-views";
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const PHONE_VIEWPORT = { width: 390, height: 844 };
const AGENDA_PATH = "/calendar/agenda";
const DAY_PATH = "/calendar/day";
const WEEK_PATH = "/calendar/week";
const MONTH_PATH = "/calendar/month";
const EVENT_PREFIX = "/calendar/event/";
const MISSING_EVENT_ID = "3b8a6f2e-1c4d-4e7a-9b5f-0a1b2c3d4e5f";

const pathOf = (page: Page): string => new URL(page.url()).pathname;

const detailsOf = (page: Page): Locator =>
  page.getByTestId("event-details-modal").or(page.getByTestId("event-details-page"));

const eventIdOf = (world: ScenarioWorld, title: string): string => {
  const id = world.eventDetails?.eventIds[title];
  if (id === undefined) {
    throw new Error(`The event "${title}" was not set up in this scenario.`);
  }
  return id;
};

const rememberEvent = (world: ScenarioWorld, title: string, id: string): void => {
  world.eventDetails = {
    ...world.eventDetails,
    eventIds: { ...world.eventDetails?.eventIds, [title]: id },
  };
};

const openAt = async (page: Page, path: string, viewport = DESKTOP_VIEWPORT): Promise<void> => {
  await page.setViewportSize(viewport);
  await page.goto(`${webBaseUrl()}${path}`);
};

type CalendarVisit = {
  readonly name: string;
  readonly viewport: { readonly width: number; readonly height: number };
  readonly path: string;
  readonly card: (id: string) => Locator;
};

const agendaCardOf = (page: Page, id: string): Locator => page.getByTestId(`agenda-event-${id}`);

const openFromAgenda = async (page: Page, id: string): Promise<void> => {
  await expect(agendaCardOf(page, id)).toBeVisible();
  await agendaCardOf(page, id).click();
  await expect.poll(() => pathOf(page)).toBe(`${EVENT_PREFIX}${id}`);
};

const clearBrowserSession = async (page: Page): Promise<void> => {
  await page.context().clearCookies();
  await page.goto(`${webBaseUrl()}/sign-in`);
  await page.evaluate(() => globalThis.localStorage?.clear());
};

Given(
  "the family has a calendar named {string} with the color {string}",
  async ({ world }, name: string, color: string) => {
    const family = world.families[0];
    expect(family, "the family must be set up first").toBeDefined();
    const id = await createCalendarWithColor(world.api, memberSessionOf(world), {
      name,
      color,
      familyId: family?.id,
    });
    world.calendarIds = { ...world.calendarIds, [name]: id };
  },
);

Given(
  "I have a timed event named {string} on the calendar {string}",
  async ({ world }, title: string, calendarName: string) => {
    const id = await createTodayEvent(
      world.api,
      memberSessionOf(world),
      calendarIdOf(world, calendarName),
      title,
    );
    rememberEvent(world, title, id);
  },
);

Given(
  "I have a 30-minute timed event named {string} on the calendar {string}",
  async ({ world }, title: string, calendarName: string) => {
    const id = await createTodayEvent(
      world.api,
      memberSessionOf(world),
      calendarIdOf(world, calendarName),
      title,
      { hour: 14, minutes: 30 },
    );
    rememberEvent(world, title, id);
  },
);

Given(
  "the family has a timed event named {string} on the calendar {string}",
  async ({ world }, title: string, calendarName: string) => {
    const id = await createTodayEvent(
      world.api,
      memberSessionOf(world),
      calendarIdOf(world, calendarName),
      title,
    );
    rememberEvent(world, title, id);
  },
);

Given("Ben joins the family {string} as a guest", async ({ world }, familyName: string) => {
  const family = world.families.find((candidate) => candidate.name === familyName);
  expect(family, `the family "${familyName}" must be set up first`).toBeDefined();
  const guest = await createGuestAccount(world.api, "Ben");
  await joinFamilyAsGuest(world.api, memberSessionOf(world), family?.id ?? "", guest.session);
  world.eventDetails = {
    ...world.eventDetails,
    guest,
    eventIds: world.eventDetails?.eventIds ?? {},
  };
});

Given(
  "Ben is invited as a guest to a timed event named {string} on the calendar {string}",
  async ({ world }, title: string, calendarName: string) => {
    const owner = memberSessionOf(world);
    const guest = world.eventDetails?.guest;
    expect(guest, "Ben must join the family before he is invited").toBeDefined();
    const id = await createTodayEvent(world.api, owner, calendarIdOf(world, calendarName), title);
    await inviteGuestToEvent(world.api, owner, id, guest?.session.userId ?? "");
    rememberEvent(world, title, id);
  },
);

Given("I sign in as Ben", async ({ page, world }) => {
  const guest = world.eventDetails?.guest;
  expect(guest, "Ben must be set up in this scenario").toBeDefined();
  await clearBrowserSession(page);
  await signInThroughUi(page, guest?.account ?? { email: "", password: "", displayName: "Ben" });
});

When("I open the event {string} from the agenda", async ({ page, world }, title: string) => {
  await openAt(page, AGENDA_PATH);
  await openFromAgenda(page, eventIdOf(world, title));
});

When(
  "I open the event {string} from the agenda on a desktop",
  async ({ page, world }, title: string) => {
    await openAt(page, AGENDA_PATH);
    await openFromAgenda(page, eventIdOf(world, title));
  },
);

When(
  "I open the event {string} from the agenda on a phone",
  async ({ page, world }, title: string) => {
    await openAt(page, AGENDA_PATH, PHONE_VIEWPORT);
    await openFromAgenda(page, eventIdOf(world, title));
  },
);

When("I open the event {string} from the day view", async ({ page, world }, title: string) => {
  const id = eventIdOf(world, title);
  await openAt(page, DAY_PATH);
  await page.getByTestId(`timeline-event-${id}`).click();
  await expect.poll(() => pathOf(page)).toBe(`${EVENT_PREFIX}${id}`);
});

When("I open the event {string} from the week view", async ({ page, world }, title: string) => {
  const id = eventIdOf(world, title);
  await openAt(page, WEEK_PATH);
  await page.getByTestId(`week-event-${id}`).first().click();
  await expect.poll(() => pathOf(page)).toBe(`${EVENT_PREFIX}${id}`);
});

When("I open the event {string} from the month view", async ({ page, world }, title: string) => {
  const id = eventIdOf(world, title);
  await openAt(page, MONTH_PATH);
  await page.getByTestId(`month-event-chip-${id}`).click();
  await expect.poll(() => pathOf(page)).toBe(`${EVENT_PREFIX}${id}`);
});

When("I open an event that no longer exists", async ({ page }) => {
  await openAt(page, `${EVENT_PREFIX}${MISSING_EVENT_ID}`);
});

When("I change the title of the event to {string}", async ({ page, world }, title: string) => {
  const id = pathOf(page).split("/").pop() ?? "";
  await detailsOf(page).getByRole("button", { name: "Edit Event", exact: true }).click();
  const form = page.getByTestId("new-event-modal");
  await expect(form).toBeVisible();
  await form.getByLabel("Title", { exact: true }).fill(title);
  await form.getByRole("button", { name: "Save", exact: true }).click();
  await expect(form).toHaveCount(0);
  rememberEvent(world, title, id);
});

When("I set the end time before the start time", async ({ page }) => {
  await detailsOf(page).getByRole("button", { name: "Edit Event", exact: true }).click();
  const form = page.getByTestId("new-event-modal");
  await expect(form).toBeVisible();
  await form.getByLabel("End time", { exact: true }).fill("00:01");
  await form.getByRole("button", { name: "Save", exact: true }).click();
});

When("I delete the event after confirming", async ({ page }) => {
  await detailsOf(page).getByRole("button", { name: "Delete event", exact: true }).click();
  const confirm = page.getByTestId("delete-event-confirm");
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Delete event", exact: true }).click();
  await expect.poll(() => pathOf(page)).toBe(AGENDA_PATH);
  await expect(page.getByRole("group", { name: "Calendar view", exact: true })).toBeVisible();
  await expect(page.getByText("Loading events", { exact: true })).toHaveCount(0);
});

When("I cancel the delete confirmation", async ({ page }) => {
  await detailsOf(page).getByRole("button", { name: "Delete event", exact: true }).click();
  const confirm = page.getByTestId("delete-event-confirm");
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(confirm).toHaveCount(0);
});

When("I close the event details", async ({ page }) => {
  const back = page.getByRole("button", { name: "Back", exact: true });
  if (await back.isVisible()) {
    await back.click();
  } else {
    await detailsOf(page).getByRole("button", { name: "Close", exact: true }).click();
  }
  await expect.poll(() => pathOf(page).startsWith(EVENT_PREFIX)).toBe(false);
});

When("I look at the calendar in every view", async ({ page, world }) => {
  const ids = ["Studio review", "Quick sync"].map((title) => eventIdOf(world, title));
  const visits: CalendarVisit[] = [
    {
      name: "day",
      viewport: DESKTOP_VIEWPORT,
      path: DAY_PATH,
      card: (id) => page.getByTestId(`timeline-event-${id}`),
    },
    {
      name: "week",
      viewport: DESKTOP_VIEWPORT,
      path: WEEK_PATH,
      card: (id) => page.getByTestId(`week-event-${id}`).first(),
    },
    {
      name: "month",
      viewport: DESKTOP_VIEWPORT,
      path: MONTH_PATH,
      card: (id) => page.getByTestId(`month-event-chip-${id}`),
    },
    {
      name: "agenda phone",
      viewport: PHONE_VIEWPORT,
      path: AGENDA_PATH,
      card: (id) => page.getByTestId(`agenda-event-${id}`),
    },
    {
      name: "week phone",
      viewport: PHONE_VIEWPORT,
      path: WEEK_PATH,
      card: (id) => page.getByTestId(`week-event-${id}`).first(),
    },
    {
      name: "agenda",
      viewport: DESKTOP_VIEWPORT,
      path: AGENDA_PATH,
      card: (id) => page.getByTestId(`agenda-event-${id}`),
    },
  ];
  for (const visit of visits) {
    await openAt(page, visit.path, visit.viewport);
    for (const id of ids) {
      await expect(visit.card(id)).toBeVisible();
    }
    await captureScreen(page, `${visit.name} event cards`, VIEWS_FEATURE);
  }
});

Then("I see the details of the event {string}", async ({ page, world }, title: string) => {
  const id = eventIdOf(world, title);
  await expect.poll(() => pathOf(page)).toBe(`${EVENT_PREFIX}${id}`);
  await expect(detailsOf(page).getByText(title, { exact: true })).toBeVisible();
  await captureScreen(page, `details ${title}`, FEATURE);
});

Then("I see the read-only line for the event", async ({ page }) => {
  await expect(detailsOf(page).getByRole("note")).toBeVisible();
});

Then("I see no edit or delete control for the event", async ({ page }) => {
  await expect(
    detailsOf(page).getByRole("button", { name: "Edit Event", exact: true }),
  ).toHaveCount(0);
  await expect(
    detailsOf(page).getByRole("button", { name: "Delete event", exact: true }),
  ).toHaveCount(0);
});

Then("I see the event details as a dialog over the calendar", async ({ page }) => {
  await expect(page.getByTestId("event-details-modal")).toBeVisible();
  await expect(
    page
      .getByRole("group", { name: "Calendar view", exact: true })
      .getByRole("button", { name: "Agenda", exact: true }),
  ).toBeVisible();
  await captureScreen(page, "details dialog", FEATURE);
});

Then("I see the event details at phone width without horizontal scroll", async ({ page }) => {
  await expect(page.getByTestId("event-details-page")).toBeVisible();
  expect(await page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")).toBe(
    true,
  );
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await captureScreen(page, "details page", FEATURE);
});
