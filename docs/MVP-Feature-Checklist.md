# Verivae MVP Feature Checklist

The first build checklist for Codex and Harborwake

## Purpose

This checklist defines the first useful version of Verivae. It is meant to keep the build focused. Verivae should become a working, mobile-first prototype before deeper integrations are added.

## MVP Goal

A user should be able to open Verivae, check a suspicious message or situation, understand the risk, save useful evidence, choose a safer next step, and review privacy boundaries without needing technical help.

## App Shell

Status: Implemented in the local MVP prototype. Continue refining polish and accessibility before production. The current app uses a mobile-first layout with manual scam check as the main action and evidence vault, recovery workspace, trusted helper, education, and settings as secondary areas.

## Home Screen

Status: Implemented in the local MVP prototype. The home screen makes the manual scam check prominent, summarizes saved evidence and active cases, and keeps the tone calm and protective.

## Manual Scam Check

Status: Implemented in the local MVP prototype. The user can type or paste a suspicious message, link, payment request, email, call summary, QR situation, file concern, or short situation summary. Optional helper fields add context without being required.

## Detection Logic

Status: Implemented in the local MVP prototype. The current logic is rule-based and simulated for MVP 1. It looks for urgency, secrecy, money pressure, gift cards, crypto, wire transfers, code requests, remote access, suspicious links, impersonation, attachment pressure, relationship pressure, marketplace patterns, fake jobs, QR requests, and pressure not to tell anyone.

## Result Screen

Status: Implemented in the local MVP prototype. Results show risk level, confidence, reasons, warning signs, what not to do, safe verification steps, missing information, and recommended next actions. The app includes a not-enough-information result and avoids absolute safety claims.

## Evidence Vault

Status: Implemented in the local MVP prototype. Users can opt in to saving a local evidence record with original check details, risk level, reasons, user notes, recovery suggestions, and saved date/time. Evidence can be filtered and deleted. The interface warns users not to save passwords, one-time codes, full card numbers, bank login details, private keys, recovery phrases, or other sensitive secrets.

## Recovery Workspace

Status: Implemented in the local MVP prototype. Recovery uses the latest check or selected saved case when available, shows a practical checklist, supports local case notes/status/progress, and includes steps such as stop communication, avoid sending more money, preserve evidence, contact official bank or payment channels, change passwords, strengthen account security, and ask a trusted person for help.

## Trusted Helper Summary

Status: Implemented in the local MVP prototype. The helper flow creates a copyable summary from the latest check or selected case. It explains what happened, risk level, confidence, warning signs, safest next steps, unclear details, and sharing cautions. Verivae does not send the summary automatically.

## Education Area

Status: Implemented in the local MVP prototype. The education area includes short, beginner-friendly scam pattern cards connected to the same warning signs used in the scam check.

## Settings and Privacy

Status: Implemented in the local MVP prototype. Settings explain local storage, sensitive information boundaries, data controls, theme choice, and product claims limits. The first version does not require Gmail, Messages, bank, payment, contact, cloud, or device permissions.

## Empty and Error States

Status: Implemented in the local MVP prototype. Empty states guide users toward running a scam check first, saving evidence, or opening recovery when appropriate. The check flow handles short or unclear input with missing-information guidance.

## Sample Test Cases

Status: Implemented and expanding. Automated tests and the scenario lab cover gift card requests, bank code requests, romance and emergency money requests, fake package fees, crypto investment pitches, QR payment requests, remote access requests, family emergency claims, suspicious attachments, secrecy pressure, ordinary low-risk messages, and unclear messages.

## Out of Scope for MVP 1

Do not build real Gmail scanning, SMS or iMessage access, bank connections, payment app connections, antivirus scanning, identity verification, law enforcement automation, or paid subscription flows in MVP 1 unless approved later.

## Definition of Done

MVP 1 is complete when the full flow works from home screen to manual check to result to saved evidence to recovery guidance. The interface should be usable on a phone-sized screen, the result should be explainable, and the app should respect the safety boundaries document.

## First Codex Build Prompt

Build MVP 1 for Verivae, a Harborwake money and scam protection app. Use the Codex build handoff, this checklist, and the product safety boundaries as the source. Start with a mobile-first prototype focused on manual scam checks, explainable results, evidence vault, recovery workspace, trusted helper summary, education, and settings. Do not build real Gmail, Messages, banking, payment, antivirus, or device-scanning integrations yet. Use realistic simulated logic and verify the full user flow works.
