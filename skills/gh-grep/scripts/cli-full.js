#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const https = require('https');

// Check if dependencies are available, fallback to minimal versions if not
let SearchFormatter, ConfigManager;

try {
  // Test if the dependencies work
  const chalk = require('chalk');
  const marked = require('marked');
  const TerminalRenderer = require('marked-terminal');
  SearchFormatter = require('./search-formatter');
  ConfigManager = require('./config-manager');
} catch (error) {
  console.log('Warning: Some dependencies missing, using minimal implementation');
  // Fallback minimal implementations
  SearchFormatter = {
    format: function(results, format = 'markdown', metadata = {}) {
      if (format === 'json') {
        return JSON.stringify({
          query: metadata.query,
          totalCount: results.length,
          results: results.map(result => ({
            repository: `${result.owner || 'unknown'}/${result.repo || 'unknown'}`,
            file: result.path || '',
            line: result.content?.snippet?.match(/data-line="(\d+)"/)?.[1] || 0,
            content: result.content?.snippet?.replace(/<[^>]*>/g, '') || '',
            language: result.lang || '',
            score: result.score || 0
          }))
        }, null, 2);
      }

      // Simple markdown formatting
      if (!results || results.length === 0) {
        return chalk.yellow('No results found.');
      }

      let output = [];
      output.push(chalk.bold.blue(`🔍 Search Results for "${metadata.query}"`));
      output.push(chalk.gray(`${results.length} results found`));
      output.push('');

      const grouped = {};
      results.forEach(result => {
        const repo = `${result.owner || 'unknown'}/${result.repo || 'unknown'}`;
        if (!grouped[repo]) grouped[repo] = [];
        grouped[repo].push(result);
      });

      Object.entries(grouped).forEach(([repo, repoResults]) => {
        output.push(chalk.bold.underline(`📁 ${repo}`));

        const fileGroups = {};
        repoResults.forEach(result => {
          const file = result.path || 'Unknown File';
          if (!fileGroups[file]) fileGroups[file] = [];
          fileGroups[file].push(result);
        });

        Object.entries(fileGroups).forEach(([file, fileResults]) => {
          output.push(chalk.cyan(`  📄 ${file}`));
          fileResults.forEach(result => {
            const content = result.content?.snippet || '';
            const lineMatch = content.match(/data-line="(\d+)"/);
            const line = lineMatch ? lineMatch[1] : 'unknown';
            const cleanContent = content.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

            output.push(`    ${chalk.gray(`:${line}`)}`);
            output.push(`    ${cleanContent.trim()}`);
            output.push('');
          });
        });
        output.push('');
      });

      return output.join('\n');
    }
  };

  ConfigManager = {
    get: () => null,
    set: () => {},
    list: () => ({}),
    getLanguagePreset: () => null,
    getRepositoryShortcut: () => null,
    getSearchPattern: () => null,
    expandLanguages: (langs) => langs,
    expandRepository: (repo) => repo,
    expandSearchPattern: (pattern) => pattern
  };
}

const program = new Command();

// Initialize components
const formatter = new SearchFormatter();
const config = new ConfigManager();

program
  .name('gh-grep')
  .description('CLI tool for searching GitHub repositories using gh_grep MCP')
  .version('1.0.0');

