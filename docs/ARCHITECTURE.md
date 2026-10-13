# Web MVP architecture

Terminal Atlas is a Vite, React, TypeScript and Tailwind CSS client application. The first load bundles command content and needs no backend. The same `src/model`, `src/content`, and `src/persistence` boundaries can be reused inside a future Tauri 2 webview.

## Modules

- `src/content/commands.ts`: offline command snapshot. It joins 74 editorial entries with 10 fixed tldr-pages English pages from `handbook/imported-tldr/`. Each imported entry records the upstream path, revision, license, URL and modification status.
- `src/model/types.ts`: explicit command, safety, source, learning, settings and versioned personal data types.
- `src/model/state.ts`: defaults, status transitions, and editorial/user override merge.
- `src/model/search.ts`: derived bilingual search, including combinations, flags and local notes.
- `src/model/scheduler.ts`: pure eligibility, weights, unique batch selection and timestamp logic. It accepts `now` and `random` so tests do not wait for real time.
- `src/model/keyboard.ts`: input, editor, dialog, IME and modifier guards.
- `src/persistence/storage.ts`: IndexedDB store, version 1 → 2 migration and JSON backup validation. Saved overrides remain separate from the bundled source, so an upstream snapshot change does not erase user edits.
- `src/components/`: card, Inspector, editor and Ambient preview. The Inspector renders Markdown using `react-markdown` and `rehype-sanitize`.
- `src/App.tsx`: route, selection and UI orchestration. Routes are `/handbook/:commandId` and `/ambient`.

## State semantics

`isFrequent` is independent of `learningStatus`. `mastered` and `often_forgotten` are mutually exclusive. `0` clears these learning marks without deleting favorites or notes. User command state also records pinned/favorite flags, times shown and last shown timestamp.

Ambient applies its category and state filters, places pinned commands first, then fills unique slots. Weighted mode multiplies a base weight by 1.5 for frequent, 3 for often forgotten, and 0.35 for mastered; recently shown entries are downweighted. The previous batch is avoided when enough alternatives exist. `nextRotationAt` is a real timestamp, so a background tab that wakes late changes batch at most once. Pausing or leaving hover restarts a full interval. Browser timer throttling may delay the visible update until the page runs again.

## Testing and future desktop integration

Run `npm run typecheck`, `npm run test`, and `npm run build`. Unit tests cover content count, bilingual search, learning semantics, keyboard guards, scheduling with an injected time, backup migration and Markdown sanitization. Browser flows use the installed Playwright CLI skill against the Vite dev server.

Tauri integration should preserve the content model and personal data schema. The native window layer would provide actual macOS always-on-top behavior and coordinate window position; the Web preview intentionally stays inside the browser page. A future migration can exchange IndexedDB for a native data adapter without changing command, search or scheduler logic.
