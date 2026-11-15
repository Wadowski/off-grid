// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { createTodayEvent } from "../support/factories/calendar-event-details.js";
import { changeEvent } from "../support/factories/calendar-events.js";
import { memberSessionOf } from "../support/family-sessions.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";
import { calendarIdOf } from "../support/world-calendar-id.js";

const { Given, When, Then } = createBdd(test);

const FEATURE = "calendar-event-reminders";
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const PHONE_VIEWPORT = { width: 375, height: 812 };
const CALENDAR_PATH = "/calendar";
const AGENDA_PATH = "/calendar/agenda";
const NEW_EVENT_PATH = "/calendar/event/new";
const UNITS = ["minute", "hour", "day", "week"] as const;

const pathOf = (page: Page): string => new URL(page.url()).pathname;

const newEventModal = (page: Page): Locator => page.getByTestId("new-event-modal");

const detailsOf = (page: Page): Locator =>
  page.getByTestId("event-details-modal").or(page.getByTestId("event-details-page"));

const unitOf = (word: string): string => {
  const unit = UNITS.find((candidate) => candidate === word.replace(/s$/, ""));
  if (unit === undefined) {
    throw new Error(`"${word}" is not a reminder unit.`);
  }
  return unit;
};

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

const openNewEventModal = async (page: Page, viewport = DESKTOP_VIEWPORT): Promise<void> => {
  await page.setViewportSize(viewport);
  await page.goto(`${webBaseUrl()}${NEW_EVENT_PATH}`);
  await expect(newEventModal(page)).toBeVisible();
};

const addReminder = async (
  scope: Locator,
  index: number,
  reminder: { amount: number; word: string },
): Promise<void> => {
  await scope.getByTestId("reminder-add").click();
  await scope.getByTestId(`reminder-amount-${index}`).fill(String(reminder.amount));
  await scope.getByTestId(`reminder-unit-${index}`).selectOption(unitOf(reminder.word));
};

const setReminder = async (
  scope: Locator,
  index: number,
  reminder: { amount: number; word: string },
): Promise<void> => {
  await scope.getByTestId(`reminder-amount-${index}`).fill(String(reminder.amount));
  await scope.getByTestId(`reminder-unit-${index}`).selectOption(unitOf(reminder.word));
};

const shownReminders = async (scope: Locator): Promise<string[]> => {
  const rows = await scope.locator('[data-testid^="reminder-row-"]').all();
  const shown: string[] = [];
  for (const row of rows) {
    const amount = await row.locator('[data-testid^="reminder-amount-"]').inputValue();
    const unit = await row.locator('[data-testid^="reminder-unit-"] option:checked').textContent();
    shown.push(`${amount} ${unit ?? ""}`);
  }
  return shown;
};

const saveNewEvent = async (page: Page): Promise<void> => {
  await newEventModal(page).getByRole("button", { name: "Create Event", exact: true }).click();
};

const createEventWithReminder = async (
  page: Page,
  title: string,
  reminder: { amount: number; word: string },
): Promise<void> => {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(`${webBaseUrl()}${CALENDAR_PATH}`);
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await expect(newEventModal(page)).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill(title);
  await addReminder(newEventModal(page), 0, reminder);
};

const editEventModal = async (page: Page): Promise<Locator> => {
  await detailsOf(page).getByRole("button", { name: "Edit Event", exact: true }).click();
  const form = newEventModal(page);
  await expect(form).toBeVisible();
  return form;
};

const saveEditedEvent = async (form: Locator): Promise<void> => {
  await form.getByRole("button", { name: "Save", exact: true }).click();
  await expect(form).toHaveCount(0);
};

Given(
  "I have a timed event named {string} on the calendar {string} with a reminder of {int} minutes",
  async ({ world }, title: string, calendarName: string, minutes: number) => {
    const owner = memberSessionOf(world);
    const id = await createTodayEvent(world.api, owner, calendarIdOf(world, calendarName), title);
    const response = await changeEvent(world.api, owner, id, {
      reminderOffsetsMinutes: [minutes],
    });
    expect(response.status(), `could not set the reminder of "${title}"`).toBe(200);
    rememberEvent(world, title, id);
  },
);

Given(
  "I have a reminder of {int} minutes on the event {string}",
  async ({ world }, minutes: number, title: string) => {
    const response = await changeEvent(world.api, memberSessionOf(world), eventIdOf(world, title), {
      reminderOffsetsMinutes: [minutes],
    });
    expect(response.status(), `could not set the reminder of "${title}"`).toBe(200);
  },
);

