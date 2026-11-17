// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { signedInPerson, type SignedInPerson } from "../support/factories/notifications.js";
import { listCalendars } from "../support/factories/calendar.js";
import { eventually } from "../support/eventually.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import {
  bearer,
  joinFamilyWithInvitation,
  leaveFamily,
  memberSessionOf,
} from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";
import { signInThroughUi } from "../support/web-session.js";

const { Given, When, Then } = createBdd(test);

const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const AGENDA_PATH = "/calendar";
const DAY_PATH = "/calendar/day";
const WEEK_PATH = "/calendar/week";
const MONTH_PATH = "/calendar/month";
const SIDEBAR = "calendar-sidebar";
const DOT_BACKGROUND_BY_COLOR: Record<string, string> = {
  teal: "rgb(15, 148, 136)",
  rose: "rgb(201, 72, 138)",
};

const familyNamed = (world: ScenarioWorld, name: string): { id: string; name: string } => {
  const family = world.families.find((created) => created.name === name);
  if (family === undefined) {
    throw new Error(`The family "${name}" was not set up in this scenario.`);
  }
  return family;
};

const personNamed = (world: ScenarioWorld, displayName: string): SignedInPerson => {
  const person = world.people?.[displayName];
  if (person === undefined) {
    throw new Error(`The family member "${displayName}" was not set up in this scenario.`);
  }
  return person;
};

const dotBackgroundOf = (color: string): string => {
  const background = DOT_BACKGROUND_BY_COLOR[color];
  if (background === undefined) {
    throw new Error(`The sidebar colour "${color}" has no expected background in this scenario.`);
  }
  return background;
};

const openAt = async (
  page: Page,
  path: string,
  viewport: { width: number; height: number },
): Promise<void> => {
  await page.setViewportSize(viewport);
  await page.goto(`${webBaseUrl()}${path}`);
};

const sidebarRowNamed = (page: Page, name: string) =>
  page.getByTestId(SIDEBAR).getByRole("listitem").filter({ hasText: name });

const sidebarCheckboxNamed = (page: Page, name: string) =>
  page.getByTestId(SIDEBAR).getByRole("checkbox", { name, exact: true });

const expectTitleVisible = async (page: Page, title: string): Promise<void> => {
  await expect(page.getByText(title).first()).toBeVisible();
};

When("I open the agenda at a desktop width of 1280 pixels", async ({ page }) => {
  await openAt(page, AGENDA_PATH, DESKTOP_VIEWPORT);
});

Then(
  "the sidebar shows {string} with the color {string}",
  async ({ page }, name: string, color: string) => {
    const row = sidebarRowNamed(page, name);
    await expect(row).toBeVisible();
    await expect(row.locator("span[aria-hidden='true']").first()).toHaveCSS(
      "background-color",
      dotBackgroundOf(color),
    );
  },
);

When(
  "I look at the event {string} in the day, week and month views at a desktop width of 1280 pixels",
  async ({ page }, title: string) => {
    for (const path of [DAY_PATH, WEEK_PATH, MONTH_PATH]) {
      await openAt(page, path, DESKTOP_VIEWPORT);
      await expectTitleVisible(page, title);
    }
  },
);

Given(
  "a family member named {string} with a family of their own joins {string}",
  async ({ world }, displayName: string, familyName: string) => {
    const family = familyNamed(world, familyName);
    const person = await signedInPerson(world.api, displayName);
    const ownFamily = await world.api.post("/api/families", {
      headers: bearer(person.session),
      data: { name: `${displayName}'s family` },
      failOnStatusCode: false,
    });
    expect(ownFamily.status(), `${displayName} could not create a family`).toBe(201);
    await joinFamilyWithInvitation(world.api, memberSessionOf(world), person.session, family.id);
    world.people = { ...world.people, [displayName]: person };
  },
);

When("I sign in as the family member {string}", async ({ page, world }, displayName: string) => {
  const person = personNamed(world, displayName);
  await page.context().clearCookies();
  await signInThroughUi(page, {
    email: person.email,
    password: person.password,
    displayName,
  });
});

When(
  "the family member {string} leaves {string}",
  async ({ world }, displayName: string, familyName: string) => {
    await leaveFamily(
      world.api,
      personNamed(world, displayName).session,
      familyNamed(world, familyName).id,
    );
  },
);

Then("I do not see {string} in the calendar sidebar", async ({ page }, name: string) => {
  await expect(page.getByRole("heading", { name: "Calendar", exact: true })).toBeVisible();
  await expect(sidebarCheckboxNamed(page, name)).toHaveCount(0);
});

Then(
  "the family member {string} eventually sees the calendar {string}",
  async ({ world }, displayName: string, calendarName: string) => {
    const person = personNamed(world, displayName);
    await eventually(
      async () => {
        const calendars = await listCalendars(world.api, person.session);
        expect(calendars.map((calendar) => calendar.name)).toContain(calendarName);
      },
      { timeout: 15_000, interval: 250 },
    );
  },
);

Then(
  "the family member {string} eventually stops seeing the calendar {string}",
  async ({ world }, displayName: string, calendarName: string) => {
    const person = personNamed(world, displayName);
    await eventually(
      async () => {
        const calendars = await listCalendars(world.api, person.session);
        expect(calendars.map((calendar) => calendar.name)).not.toContain(calendarName);
      },
      { timeout: 15_000, interval: 250 },
    );
  },
);
