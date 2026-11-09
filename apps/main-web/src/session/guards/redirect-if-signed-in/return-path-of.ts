// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const SAME_ORIGIN_PATH = /^\/(?!\/)/;
const SIGN_IN_PATH = "/sign-in";
const HOME_PATH = "/";

export const returnPathOf = (routeState: unknown): string => {
  const from =
    typeof routeState === "object" && routeState !== null && "from" in routeState
      ? routeState.from
      : undefined;
  if (typeof from !== "string" || !SAME_ORIGIN_PATH.test(from) || from.startsWith(SIGN_IN_PATH)) {
    return HOME_PATH;
  }
  return from;
};
