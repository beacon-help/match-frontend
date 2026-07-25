## Coding Standards

Formatting (indentation, quotes, etc.) is enforced by Prettier/ESLint — don't debate it, run `make format`. These standards cover the judgment calls tooling can't check.

1. **Components are functions with a template.** The `<script>` block is like a function body: props in, rendered output out. Keep unrelated logic (API calls, data fetching) out of components — put it in plain `.ts` files under `$lib`.
2. **One component, one responsibility.** If a component's script block is doing validation _and_ fetching _and_ rendering, split it. Same "single responsibility" instinct as a backend service.
3. **Props are the API contract.** Always declare an explicit `Props` interface (see `InfoCard.svelte`, `TaskForm.svelte`) rather than untyped `$props()`. Treat it like a function signature or DTO.
4. **No business logic in markup.** Computations belong in `<script>`, not inline in the template (e.g. avoid inline ternaries with side effects inside `{...}` expressions).
5. **State should be obviously owned.** A piece of `$state` lives in the component that needs it. Only lift it up (or into a store) once two components actually need to share it — avoid premature global stores.
6. **Prefer plain functions over cleverness.** Reach for `$derived`/`$effect` only when a plain function or variable won't do — implicit reactivity is the easiest thing to get wrong coming from a backend background.
7. **Tailwind utility classes in markup, no raw `style="..."` attributes.** Utility classes compile to a shared, cached stylesheet — they are not the same problem as inline styles. Hardcoded `style=` values are untracked and unthemeable; avoid them. If the same cluster of classes (6+) repeats in 3+ places, extract a component (the Tailwind reuse unit), not a hand-written CSS class.

## Resources

- OpenAPI specs of the backend service can be found in `../match-backend/openapi_specs.json`
