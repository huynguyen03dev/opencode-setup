#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

/**
 * Sequential Thinking API
 * Provides the core reasoning engine for sequential thought processing
 * Compatible with the original MCP sequential thinking tool interface
 */

class SequentialThinkingEngine {
  constructor() {
    this.currentSession = null;
    this.mode = 'interactive'; // 'interactive', 'batch', 'api'
  }

  // Core API method - compatible with original MCP tool
  processSequentialThinking(params) {
    const {
      thought,
      nextThoughtNeeded,
      thoughtNumber,
      totalThoughts,
      isRevision = false,
      revisesThought = null,
      branchFromThought = null,
      branchId = null,
      needsMoreThoughts = false
    } = params;

    // Validate required parameters
    if (!thought || typeof thought !== 'string') {
      throw new Error('Thought is required and must be a string');
    }

    if (typeof nextThoughtNeeded !== 'boolean') {
      throw new Error('nextThoughtNeeded must be a boolean');
    }

    if (!Number.isInteger(thoughtNumber) || thoughtNumber < 1) {
      throw new Error('thoughtNumber must be a positive integer');
    }

    if (!Number.isInteger(totalThoughts) || totalThoughts < thoughtNumber) {
      throw new Error('totalThoughts must be an integer >= thoughtNumber');
    }

    // Process the thinking step
    const result = this.processThought({
      thought,
      thoughtNumber,
      totalThoughts,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId,
      nextThoughtNeeded,
      needsMoreThoughts
    });

    return result;
  }

  processThought(thinkingData) {
    const {
      thought,
      thoughtNumber,
      totalThoughts,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId,
      nextThoughtNeeded,
      needsMoreThoughts
    } = thinkingData;

    // Create enhanced response
    const response = {
      success: true,
      thoughtData: {
        thought,
        thoughtNumber,
        totalThoughts,
        isRevision: Boolean(isRevision),
        revisesThought: revisesThought || null,
        branchFromThought: branchFromThought || null,
        branchId: branchId || null,
        nextThoughtNeeded: Boolean(nextThoughtNeeded),
        needsMoreThoughts: Boolean(needsMoreThoughts),
        timestamp: new Date().toISOString()
      },
      analysis: this.analyzeThought(thought, thinkingData),
      recommendations: this.generateRecommendations(thinkingData),
      context: this.updateContext(thinkingData)
    };

    return response;
  }

  analyzeThought(thought, context) {
    const analysis = {
      complexity: this.assessComplexity(thought),
      type: this.classifyThoughtType(thought),
      confidence: this.assessConfidence(thought, context),
      scope: this.assessScope(thought, context),
      progress: this.calculateProgress(context)
    };

    return analysis;
  }

  assessComplexity(thought) {
    const complexityIndicators = {
      'very low': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'very high': 5
    };

    let score = 0;

    // Length complexity
    if (thought.length > 500) score += 2;
    else if (thought.length > 200) score += 1;

    // Concept complexity indicators
    const complexConcepts = [
      'analysis', 'synthesize', 'integrate', 'architecture', 'algorithm',
      'optimization', 'strategy', 'framework', 'paradigm', 'abstraction'
    ];

    const foundConcepts = complexConcepts.filter(concept =>
      thought.toLowerCase().includes(concept.toLowerCase())
    );
    score += foundConcepts.length;

    // Question complexity
    const questionMarks = (thought.match(/\?/g) || []).length;
    score += questionMarks;

    // Conditional complexity
    const conditionals = (thought.match(/if|then|else|when|unless|while/gi) || []).length;
    score += Math.min(conditionals / 2, 2);

    // Determine complexity level
    if (score <= 2) return 'very low';
    if (score <= 4) return 'low';
    if (score <= 6) return 'medium';
    if (score <= 8) return 'high';
    return 'very high';
  }

  classifyThoughtType(thought) {
    const types = {
      'question': /\?|how|what|why|when|where|which|who/i,
      'analysis': /analyze|examine|investigate|explore|consider/i,
      'solution': /solve|fix|implement|create|build|develop/i,
      'planning': /plan|design|outline|structure|organize/i,
      'evaluation': /evaluate|assess|compare|review|critique/i,
      'synthesis': /combine|integrate|merge|synthesize|unify/i,
      'assumption': /assume|suppose|presume|hypothesize/i,
      'conclusion': /conclude|therefore|thus|hence|result/i,
      'revision': /revise|modify|update|change|adjust/i
    };

    for (const [type, pattern] of Object.entries(types)) {
      if (pattern.test(thought)) {
        return type;
      }
    }

    return 'general';
  }

