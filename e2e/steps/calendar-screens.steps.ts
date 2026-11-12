// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { blockingViolationDescriptions } from "../support/accessibility.js";
import { createCalendar, listCalendars } from "../support/factories/calendar.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { accountSessionOf, memberSessionOf } from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const CALENDARS_PATH = "/calendar";
const NEW_CALENDAR_PATH = "/calendar/new";
const NAME_PLACEHOLDER = "Enter a calendar name";
const CALENDAR_ROW = "calendar-row";
const SIDEBAR_ROW = "sidebar-calendar-row";

// Swatch colors as rendered by the browser (the family accent colors the API colors map to).
const RGB_BY_COLOR: Record<string, string> = {
  blue: "rgb(59, 111, 212)",
  teal: "rgb(15, 148, 136)",
  green: "rgb(63, 145, 66)",
  amber: "rgb(211, 138, 14)",
  rose: "rgb(201, 72, 138)",
  violet: "rgb(142, 77, 196)",
};

const colorOf = (color: string): string => {
  const rgb = RGB_BY_COLOR[color];
  if (rgb === undefined) {
    throw new Error(`Unknown calendar color: ${color}`);
  }
  return rgb;
};

const openCalendars = async (page: Page): Promise<void> => {
  await page.goto(`${webBaseUrl()}${CALENDARS_PATH}`);
  await expect(page.getByRole("heading", { name: "Calendars", exact: true })).toBeVisible();
};

const rowNamed = (page: Page, name: string) =>
  page.getByTestId(CALENDAR_ROW).filter({ hasText: name });

const sidebarRowNamed = (page: Page, name: string) =>
  page.getByTestId(SIDEBAR_ROW).filter({ hasText: name });

const fillName = async (page: Page, name: string): Promise<void> => {
  await page.getByPlaceholder(NAME_PLACEHOLDER).fill(name);
};

const pickColor = async (page: Page, color: string): Promise<void> => {
  await page.getByTestId(`calendar-color-${color}`).click();
};

const submitCalendarForm = async (page: Page): Promise<void> => {
  await page.getByTestId("calendar-submit").click();
};

const openEditScreenNamed = async (page: Page, name: string): Promise<void> => {
  await openCalendars(page);
  await rowNamed(page, name).click();
  await expect(page.getByRole("heading", { name: "Edit calendar", exact: true })).toBeVisible();
};

const calendarIdOf = (world: ScenarioWorld, name: string): string => {
  const id = world.calendarIds?.[name];
  if (id === undefined) {
    throw new Error(`No calendar named "${name}" was set up in this scenario.`);
  }
  return id;
};

Given(
  "I have a personal calendar named {string} with the color {string}",
  async ({ world }, name: string, color: string) => {
    const calendar = await createCalendar(world.api, memberSessionOf(world), { name, color });
    world.calendarIds = { ...world.calendarIds, [name]: calendar.id };
  },
);

When("I open the calendar from the navigation", async ({ page }) => {
  await page.goto(`${webBaseUrl()}/`);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Calendar" })
    .click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(CALENDARS_PATH);
});

Then("I see the calendars list", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Calendars", exact: true })).toBeVisible();
});

Then(
  "the sidebar lists {string} with a {string} color dot",
  async ({ page }, name: string, color: string) => {
    const row = sidebarRowNamed(page, name);
    await expect(row).toBeVisible();
    await expect(row.locator("span[aria-hidden='true']")).toHaveCSS(
      "background-color",
      colorOf(color),
    );
  },
);

When(
  "I create a personal calendar named {string} with the color {string} from the calendar screen",
  async ({ page }, name: string, color: string) => {
    await openCalendars(page);
    await page.getByTestId("calendars-new").click();
    await fillName(page, name);
    await pickColor(page, color);
    await submitCalendarForm(page);
    await expect.poll(() => new URL(page.url()).pathname).toBe(CALENDARS_PATH);
  },
);

Then("I see the calendars list with {string}", async ({ page }, name: string) => {
  await expect(rowNamed(page, name)).toBeVisible();
});

