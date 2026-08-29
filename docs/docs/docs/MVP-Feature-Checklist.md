# Verivae MVP Feature Checklist

The first build checklist for Codex and Harborwake

## Purpose

This checklist defines the first useful version of Verivae. It is meant to keep the build focused. Verivae should become a working, mobile-first prototype before deeper integrations are added.

## MVP Goal

A user should be able to open Verivae, check a suspicious message or situation, understand the risk, save useful evidence, choose a safer next step, and review privacy boundaries without needing technical help.

## App Shell

Status: Not started. Build a mobile-first layout with clear navigation. The main action should be manual scam check. Secondary areas should include evidence vault, recovery workspace, trusted helper, education, and settings.

## Home Screen

Status: Not started. The home screen should make the safest next action obvious. It should feel calm and protective. It should not overload the user with too many choices.

## Manual Scam Check

Status: Not started. The user should be able to paste or type suspicious text, links, payment requests, emails, messages, or a short situation summary. The screen should ask what the user is being asked to do.

## Detection Logic

Status: Not started. Use simulated rule-based logic for MVP 1. Look for urgency, secrecy, money pressure, gift cards, crypto, wire transfers, code requests, remote access, suspicious links, impersonation, attachment pressure, and pressure not to tell anyone.

## Result Screen

Status: Not started. Show a risk level, reasons, what not to do, safe verification steps, and recommended next action. Include a not-enough-information result when the app cannot judge safely.

## Evidence Vault

Status: Not started. Let the user save a check result with original content, risk level, reasons, user notes, and recovery suggestions. For MVP 1, local storage is acceptable unless a backend is approved later.

## Recovery Workspace

Status: Not started. Provide a basic recovery checklist for suspected scam situations. Include stop communication, avoid sending more money, preserve evidence, contact the bank or payment provider, change passwords, strengthen account security, and ask a trusted person for help.

## Trusted Helper Summary

Status: Not started. Generate a simple summary a user can show to a trusted person. The summary should explain what happened, what seems risky, what the user is being asked to do, and what kind of help is needed.

## Education Area

Status: Not started. Add short lessons or cards for common scam patterns. The education area should be connected to the same warning signs used in the scam check.

## Settings and Privacy

Status: Not started. Include clear privacy boundaries, data controls, future permission explanations, notification preferences, and product claims limits. The first version should not require Gmail, Messages, bank, payment, or device permissions.

## Empty and Error States

Status: Not started. Add helpful empty states for no saved evidence, no recovery items, and no helper summary yet. Add error states when input is too short, a check cannot be completed, or the app needs more information.

## Sample Test Cases

Status: Not started. Test a gift card request, bank code request, romance emergency request, fake package fee, crypto investment pitch, QR payment request, remote access request, family emergency from an unknown number, suspicious attachment, and secrecy-pressure message.

## Out of Scope for MVP 1

Do not build real Gmail scanning, SMS or iMessage access, bank connections, payment app connections, antivirus scanning, identity verification, law enforcement automation, or paid subscription flows in MVP 1 unless approved later.

## Definition of Done

MVP 1 is complete when the full flow works from home screen to manual check to result to saved evidence to recovery guidance. The interface should be usable on a phone-sized screen, the result should be explainable, and the app should respect the safety boundaries document.

## First Codex Build Prompt

Build MVP 1 for Verivae, a Harborwake money and scam protection app. Use the Codex build handoff, this checklist, and the product safety boundaries as the source. Start with a mobile-first prototype focused on manual scam checks, explainable results, evidence vault, recovery workspace, trusted helper summary, education, and settings. Do not build real Gmail, Messages, banking, payment, antivirus, or device-scanning integrations yet. Use realistic simulated logic and verify the full user flow works.
