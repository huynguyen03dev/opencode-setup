#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Session Management for Sequential Thinking
 * Handles persistence, storage, and retrieval of reasoning sessions
 */

class SessionManager {
  constructor(sessionDir = null) {
    this.sessionDir = sessionDir || path.join(os.homedir(), '.sequential-thinking');
    this.sessionsDir = path.join(this.sessionDir, 'sessions');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  createSession(topic = null, metadata = {}) {
    const sessionId = this.generateSessionId();
    const session = {
      sessionId,
      topic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thoughts: [],
      branches: {},
      currentBranch: 'main',
      metadata: {
        totalThoughts: 0,
        completedThoughts: 0,
        revisionCount: 0,
        branchCount: 0,
        ...metadata
      },
      settings: {
        autoSave: true,
        compression: false,
        ...metadata.settings
      }
    };

    return session;
  }

  saveSession(session, name = null) {
    try {
      const sessionData = {
        ...session,
        updatedAt: new Date().toISOString()
      };

      // Auto-update metadata
      sessionData.metadata.totalThoughts = sessionData.thoughts.length;
      sessionData.metadata.revisionCount = sessionData.thoughts.filter(t => t.isRevision).length;
      sessionData.metadata.branchCount = Object.keys(sessionData.branches).length;

      // Determine filename
      let filename;
      if (name) {
        filename = `${name}.json`;
      } else {
        filename = `${session.sessionId}.json`;
      }

      const filePath = path.join(this.sessionsDir, filename);

      // Write session file
      fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), 'utf8');

      // Update sessions index
      this.updateSessionsIndex(sessionData, name || session.sessionId);

      return true;
    } catch (error) {
      console.error('Error saving session:', error.message);
      return false;
    }
  }

  loadSession(sessionIdOrName) {
    try {
      const filename = sessionIdOrName.endsWith('.json')
        ? sessionIdOrName
        : `${sessionIdOrName}.json`;

      const filePath = path.join(this.sessionsDir, filename);

      if (!fs.existsSync(filePath)) {
        // Try to find by name in index
        const index = this.loadSessionsIndex();
        const indexedSession = index.sessions.find(s => s.name === sessionIdOrName);
        if (indexedSession && indexedSession.filename) {
          return this.loadSession(indexedSession.filename);
        }
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const session = JSON.parse(content);

      return session;
    } catch (error) {
      console.error('Error loading session:', error.message);
      return null;
    }
  }

  deleteSession(sessionIdOrName) {
    try {
      const filename = sessionIdOrName.endsWith('.json')
        ? sessionIdOrName
        : `${sessionIdOrName}.json`;

      const filePath = path.join(this.sessionsDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.removeFromSessionsIndex(sessionIdOrName);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting session:', error.message);
      return false;
    }
  }

  listSessions() {
    try {
      const index = this.loadSessionsIndex();
      return index.sessions.map(session => ({
        name: session.name,
        sessionId: session.sessionId,
        topic: session.topic,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        thoughtCount: session.metadata?.totalThoughts || 0,
        branches: session.metadata?.branchCount || 0,
        revisions: session.metadata?.revisionCount || 0,
        filename: session.filename
      }));
    } catch (error) {
      console.error('Error listing sessions:', error.message);
      return [];
    }
  }

  loadSessionsIndex() {
    const indexPath = path.join(this.sessionDir, 'sessions.json');

    if (fs.existsSync(indexPath)) {
      try {
        const content = fs.readFileSync(indexPath, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        // If index is corrupted, rebuild it
        return this.rebuildSessionsIndex();
      }
    }

    return { sessions: [], lastUpdated: new Date().toISOString() };
  }

  updateSessionsIndex(session, name) {
    try {
      const index = this.loadSessionsIndex();

      // Remove existing entry for this session
      index.sessions = index.sessions.filter(s =>
        s.sessionId !== session.sessionId && s.name !== name
      );

      // Add new entry
      index.sessions.push({
        name,
        sessionId: session.sessionId,
        topic: session.topic,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        metadata: session.metadata,
        filename: `${name}.json`
      });

      index.lastUpdated = new Date().toISOString();

      const indexPath = path.join(this.sessionDir, 'sessions.json');
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

      return true;
    } catch (error) {
      console.error('Error updating sessions index:', error.message);
      return false;
    }
  }

  removeFromSessionsIndex(sessionIdOrName) {
    try {
      const index = this.loadSessionsIndex();
      index.sessions = index.sessions.filter(s =>
        s.sessionId !== sessionIdOrName && s.name !== sessionIdOrName
      );

      index.lastUpdated = new Date().toISOString();

      const indexPath = path.join(this.sessionDir, 'sessions.json');
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

      return true;
    } catch (error) {
      console.error('Error removing from sessions index:', error.message);
      return false;
    }
  }

  rebuildSessionsIndex() {
    try {
      const sessions = [];
      const files = fs.readdirSync(this.sessionsDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.sessionsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const session = JSON.parse(content);

            sessions.push({
              name: file.replace('.json', ''),
              sessionId: session.sessionId,
              topic: session.topic,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt,
              metadata: session.metadata,
              filename: file
            });
          } catch (error) {
            console.warn(`Skipping corrupted session file: ${file}`);
          }
        }
      }

      const index = {
        sessions,
        lastUpdated: new Date().toISOString()
      };

      const indexPath = path.join(this.sessionDir, 'sessions.json');
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

      return index;
    } catch (error) {
      console.error('Error rebuilding sessions index:', error.message);
      return { sessions: [], lastUpdated: new Date().toISOString() };
    }
  }

  exportSession(sessionIdOrName, format = 'json', outputPath = null) {
    try {
      const session = this.loadSession(sessionIdOrName);
      if (!session) {
        throw new Error(`Session ${sessionIdOrName} not found`);
      }

      let exportData;
      let extension;

      switch (format.toLowerCase()) {
        case 'json':
          exportData = JSON.stringify(session, null, 2);
          extension = 'json';
          break;

        case 'markdown':
          exportData = this.sessionToMarkdown(session);
          extension = 'md';
          break;

        case 'compact':
          exportData = this.sessionToCompact(session);
          extension = 'txt';
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      if (outputPath) {
        fs.writeFileSync(outputPath, exportData, 'utf8');
        console.log(`Session exported to: ${outputPath}`);
      } else {
        console.log(exportData);
      }

      return true;
    } catch (error) {
      console.error('Error exporting session:', error.message);
      return false;
    }
  }

  sessionToMarkdown(session) {
    const lines = [];

    lines.push(`# Sequential Thinking Session`);
    lines.push('');
    lines.push(`**Session ID:** ${session.sessionId}`);
    lines.push(`**Topic:** ${session.topic || 'No topic specified'}`);
    lines.push(`**Created:** ${new Date(session.createdAt).toLocaleString()}`);
    lines.push(`**Last Updated:** ${new Date(session.updatedAt).toLocaleString()}`);
    lines.push(`**Total Thoughts:** ${session.thoughts.length}`);
    lines.push(`**Revisions:** ${session.metadata?.revisionCount || 0}`);
    lines.push(`**Branches:** ${Object.keys(session.branches).length}`);
    lines.push('');

    lines.push('## Thoughts');
    lines.push('');

    session.thoughts.forEach((thought, index) => {
      const revisionTag = thought.isRevision ? ` (revises #${thought.revisesThought})` : '';
      const branchTag = thought.branchId ? ` [branch: ${thought.branchId}]` : '';

      lines.push(`### Thought #${thought.number}${revisionTag}${branchTag}`);
      lines.push('');
      lines.push(`**Time:** ${new Date(thought.timestamp).toLocaleString()}`);
      lines.push(`**Next Needed:** ${thought.nextThoughtNeeded ? 'Yes' : 'No'}`);
      if (thought.estimate) {
        lines.push(`**Estimated Total:** ${thought.estimate} thoughts`);
      }
      lines.push('');
      lines.push(thought.text);
      lines.push('');

      if (thought.isRevision && thought.originalText) {
        lines.push('**Original Text:**');
        lines.push(`> ${thought.originalText}`);
        lines.push('');
      }
    });

    if (Object.keys(session.branches).length > 0) {
      lines.push('## Branches');
      lines.push('');

      for (const [branchId, branch] of Object.entries(session.branches)) {
        lines.push(`### Branch: ${branchId}`);
        lines.push('');
        lines.push(`**From Thought:** #${branch.fromThought}`);
        lines.push(`**Created:** ${new Date(branch.createdAt).toLocaleString()}`);
        lines.push(`**Thoughts in Branch:** ${branch.thoughts?.length || 0}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  sessionToCompact(session) {
    const lines = [];

    lines.push(`Session: ${session.sessionId}`);
    lines.push(`Topic: ${session.topic || 'No topic'}`);
    lines.push(`Thoughts: ${session.thoughts.length}`);
    lines.push('');

    session.thoughts.forEach(thought => {
      const prefix = thought.isRevision ? `REV[#${thought.revisesThought}]` : 'THOUGHT';
      lines.push(`${prefix}[${thought.number}]: ${thought.text}`);
    });

    return lines.join('\n');
  }

  // Utility methods for thought management
  addThought(session, thoughtText, options = {}) {
    const thought = {
      id: session.thoughts.length + 1,
      text: thoughtText,
      timestamp: new Date().toISOString(),
      branch: session.currentBranch || 'main',
      number: session.thoughts.filter(t => !t.isRevision).length + 1,
      isRevision: options.isRevision || false,
      revisesThought: options.revisesThought || null,
      branchFromThought: options.branchFromThought || null,
      branchId: options.branchId || null,
      estimate: options.estimate || null,
      nextThoughtNeeded: options.nextThoughtNeeded !== false,
      needsMoreThoughts: options.needsMoreThoughts !== false
    };

    session.thoughts.push(thought);

    if (session.metadata) {
      session.metadata.totalThoughts = session.thoughts.length;
      if (thought.isRevision) {
        session.metadata.revisionCount++;
      }
    }

    return thought;
  }

  reviseThought(session, thoughtNumber, newText, options = {}) {
    const originalThought = session.thoughts.find(t => t.number === thoughtNumber);
    if (!originalThought) {
      throw new Error(`Thought ${thoughtNumber} not found`);
    }

    const revision = {
      ...originalThought,
      id: session.thoughts.length + 1,
      text: newText,
      timestamp: new Date().toISOString(),
      isRevision: true,
      revisesThought: thoughtNumber,
      originalText: originalThought.text,
      number: session.thoughts.length + 1
    };

    session.thoughts.push(revision);

    if (session.metadata) {
      session.metadata.revisionCount++;
    }

    return revision;
  }

  createBranch(session, thoughtNumber, branchId) {
    const branchFromThought = session.thoughts.find(t => t.number === thoughtNumber);
    if (!branchFromThought) {
      throw new Error(`Thought ${thoughtNumber} not found`);
    }

    session.branches[branchId] = {
      id: branchId,
      createdAt: new Date().toISOString(),
      fromThought: thoughtNumber,
      thoughts: [branchFromThought]
    };

    session.currentBranch = branchId;

    if (session.metadata) {
      session.metadata.branchCount++;
    }

    return session.branches[branchId];
  }
}

module.exports = { SessionManager };