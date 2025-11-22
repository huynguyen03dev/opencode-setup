---
name: gh-grep
description: CLI tool for searching GitHub repositories using direct API access. This skill provides a command-line interface that agents can use to search for code patterns, implementation examples, and research across millions of public GitHub repositories. Use this skill when you need to find real-world usage examples, learn unfamiliar APIs, discover implementation patterns, or research codebases for technical investigation.
---

# gh-grep - GitHub Code Search CLI

## Overview

The gh-grep skill provides a comprehensive command-line interface for searching GitHub repositories using direct API access to Grep.app. It enables agents to efficiently search millions of public repositories for code patterns, implementation examples, and research purposes without requiring any MCP server.

## When to Use This Skill

Use this skill when you need to:
- **Learn new APIs** by finding real-world usage examples
- **Discover implementation patterns** for common programming problems
- **Research codebases** for technical investigation and troubleshooting
- **Find best practices** by examining production code from quality repositories
- **Compare different approaches** to solving similar problems
- **Study error handling patterns** across various projects

## Quick Start

### ⚠️ **IMPORTANT: Agent Usage Guidelines**

**CRITICAL - Always Use Absolute Paths:**
- ✅ **CORRECT**: `node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "query"` - Works from any directory
- ❌ **WRONG**: `node scripts/cli.js "query"` - Only works when in /home/hazeruno/.claude/skills/gh-grep/
- ❌ **WRONG**: `cd skills/gh-grep && node scripts/cli.js "query"` - Each bash command runs in separate shell

**ALWAYS use absolute path**: `node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "your query" [options]`

### Basic Usage
```bash
# Search for React hooks usage
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "useState" -l TypeScript

# Find error handling patterns
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "try.*catch" --use-regexp -l JavaScript Python

# Search in specific repositories
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "useEffect" -r facebook/react

# Get JSON output for processing
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "fetch" -l JavaScript --format json
```

### Agent Execution Pattern
When using this skill from ANY directory, always execute:
```bash
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js <query> [options]
```

### Available Options
- `-l, --language <lang>` - Filter by programming language
- `-r, --repo <repo>` - Filter by repository (partial name works)
- `-p, --path <path>` - Filter by file path pattern
- `-f, --format <format>` - Output format: `json` or `markdown` (default: json)
- `--use-regexp` - Treat query as regular expression
- `--match-case` - Case-sensitive search
- `--match-whole-words` - Match whole words only
- `--limit <number>` - Maximum results (default: 10)
- `-h, --help` - Show help and examples

## Core Capabilities

### 1. Intelligent Search Patterns
Use regular expressions and smart filtering to find specific code patterns:
```bash
# Function definitions across languages
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "function \w+|def \w+" --use-regexp -l TypeScript Python

# Import/Export statements
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "import.*from|require\(" --use-regexp -l JavaScript

# React hooks patterns
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "use.*\(\)" --use-regexp -l TypeScript
```

### 2. Language and Repository Filtering
Narrow searches to specific languages or high-quality repositories:
```bash
# Frontend technologies
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "useState|useEffect" -l TypeScript JavaScript

# Backend patterns in specific frameworks
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "middleware" -l JavaScript -r express

# Multiple languages
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "async.*await" -l JavaScript TypeScript --use-regexp
```

### 3. Output Formats
Get results in optimal formats for your needs:
```bash
# Enhanced JSON for agent processing and analysis (default)
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "ErrorBoundary" -l TypeScript

# Markdown for documentation and reading
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "fetch" --format markdown
```

**Enhanced JSON Format (Agent-Optimized):**
The JSON output is specifically designed for agent consumption with rich metadata:

```json
{
  "query": "useState",
  "search_metadata": {
    "timestamp": "2025-11-16T04:06:33.192Z",
    "total_count": 10,
    "processed_count": 10,
    "api_version": "v1",
    "format": "enhanced_json"
  },
  "results": [
    {
      "repository": "kamranahmedse/developer-roadmap",
      "owner": "unknown",
      "file": "src/components/TopicDetail/TopicDetail.tsx",
      "line": 1,
      "language": "TypeScript",
      "framework": "React",
      "content": "import { useEffect, useMemo, useRef, useState } from 'react';",
      "context": {
        "before": "",
        "after": "",
        "matchLine": "import { useEffect, useMemo, useRef, useState } from 'react';",
        "matchIndex": 0
      },
      "function_name": null,
      "score": 0,
      "metadata": {
        "file_extension": "tsx",
        "is_typescript": true,
        "has_imports": true,
        "has_exports": false,
        "search_highlight": "useState"
      }
    }
  ]
}
```

