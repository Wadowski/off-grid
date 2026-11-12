// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class SubscriptionHalted extends Error {
  constructor(subscriber: string, sequence: number, cause: unknown) {
    super(`subscriber "${subscriber}" is halted at event ${sequence}`, { cause });
    this.name = "SubscriptionHalted";
  }
}
