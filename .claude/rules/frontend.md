---
paths:
  - "apps/main-web/**"
  - "packages/ui/**"
---

# Frontend rules

- DO use the shared components from `packages/ui` before writing a native element or a custom one. For example, use `Button` instead of a raw `<button>`, `TextField` instead of a raw `<input>`, and `VisuallyHidden` for a label that only assistive technology should read. DON'T write a raw HTML element or a new component in `apps/main-web` when `packages/ui` already has one that fits. If a shared component lacks a variant or prop you need, extend it in `packages/ui` rather than working around it.
- DO use design tokens from `packages/ui` for colour, spacing and type.
- DO meet WCAG 2.2 AA.
- DO send every user-facing string through the i18n catalogs, and render it with `Text` from `packages/ui`. A static string takes `textId` (a catalog key, checked by the typecheck), for example `<Text variant="heading" textId="families.heading" />`. A dynamic value takes `value`, for example `<Text variant="body" value={family.name} />`. DON'T put text directly between tags or in a prop such as `label` or `error` without `Text`. Use `t` only for attributes such as `aria-label`, which `Text` cannot render.
- DO group components by kind under `src/`: `pages/<name>/` for a route screen, `forms/<name>/` for a form, `lists/<name>/` for a list, `layouts/<name>/` for a shell, and `errors/<name>/` for an error view. A component that is part of another component lives in a `components/<name>/` folder inside its parent's folder. The same grouping applies to `packages/ui`, where each component has its own folder.
- DO give each component its own folder with the component file, plus `styles.ts` and `types.ts` when it has any. Test files sit beside the component they test.
- DO split a component into smaller components when it renders more than one concern, so that each file reads on its own.
- DON'T declare style objects in a component file. Put them in `styles.ts` in the same folder and import them.
- DON'T declare a props type or any other type in a component file. Put it in `types.ts` in the same folder and import it.
- DO give interactive elements stable `data-testid` names in kebab-case.
- DO write React components as arrow functions assigned to a `const`, such as `export const Button = (...) => {...}`. DON'T use `function` declarations for components.
- DO talk to the server only through `packages/contracts` and `packages/api-client`.
- DON'T hard-code colours or spacing values.
- DON'T import from `modules/` or from `packages/` other than `contracts`, `api-client` and `ui`. `web-allowed-imports` enforces this ([boundaries.md](../../docs/architecture/boundaries.md)).
- DON'T rely on immediate consistency. Events are eventually consistent, so screens must tolerate a short delay after a change ([ADR 0002](../../docs/adr/0002-outbox-events-and-projections.md)).
