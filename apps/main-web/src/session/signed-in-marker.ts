// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const SIGNED_IN_KEY = "offgrid.signedIn";
const SIGNED_IN_VALUE = "1";

export const markSignedIn = (): void => {
  try {
    sessionStorage.setItem(SIGNED_IN_KEY, SIGNED_IN_VALUE);
  } catch {
    return;
  }
};

export const wasSignedIn = (): boolean => {
  try {
    return sessionStorage.getItem(SIGNED_IN_KEY) === SIGNED_IN_VALUE;
  } catch {
    return false;
  }
};

export const forgetSignedIn = (): void => {
  try {
    sessionStorage.removeItem(SIGNED_IN_KEY);
  } catch {
    return;
  }
};
