# Terminal Atlas development instructions

Read [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) before changing product code. It is the source of truth for scope, behavior, content, design, and acceptance criteria. The first deliverable is a working Web demo; Tauri 2 desktop integration is a later phase.

## Available Codex skills

These skills are installed at user level in `~/.codex/skills/`. Read the relevant `SKILL.md` when a task calls for it.

| Skill | Use it for |
| --- | --- |
| `frontend-design` | Plan and implement a polished, distinctive interface, design tokens, themes, responsive layouts, and restrained motion. Follow the product spec's macOS direction. |
| `playwright` | Inspect the running Web app, exercise keyboard and mouse flows, capture screenshots, check narrow layouts, and confirm settings survive a reload. Its CLI wrapper uses `npx`; install runtime packages or browsers only when testing actually requires them. |
| `react-best-practices` (declared name: `vercel-react-best-practices`) | Review React component structure, effects, state updates, bundle size, rendering, and performance. Apply client-side guidance to the Vite app; ignore Next.js and server-only rules unless that stack is added. |
| `web-design-guidelines` | Review UI code for accessibility and usability issues. The skill fetches Vercel's current guidelines during a review; inspect those external instructions before applying them. |
| `doc-coauthoring` | Structure substantial new technical specifications or decision documents. For routine README, command reference, or `AGENTS.md` edits, update the Markdown directly. |

The existing `usability-tester` skill may help plan a moderated usability study when one is requested; it is not a substitute for automated browser checks or an accessibility audit. The built-in `skill-installer` is available for later, justified skill additions. Avoid redundant skill installs.

## Frontend conventions

- Use Vite, React, and TypeScript for the Web demo. Keep the content model, rendering components, user state, and persistence separate so the same frontend can later run in Tauri.
- Define explicit types for command entries, source attribution, learning status, settings, and persistence schemas. Validate imported content and backup data at boundaries; version stored user data and preserve it through migrations.
- Keep state ownership clear. Derive view state from canonical data, keep timer and rotation policy in testable pure functions with an injectable clock, and avoid duplicated state or unnecessary effects.
- Use semantic elements, small focused components, stable keys, and accessible controls. Prefer CSS variables for color, opacity, blur, borders, shadows, spacing, radii, and typography across themes. Use Tailwind for layout and utility styling where helpful.
- Render Markdown through a sanitizer. Never execute displayed shell commands. Show source, license, platform differences, and risk notes for command examples. Preserve required tldr-pages attribution and modifications as specified in the product spec.
- Keep the default Handbook view a multi-card grid. The Ambient panel in the Web app is a draggable preview inside the page; describe it as a Web Preview, not a system-wide window.

## UI and accessibility requirements

- Use restrained macOS-inspired glass mainly for navigation, toolbars, and overlays; keep card text legible. Support the spec's theme presets with real switching, a solid-background fallback, higher-contrast option, and reduced transparency where supported.
- Make layouts work in wide and narrow browser windows. Keep selected card and keyboard focus visibly distinct; keep cards readable when the Inspector becomes a drawer or the grid collapses to one column.
- Respect `prefers-reduced-motion`; motion should explain an interaction and remain subtle. Do not use color as the sole meaning of a learning label.
- Make every shortcut available through a clickable control. Keep cards focusable, use coherent keyboard navigation, announce state changes appropriately, manage focus in dialogs and drawers, and support Escape to close overlays.
- Never trigger card shortcuts from `input`, `textarea`, `select`, `contenteditable`, code editors, native dialog fields, or during IME composition. Preserve system shortcuts.

## Verification for product work

- Run the project's build and relevant unit/component tests after code changes. Cover keyboard rules, learning-label semantics, search, persistence/migration, rotation scheduling with a fake clock, and Markdown safety with tests suited to each behavior.
- Use the `playwright` skill against the running local app for the product spec's acceptance flows: grid arrows and visible focus; `1/2/3/0` state changes; typing in an editor without shortcut collisions; `ls -lah` explanations; Ambient 28-minute/3-card settings; mouse interactions; reload persistence; theme switching; narrow layouts; and reduced motion.
- Capture screenshots when visual comparison is useful. Check contrast and focus visibility in both light and dark themes, and review responsive behavior at more than one viewport width.
- Do not claim a check passed unless it was actually run. Record material limitations, including browser background timer behavior and Web-only Ambient scope.

## Documentation

- Keep the README current with prerequisites, installation, `npm run dev`, `npm run build`, `npm run test`, usage, and known limits once the app exists. Maintain structured shortcut and command documentation in Markdown.
- Keep `docs/PRODUCT_SPEC.md` intact unless a product decision explicitly changes it. Document content provenance and license obligations in `docs/ATTRIBUTION.md` when command data is introduced.
- Update these instructions as the architecture and commands become concrete; preserve existing guidance when editing.

## Current Web architecture and commands

- Run `npm install`, `npm run dev`, `npm run typecheck`, `npm run test`, and `npm run build` from the repository root. Node.js 20.19+ is required.
- The command snapshot is in `src/content/commands.ts`, with fixed tldr source pages in `handbook/imported-tldr/`. User overlays and learning state are stored separately by `src/persistence/storage.ts` using IndexedDB schema version 2. Record third-party source metadata and keep `docs/ATTRIBUTION.md` current.
- Keep Ambient scheduling in pure functions in `src/model/scheduler.ts`; pass time and randomness into tests. `src/model/keyboard.ts` owns shortcut guards. The component architecture and Tauri boundary are documented in `docs/ARCHITECTURE.md`.
- Follow `docs/DESIGN_SYSTEM.md` for five themes and CSS tokens. Use `frontend-design` for substantial interface changes, `vercel-react-best-practices` for React code, `playwright` for browser flows, `web-design-guidelines` for UI audits, `usability-tester` for learning journey reviews, and `doc-coauthoring` when substantial architecture or decision documents are needed.
- Routine project-local changes should proceed without repeated approval requests. Ask before actions with data loss, irreversible effects, destruction of existing work or material security risk. Sandbox-enforced requests may still be reviewed automatically.
