# @offgrid/ui

Purpose: shared React components and design tokens.
Public API: only what `src/index.ts` exports; never import from `src/` internals.
Owner: platform team

## Exports

- `tokens`: typed design tokens (colour in `light` and `dark` themes, space, font family, size and weight, radius, elevation, focus ring).
- `tokensStylesheet`: CSS that declares every token as a `--og-*` custom property. Inject it once at the app root. Dark mode follows `prefers-color-scheme` unless `data-theme` is set to `light` or `dark` on `:root`.
- `Button`, `TextField`, `Card`, `VisuallyHidden`: accessible components that style themselves only with tokens.

Colours in `tokens` are checked against WCAG 2.2 AA contrast by `src/tokens.test.ts`.
