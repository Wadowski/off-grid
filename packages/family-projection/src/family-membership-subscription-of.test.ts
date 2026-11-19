// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { familyMembershipSubscriptionOf } from "./family-membership-subscription-of.js";

describe("familyMembershipSubscriptionOf", () => {
  it("names the subscriber after its module and runs it as that module", () => {
    const subscription = familyMembershipSubscriptionOf("files");

    expect(subscription.name).toBe("files-family-membership");
    expect(subscription.runAs).toBe("files");
    expect(subscription.onFailure).toBe("halt");
  });

  it("delivers the joined and removed events", () => {
    expect(familyMembershipSubscriptionOf("calendar").events).toEqual([
      familyMemberAddedV1,
      familyMemberRemovedV1,
    ]);
  });
});
