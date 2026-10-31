// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { API_PROXY_TARGET, API_PATH } from "./src/constants.js";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      [API_PATH]: { target: API_PROXY_TARGET, changeOrigin: false },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
