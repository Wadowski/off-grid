// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isHttpOrigin = (value: string): boolean => {
  try {
    const url = new URL(value);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    const isBareOrigin = url.pathname === "/" && url.search === "" && url.hash === "";
    return isHttp && isBareOrigin && !value.endsWith("/");
  } catch {
    return false;
  }
};