Given(
  "Ben has a reminder of {int} minutes on the event {string}",
  async ({ world }, minutes: number, title: string) => {
    const guest = world.eventDetails?.guest;
    if (guest === undefined) {
      throw new Error("Ben must be set up in this scenario.");
    }
    const response = await changeEvent(world.api, guest.session, eventIdOf(world, title), {
      reminderOffsetsMinutes: [minutes],
    });
    expect(response.status(), `could not set Ben's reminder of "${title}"`).toBe(200);
  },
);

When(
  "I create an event named {string} with a reminder of {int} {word}",
  async ({ page }, title: string, amount: number, word: string) => {
    await createEventWithReminder(page, title, { amount, word });
    await saveNewEvent(page);
    await expect.poll(() => pathOf(page)).toBe(CALENDAR_PATH);
    await expect(newEventModal(page)).toHaveCount(0);
  },
);

When("I open the event {string} for editing from the agenda", async ({ page }, title: string) => {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(`${webBaseUrl()}${AGENDA_PATH}`);
  await page.getByText(title, { exact: true }).first().click();
  await editEventModal(page);
});

When(
  "I change the reminder of the event to {int} {word}",
  async ({ page }, amount: number, word: string) => {
    const form = await editEventModal(page);
    await setReminder(form, 0, { amount, word });
    await saveEditedEvent(form);
  },
);

When("I remove the reminder of the event", async ({ page }) => {
  const form = await editEventModal(page);
  await form.getByTestId("reminder-remove-0").click();
  await saveEditedEvent(form);
});

When("I open the new event modal and add {int} reminders", async ({ page }, count: number) => {
  await openNewEventModal(page);
  for (let index = 0; index < count; index += 1) {
    await newEventModal(page).getByTestId("reminder-add").click();
  }
});

When(
  "I try to save an event named {string} with reminders of {int} {word} and {int} {word}",
  async (
    { page },
    title: string,
    firstAmount: number,
    firstWord: string,
    secondAmount: number,
    secondWord: string,
  ) => {
    await openNewEventModal(page);
    await page.getByLabel("Title", { exact: true }).fill(title);
    await addReminder(newEventModal(page), 0, { amount: firstAmount, word: firstWord });
    await addReminder(newEventModal(page), 1, { amount: secondAmount, word: secondWord });
    await saveNewEvent(page);
  },
);

When(
  "I try to save an event named {string} with a reminder of {int} {word}",
  async ({ page }, title: string, amount: number, word: string) => {
    await openNewEventModal(page);
    await page.getByLabel("Title", { exact: true }).fill(title);
    await addReminder(newEventModal(page), 0, { amount, word });
    await saveNewEvent(page);
  },
);

When(
  "I save a reminder of {int} {word} from the event details",
  async ({ page }, amount: number, word: string) => {
    const details = detailsOf(page);
    await addReminder(details, 0, { amount, word });
    const save = details.getByTestId("guest-reminders-save");
    await save.click();
    await expect(save).toBeDisabled();
    await expect(details.getByRole("alert")).toHaveCount(0);
  },
);

When("I open the new event modal on a phone and add a reminder", async ({ page }) => {
  await openNewEventModal(page, PHONE_VIEWPORT);
  await newEventModal(page).getByTestId("reminder-add").click();
});

Then("I see the reminder {string} in the event form", async ({ page }, reminder: string) => {
  await expect.poll(() => shownReminders(newEventModal(page))).toContain(reminder);
});

Then("I do not see the reminder {string} in the event form", async ({ page }, reminder: string) => {
  await expect(newEventModal(page).getByTestId("reminder-add")).toBeVisible();
  expect(await shownReminders(newEventModal(page))).not.toContain(reminder);
});

Then("I see no reminders in the event form", async ({ page }) => {
  await expect(newEventModal(page).getByTestId("reminder-add")).toBeVisible();
  await expect.poll(() => shownReminders(newEventModal(page))).toEqual([]);
});

Then("I see the reminder {string} in the event details", async ({ page }, reminder: string) => {
  await expect.poll(() => shownReminders(detailsOf(page))).toContain(reminder);
});

Then("I cannot add another reminder", async ({ page }) => {
  await expect(newEventModal(page).getByTestId("reminder-add")).toBeDisabled();
  await expect(newEventModal(page).getByTestId("reminder-row-4")).toBeVisible();
  await expect(newEventModal(page).getByTestId("reminder-row-5")).toHaveCount(0);
});

Then("I see the reminder controls at phone width without horizontal scroll", async ({ page }) => {
  await expect(page.getByTestId("reminder-group")).toBeVisible();
  expect(await page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")).toBe(
    true,
  );
  await captureScreen(page, "new event reminders", FEATURE);
});
