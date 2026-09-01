# Verivae Codex Build Handoff - MVP 1

Harborwake product build packet for the first working version

## Document Purpose

This handoff document turns the master design brief into a focused starting packet for Codex. It is not a replacement for the master brief. It is the build-facing summary Codex should use first so the initial app stays useful, realistic, privacy-conscious, and small enough to finish.

## Plain-English Product Summary

Verivae is a money and scam protection app created under Harborwake. The first version should help a user pause before doing something risky, such as sending money, sharing a login code, clicking a suspicious link, scanning a payment QR code, opening an attachment, installing remote-access software, or trusting a person who may be impersonating someone else. The app should not act like magic. It should calmly help the user check the situation, explain the risk, preserve useful evidence, and choose a safer next step.

## Cross-Device Product Direction

Verivae should eventually support both mobile users and non-mobile users. The mobile app should focus on phone-centered risks such as texts, calls, QR codes, screenshots, payment requests, device-safety guidance, and recovery help. A future browser extension should focus on desktop and laptop risks such as suspicious websites, email pages, login pages, payment pages, downloads, popups, and links.

MVP 1 should not build both platforms at once. Instead, the first build should keep the scam-checking logic separate from the screen layout so the same core reasoning can later support the mobile app, browser extension, and desktop web dashboard without rebuilding the product from scratch.

## Primary Build Principle

The first version should prioritize the before-action scam check. The app is most valuable when it interrupts the moment before harm happens. Recovery features, device checks, family/helper review, education, and account protection should support that core moment instead of making the first version too broad.

## What Codex Should Build First

The MVP should include a clean mobile-first web app or app prototype that can later become a real mobile app. It should include a home screen, manual scam check flow, result screen, evidence vault, recovery workspace, trusted helper review flow, settings, privacy controls, and a small scam education area. The first version can use simulated checks and clear placeholder logic where real integrations are not ready, but the interface and user flow should be real enough to test.

## Recommended Starting Platform

Start with a mobile-first web app unless a later decision chooses native iOS or Android. A mobile-first web app is easier to build, test, and improve early. It can still be designed to feel like a phone app. Later, the product can move into native mobile development when Gmail, Messages, device scanning, notifications, and operating-system permissions become important.

## MVP Architecture Direction

Keep the scam-checking logic reusable. The screens should call a separate detection layer instead of hiding all risk rules inside the visual components. That detection layer should accept a check item, inspect the user-provided content and context, and return a structured result with risk level, detected signals, explanation, missing information, and recommended next steps.

This matters because the same detection layer should later be usable by the mobile app, a browser extension, and a desktop web dashboard. MVP 1 does not need a complex shared package yet, but the code should be organized so future platform work does not require starting over.

## MVP Screens

Home screen. The home screen should make the safest action obvious. The main action should be a manual scam check. Secondary actions should include evidence vault, recovery workspace, trusted helper, education, and settings. The home screen should avoid panic-based language. It should feel calm, serious, and protective.

Manual scam check screen. The user should be able to paste or type a message, email, link, phone number, payment request, QR code description, or situation summary. The screen should ask what the user is being asked to do. The app should pay special attention to money transfers, gift cards, crypto, wire transfers, account codes, password reset codes, remote access, package fees, job offers, romance requests, bank warnings, family emergencies, and investment claims.

Scam result screen. The result screen should show a clear risk level, the reasons for that level, what the user should not do, what they can verify safely, and whether they should save evidence or ask a trusted helper. The app should include a not-sure path when confidence is low. It should never imply certainty when the information is incomplete.

Evidence vault screen. The evidence vault should let users save screenshots, pasted text, links, contact details, transaction notes, and timestamps typed by the user. In the first version, this can be a local or prototype-level vault, but the layout should anticipate secure storage later.

Recovery workspace. The recovery workspace should guide users after something may have gone wrong. It should focus on practical next steps: stop communication, avoid sending more money, contact the bank or payment app, change passwords, enable multi-factor authentication, preserve evidence, report the incident, and ask a trusted person for help.

Trusted helper screen. The trusted helper feature should let a user prepare a safe summary to show or send to a trusted person. It should avoid exposing unnecessary sensitive information. The first version can generate a review summary without sending it automatically.

Education screen. The education area should explain common scam patterns in short, clear lessons connected to the app's checks. It should teach users why a request is risky without shaming them.

Settings and privacy screen. Settings should include permission explanations, data controls, helper preferences, notification preferences, emergency contact ideas, and plain-language boundaries about what the app can and cannot do.

## Core MVP Feature Requirements

Manual scam check must accept user-provided content and return a structured result. The result should include risk level, detected warning signs, missing information, safe verification steps, and recommended next action.

Risk scoring must be explainable. The app should not simply say low, medium, or high risk. It should show why. For example, the result can explain that urgency, secrecy, payment pressure, code requests, unusual payment methods, mismatched identities, or suspicious links increased the risk.

The not-sure path must be treated as a real outcome. If the app lacks enough information, it should say that clearly and guide the user toward safe verification. It should never pretend confidence just to look powerful.

Evidence capture must be easy. After a check, the user should be able to save the situation to the vault. The saved item should include the original content, result summary, user notes, and recommended next steps.

Recovery guidance must be action-oriented. The recovery workspace should not give legal guarantees, refund promises, or law enforcement certainty. It should help the user organize what to do next.

Trusted helper review must be privacy-aware. The app should help the user share enough context for help without automatically exposing passwords, codes, financial details, full account numbers, or unnecessary private messages.

## First-Version Integration Policy

Do not build real Gmail, Messages, banking, payment-app, antivirus, browser-extension, or device-scanning integrations in MVP 1 unless the user specifically approves that later. For MVP 1, represent these as future-ready sections, mock states, or manual import flows.

## Detection Behavior

The app should look for scam signals, not just bad words. Important signals include urgency, secrecy, fear, authority impersonation, romance pressure, unusual payment instructions, requests for codes, remote access, unverifiable sender identity, mismatched domains, suspicious links, attachment pressure, QR code payment pressure, and claims that discourage the user from asking someone else.

## Result Levels

Use simple result levels: likely safe, caution, high risk, and not enough information. Likely safe should still include basic caution. Caution should explain what to verify. High risk should clearly tell the user to pause and not send money or codes. Not enough information should ask for more context or recommend trusted verification.

## Definition of Done

MVP 1 is done when a non-technical user can open the app, run a scam check, understand the result, save evidence, choose a safer next step, and review privacy boundaries without needing the developer to explain the interface. The app should feel small but real. It should not include every future feature. It should make the first protective moment work well.
