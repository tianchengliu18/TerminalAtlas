# Command content conventions

The offline editorial snapshot lives in `src/content/commands.ts`. Every entry needs a stable lowercase `id`, an exact executable name in `command`, a concise Chinese title and summary, valid syntax, at least one useful example, category, platform list, safety level, and source metadata. Keep flags and combinations separate: `ls -lah` is one example containing three combinable short flags, not a new `-lah` flag.

Use `meaningEn` for an attested English meaning or name origin. Do not invent expansions for commands that are not abbreviations; leave the field blank when uncertain. Describe platform differences in `platformNote` and per-example `platforms`. Mark commands that change data or could cause loss with the appropriate safety level and a concrete warning. Examples are displayed for learning and copying only; the app never runs them.

Put commonly useful flag definitions in `flags` and explain meaningful combinations in `combinations`. Link related entries by stable IDs. Search aliases may include Chinese terms and familiar invocation forms. Check macOS behavior first and note GNU/Linux differences explicitly.

For third-party material, preserve the original Markdown snapshot in `handbook/imported-tldr/`, pin its revision, and record its URL, upstream path, license, and modification status in each affected entry. Update [ATTRIBUTION.md](ATTRIBUTION.md) when adding a source. User edits remain in the IndexedDB override layer, separate from the bundled snapshot. Source updates must merge without deleting those edits.
