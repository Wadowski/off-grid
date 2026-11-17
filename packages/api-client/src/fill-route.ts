// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const fillRoute = (route: string, params: Readonly<Record<string, string>>): string =>
  route.replace(/:([A-Za-z]+)/g, (_placeholder, name: string) =>
    encodeURIComponent(params[name] ?? ""),
  );
