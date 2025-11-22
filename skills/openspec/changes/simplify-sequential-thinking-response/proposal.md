# Change: Simplify Sequential Thinking JSON Response Format

## Why

The current JSON response format for the sequential-thinking API includes extensive metadata fields (`analysis`, `recommendations`, `context`) that consume significant tokens when used by LLMs. Since this tool is designed for LLM consumption, token efficiency is critical. The verbose format wastes tokens on fields that aren't essential for the core reasoning flow.

## What Changes

- Remove `analysis` object (complexity, type, confidence, scope, progress)
- Remove `recommendations` array
- Remove `context` object (sessionProgress, hasRevisions, hasBranches, estimatedCompletion, suggestedNextSteps)
- Remove `success` field (errors will be handled via exceptions)
- Remove `timestamp` from thoughtData
- Remove optional fields from thoughtData: `isRevision`, `revisesThought`, `branchFromThought`, `branchId`, `needsMoreThoughts`
- Keep only essential flow control fields:
  - `thought` - The actual reasoning content
  - `thoughtNumber` - Current step number
  - `totalThoughts` - Estimated total steps
  - `nextThoughtNeeded` - Whether more reasoning is needed

## Impact

- Affected specs: `sequential-thinking-api`
- Affected code: `sequential-thinking/scripts_python/api.py` (SequentialThinkingEngine class)
- Token savings: Reduces response size from ~200-300 tokens to ~20-50 tokens per thought
- No backward compatibility concerns (confirmed by user)
