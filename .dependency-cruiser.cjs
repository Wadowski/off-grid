// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// Module boundary rules for the modular monolith. `pnpm check:boundaries` runs
// this config over apps/, modules/ and packages/. The rules are listed in
// docs/architecture/boundaries.md and decided in docs/adr/0006-modular-monolith.md.
//
// Paths match `(^|/)` rather than a leading `^` so that the fixtures under
// tools/boundary-fixtures/ can mirror the real tree under their own prefix.

const ADR = "See docs/adr/0006-modular-monolith.md and docs/architecture/boundaries.md.";

// Node built-ins and npm packages that domain code must not touch.
const IO_CORE =
  "^(node:)?(fs|fs/promises|net|tls|http|https|http2|dns|dgram|child_process|worker_threads|cluster)$";
const IO_NPM =
  "(^|/)node_modules/(prisma|@prisma/[^/]+|fastify|@fastify/[^/]+|pg|undici|axios|got|node-fetch)/";

/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "module-public-api",
      severity: "error",
      comment: `A module imports another module only through its index.ts or packages/contracts. ${ADR}`,
      from: { path: "(^|/)modules/([^/]+)/" },
      to: {
        path: "(^|/)modules/[^/]+/",
        pathNot: ["(^|/)modules/$2/", "(^|/)modules/[^/]+/src/index\\.ts$"],
      },
    },
    {
      name: "identity-internals-private",
      severity: "error",
      comment: `Only the identity module reads or writes credentials, sessions and recovery codes. Other code uses src/index.ts. ${ADR}`,
      from: { pathNot: "(^|/)modules/identity/" },
      to: {
        path: "(^|/)modules/identity/",
        pathNot: "(^|/)modules/identity/src/index\\.ts$",
      },
    },
    {
      name: "modules-not-import-apps",
      severity: "error",
      comment: `Modules never import from apps/. ${ADR}`,
      from: { path: "(^|/)modules/" },
      to: { path: "(^|/)apps/" },
    },
    {
      name: "packages-not-import-apps-or-modules",
      severity: "error",
      comment: `Shared packages never import from apps/ or modules/. ${ADR}`,
      from: { path: "(^|/)packages/" },
      to: { path: "(^|/)(apps|modules)/" },
    },
    {
      name: "web-allowed-imports",
      severity: "error",
      comment: `apps/main-web imports only packages/contracts, packages/api-client and packages/ui from the workspace. ${ADR}`,
      from: { path: "(^|/)apps/main-web/" },
      to: {
        path: "(^|/)(apps|modules|packages)/",
        pathNot: ["(^|/)apps/main-web/", "(^|/)packages/(contracts|api-client|ui)/"],
      },
    },
    {
      name: "domain-no-io",
      severity: "error",
      comment: `Module domain/ code does no I/O: no Prisma, Fastify, pg, fs or network libraries. ${ADR}`,
      from: { path: "(^|/)modules/[^/]+/src/domain/" },
      to: { path: [IO_CORE, IO_NPM] },
    },
    {
      name: "domain-no-adapter-layers",
      severity: "error",
      comment: `Module domain/ code does not import infrastructure/, http/, events/ or workers/. ${ADR}`,
      from: { path: "(^|/)modules/[^/]+/src/domain/" },
      to: { path: "(^|/)modules/[^/]+/src/(infrastructure|http|events|workers)/" },
    },
    {
      name: "no-circular",
      severity: "error",
      comment: `No circular dependencies. ${ADR}`,
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(node_modules|dist|coverage|\\.turbo)/" },
    // Type-only imports count too: a domain type imported from Prisma is still a violation.
    tsPreCompilationDeps: true,
    // Resolve with the NodeNext rules, so `./x.js` in source finds `./x.ts`.
    tsConfig: { fileName: "tsconfig.base.json" },
  },
};