When(
  "I create a calendar named {string} for the family {string} from the calendar screen",
  async ({ page }, name: string, family: string) => {
    await openCalendars(page);
    await page.getByTestId("calendars-new").click();
    await fillName(page, name);
    await page.getByTestId("calendar-owner").selectOption({ label: family });
    await submitCalendarForm(page);
    await expect.poll(() => new URL(page.url()).pathname).toBe(CALENDARS_PATH);
  },
);

Then(
  "the calendars list shows {string} owned by {string}",
  async ({ page }, name: string, family: string) => {
    await expect(rowNamed(page, name)).toContainText(family);
  },
);

When("I try to create a calendar with an empty name", async ({ page }) => {
  await page.goto(`${webBaseUrl()}${NEW_CALENDAR_PATH}`);
  await submitCalendarForm(page);
});

When(
  "I rename the calendar {string} to {string} and change its color to {string} on the edit screen",
  async ({ page }, from: string, to: string, color: string) => {
    await openEditScreenNamed(page, from);
    await fillName(page, to);
    await pickColor(page, color);
    await submitCalendarForm(page);
    await expect.poll(() => new URL(page.url()).pathname).toBe(CALENDARS_PATH);
  },
);

When("I delete the calendar {string} after confirming", async ({ page }, name: string) => {
  await openEditScreenNamed(page, name);
  await page.getByTestId("calendar-delete").click();
  await page.getByTestId("calendar-delete-submit").click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(CALENDARS_PATH);
});

Then("I see the calendars list without {string}", async ({ page }, name: string) => {
  await expect(page.getByRole("heading", { name: "Calendars", exact: true })).toBeVisible();
  await expect(rowNamed(page, name)).toHaveCount(0);
});

Then("the sidebar does not list {string}", async ({ page }, name: string) => {
  await expect(sidebarRowNamed(page, name)).toHaveCount(0);
});

When(
  "I open the delete confirmation for the calendar {string} and cancel it",
  async ({ page }, name: string) => {
    await openEditScreenNamed(page, name);
    await page.getByTestId("calendar-delete").click();
    await page.getByTestId("calendar-delete-cancel").click();
    await expect(page.getByTestId("calendar-delete")).toBeVisible();
  },
);

Then("the calendar {string} is still listed", async ({ page }, name: string) => {
  await openCalendars(page);
  await expect(rowNamed(page, name)).toBeVisible();
});

When("I open the edit screen for my default calendar", async ({ page, world }) => {
  const calendars = await listCalendars(world.api, memberSessionOf(world));
  const defaultCalendar = calendars.find((calendar) => calendar.isDefault);
  if (defaultCalendar === undefined) {
    throw new Error("The person has no default calendar.");
  }
  await page.goto(`${webBaseUrl()}${CALENDARS_PATH}/${defaultCalendar.id}`);
  await expect(page.getByRole("heading", { name: "Edit calendar", exact: true })).toBeVisible();
});

Then("I do not see a delete button", async ({ page }) => {
  await expect(page.getByTestId("calendar-delete")).toHaveCount(0);
});

When("I open the edit screen for a calendar I cannot access", async ({ page, world }) => {
  const other = await accountSessionOf(world.api, "Ben Calendars");
  const created = await createCalendar(world.api, other.session, {
    name: "Ben's private calendar",
    color: "rose",
  });
  await page.goto(`${webBaseUrl()}${CALENDARS_PATH}/${created.id}`);
});

When("I open the calendars list at a phone width of 375 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openCalendars(page);
});

Then("the page has no horizontal scroll", async ({ page }) => {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

When(
  "I check the calendars list, the create calendar screen and the edit calendar screen for accessibility in light and dark theme",
  async ({ page, world }) => {
    const calendarId = calendarIdOf(world, "Studio");
    const screens = [CALENDARS_PATH, NEW_CALENDAR_PATH, `${CALENDARS_PATH}/${calendarId}`];
    const violations: string[] = [];
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      for (const screen of screens) {
        await page.goto(`${webBaseUrl()}${screen}`);
        await expect(page.getByRole("heading").first()).toBeVisible();
        violations.push(
          ...(await blockingViolationDescriptions(page)).map(
            (item) => `${scheme} ${screen}: ${item}`,
          ),
        );
      }
    }
    world.accessibilityViolations = violations;
  },
);

Then("no serious accessibility violations are found", ({ world }) => {
  expect(world.accessibilityViolations ?? ["not checked"]).toEqual([]);
});
