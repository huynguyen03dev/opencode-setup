#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Simple CLI without external dependencies
function printUsage() {
  console.log(`
gh-grep - GitHub Code Search CLI

Usage: node simple-cli.js <query> [options]

Options:
  -l, --language <lang>     Programming language
  -r, --repo <repo>        Repository (owner/repo)
  -p, --path <path>        File path pattern
  -f, --format <format>    Output format (json|markdown) [default: json]
  --use-regexp            Treat query as regular expression
  --match-case           Case-sensitive search
  --match-whole-words    Match whole words only
  --limit <number>       Maximum results [default: 10]
  -h, --help             Show this help

Examples:
  node simple-cli.js "useState" -l TypeScript
  node simple-cli.js "useEffect" -r facebook/react --format json
  node simple-cli.js "error handling" -l JavaScript --use-regexp
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const options = {
    query: args[0],
    language: null,
    repo: null,
    path: null,
    format: 'json',
    useRegexp: false,
    matchCase: false,
    matchWholeWords: false,
    limit: 10
  };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '-l':
      case '--language':
        options.language = args[++i];
        break;
      case '-r':
      case '--repo':
        options.repo = args[++i];
        break;
      case '-p':
      case '--path':
        options.path = args[++i];
        break;
      case '-f':
      case '--format':
        options.format = args[++i];
        break;
      case '--use-regexp':
        options.useRegexp = true;
        break;
      case '--match-case':
        options.matchCase = true;
        break;
      case '--match-whole-words':
        options.matchWholeWords = true;
        break;
      case '--limit':
        options.limit = parseInt(args[++i]);
        break;
    }
  }

  return options;
}

async function searchGrep(options) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://grep.app/api/search');
    const queryParams = new URLSearchParams();
    queryParams.append('q', options.query);

    if (options.language) {
      queryParams.append('lang', options.language);
    }
    if (options.repo) {
      queryParams.append('repo', options.repo);
    }
    if (options.path) {
      queryParams.append('path', options.path);
    }
    if (options.useRegexp) {
      queryParams.append('regexp', 'true');
    }
    if (options.matchCase) {
      queryParams.append('case', 'true');
    }
    if (options.matchWholeWords) {
      queryParams.append('whole', 'true');
    }
    if (options.limit) {
      queryParams.append('limit', options.limit.toString());
    }

    url.search = queryParams.toString();

    const requestOptions = {
      hostname: 'grep.app',
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'gh-grep-cli/1.0.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve(response.hits?.hits || []);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
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

function formatMarkdown(results, query) {
  if (!results || results.length === 0) {
    return `🔍 Search Results for "${query}"\n\nNo results found.\n`;
  }

  let output = `🔍 Search Results for "${query}"\n${results.length} results found\n\n`;

  const grouped = {};
  results.forEach(result => {
    const repo = `${result.owner || 'unknown'}/${result.repo || 'unknown'}`;
    if (!grouped[repo]) grouped[repo] = [];
    grouped[repo].push(result);
  });

  Object.entries(grouped).forEach(([repo, repoResults]) => {
    output += `📁 ${repo}\n`;

    const fileGroups = {};
    repoResults.forEach(result => {
      const file = result.path || 'Unknown File';
      if (!fileGroups[file]) fileGroups[file] = [];
      fileGroups[file].push(result);
    });

    Object.entries(fileGroups).forEach(([file, fileResults]) => {
      output += `  📄 ${file}\n`;
      fileResults.forEach(result => {
        // Extract line number and content from the HTML snippet
        const content = result.content?.snippet || '';
        const lineMatch = content.match(/data-line="(\d+)"/);
        const line = lineMatch ? lineMatch[1] : 'unknown';

        // Remove HTML tags to get clean content
        const cleanContent = content.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

        output += `    :${line}\n`;
        output += `    ${cleanContent.trim()}\n\n`;
      });
    });
    output += '\n';
  });

  return output;
}

function formatJSON(results, query) {
  // Enhanced JSON format with better structure and clean content
  const enhancedResults = results.map(result => {
    const rawContent = result.content?.snippet || '';

    // Extract clean content without HTML tags and decode HTML entities
    const cleanContent = rawContent
      .replace(/<[^>]*>/g, '')  // Remove HTML tags
      .replace(/&#39;/g, "'")  // Decode '
      .replace(/&quot;/g, '"') // Decode "
      .replace(/&amp;/g, '&')  // Decode &
      .replace(/&lt;/g, '<')  // Decode <
      .replace(/&gt;/g, '>')  // Decode >
      .trim();

    // Extract line number
    const lineMatch = rawContent.match(/data-line="(\d+)"/);
    const lineNumber = lineMatch ? parseInt(lineMatch[1]) : 0;

    // Clean repository name
    const cleanRepo = result.repo || 'unknown';
    const cleanOwner = result.owner || 'unknown';

    // Extract context (surrounding lines) - improved logic
    const lines = cleanContent.split('\n');

    // Find the line that actually contains the query match
    const queryLower = query.toLowerCase();
    const matchLineIndex = lines.findIndex(line =>
      line.toLowerCase().includes(queryLower.substring(0, Math.min(20, queryLower.length)))
    );

    const context = {
      before: matchLineIndex > 0 ? lines.slice(Math.max(0, matchLineIndex - 2), matchLineIndex).join('\n') : '',
      after: matchLineIndex >= 0 && matchLineIndex < lines.length - 1 ? lines.slice(matchLineIndex + 1, matchLineIndex + 3).join('\n') : '',
      matchLine: matchLineIndex >= 0 ? lines[matchLineIndex] : cleanContent.split('\n')[0],
      matchIndex: matchLineIndex
    };

    // Try to infer framework from imports and file patterns
    const contentLower = cleanContent.toLowerCase();
    const filePath = result.path || '';
    const fileExt = filePath.split('.').pop()?.toLowerCase() || '';

    let framework = 'Unknown';
    let language = result.lang || detectLanguageFromExtension(fileExt);

    // Detect frameworks from imports and patterns
    if (contentLower.includes('react') && (fileExt === 'jsx' || fileExt === 'tsx')) {
      framework = 'React';
      language = fileExt === 'tsx' ? 'TypeScript' : 'JavaScript';
    } else if (contentLower.includes('vue') && fileExt === 'vue') {
      framework = 'Vue';
      language = 'Vue';
    } else if (contentLower.includes('angular') && (fileExt === 'ts' || fileExt === 'component.ts')) {
      framework = 'Angular';
      language = 'TypeScript';
    } else if (contentLower.includes('django') || contentLower.includes('flask')) {
      framework = contentLower.includes('django') ? 'Django' : 'Flask';
      language = 'Python';
    } else if (contentLower.includes('express') && (contentLower.includes('require(\'express\'') || contentLower.includes('from \'express\'') || contentLower.includes('import.*express'))) {
      framework = 'Express';
      language = 'JavaScript';
    } else if (contentLower.includes('fastify') && (contentLower.includes('require(\'fastify\'') || contentLower.includes('from \'fastify\'') || contentLower.includes('import.*fastify'))) {
      framework = 'Fastify';
      language = 'JavaScript';
    }

    // Try to extract function name or class name
    let functionName = null;
    const functionMatch = cleanContent.match(/(?:function|const|let|var)\s+(\w+)\s*[=\(]/);
    if (functionMatch) {
      functionName = functionMatch[1];
    } else {
      const classMatch = cleanContent.match(/class\s+(\w+)/);
      if (classMatch) {
        functionName = classMatch[1];
      }
    }

    return {
      repository: cleanRepo,
      owner: cleanOwner,
      file: filePath,
      line: lineNumber,
      language: language,
      framework: framework,
      content: cleanContent,
      context: context,
      function_name: functionName,
      score: result.score || 0,
      // Additional metadata for better filtering
      metadata: {
        file_extension: fileExt,
        is_typescript: language === 'TypeScript',
        has_imports: contentLower.includes('import '),
        has_exports: contentLower.includes('export '),
        search_highlight: query
      }
    };
  });

  return JSON.stringify({
    query,
    search_metadata: {
      timestamp: new Date().toISOString(),
      total_count: results.length,
      processed_count: enhancedResults.length,
      api_version: "v1",
      format: "enhanced_json"
    },
    results: enhancedResults
  }, null, 2);
}

// Helper function to detect language from file extension
function detectLanguageFromExtension(ext) {
  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'scala': 'Scala',
    'sh': 'Shell',
    'sql': 'SQL',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'md': 'Markdown',
    'dockerfile': 'Docker',
    'mq5': 'MQL5',
    'mq4': 'MQL4',
    'mqh': 'MQL'
  };

  return languageMap[ext] || 'Unknown';
}

async function main() {
  try {
    const options = parseArgs();

    console.log(`🔍 Searching GitHub repositories...`);
    console.log(`Query: ${options.query}`);

    const results = await searchGrep(options);

    if (options.format === 'json') {
      console.log(formatJSON(results, options.query));
    } else {
      console.log(formatMarkdown(results, options.query));
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();