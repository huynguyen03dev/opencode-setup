---
name: sequential-thinking
description: Local CLI tool for systematic step-by-step reasoning with revision tracking and branching capabilities. Ideal for multi-stage analysis, design planning, problem decomposition, or tasks with initially unclear scope. Works offline without external dependencies.
license: MIT
---

# Sequential Thinking CLI

Local implementation of structured problem-solving through iterative reasoning with revision and branching capabilities. **No MCP server required** - completely self-contained. **Now implemented in Python** for better ecosystem alignment and accessibility.

## Core Capabilities

- **Iterative reasoning**: Break complex problems into sequential thought steps
- **Dynamic scope**: Adjust total thought count as understanding evolves
- **Revision tracking**: Reconsider and modify previous conclusions
- **Branch exploration**: Explore alternative reasoning paths from any point
- **Stateless sessions**: Fresh reasoning sessions each time (MCP pattern)
- **Context window safe**: No accumulation across sessions prevents context overflow
- **Offline operation**: Works without internet connectivity
- **Local processing**: Fast execution with no external dependencies

## When to Use

Use the Sequential Thinking CLI when:
- Problem requires multiple interconnected reasoning steps
- Initial scope or approach is uncertain
- Need to filter through complexity to find core issues
- May need to backtrack or revise earlier conclusions
- Want to explore alternative solution paths
- Prefer clean, stateless reasoning sessions (starts fresh each time)

**Don't use for**: Simple queries, direct facts, or single-step tasks.

## Quick Start

### ⚠️ **IMPORTANT: Always Use Absolute Paths**

**CRITICAL - Always Use Absolute Paths:**
- ✅ **CORRECT**: `python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking interactive` - Works from any directory
- ❌ **WRONG**: `python3 scripts_python/sequential-thinking interactive` - Only works when in the scripts directory
- ❌ **WRONG**: `cd scripts_python && python3 sequential-thinking interactive` - Each bash command runs in separate shell

**ALWAYS use absolute path**: `python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking <command>`

### Interactive Mode (Recommended)

```bash
# Start interactive reasoning session
python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking interactive
```

This provides a guided experience with:
- Step-by-step thought input
- Real-time analysis and feedback
- Automatic session saving
- Progress tracking

### API Mode (Drop-in MCP Replacement)

```bash
# Use as API (compatible with original MCP tool)
echo '{"thought":"Need to analyze the problem","thoughtNumber":1,"totalThoughts":5,"nextThoughtNeeded":true}' | python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking api
```

### Test the Implementation

```bash
# Run built-in tests
python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking test
```

## MCP-Style Session Management

### Stateless Sessions (Recommended)

```bash
# Start fresh reasoning session (always starts from thought #1)
python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/cli.py "How to optimize database queries?"

# Add thoughts to current session
python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/cli.py --thought "Need to analyze query patterns" --estimate 5

# Show session summary
python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/cli.py --summary

# Export current session as markdown
python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/cli.py --export markdown --output reasoning.md
```

### Session Features

- **Stateless by design**: Each session starts fresh with thought #1
- **Context window safe**: No accumulation across different reasoning sessions
- **In-memory processing**: Fast execution without disk I/O
- **Session isolation**: Each reasoning topic is completely independent
- **Export capability**: Save current session results if needed

## API Parameters

### Required Parameters

- `thought` (string): Current reasoning step
- `nextThoughtNeeded` (boolean): Whether more reasoning is needed
- `thoughtNumber` (integer): Current step number (starts at 1)
- `totalThoughts` (integer): Estimated total steps needed

### Optional Parameters

- `isRevision` (boolean): Indicates this revises previous thinking
- `revisesThought` (integer): Which thought number is being reconsidered
- `branchFromThought` (integer): Thought number to branch from
- `branchId` (string): Identifier for this reasoning branch

## Response Format

The API provides a minimal response format optimized for token efficiency:

```json
{
  "thought": "Need to analyze database performance",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true
}
```

## Workflow Examples

### Basic Problem Solving

```bash
# Start interactive session
python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking interactive

# Follow prompts:
# Topic: "How to improve application performance"
# Thought 1: "Need to identify performance bottlenecks first"
# Thought 2: "Let me analyze database query patterns"
# Thought 3: "Found N+1 query problem in user data fetching"
# Thought 4: "Solution involves implementing query optimization"
# Thought 5: "Will add proper database indexes and optimize joins"
```

### Revision Workflow

```bash
# API mode with revision
echo '{
  "thought": "After deeper analysis, the issue is actually in memory allocation, not database queries",
  "thoughtNumber": 4,
  "totalThoughts": 6,
  "isRevision": true,
  "revisesThought": 3,
  "nextThoughtNeeded": true
}' | python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking api
```

### Branching Workflow

```bash
# Create branch for alternative approach
echo '{
  "thought": "Let me explore a completely different architecture using microservices",
  "thoughtNumber": 4,
  "totalThoughts": 7,
  "branchFromThought": 2,
  "branchId": "microservices-alternative",
  "nextThoughtNeeded": true
}' | python3 /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts_python/sequential-thinking api
```

## MCP Pattern Benefits

**Why Stateless Sessions?**

1. **Context Window Protection**: No risk of context accumulation across sessions
2. **Clean Reasoning**: Each topic gets a fresh mental slate
3. **Fast Performance**: No disk I/O or session loading overhead
4. **True to MCP Design**: Follows the original MCP sequential thinking pattern
5. **Simplicity**: No session management complexity required

**Session Lifecycle**
```
Start Session → Add Thoughts → Revising/Branching → Export Results → Session Ends
   ↑                                                           ↓
   ←────────────── Fresh Session Starts Here (Thought #1) ──────
```

## Resources

### scripts_python/
Python modules that provide the CLI functionality with zero external dependencies.

**Key Scripts:**
- `sequential-thinking` - Main CLI interface with interactive, API, and test modes
- `cli.py` - Full-featured CLI with session management and export capabilities
- `api.py` - Core reasoning engine and API implementation

**Usage:** Execute using absolute paths as shown in the Quick Start section.

### scripts/ (Archived)
Original Node.js modules retained for reference during migration.

**Archived Scripts:**
- `sequential-thinking` - Original JavaScript CLI interface
- `cli.js` - Original JavaScript CLI with session management
- `api.js` - Original JavaScript core reasoning engine
- `session-manager.js` - Original JavaScript session persistence utilities

### Benefits of MCP Pattern

1. **Offline Capability**: Works without internet connectivity
2. **Faster Execution**: No network latency or MCP server overhead
3. **Context Window Safe**: Stateless sessions prevent context overflow
4. **Clean Reasoning**: Fresh start for each topic with thought #1
5. **Export Capabilities**: Save current session results when needed
6. **No Session Management**: No complex persistence or cleanup required
7. **True to Original**: Follows MCP sequential thinking design principles


## Tips

- Start with rough estimate for `totalThoughts`, refine as you progress
- Use revision when assumptions prove incorrect
- Branch when multiple approaches seem viable
- Express uncertainty explicitly in thoughts
- Adjust scope freely - accuracy matters less than progress visibility
- Use interactive mode for new or complex problems
- Export sessions as Markdown for documentation and sharing
- Each session starts fresh - perfect for exploring new topics without baggage
