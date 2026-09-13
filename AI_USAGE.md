# AI Usage Note

## Tools Used

- ChatGPT
- Coding agent / Codex
- Gemini API

## How AI Was Used

- Implementation assistance
- Debugging
- Prompt refinement
- Code review
- Structured extraction in the product

## Decisions I Made

I made the important decisions manually: scope, architecture, experiment schema, provenance, ambiguity rules, clarification strategy, provider choice, and error handling.

## Suggestions Rejected / Modified

1. Models initially invented numerical thresholds for “sharp fall”; this was rejected.
2. Prompts were changed to preserve ambiguity.
3. OpenRouter free models were tested but rejected because structured-output reliability was inconsistent.
4. Gemini was selected after live testing produced reliable structured output.
5. Prompt constraints were tightened after a model introduced unrelated high-volatility context.

## What I Am Most Proud Of

> The system does not simply generate plausible answers. It makes ambiguity visible and asks users for missing information before producing a testable experiment.
