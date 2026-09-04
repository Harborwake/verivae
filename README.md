# Verivae

Verivae is an AI-assisted financial safety app from Harborwake for checking scam risks, suspicious payment requests, risky links, and money-leak warning signs before a user takes action.

## Start Here

This repository is currently the planning and MVP build home for Verivae. A dependency-free local/static MVP shell now lives in `index.html`, `src/`, and `tests/`. Before building, read the planning docs in this order:

1. [Verivae Codex Kickoff Prompt](docs/Codex-Kickoff-Prompt.md)
2. [Verivae Docs Guide](docs/README.md)
3. [Verivae Codex Build Handoff - MVP 1](docs/Verivae-Codex-Build-Handoff-MVP-1.md)
4. [Verivae Product Safety Boundaries](docs/Product-Safety-Boundaries.md)
5. [Verivae App Design Brief](docs/Verivae-App-Design-Brief.md)
6. [Verivae MVP Feature Checklist](docs/MVP-Feature-Checklist.md)
7. [Verivae Architecture Notes](docs/Architecture-Notes.md)

## MVP Focus

The first working version should focus on a mobile-first manual scam check experience. A user should be able to enter a suspicious message, email, link, payment request, QR situation, attachment concern, or short situation summary; receive an explainable risk result; save useful evidence; and follow recovery guidance when needed.

## Cross-Device Direction

Verivae should eventually support both mobile users and desktop/laptop users. A future browser extension can help check suspicious websites, email pages, login pages, payment pages, downloads, popups, and links. MVP 1 should not build the extension yet, but the scam-checking logic should be organized so it can be reused later.

## Important Safety Boundary

Verivae should help users pause, understand risk, preserve evidence, and choose safer next steps. It must not promise perfect scam detection, guaranteed refunds, legal outcomes, account recovery, device cleanup, or complete virus removal.

## Current Repo Status

- Planning docs are in the `docs` folder.
- MVP build Issues and future backlog Issues are in the GitHub Issues tab.
- MVP 1 app shell code now lives in `index.html`, `src/`, and `tests/`.

## Run the MVP

This first version is a dependency-free static web app. Open `index.html` in a browser to try the prototype.

To run the lightweight detection tests:

```bash
npm test
```

To run the scenario regression lab directly:

```bash
npm run scenarios
```

If `npm` is unavailable on PATH, the scenario lab can be run with:

```bash
node tests/runScenarioLab.js
```

## MVP 1 App Structure

- `index.html` contains the mobile-first app shell and navigation mount point.
- `src/app.js` contains screen rendering and navigation.
- `src/scamDetection.js` contains reusable rule-based scam-checking logic.
- `src/storage.js` contains prototype-only local evidence and settings storage.
- `src/styles.css` contains the responsive visual design.
- `tests/scamDetection.test.js` covers the first detection behavior.
