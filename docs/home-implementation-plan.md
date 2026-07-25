# Home Page Implementation Plan

Implement the **Home** frame from the Figma wireframe
([Match website wireframe](https://www.figma.com/design/sy6FpNdNFZjnGjIoGcwSY0/Match-website-wireframe?node-id=1-3),
node `1:3`) as the site landing page (`/`).

The design is a single-column, centered landing page (1000px content column on a
1440px canvas) with four pieces:

1. **Header** — logo mark, "Match Valencia" brand, `Sign in` (neutral) + `Register`
   (primary) buttons, bottom border. This is a shared component reused across almost
   every frame in the file.
2. **Hero text section** — intro paragraph about the Nov 4 2025 Valencia DANA flood.
3. **Figmap** — static basemap image overlaid with ~18 location pins.
4. **Affected-areas text section** — paragraph listing municipalities, with the place
   names in **bold**.

Each step below is atomic and independently committable — stop and review after each.

---

## Note: the current `/` page

`src/routes/+page.svelte` currently holds an uncommitted "Cases" scratch page (public
task list + `TaskForm`). The Home design replaces it — **Step 3 overwrites this file
directly** (no need to preserve the Cases content).

---

## Step 1 — Commit static assets

**Goal:** get the design's images into the repo (Figma asset URLs expire in ~7 days, so
they must be downloaded, not linked).

- Download and commit into `static/home/`:
  - `basemap.png` — the Valencia basemap image (Figma `7:284`).
  - `marker.svg` — the location pin (Figma `Default marker component`, `7:285`).
- Logo: the wireframe uses a **placeholder Figma glyph** for the logo. Do **not** ship
  the Figma logo as the brand. Commit a neutral placeholder (`static/home/logo.svg`, a
  simple mark) or plan to render the brand as text only. Flag for a designer to supply
  the real Match logo.

**Acceptance:** files exist under `static/`, referenced via root-absolute paths
(`/home/basemap.png`). Nothing renders them yet — this step is assets only.

---

## Step 2 — `Header.svelte` component + wire into layout

**Goal:** the shared top bar, visible on every route.

- Create `src/lib/components/Header.svelte`:
  - `Props` interface (even if empty for now, per project convention) — later
    `isLoggedIn` / `userType` will drive the auth buttons (the Figma Header has
    variants for logged-in/out and help-seeker/helper).
  - Layout: full-width, `h-[106px]`, bottom border (`border-b border-gray-200`),
    horizontal padding, `flex items-center justify-between`.
  - Left: logo mark + brand text "Match Valencia".
  - Right: `Sign in` (neutral/outline) and `Register` (primary/filled) buttons —
    match the button styling already used in `SignupForm.svelte`
    (`rounded-lg`, `bg-blue-600 text-white` for primary).
  - Buttons are plain `<a href>` links (`/signup` exists; `Sign in` → `/login`
    placeholder) — no logic in markup.
- Render `<Header />` in `src/routes/+layout.svelte` above the `<slot />`.

**Acceptance:** header appears on `/`, `/cases`, `/signup`. Buttons link correctly.
Matches the Figma header visually (spacing, border, button hierarchy).

---

## Step 3 — Home page scaffold + hero text section

**Goal:** the Home route with its centered content column and the first paragraph.

- Replace `src/routes/+page.svelte` with the Home layout:
  - A centered content column (`max-w-[1000px] mx-auto px-6 py-...`) matching the
    1000px design column.
  - Hero copy from the design (the "On November 4, 2025…" two paragraphs).
  - Typography tuned to the design: ~`text-2xl`, relaxed line height
    (design uses 24px / 44px line-height). Keep the copy in the `<script>` as a
    constant or inline static markup — no business logic.

**Acceptance:** `/` shows the header + intro paragraphs, centered, readable. No map yet.

---

## Step 4 — `Figmap` map section

**Goal:** the basemap with location pins.

- Create `src/lib/components/HomeMap.svelte` (wireframe = **static** map):
  - `Props`: `markers: { x: number; y: number }[]` (positions in the 1000×600 map
    space from the design, or a normalized 0–1 fraction).
  - Render the basemap `<img src="/home/basemap.png">` in a `relative` container
    sized to the design's aspect ratio (1000×600), and absolutely-position each
    `marker.svg` pin over it using the coordinates.
  - Fixed-size pin containers with explicit width/height (per icon-sizing rules).
- Place `<HomeMap />` between the hero and the (upcoming) affected-areas text on `/`.
- Marker coordinates live in a plain array in the page `<script>` (or a
  `$lib/data`/`.ts` file), passed in as the `markers` prop.

> Note: this reproduces the wireframe's static map. A follow-up (out of scope) would
> replace it with an interactive map (Leaflet / MapLibre) fed by real task locations
> from the backend (`GET /task/public` already returns `location.lat/lon`).

**Acceptance:** `/` shows the basemap with pins positioned like the design. Responsive:
the map scales within the content column without distorting pin positions.

---

## Step 5 — Affected-areas text section

**Goal:** the closing paragraph with bold municipality names.

- Add the second text block below the map on `/`: "The most affected areas include the
  municipalities of **Torrent**, **Alzira**, **Xàtiva**, **Sagunto**, **Ontinyent**,
  **Gandía**, **Carcaixent**, and **Paterna**, where…".
- Keep the municipality list as a data array in the `<script>` and render with
  `{#each}`, emitting `<strong>` per name — avoids hand-duplicating markup and keeps
  the "no business logic in markup" rule (the join/rendering is trivial presentation).
- Match hero typography for consistency.

**Acceptance:** `/` matches the full Home design top-to-bottom: header → hero → map →
affected-areas text. Bold names render correctly.

---

## Step 6 — Polish & verification

**Goal:** fidelity, responsiveness, and green checks.

- Compare against the Figma screenshot; tune spacing, font sizes, line heights, colors
  to design tokens where practical (design uses Roboto / `display-small`; map to the
  project's font stack or add Roboto if desired).
- Verify responsive behavior below 1000px (content column, map scaling, header buttons).
- Run `pnpm format`, `pnpm lint`, `pnpm check`, and `pnpm test`.
- Optionally add/adjust a `page.svelte.test.ts` smoke test for the Home route.

**Acceptance:** all checks pass; page visually matches the wireframe at desktop and
degrades gracefully on narrow viewports.

---

## Summary of new/changed files

| Step | Files                                                                       |
| ---- | --------------------------------------------------------------------------- |
| 1    | `static/home/basemap.png`, `static/home/marker.svg`, `static/home/logo.svg` |
| 2    | `src/lib/components/Header.svelte`, `src/routes/+layout.svelte`             |
| 3    | `src/routes/+page.svelte`                                                   |
| 4    | `src/lib/components/HomeMap.svelte`, `src/routes/+page.svelte`              |
| 5    | `src/routes/+page.svelte`                                                   |
| 6    | polish + `src/routes/page.svelte.test.ts` (optional)                        |

## Open questions for the designer / product

- Real **Match** logo asset (wireframe uses a placeholder Figma glyph).
- Should the map be static (wireframe) or interactive (real task locations)?
- Destination routes for `Sign in` (no `/login` frame wired yet) and `Register`.
