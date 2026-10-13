# Terminal Atlas design system

The interface treats commands as pages in a personal field guide. The strongest visual object is the selected command card; the toolbar and Ambient preview use restrained glass. Body cards remain opaque enough for long Chinese explanations.

## Tokens and layout

- **Cupertino Frost:** mist `#e9eff3`, card `#ffffff`, ink `#223344`, blue `#43749b`.
- **Midnight Glass:** night `#121c27`, card `#1d2b38`, ink `#edf3f6`, blue `#91bcdb`.
- **Graphite Pro:** graphite `#24282b`, card `#303539`, ink `#f4f4f1`, accent `#d1d9dd`.
- **Paper Notes:** paper `#f5f1e9`, card `#fffdf7`, ink `#34332f`, accent `#7b725d`.
- **Terminal Green:** dark `#101b18`, card `#182720`, ink `#e4f2e6`, accent `#90d4aa`.

The body uses the system sans stack for Chinese and English; command strings use the system monospace stack. The desktop shell has a 224 px library rail, flexible card grid, and 348 px Inspector. Below laptop width the Inspector becomes a drawer; below tablet width the grid is one column.

CSS variables in `src/styles.css` own color, blur, opacity, border, radius, shadow, spacing, and transition values. Selection has a strong outline, while keyboard focus adds a second visible ring. Reduced motion disables nonessential transitions. Reduced transparency uses solid surfaces.
