// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { runPostgresTool } from "./run-postgres-tool.js";

const fakeTool = (script: string): readonly string[] => ["-e", script];

describe("runPostgresTool", () => {
  it("puts the failing tool's stderr into the error", async () => {
    const failure = await runPostgresTool(
      process.execPath,
      fakeTool("process.stderr.write('pg_dump: error: connection refused'); process.exit(1)"),
      { PATH: process.env.PATH ?? "" },
    ).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).toContain("exited with code 1");
    expect((failure as Error).message).toContain("pg_dump: error: connection refused");
  });

  it("keeps only the last 2000 bytes of stderr", async () => {
    const failure = await runPostgresTool(
      process.execPath,
      fakeTool(
        "process.stderr.write('HEAD-MARK' + 'x'.repeat(5000) + 'TAIL-MARK'); process.exit(2)",
      ),
      { PATH: process.env.PATH ?? "" },
    ).catch((error: unknown) => error);

    const message = (failure as Error).message;
    expect(message).toContain("TAIL-MARK");
    expect(message).not.toContain("HEAD-MARK");
    expect(message.length).toBeLessThan(2100);
  });

  it("redacts the password from stderr", async () => {
    const failure = await runPostgresTool(
      process.execPath,
      fakeTool("process.stderr.write('password=migrator-secret-value rejected'); process.exit(1)"),
      { PATH: process.env.PATH ?? "", PGPASSWORD: "migrator-secret-value" },
    ).catch((error: unknown) => error);

    expect((failure as Error).message).toContain("password=[redacted] rejected");
    expect((failure as Error).message).not.toContain("migrator-secret-value");
  });
});
