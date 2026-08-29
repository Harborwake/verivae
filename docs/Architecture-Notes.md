# Verivae Architecture Notes

Plain-English architecture guidance for the first Verivae build and future platforms

## Purpose

This document explains how Verivae should be organized when Codex starts building. It is not a code file and it is not a timeline. It tells Codex how to keep the first version small while still making smart choices that support a future mobile app, browser extension, and desktop experience.

## Product Shape

Verivae should become a cross-device scam protection product. The first build should be a mobile-first web app prototype because that is the fastest way to create and test the core experience. Later, Verivae can grow into a native mobile app and a browser extension for desktop and laptop users.

The important architecture idea is simple: the scam-checking brain should not be trapped inside one screen. The same core detection logic should eventually be usable from a phone screen, browser extension popup, desktop web dashboard, and future integrations.

## Core App Layers

Verivae should be organized into clear parts:

- User interface layer: screens, buttons, forms, navigation, result cards, evidence views, recovery checklists, and settings.
- Scam-checking logic layer: the rules or future AI-assisted reasoning that reviews user-provided content and returns a risk result.
- Data layer: saved scam checks, evidence items, recovery tasks, trusted-helper summaries, user preferences, and privacy settings.
- Safety boundary layer: shared wording and behavior that prevents overpromising, unsafe advice, or unnecessary collection of sensitive information.

For MVP 1, these layers can be simple. They do not need heavy engineering. The goal is clean separation so future work is easier.

## Reusable Scam-Checking Logic

The scam-checking logic should accept a structured check item and return a structured result.

A check item should include:

- the original user-provided content
- the source type, such as message, email, link, payment request, QR situation, attachment concern, or other
- what the user is being asked to do
- optional user notes

A result should include:

- risk level
- detected warning signs
- plain-English explanation
- missing information
- recommended next steps
- whether evidence saving is recommended
- whether recovery guidance is recommended
- whether trusted-helper review is recommended

This structure matters because a browser extension could later send the same kind of check item as the mobile app. A phone user might paste a text message. A desktop user might send selected webpage text or a suspicious URL. The app should handle both through the same core pattern.

## Mobile App Direction

The future mobile app should focus on risks that happen on phones: suspicious texts, calls, QR codes, payment requests, screenshots, device-safety guidance, and recovery help. MVP 1 should feel mobile-first even if it is built as a web app. Screens should be readable, buttons should be easy to tap, and the main flow should work on a phone-sized screen.

MVP 1 should not require phone permissions. Manual entry is enough for the first version.

## Browser Extension Direction

The future browser extension should help desktop and laptop users check suspicious websites, email pages, login pages, payment pages, downloads, popups, and links. It should be opt-in and clear about what it can see.

The extension should not read everything by default. Safer early behavior would be user-triggered checks, such as checking the current page, selected text, copied link, or pasted message. Stronger automatic protection can be considered later only with clear permissions and careful privacy design.

## Storage and Privacy Direction

MVP 1 can use prototype-only local storage for saved evidence, but the interface must warn users not to save passwords, one-time codes, full card numbers, bank login details, private keys, recovery phrases, or other sensitive secrets.

Longer term, Verivae should treat evidence as highly sensitive. Any cloud storage, account sync, helper sharing, or device-to-device access should be designed carefully and explained clearly before it is built.

## Safety Boundary Direction

Safety boundaries should appear inside the app behavior, not only in documents. Every risky result should avoid false certainty. Every recovery flow should avoid promising refunds or legal outcomes. Every device-safety flow should avoid claiming complete virus detection or cleanup. Every future integration should ask for the smallest useful permission.

## MVP 1 Architecture Guidance

For the first build, Codex should keep things simple:

- Build a mobile-first web app prototype.
- Keep detection/risk logic separate from screen components.
- Use realistic simulated logic instead of real integrations.
- Store prototype evidence locally unless a backend is approved later.
- Make sample scam scenarios easy to test.
- Keep future platform code out of MVP 1.
- Avoid building native mobile, browser extension, banking, email, message, antivirus, or subscription systems yet.

## What Good Looks Like

A good first architecture will feel small, readable, and easy to change. A future developer should be able to open the project, find the scam-checking logic, find the screens, find the saved evidence structure, and understand where future mobile or browser-extension work would connect.

A poor first architecture would hide all detection rules inside one screen, mix privacy warnings into random components, hard-code every result, or build fake integrations that look real but cannot safely work.

## Codex Reminder

Build the first useful version. Keep the foundation clean. Do not overbuild the platform before the core scam-checking experience works.
