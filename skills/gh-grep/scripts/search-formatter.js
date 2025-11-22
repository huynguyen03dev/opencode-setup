const chalk = require('chalk');
const { marked } = require('marked');
const { TerminalRenderer } = require('marked-terminal');

marked.setOptions({
  renderer: new TerminalRenderer()
});

class SearchFormatter {
  constructor() {
    this.formatters = {
      json: this.formatJSON.bind(this),
      markdown: this.formatMarkdown.bind(this)
    };
  }

  /**
   * Format search results in the specified format
   */
  format(results, format = 'markdown', metadata = {}) {
    const formatter = this.formatters[format.toLowerCase()];
    if (!formatter) {
      throw new Error(`Unsupported format: ${format}. Supported formats: ${Object.keys(this.formatters).join(', ')}`);
    }

    return formatter(results, metadata);
  }

  /**
   * Format results as JSON
   */
  formatJSON(results, metadata) {
    const output = {
      metadata: {
        query: metadata.query,
        filters: metadata.filters,
        totalCount: results.length,
        timestamp: new Date().toISOString()
      },
      results: results.map(result => ({
        repository: result.repository,
        file: result.file,
        line: result.line,
        content: result.content,
        score: result.score || 0
      }))
    };

    return JSON.stringify(output, null, 2);
  }

  /**
   * Format results as Markdown
   */
  formatMarkdown(results, metadata) {
    if (!results || results.length === 0) {
      return chalk.yellow('No results found.');
    }

    let output = [];

    // Header
    output.push(chalk.bold.blue(`🔍 Search Results for "${metadata.query}"`));
    output.push(chalk.gray(`${results.length} results found`));
    output.push('');

    // Group results by repository
    const groupedResults = this.groupByRepository(results);

    for (const [repo, repoResults] of Object.entries(groupedResults)) {
      output.push(chalk.bold.underline(`📁 ${repo}`));

      // Group by file within repository
      const fileGroups = this.groupByFile(repoResults);

      for (const [file, fileResults] of Object.entries(fileGroups)) {
        output.push(chalk.cyan(`  📄 ${file}`));

        for (const result of fileResults) {
          output.push(this.formatCodeMatch(result));
        }
        output.push('');
      }
      output.push('');
    }

    return output.join('\n');
  }

  /**
   * Format an individual code match
   */
  formatCodeMatch(result) {
    const lineNumber = chalk.gray(`:${result.line}`);
    const filePath = chalk.green(`${result.file}${lineNumber}`);

    // Extract relevant context around the match
    const content = this.extractRelevantContext(result.content, result.query);

    return `    ${filePath}\n${this.highlightMatch(content, result.query)}`;
  }

  /**
   * Extract relevant context around the search match
   */
  extractRelevantContext(content, query) {
    if (!content) return '';

    const lines = content.split('\n');
    const maxLines = 5; // Show up to 5 lines of context
    const context = lines.slice(0, maxLines);

    return context.map(line => `      ${line}`).join('\n');
  }

  /**
   * Highlight the search match in the content
   */
  highlightMatch(content, query) {
    if (!query || !content) return content;

    try {
      // Simple highlighting for exact matches
      const regex = new RegExp(this.escapeRegex(query), 'gi');
      return content.replace(regex, (match) => chalk.yellow(match));
    } catch (error) {
      // If regex fails, return original content
      return content;
    }
  }

  /**
   * Group results by repository
   */
  groupByRepository(results) {
    return results.reduce((groups, result) => {
      const repo = result.repository || 'Unknown Repository';
      if (!groups[repo]) {
        groups[repo] = [];
      }
      groups[repo].push(result);
      return groups;
    }, {});
  }

  /**
   * Group results by file within a repository
   */
  groupByFile(results) {
    return results.reduce((groups, result) => {
      const file = result.file || 'Unknown File';
      if (!groups[file]) {
        groups[file] = [];
      }
      groups[file].push(result);
      // Sort by line number
      groups[file].sort((a, b) => (a.line || 0) - (b.line || 0));
      return groups;
    }, {});
  }

  /**
   * Escape special regex characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Format results for console output with colors
   */
  formatForConsole(results, metadata) {
    const formatted = this.formatMarkdown(results, metadata);
    console.log(formatted);
  }

  /**
   * Generate summary statistics
   */
  generateSummary(results, metadata) {
    const stats = {
      totalResults: results.length,
      repositories: new Set(results.map(r => r.repository)).size,
      files: new Set(results.map(r => r.file)).size,
      languages: new Set(results.map(r => r.language).filter(Boolean)).size
    };

    return `📊 Summary: ${stats.totalResults} matches in ${stats.files} files across ${stats.repositories} repositories`;
  }
}

module.exports = SearchFormatter;