program
  .argument('<query>', 'search query or pattern')
  .option('-l, --language <languages...>', 'filter by programming languages')
  .option('-r, --repo <repository>', 'filter by repository (owner/repo or partial name)')
  .option('-p, --path <path>', 'filter by file path pattern')
  .option('-f, --format <format>', 'output format (json|markdown)', 'markdown')
  .option('--use-regexp', 'treat query as regular expression')
  .option('--match-case', 'case-sensitive search')
  .option('--match-whole-words', 'match whole words only')
  .option('--limit <number>', 'maximum number of results', '50')
  .action(async (query, options) => {
    try {
      // Build search parameters
      const searchParams = {
        query,
        language: options.language,
        repo: options.repo,
        path: options.path,
        useRegexp: options.useRegexp,
        matchCase: options.matchCase,
        matchWholeWords: options.matchWholeWords,
        limit: parseInt(options.limit)
      };

      
      console.log(chalk.blue('🔍 Searching GitHub repositories...'));
      console.log(chalk.gray(`Query: ${query}`));

      if (searchParams.language) {
        console.log(chalk.gray(`Languages: ${searchParams.language.join(', ')}`));
      }

      if (searchParams.repo) {
        console.log(chalk.gray(`Repository: ${searchParams.repo}`));
      }

      // Call the gh_grep MCP tool
      const results = await callGhGrep(searchParams);

      if (!results || results.length === 0) {
        console.log(chalk.yellow('No results found.'));
        return;
      }

      // Format and display results
      const formattedOutput = formatter.format(results, options.format, {
        query,
        filters: searchParams,
        totalCount: results.length
      });

      console.log(formattedOutput);

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (process.env.DEBUG) {
        console.error(chalk.red('Stack:'), error.stack);
      }
      process.exit(1);
    }
  });

// Configuration commands
program
  .command('config')
  .description('Manage gh-grep configuration')
  .option('--list', 'list current configuration')
  .option('--set <key=value>', 'set configuration value')
  .action(async (options) => {
    try {
      if (options.list) {
        const currentConfig = config.list();
        console.log(chalk.blue('Current configuration:'));
        console.log(JSON.stringify(currentConfig, null, 2));
      } else if (options.set) {
        const [key, value] = options.set.split('=');
        config.set(key, value);
        console.log(chalk.green(`Set ${key} = ${value}`));
      } else {
        console.log(chalk.yellow('Use --list to view or --set key=value to update configuration'));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Examples command
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(chalk.blue('Usage Examples:'));
    console.log();

    console.log(chalk.yellow('Basic search:'));
    console.log('  gh-grep "useState"');
    console.log('  gh-grep "function fetchData" --use-regexp');
    console.log();

    console.log(chalk.yellow('Language filtering:'));
    console.log('  gh-grep "ErrorBoundary" -l TypeScript JavaScript');
    console.log('  gh-grep "class UserController" -l Python');
    console.log();

    console.log(chalk.yellow('Repository filtering:'));
    console.log('  gh-grep "useEffect" -r facebook/react');
    console.log('  gh-grep "express" -r expressjs');
    console.log();

    console.log(chalk.yellow('File filtering:'));
    console.log('  gh-grep "package.json" --path "package.json"');
    console.log();

    console.log(chalk.yellow('Output formats:'));
    console.log('  gh-grep "useState" --format json');
    console.log('  gh-grep "ErrorBoundary" --format markdown');
  });

/**
 * Call the Grep API directly via HTTP
 * This function makes HTTP requests to the Grep API instead of using MCP
 */
async function callGhGrep(params) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://grep.app/api/search');

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.query);

    if (params.language && params.language.length > 0) {
      params.language.forEach(lang => queryParams.append('lang', lang));
    }

    if (params.repo) {
      queryParams.append('repo', params.repo);
    }

    if (params.path) {
      queryParams.append('path', params.path);
    }

    if (params.useRegexp) {
      queryParams.append('regexp', 'true');
    }

    if (params.matchCase) {
      queryParams.append('case', 'true');
    }

    if (params.matchWholeWords) {
      queryParams.append('whole', 'true');
    }

    url.search = queryParams.toString();

    const options = {
      hostname: 'grep.app',
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'gh-grep-cli/1.0.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);

            // Transform Grep API response to match expected format
            const rawResults = response.hits?.hits || [];

            // Transform to match the format expected by the formatter
            const results = rawResults.map(item => ({
              repository: `${item.owner || 'unknown'}/${item.repo || 'unknown'}`,
              file: item.path || '',
              line: item.content?.snippet?.match(/data-line="(\d+)"/)?.[1] || 0,
              content: item.content?.snippet?.replace(/<[^>]*>/g, '') || '',
              language: item.lang || '',
              score: item.score || 0
            }));

            resolve(results);
          } else {
            throw new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout after 30 seconds'));
    });

    req.end();
  });
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message);
  if (process.env.DEBUG) {
    console.error(chalk.red('Stack:'), error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Export for testing
module.exports = { program, callGhGrep };