#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Sequential Thinking CLI - Local implementation of sequential reasoning
function printUsage() {
  console.log(`
Sequential Thinking CLI - Local reasoning and analysis tool

Usage: node cli.js [options] [input-file]

Interactive Mode:
  node cli.js                    Start interactive reasoning session
  node cli.js -t "initial"      Start with initial thought topic

File Mode:
  node cli.js session.json      Load and continue existing session
  node cli.js -f session.json   Specify session file explicitly

Session Options:
  -s, --session <file>    Session file path [default: ~/.sequential-thinking/session.json]
  -t, --topic <topic>     Initial reasoning topic or question
  -o, --output <file>     Output file for session results
  --format <format>       Output format: json, markdown [default: json]
  --session-dir <dir>     Directory for session storage [default: ~/.sequential-thinking]

Thought Options (for batch processing):
  --thought <text>        Add a thought to current session
  --revise <number>       Revise thought number
  --branch <number>       Create branch from thought number
  --branch-id <id>        Branch identifier
  --estimate <number>     Estimated total thoughts needed
  --complete              Mark current reasoning as complete

Session Management:
  --list-sessions         List all saved sessions
  --load <session>        Load specific session by name
  --save <name>           Save current session with name
  --delete <session>      Delete saved session
  --clear                 Clear current session from memory

Output Options:
  -v, --verbose           Show detailed reasoning output
  --history               Show thought history only
  --summary               Show session summary
  --export <format>       Export session: json, markdown, compact

Examples:
  # Start interactive session
  node cli.js "How to optimize database queries?"

  # Continue existing session
  node cli.js --session ./my-session.json

  # Add thought to session
  node cli.js --thought "Need to analyze query patterns" --estimate 5

  # Create branch from thought 3
  node cli.js --branch 3 --branch-id "alternative-approach"

  # Revise thought 2
  node cli.js --revise 2 --thought "Updated analysis with new data"

  # Export session as markdown
  node cli.js --export markdown --output reasoning.md
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const options = {
    // MCP pattern: No session persistence - remove session file paths
    topic: null,
    outputFile: null,
    format: 'json',
    thought: null,
    revise: null,
    branch: null,
    branchId: null,
    estimate: null,
    complete: false,
    listSessions: false,
    load: null,
    save: null,
    delete: null,
    clear: false,
    verbose: false,
    history: false,
    summary: false,
    export: null,
    inputFile: null
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-s':
      case '--session':
        options.sessionPath = args[++i];
        break;
      case '-t':
      case '--topic':
        options.topic = args[++i];
        break;
      case '-o':
      case '--output':
        options.outputFile = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--session-dir':
        options.sessionDir = args[++i];
        break;
      case '--thought':
        options.thought = args[++i];
        break;
      case '--revise':
        options.revise = parseInt(args[++i]);
        // Next argument might be the thought text
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          options.thought = args[++i];
        }
        break;
      case '--branch':
        options.branch = parseInt(args[++i]);
        break;
      case '--branch-id':
        options.branchId = args[++i];
        break;
      case '--estimate':
        options.estimate = parseInt(args[++i]);
        break;
      case '--complete':
        options.complete = true;
        break;
      case '--list-sessions':
        // MCP pattern: No session persistence - these commands are deprecated
        console.log('Warning: Session management commands are deprecated in MCP mode (stateless sessions)');
        options.listSessions = true;
        break;
      case '--load':
        console.log('Warning: Session loading is deprecated in MCP mode (stateless sessions)');
        options.load = args[++i];
        break;
      case '--save':
        console.log('Warning: Session saving is deprecated in MCP mode (stateless sessions)');
        options.save = args[++i];
        break;
      case '--delete':
        console.log('Warning: Session deletion is deprecated in MCP mode (stateless sessions)');
        options.delete = args[++i];
        break;
      case '--clear':
        options.clear = true;
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '--history':
        options.history = true;
        break;
      case '--summary':
        options.summary = true;
        break;
      case '--export':
        options.export = args[++i];
        break;
      default:
        if (!arg.startsWith('-')) {
          if (options.inputFile === null) {
            options.inputFile = arg;
          } else if (options.topic === null) {
            options.topic = arg;
          }
        }
        break;
    }
  }

  // MCP pattern: No session directory needed - stateless sessions

  return options;
}

class SequentialThinkingSession {
  constructor() {
    // MCP pattern: Memory-only session, no persistence
    this.data = {
      sessionId: this.generateSessionId(),
      createdAt: new Date().toISOString(),
      topic: null,
      thoughts: [],
      branches: {},
      currentBranch: 'main',
      metadata: {
        totalThoughts: 0,
        completedThoughts: 0,
        revisionCount: 0,
        branchCount: 0
      }
    };
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // MCP pattern: No load/save methods - stateless in-memory only

  addThought(thoughtText, options = {}) {
    const thought = {
      id: this.data.thoughts.length + 1,
      text: thoughtText,
      timestamp: new Date().toISOString(),
      branch: this.data.currentBranch,
      number: this.data.thoughts.length + 1,
      isRevision: options.isRevision || false,
      revisesThought: options.revisesThought || null,
      branchFromThought: options.branchFromThought || null,
      branchId: options.branchId || null,
      estimate: options.estimate || null,
      nextThoughtNeeded: options.nextThoughtNeeded !== false,
      needsMoreThoughts: options.needsMoreThoughts !== false
    };

    this.data.thoughts.push(thought);
    this.data.metadata.totalThoughts = this.data.thoughts.length;

    if (options.isRevision) {
      this.data.metadata.revisionCount++;
    }

    return thought;
  }

  reviseThought(thoughtNumber, newText, options = {}) {
    const originalThought = this.data.thoughts.find(t => t.number === thoughtNumber);
    if (!originalThought) {
      throw new Error(`Thought ${thoughtNumber} not found`);
    }

    const revision = {
      ...originalThought,
      id: this.data.thoughts.length + 1,
      text: newText,
      timestamp: new Date().toISOString(),
      isRevision: true,
      revisesThought: thoughtNumber,
      originalText: originalThought.text,
      number: this.data.thoughts.length + 1
    };

    this.data.thoughts.push(revision);
    this.data.metadata.revisionCount++;

    return revision;
  }

  createBranch(thoughtNumber, branchId) {
    const branchFromThought = this.data.thoughts.find(t => t.number === thoughtNumber);
    if (!branchFromThought) {
      throw new Error(`Thought ${thoughtNumber} not found`);
    }

    this.data.branches[branchId] = {
      id: branchId,
      createdAt: new Date().toISOString(),
      fromThought: thoughtNumber,
      thoughts: [branchFromThought]
    };

    this.data.metadata.branchCount++;
    this.data.currentBranch = branchId;

    return this.data.branches[branchId];
  }

  getLatestThought() {
    return this.data.thoughts[this.data.thoughts.length - 1];
  }

  getSessionSummary() {
    const latestThought = this.getLatestThought();
    return {
      sessionId: this.data.sessionId,
      topic: this.data.topic,
      totalThoughts: this.data.thoughts.length,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
      currentStatus: latestThought ? latestThought.nextThoughtNeeded ? 'In Progress' : 'Complete' : 'Not Started',
      branches: Object.keys(this.data.branches).length,
      revisions: this.data.metadata.revisionCount
    };
  }
}

async function main() {
  try {
    const options = parseArgs();

    // Handle session management commands
    if (options.listSessions) {
      // TODO: Implement session listing
      console.log('Session listing not yet implemented');
      return;
    }

    if (options.delete) {
      // TODO: Implement session deletion
      console.log('Session deletion not yet implemented');
      return;
    }

    // Create session (MCP pattern: fresh memory-only session each time)
    const session = new SequentialThinkingSession();

    // Handle different modes
    if (options.topic) {
      // Start new session with topic
      session.data.topic = options.topic;
      const initialThought = session.addThought(`Starting analysis: ${options.topic}`, {
        estimate: options.estimate || 5
      });

      console.log('Started new reasoning session:');
      console.log(`Topic: ${options.topic}`);
      console.log(`Session ID: ${session.data.sessionId}`);
      console.log(`Initial thought: ${initialThought.text}`);

    } else if (options.thought) {
      // Add thought to existing session
      if (options.revise) {
        const revision = session.reviseThought(options.revise, options.thought);
        console.log(`Revised thought ${options.revise}:`);
        console.log(`Original: ${revision.originalText}`);
        console.log(`Revised: ${options.thought}`);
      } else {
        const thought = session.addThought(options.thought, {
          estimate: options.estimate,
          branchFromThought: options.branch,
          branchId: options.branchId
        });
        console.log(`Added thought ${thought.number}: ${thought.text}`);
      }

    } else if (options.branch && options.branchId) {
      // Create branch
      const branch = session.createBranch(options.branch, options.branchId);
      console.log(`Created branch "${options.branchId}" from thought ${options.branch}`);

    } else if (options.clear) {
      // Clear session
      session.data = {
        ...session.data,
        thoughts: [],
        branches: {},
        currentBranch: 'main',
        metadata: {
          totalThoughts: 0,
          completedThoughts: 0,
          revisionCount: 0,
          branchCount: 0
        }
      };
      console.log('Session cleared');

    } else if (options.history) {
      // Show thought history
      console.log('Thought History:');
      session.data.thoughts.forEach((thought, index) => {
        const status = thought.isRevision ? `[REVISED ${thought.revisesThought}]` : '';
        const branch = thought.branchId ? `[BRANCH: ${thought.branchId}]` : '';
        console.log(`${index + 1}. ${thought.text} ${status} ${branch}`);
      });

    } else if (options.summary) {
      // Show session summary
      const summary = session.getSessionSummary();
      console.log('Session Summary:');
      console.log(JSON.stringify(summary, null, 2));

    } else {
      // Default: show session status
      const summary = session.getSessionSummary();
      console.log('Current Session Status:');
      console.log(`Session ID: ${summary.sessionId}`);
      console.log(`Topic: ${summary.topic || 'Not set'}`);
      console.log(`Thoughts: ${summary.totalThoughts}`);
      console.log(`Status: ${summary.currentStatus}`);
      console.log(`Branches: ${summary.branches}`);
      console.log(`Revisions: ${summary.revisions}`);
    }

    // MCP pattern: No session saving - stateless in-memory only

    // Export if requested
    if (options.export) {
      // TODO: Implement export functionality
      console.log(`Export to ${options.export} not yet implemented`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();