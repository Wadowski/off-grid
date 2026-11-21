// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type InstallHostKind = "with-docker" | "without-docker" | "not-linux";

export type InstallRunResult = {
  exitCode: number;
  output: string;
};

export type InstallWorld = {
  project: string;
  containerName: string;
  lastRun?: InstallRunResult;
  secretsBefore?: string;
  owner?: InstallOwner;
};

export type InstallOwner = {
  email: string;
  password: string;
};
