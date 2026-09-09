---
title: Evaluation Dataset from User Corrections
trigger_condition: When MVP user corrections are actively logged in SQLite (Story 14)
planted_date: 2026-09-09
---

# Evaluation Dataset from User Corrections

## Purpose
NexBrief Story 14 specifies: *"I want my corrections to be saved, so that they can be used to test and improve NexBrief in the future."*

## Seed Idea
Once users start editing extractions, correcting inferences, and refining briefs:
1. Export the stored correction logs from SQLite into a structured evaluation dataset (paired `raw_transcript`, `initial_agent_output`, `human_corrected_output`).
2. Implement automated regression tests comparing prompt/model changes against known human corrections.
3. Use this dataset to calibrate few-shot prompts or fine-tune models specifically on client discovery transcript nuances.
