// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SignInInput } from "@offgrid/api-client";
import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { ServerUnreachableError } from "./server-unreachable-error.js";

export const requestSignIn = async (input: SignInInput) => {
  try {
    return await anonymousAuthClient.signIn(input);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ServerUnreachableError();
    }
    throw error;
  }
};
