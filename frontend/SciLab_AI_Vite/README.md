# SciLab AI — Vite

Vite version of the SciLab AI virtual science laboratory.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

This version uses Vite with vanilla JavaScript. The existing SciLab AI HTML/CSS/JavaScript behavior is preserved; the original inline CSS and JavaScript have been separated into `src/style.css` and `src/main.js`.

## UI refresh
- Bright professional light palette and softer navy/cyan/violet dark palette.
- Persistent Light/Dark theme switch.
- GSAP + ScrollTrigger reveal, hover, floating, and hero motion.
- `preview.html` is a standalone dynamic preview with live Light/Dark switching.


## Physics catalogue fix — v2026.08.27-final
The legacy inline JavaScript application was removed from index.html so it cannot override the current src/main.js Physics catalogue. The Physics selector is populated by PHYS_CORE_ORDER (25 core experiments) plus 2 interactive demonstrations, for 27 total selectable Physics experiments.