**Enhanced JSON Features:**
- **Clean Content**: HTML entities decoded (`&#39;` → `'`, `&amp;` → `&`)
- **Framework Detection**: Automatically identifies React, Vue, Angular, Django, Flask, Express, Fastify
- **Language Detection**: Enhanced language detection from file extensions
- **Context Extraction**: Shows before/after lines around code matches
- **Function Names**: Extracts function/class names when available
- **Rich Metadata**: File extensions, TypeScript detection, import/export analysis
- **Search Highlighting**: Includes the original search query for reference

### 4. Path Filtering
Target specific files and directories:
```bash
# Search in configuration files
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "port|host" -p "package.json"

# Search in test files
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "describe\(" --use-regexp -p "*test*" --limit 5

# Search in source directories
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "export" -p "src/*" -l TypeScript
```

## Search Workflows

### Learning New Technologies
1. **Find basic usage patterns:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "createSlice" -l TypeScript --limit 5
   ```

2. **Discover advanced patterns:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "createAsyncThunk" --use-regexp -l TypeScript --limit 3
   ```

3. **Study implementation examples:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "configureStore" -r reduxjs/redux-toolkit --limit 2
   ```

### Implementation Research
1. **Search for specific solutions:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "authentication middleware" -l JavaScript --limit 10
   ```

2. **Compare different approaches:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "websocket" -l JavaScript --limit 15
   ```

3. **Find best practices:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "error handling" --use-regexp -l TypeScript --limit 10
   ```

### Code Pattern Discovery
1. **Find common patterns:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "useEffect.*\[\]" --use-regexp -l TypeScript --limit 5
   ```

2. **Study variations:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "useEffect.*\[.*\]" --use-regexp -l TypeScript --limit 5
   ```

3. **Learn optimization techniques:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "useMemo|useCallback" -l TypeScript --limit 5
   ```

### Research and Investigation
1. **Search for specific technologies:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "redis" -l Python --limit 10
   ```

2. **Find API usage patterns:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "fetch\(|axios\." --use-regexp -l JavaScript --limit 5
   ```

3. **Study testing approaches:**
   ```bash
   node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "test\(|describe\(" --use-regexp -l TypeScript --path "*test*" --limit 3
   ```

## Resources

### scripts/
Executable Node.js modules that provide the CLI functionality.

**Key Scripts:**
- `cli.js` - Main command-line interface with argument parsing and direct API integration
- `cli-full.js` - Full-featured version with dependencies (backup)
- `config-manager.js` - Configuration management utilities (not currently used)
- `search-formatter.js` - Output formatting for JSON and Markdown results

**Usage:** Execute the CLI using `node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js` with appropriate arguments.

### references/
Comprehensive documentation for effective GitHub code searching.

**Key References:**
- `search-patterns.md` - Common search patterns organized by language, framework, and use case
- `best-practices.md` - Guidelines for effective searching and quality assessment of results

**Usage:** Load these references when planning searches or when you need guidance on effective search strategies and patterns.

## Advanced Features

### Search Optimization
- **Query building:** Use specific patterns rather than generic terms
- **Filter combinations:** Layer language, repository, and file filters for precision
- **Result ranking:** Evaluate results by repository quality and relevance
- **Regular expressions:** Leverage regex for complex pattern matching

### Output Customization
- **Context extraction:** Shows relevant code surrounding matches
- **Line numbers:** Includes line numbers for precise navigation
- **Multiple formats:** JSON for processing, Markdown for documentation
- **Repository grouping:** Results grouped by repository for easy browsing

### Search Techniques
- **Pattern matching:** Use `--use-regexp` for flexible pattern searches
- **Case sensitivity:** Use `--match-case` for exact matching
- **Whole words:** Use `--match-whole-words` to avoid partial matches
- **Result limiting:** Use `--limit` to control result volume

## Integration Examples

### Learning Workflows
```bash
# 1. Discover API usage patterns
node scripts/cli.js "useState\(" -l TypeScript --limit 5

# 2. Study implementation details
node scripts/cli.js "useState.*useState" --use-regexp -l TypeScript --limit 3

