# SIBO Compass

SIBO Compass is a concept-test web app for MGMT 5360 Entrepreneurship at Seattle University. It helps adults with chronic bloating or other digestive symptoms prepare a one-page summary to bring to their doctor, and it measures whether people then ask for early access to a paid test-and-clinician service.

**Concept test only. Not medical advice. The app does not diagnose.**

Live app: https://gut-signal-compass.lovable.app

## What the app does

1. Asks short questions about symptoms, meals and what the person has already tried
2. Runs a safety check and stops with a "see a doctor" message if any warning sign applies
3. Builds a one-page summary with questions to ask a doctor, using simple rules (no AI)
4. Shows the possible care pathway and prices as an outline (nothing can be ordered)
5. Lets the person join early access with an email
6. Records anonymous step events so the team can measure how many people click early access

## Data

Stored in Supabase: anonymous session answers, step events and early-access emails. No names, exact location or medical records are collected. Only the team's admin can read or delete the data, on a private results page.

## Built with

Lovable, Supabase and GitHub.

## Team

Group project, Seattle University, Fall 2026.
