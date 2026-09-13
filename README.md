# ResearchLab — AI Trading Research Assistant

## Overview

ResearchLab converts ambiguous natural-language trading ideas into structured, testable research experiments. It helps make important assumptions visible before any market-data analysis begins.

## Problem

Trading questions are often incomplete or ambiguous. A question such as “Does buying NIFTY after a sharp fall work?” still needs a precise threshold, timeframe, exit rule, and holding period before it can be tested.

## Solution

The prototype guides each idea through a compact workflow:

Ask → Structure → Clarify → Ready

## Key Features

- Natural-language research questions
- AI structured experiment extraction
- Missing-information detection
- Ambiguity handling
- Clarification workflow
- Field provenance
- Zod validation
- Responsive research UI

## Architecture

```text
Browser
  → Next.js
  → API Routes
  → Gemini
  → Structured JSON
  → Zod Validation
  → UI
```

Main API routes:

- `POST /api/structure-experiment`
- `POST /api/generate-clarifications`
- `POST /api/apply-clarifications`

## Experiment Structure

Each validated experiment contains:

`instrument`, `timeframe`, `entryCondition`, `exitCondition`, `holdingPeriod`, `filters`, `objective`, `missingFields`, and `sources`.

`sources` records whether a field was user-provided, clarified, inferred, or missing.

## Technologies

- Next.js
- TypeScript
- React
- Tailwind CSS
- Gemini API
- `@google/genai`
- Zod
- Lucide React
- Vercel

## AI Usage

AI coding tools were used for implementation assistance, debugging, code review, and prompt iteration. The product flow, experiment schema, ambiguity strategy, clarification flow, provenance model, validation boundaries, and architecture decisions were personally designed. Important AI-generated suggestions were reviewed and modified.

Examples of iteration include rejecting invented thresholds for “sharp fall,” tightening prompts to prevent unrelated values leaking into experiments, and changing the inference provider after reliability testing.

## Key Decisions

1. Separate structured extraction from clarification.
2. Treat LLM output as untrusted and validate it with Zod.
3. Keep API keys server-side.
4. Preserve ambiguity instead of silently inventing values.
5. Track provenance for every experiment field.
6. Keep the prototype intentionally small.

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` with:

```text
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
```

Do not commit `.env.local` or a real API key.

## Limitations

- No real market-data integration
- No backtesting engine
- AI output can still require validation
- The prototype focuses only on defining research experiments

## What I Would Improve Next

- Pass the final Experiment into a backtesting engine
- Add historical market-data integration
- Add research history and persistence
- Support experiment comparison
- Add richer validation rules
