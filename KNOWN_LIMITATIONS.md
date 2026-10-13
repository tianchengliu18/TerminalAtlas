# Known limitations

- Ambient is a draggable **Web Preview inside the page**. It cannot stay above other macOS applications or run after the browser tab closes; the later Tauri 2 phase is required for a system-level window.
- Browsers may throttle background timers. The app stores an absolute next-rotation time and rotates once on return, without replaying every missed period.
- The content is a concise handbook, not a replacement for each platform's `man` pages. Some English tldr reference pages contain GNU-specific long options; the curated examples prioritize macOS-compatible syntax and flag platform differences where material.
- Ten tldr English pages are bundled at a fixed revision; a reusable upstream import/update CLI is a later phase. The other entries are original editorial seeds. User overrides are never overwritten by a bundled update.
- Personal data is local to the current browser profile. There is no account sync. Use JSON export before clearing browser data.
- Markdown export and double-bracket backlinks are not implemented. Notes and command explanations can be backed up as JSON.