  assessConfidence(thought, context) {
    let confidence = 0.5; // Base confidence

    // Increase confidence for definitive statements
    if (/definitely|certainly|clearly|obviously/i.test(thought)) {
      confidence += 0.3;
    }

    // Decrease confidence for uncertain statements
    if (/maybe|perhaps|possibly|uncertain|unclear/i.test(thought)) {
      confidence -= 0.2;
    }

    // Increase confidence for questions with clear scope
    if (/\?/.test(thought) && thought.length < 200) {
      confidence += 0.1;
    }

    // Adjust based on progress
    if (context.thoughtNumber && context.totalThoughts) {
      const progress = context.thoughtNumber / context.totalThoughts;
      confidence += progress * 0.2;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  assessScope(thought, context) {
    const scopeIndicators = {
      'narrow': ['specific', 'particular', 'focus', 'target'],
      'medium': ['general', 'overall', 'comprehensive'],
      'broad': ['system', 'architecture', 'strategy', 'paradigm']
    };

    for (const [scope, indicators] of Object.entries(scopeIndicators)) {
      if (indicators.some(indicator => thought.toLowerCase().includes(indicator))) {
        return scope;
      }
    }

    return 'medium';
  }

  calculateProgress(context) {
    if (!context.thoughtNumber || !context.totalThoughts) {
      return 0;
    }
    return context.thoughtNumber / context.totalThoughts;
  }

  generateRecommendations(context) {
    const recommendations = [];

    const { thoughtNumber, totalThoughts, nextThoughtNeeded, isRevision, branchFromThought } = context;

    // Progress-based recommendations
    const progress = thoughtNumber / totalThoughts;

    if (progress < 0.2) {
      recommendations.push('Consider establishing clear objectives and scope');
    } else if (progress < 0.5) {
      recommendations.push('Focus on understanding core constraints and requirements');
    } else if (progress < 0.8) {
      recommendations.push('Begin synthesizing insights and forming conclusions');
    } else {
      recommendations.push('Ensure all aspects have been thoroughly considered');
    }

    // Revision-specific recommendations
    if (isRevision) {
      recommendations.push('Document what changed in this revision and why');
    }

    // Branch-specific recommendations
    if (branchFromThought) {
      recommendations.push('Clearly distinguish this branch from the original reasoning path');
    }

    // Next step recommendations
    if (nextThoughtNeeded) {
      recommendations.push('Consider what logical next step follows from this thought');
    } else {
      recommendations.push('Prepare to summarize conclusions and next steps');
    }

    return recommendations;
  }

  updateContext(context) {
    const contextUpdate = {
      sessionProgress: context.thoughtNumber / context.totalThoughts,
      hasRevisions: context.isRevision || false,
      hasBranches: !!context.branchFromThought,
      estimatedCompletion: this.estimateCompletion(context),
      suggestedNextSteps: this.suggestNextSteps(context)
    };

    return contextUpdate;
  }

  estimateCompletion(context) {
    const { thoughtNumber, totalThoughts } = context;

    if (thoughtNumber >= totalThoughts) {
      return 'complete';
    }

    const progress = thoughtNumber / totalThoughts;

    if (progress < 0.25) return 'early';
    if (progress < 0.5) return 'developing';
    if (progress < 0.75) return 'advanced';
    return 'nearing completion';
  }

  suggestNextSteps(context) {
    const suggestions = [];
    const { thoughtNumber, totalThoughts, isRevision, branchFromThought } = context;

    if (isRevision) {
      suggestions.push('Validate the revised thought against original objectives');
    }

    if (branchFromThought) {
      suggestions.push('Explore implications of the new reasoning branch');
    }

    if (thoughtNumber < totalThoughts * 0.5) {
      suggestions.push('Continue analysis of remaining aspects');
    } else if (thoughtNumber < totalThoughts * 0.8) {
      suggestions.push('Begin synthesizing findings into coherent conclusions');
    } else {
      suggestions.push('Finalize reasoning and prepare actionable recommendations');
    }

    return suggestions;
  }
}

// Interactive mode implementation
class InteractiveMode {
  constructor(engine) {
    this.engine = engine;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('\n🧠 Sequential Thinking - Interactive Mode');
    console.log('=====================================\n');

    const topic = await this.question('What would you like to reason about? ');
    if (!topic.trim()) {
      console.log('No topic provided. Exiting.');
      this.rl.close();
      return;
    }

    console.log(`\nStarting sequential thinking about: ${topic}`);
    console.log('Type "help" for commands, "exit" to quit.\n');

    let thoughtNumber = 1;
    let totalThoughts = 5; // Initial estimate
    let isComplete = false;

    while (!isComplete) {
      const prompt = `Thought ${thoughtNumber}/${totalThoughts} > `;
      const thought = await this.question(prompt);

      if (thought.toLowerCase() === 'exit') {
        break;
      }

      if (thought.toLowerCase() === 'help') {
        this.showHelp();
        continue;
      }

      if (thought.toLowerCase() === 'revise') {
        const reviseNum = await this.question('Which thought number to revise? ');
        const newThought = await this.question('New thought text: ');

        try {
          const result = this.engine.processSequentialThinking({
            thought: newThought,
            thoughtNumber: parseInt(reviseNum),
            totalThoughts,
            isRevision: true,
            revisesThought: parseInt(reviseNum),
            nextThoughtNeeded: true
          });
          this.displayResult(result);
        } catch (error) {
          console.error('Error:', error.message);
        }
        continue;
      }

      if (thought.trim()) {
        try {
          const nextThoughtNeeded = await this.confirm('Continue with more thoughts?');

          const result = this.engine.processSequentialThinking({
            thought,
            thoughtNumber,
            totalThoughts,
            nextThoughtNeeded
          });

          this.displayResult(result);

          if (!nextThoughtNeeded) {
            isComplete = true;
          } else {
            thoughtNumber++;

            // Optionally adjust estimate
            const adjust = await this.confirm('Adjust total thoughts estimate?');
            if (adjust) {
              const newTotal = await this.question(`New total estimate (current: ${totalThoughts}): `);
              const parsed = parseInt(newTotal);
              if (!isNaN(parsed) && parsed >= thoughtNumber) {
                totalThoughts = parsed;
              }
            }
          }
        } catch (error) {
          console.error('Error processing thought:', error.message);
        }
      }
    }

    console.log('\n🎉 Sequential thinking session completed!');
    this.rl.close();
  }

  question(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve);
    });
  }

  confirm(prompt) {
    return new Promise(resolve => {
      this.rl.question(`${prompt} (y/n): `, answer => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  displayResult(result) {
    console.log('\n📝 Thought Processed:');
    console.log(`   Complexity: ${result.analysis.complexity}`);
    console.log(`   Type: ${result.analysis.type}`);
    console.log(`   Confidence: ${(result.analysis.confidence * 100).toFixed(0)}%`);
    console.log(`   Progress: ${(result.context.sessionProgress * 100).toFixed(0)}%`);

    if (result.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      result.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    console.log('');
  }

  showHelp() {
    console.log('\nCommands:');
    console.log('  help    - Show this help');
    console.log('  revise  - Revise a previous thought');
    console.log('  exit    - Exit the session');
    console.log('  Just type your thoughts normally to add them');
    console.log('');
  }
}

// CLI entry point
function main() {
  const args = process.argv.slice(2);
  const engine = new SequentialThinkingEngine();

  if (args.length === 0) {
    // Interactive mode
    const interactive = new InteractiveMode(engine);
    interactive.start();
  } else if (args[0] === 'api') {
    // API mode - read JSON from stdin
    let inputData = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => inputData += chunk);
    process.stdin.on('end', () => {
      try {
        const params = JSON.parse(inputData);
        const result = engine.processSequentialThinking(params);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error(JSON.stringify({
          success: false,
          error: error.message
        }, null, 2));
        process.exit(1);
      }
    });
  } else {
    // Batch mode with arguments
    console.log('Usage:');
    console.log('  node api.js              # Interactive mode');
    console.log('  node api.js api          # API mode (JSON from stdin)');
    console.log('');
  }
}

if (require.main === module) {
  main();
}

module.exports = { SequentialThinkingEngine, InteractiveMode };