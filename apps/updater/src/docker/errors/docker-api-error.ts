// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class DockerApiError extends Error {
  constructor(operation: string, status: number) {
    super(`docker ${operation} failed with status ${status}`);
    this.name = "DockerApiError";
  }
}
