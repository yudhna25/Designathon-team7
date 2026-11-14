# ViệcNhanh Aichi · Prototype (Team 7 · Designathon 2026 · Milestone 2)

Interactive prototype for the user flow "AI chấm điểm phù hợp JD ↔ hồ sơ".
Two roles: **Người lao động** (mobile web, `/worker`) and **HR nhà máy** (desktop, `/hr`).

## Run

```bash
npm install
npm run dev -- -p 6868
```

Open two tabs side by side (`/worker` and `/hr`): they sync live in the same browser.
`Shift + D` (or the **Demo** tab) opens the demo controls: jump to any screen, fast-forward time
(+1h / +20h to see the 4h reminder and the 24h auto-close), change deadline / threshold / weights,
animation speed, theme, HR language, reset.

Self-check for the matching and pay rules: `npx tsx scripts/check-scoring.ts`.

## Where things live

| What | File |
| --- | --- |
| ZEN Kaiz tokens (extracted from the DS site) | `src/styles/zen-tokens.css` |
| Component classes + Tailwind aliases | `src/app/globals.css` |
| Jobs, visas, demo people | `src/lib/data.ts` |
| Matching (visa gate + 4 weighted criteria) | `src/lib/scoring.ts` |
| Take-home pay estimate | `src/lib/pay.ts` |
| State, simulated clock, 24h rule, tab sync | `src/lib/store.ts` |
| HR EN / 日本語 strings | `src/lib/hr-i18n.ts` |

## Adding the colour palette later

The UI is black & white on purpose (ZEN's default *neutral emphasis*). To brand it:

1. In `src/styles/zen-tokens.css`, set the `--color-*-accent-*` values (light block and `[data-theme=dark]` block).
2. Add `data-emphasis="brand"` to `<html>` in `src/app/layout.tsx`. Buttons, chips, checkboxes switch to the accent.
3. For extra accents (score ring, meters), change `--color-bg-neutral-solid` usages in `ScoreRing` / `.meter` in `src/components/ui.tsx` and `globals.css`.

## Credits

UI built on ZEN Kaiz Design System (Free) · Dizai Studio — zen.dizai.studio.
Fonts: Inter, JetBrains Mono (SIL OFL 1.1). Code: Next.js, React, Tailwind CSS (MIT), GSAP.
Prototype vibecoded with Claude Code. All demo data is fictional; factory names are invented.