# 3. Find related patterns
node scripts/cli.js "useEffect.*useState" --use-regexp -l TypeScript --limit 3
```

### Research Workflows
```bash
# 1. Compare implementations
node scripts/cli.js "authentication" -l JavaScript --limit 10

# 2. Study best practices
node scripts/cli.js "error.*logging" --use-regexp -l Python --limit 5

# 3. Find specific implementations
node scripts/cli.js "middleware" -l JavaScript -r express --limit 3
```

### Code Review Workflows
```bash
# 1. Find similar implementations
node scripts/cli.js "validation" -l TypeScript --limit 5

# 2. Check security patterns
node scripts/cli.js "bcrypt|hash|salt" -l JavaScript --limit 3

# 3. Study testing approaches
node scripts/cli.js "describe\(|it\(" --use-regexp -l TypeScript --path "*test*" --limit 2
```

## Tips for Effective Usage

### General Search Tips
1. **Be specific** - Use precise patterns rather than generic terms
2. **Filter early** - Apply language and repository filters to narrow results
3. **Use regex** - Leverage regular expressions for flexible pattern matching
4. **Evaluate quality** - Consider repository relevance when assessing results
5. **Iterate searches** - Start broad, then refine based on initial results
6. **Use limits** - Control result volume for focused investigation
7. **Choose right format** - Use JSON for processing, Markdown for reading

### ⚠️ **Important: Niche Language Search Strategies**

**For MQL5, MQ4, and specialized languages:**

**✅ RECOMMENDED APPROACHES:**
```bash
# Target specific repositories (most reliable)
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "OnTick|OnInit" -r "EA31337" --limit 10

# Search without language filters (language detection may not work)
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "Expert.*Advisor|EA.*magic" --use-regexp --limit 10

# Search for file extensions directly
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "\.mq5|\.mq4" --use-regexp --limit 10

# Search for MQL5-specific functions without language filter
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "OrderSend|MqlTradeRequest|SymbolSelect" --use-regexp --limit 10
```

**❌ AVOID THESE APPROACHES:**
```bash
# Language filters often don't work for niche languages
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "OnTick" -l MQL5 --limit 10

# Too specific patterns that may not exist in indexed files
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "gold.*trading.*bot.*EA" --use-regexp -l MQL5
```

### 🔧 **Troubleshooting Common Issues**

**Problem: No results for specific languages**
- **Solution**: Remove language filter (`-l MQL5`) and search by repository or file extension

**Problem: cd command fails**
- **Solution**: Always use absolute paths: `node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "query"`

**Problem: Complex regex returns nothing**
- **Solution**: Start with simpler patterns, then gradually add complexity
- Example: Start with `"EA"`, then try `"EA.*magic"`

**Problem: Repository targeting not working**
- **Solution**: Use partial repository names: `-r "EA31337"` or `-r "facebook"`

### 🎯 **Effective Search Patterns for Different Languages**

**MQL5/MetaTrader:**
```bash
# EA functions
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "OnTick|OnInit|OnDeinit" --use-regexp --limit 10

# Trading functions
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "OrderSend|MqlTradeRequest|OrderClose" --use-regexp --limit 10

# File-specific search
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "\.mq5" -r "your-repo" --limit 10
```

**Web Development:**
```bash
# JavaScript/TypeScript (language filters work well)
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "useState|useEffect" -l TypeScript --limit 10

# Backend patterns
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "express|fastify" -l JavaScript --limit 10
```

**Python:**
```bash
# Django/Flask patterns
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "def.*|class.*" -l Python --limit 10

# Import patterns
node /home/hazeruno/.claude/skills/gh-grep/scripts/cli.js "from.*import|import.*" -l Python --limit 10
```

## Error Handling

The CLI handles common error scenarios gracefully:
- **No results:** Displays "No results found" message
- **Invalid options:** Falls back to default behavior
- **Network errors:** Shows connection error messages
- **Invalid queries:** Provides helpful error feedback

## Performance

- **Fast response:** ~0.8 seconds for typical searches
- **Direct API access:** No MCP server overhead
- **Efficient processing:** Minimal memory usage
- **Scalable:** Handles large result sets effectively

This skill transforms GitHub from a code repository into a searchable knowledge base, enabling agents to learn from real-world implementations and discover proven solutions to common programming challenges.