# Verivae Product Safety Boundaries

What Verivae may say, must avoid, and should protect during product design and development

## Purpose

This document defines the safety boundaries for Verivae so the app can help users without overpromising what it can prove, detect, repair, or recover. It should be used beside the master design brief and the Codex build handoff whenever Verivae features are designed, written, or coded.

## Core Promise

Verivae helps users pause before taking risky actions. It can review user-provided messages, links, payment requests, suspicious situations, and related evidence. It can explain warning signs, suggest safer verification steps, and help organize recovery actions. It should act like a careful guide, not a guaranteed scam detector.

## Claims Verivae Can Make

Verivae can say it helps users check suspicious requests before sending money, sharing codes, clicking risky links, opening attachments, installing software, or trusting an unverified person. It can say it looks for common scam signals such as urgency, secrecy, unusual payment methods, identity mismatch, code requests, remote access pressure, suspicious links, and pressure to avoid asking others.

## Claims Verivae Must Not Make

Verivae must not promise that it detects every scam. It must not promise that a result is legally final. It must not promise refunds, criminal identification, account recovery, complete device scanning, guaranteed virus removal, perfect deepfake detection, or perfect AI impersonation detection. It must not tell users that something is definitely safe when important information is missing.

## Money and Payment Safety

Verivae should treat gift cards, crypto transfers, wire transfers, payment app transfers, bank login requests, refund-payment requests, fake fees, urgent debts, investment promises, and emergency money requests as high-attention situations. The app should encourage users to pause, verify through independent contact methods, and avoid sending more money when a situation is suspicious.

## Codes, Passwords, and Account Access

Verivae must never ask users to enter passwords, one-time codes, private keys, full account numbers, full card numbers, or recovery phrases. If a scam check includes one of these items, the app should warn the user that this information is sensitive and should not be shared. The app should guide the user to change passwords or enable stronger account protection only through official account settings.

## Device and Virus Safety

Verivae may guide users through platform-supported safety checks and safe next steps. It should not claim to fully scan a phone, remove every virus, or replace trusted antivirus or operating-system security tools. Future device-safety features should be framed as guidance, selected file review, permission review, and suspicious behavior review unless a real security engine is later approved and tested.

## Email, Message, and Integration Safety

The first version should use manual input instead of direct inbox, message, banking, or device integrations. Future integrations must be optional, clearly explained, and easy to turn off. The app should only request permissions when the feature needs them, and it should explain what will be read, what will be stored, and what will never be accessed.

## AI and Uncertainty

Verivae should show uncertainty honestly. When confidence is low, the app should say it does not have enough information and recommend safer verification. It should explain reasons instead of only showing a score. It should not hide uncertainty behind strong-sounding language.

## Recovery Boundaries

Verivae can help users organize recovery steps after a suspected scam. It can suggest contacting banks, payment apps, account providers, credit bureaus, trusted helpers, and official reporting channels when appropriate. It must not promise that money will be returned, accounts will be restored, law enforcement will act, or scammers will be found.

## Trusted Helper Privacy

Trusted-helper features should share the smallest useful summary. The app should avoid exposing passwords, codes, full financial details, private keys, recovery phrases, full message histories, or private personal information unless the user intentionally includes that information outside the app. Helper summaries should focus on what happened, what the user is being asked to do, why it may be risky, and what help is needed.

## User Tone

Verivae should be calm, direct, and nonjudgmental. It should never shame users for being targeted or tricked. The product should reduce panic and support safer decisions.

## Build Rule

When Codex builds features, safety boundaries must be visible in the product behavior, not only written in documentation. Results should include explanations, safe next steps, and a not-sure path. Risk language should be careful, especially for scams, money movement, device safety, account recovery, and AI impersonation.
