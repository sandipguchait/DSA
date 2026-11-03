# DSA Dry Run Lab

A React + TypeScript practice workspace for DSA traces and frontend machine coding.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, then choose **Machine Coding**. Direct links use `#machine/<exercise-id>`, for example `#machine/star-rating`.

## Machine Coding

The 23 exercises from the supplied practice list are grouped in a searchable sidebar. Tic-tac-toe and Connect Four have separate implementations. Every exercise includes:

- A brief with requirements and a practice timebox.
- HLD describing client-side boundaries and data flow.
- LLD describing authoritative state, derived values, refs, and event transitions.
- Performance costs, tradeoffs, and a follow-up challenge.
- The actual React + TypeScript source used by its interactive preview, plus shared CSS.
- A persistent manual verification checklist and a practice completion mark.

The study guide and preview share a resizable split when there is at least 900px of content width. On smaller screens they stack. The sidebar can also resize or collapse. Preview reset remounts the current demo; switching study tabs preserves preview state. Selecting a different exercise starts a fresh preview.

All examples use local data. Typeahead and optimistic-like requests simulate latency and deterministic failure; progress bars simulate upload work. They do not send requests or persist input values. The native modal temporarily enters the browser top layer. Dragging has button/select alternatives for keyboard and touch users.

Implementation modules live in `src/machine/demos/`. `registry.ts` imports each module both as a React component and as raw source, so the displayed implementation cannot diverge from the running preview. Shared styling is in `src/machine/machine.css`. Design notes and verification scenarios are in `src/machine/problems.ts`.

The examples are intentionally focused interview baselines. Their performance notes identify limitations such as local-only data, native drag support, bounded collections, cache eviction, and production error handling. HLD is client architecture; distributed backend systems are outside these UI exercises.

## Validate

```sh
npm test
npm run typecheck
npm run build
```

Tests exercise all 23 preview mounts, keyboard selection, async cancellation, rollback, concurrency limits, game rules, source/preview correspondence, routing, and practice persistence. DOM tests do not replace real-browser checks of layout, pointer dragging, native dialog focus containment, or screen-reader announcements.

The production build writes a self-contained `dist/index.html` using the existing single-file Vite configuration.

Reference guidance: [React state structure](https://react.dev/learn/choosing-the-state-structure), [synchronizing with effects](https://react.dev/learn/synchronizing-with-effects), and [WAI-ARIA patterns](https://www.w3.org/WAI/ARIA/apg/patterns/).
