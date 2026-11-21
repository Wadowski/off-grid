// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FakeReleaseSourceOptions = {
  directory: string;
  certificate: string;
  key: string;
  port: number;
};

export type FakeReleaseSource = {
  port: number;
  close: () => Promise<void>;
};

export type ReleaseResponse = {
  status: number;
  contentType: string;
  body: string | Buffer;
};

export type ReleaseRoute =
  | { kind: "latest-release" }
  | { kind: "tagged-release"; version: string }
  | { kind: "asset"; assetId: number }
  | { kind: "latest-download"; fileName: string }
  | { kind: "versioned-download"; version: string; fileName: string };

export type ReleaseRequestLogEntry = {
  method: string;
  path: string;
  host: string;
  status: number;
};

export type ReleaseService = "server" | "web" | "updater";

export type ReleaseSourcePreparation = {
  directory: string;
  registryPort: string;
};

export type PushedImages = Record<ReleaseService, string>;

export type ReleaseVersionPlan = {
  version: string;
  failsHealthCheck: boolean;
};

export type ReleaseTestReply = {
  status: number;
  text: string;
};
