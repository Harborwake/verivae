# Verivae Codex Kickoff Prompt

Use this prompt when starting the first real Codex build task for Verivae.

## Prompt

Build MVP 1 for Verivae, a money and scam protection app from Harborwake.

Before writing code, read these repo files in this order:

1. README.md
2. docs/README.md
3. docs/Verivae-Codex-Build-Handoff-MVP-1.md
4. docs/Product-Safety-Boundaries.md
5. docs/MVP-Feature-Checklist.md

Build only MVP 1 for now. Do not try to build the entire long-term product.

The first version should be a mobile-first web app prototype focused on:

- a clean app shell and navigation
- manual scam check input
- explainable scam-risk result screen
- simulated detection logic
- evidence vault
- recovery workspace
- trusted helper summary
- scam education screen
- settings and privacy screen
- full MVP flow testing

Design the app so the scam-checking logic can later be reused by a mobile app, browser extension, and desktop web dashboard. Keep detection/risk logic separate from the visual screens.

Do not build real Gmail, Messages, banking, payment app, antivirus, browser-extension, device-scanning, subscription, or law-enforcement integrations yet. Those are future backlog items.

Use realistic simulated logic for the first version. The app should look and behave like a real product, but it should stay small enough to finish and test.

Important safety rules:

- Do not promise perfect scam detection.
- Do not promise refunds, legal outcomes, account recovery, device cleanup, or complete virus removal.
- Do not ask users to enter passwords, one-time codes, full card numbers, bank login details, private keys, or recovery phrases.
- Always include a not-enough-information path when the app cannot judge safely.
- Keep the tone calm, clear, and nonjudgmental.

Use the existing GitHub Issues as the task list. Start with Issue #1 and work in order unless there is a strong reason to change the sequence. Verify the app works on phone-sized screens before calling MVP 1 done.
