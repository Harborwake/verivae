# Verivae

Verivae is an AI-assisted financial safety app from Harborwake for checking scam risks, suspicious payment requests, risky links, and money-leak warning signs before a user takes action.

## Start Here

This repository is currently the planning and MVP build home for Verivae. The app has not been coded yet. Before building, read the planning docs in this order:

1. [Verivae Codex Kickoff Prompt](docs/Codex-Kickoff-Prompt.md)
2. [Verivae Docs Guide](docs/README.md)
3. [Verivae Codex Build Handoff - MVP 1](docs/Verivae-Codex-Build-Handoff-MVP-1.md)
4. [Verivae Product Safety Boundaries](docs/Product-Safety-Boundaries.md)
5. [Verivae MVP Feature Checklist](docs/MVP-Feature-Checklist.md)
6. [Verivae Architecture Notes](docs/Architecture-Notes.md)

## MVP Focus

The first working version should focus on a mobile-first manual scam check experience. A user should be able to enter a suspicious message, email, link, payment request, QR situation, attachment concern, or short situation summary; receive an explainable risk result; save useful evidence; and follow recovery guidance when needed.

## Cross-Device Direction

Verivae should eventually support both mobile users and desktop/laptop users. A future browser extension can help check suspicious websites, email pages, login pages, payment pages, downloads, popups, and links. MVP 1 should not build the extension yet, but the scam-checking logic should be organized so it can be reused later.

## Important Safety Boundary

Verivae should help users pause, understand risk, preserve evidence, and choose safer next steps. It must not promise perfect scam detection, guaranteed refunds, legal outcomes, account recovery, device cleanup, or complete virus removal.

## Current Repo Status

- Planning docs are in the `docs` folder.
- MVP build Issues and future backlog Issues are in the GitHub Issues tab.
- No production app code has been added yet.
