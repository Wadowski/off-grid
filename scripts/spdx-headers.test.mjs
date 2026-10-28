// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// REUSE-IgnoreStart
import { addHeader, hasHeader } from "./spdx-headers.mjs";
// REUSE-IgnoreEnd

// REUSE-IgnoreStart
describe("spdx-headers", () => {
  it("detects an existing header within the first lines", () => {
    assert.equal(hasHeader("// SPDX-License-Identifier: FSL-1.1-ALv2\nexport {};\n"), true);
  });

  it("reports a file without a header", () => {
    assert.equal(hasHeader("export {};\n"), false);
  });

  it("prepends the header to a plain file", () => {
    const out = addHeader("export {};\n");
    assert.equal(
      out,
      [
        "// SPDX-FileCopyrightText: 2026 Dominik Wadowski",
        "// SPDX-License-Identifier: FSL-1.1-ALv2",
        "",
        "export {};",
        "",
      ].join("\n"),
    );
    assert.equal(hasHeader(out), true);
  });

  it("keeps a shebang on the first line", () => {
    const out = addHeader("#!/usr/bin/env node\nconsole.log(1);\n");
    assert.match(out, /^#!\/usr\/bin\/env node\n\/\/ SPDX-FileCopyrightText/);
  });
});
// REUSE-IgnoreEnd
