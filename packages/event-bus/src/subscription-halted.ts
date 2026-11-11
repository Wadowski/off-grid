// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// Thrown when a "halt" subscriber gives up on an event. The batch rolls back, so the
// cursor stays before that event and the next pass tries it again.
export class SubscriptionHalted extends Error {
  constructor(subscriber: string, sequence: number, cause: unknown) {
    super(`subscriber "${subscriber}" is halted at event ${sequence}`, { cause });
    this.name = "SubscriptionHalted";
  }
}
