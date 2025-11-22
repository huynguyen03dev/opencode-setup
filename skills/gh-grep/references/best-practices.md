# gh-grep Best Practices

This guide covers best practices for effectively using gh-grep to search GitHub repositories and find relevant code patterns.

## Search Strategy

### Start Broad, Then Narrow
```bash
# Start with a broad search
gh-grep "useState" -l TypeScript

# Then narrow with specific patterns
gh-grep "const \[.*, set.*\] = useState" --use-regexp -l TypeScript
```

### Use Specific Language Filters
```bash
# Good: Specify languages
gh-grep "ErrorBoundary" -l TypeScript JavaScript

# Avoid: Too broad
gh-grep "Error"  # This will find many irrelevant results
```

### Combine Multiple Filters
```bash
# Combine language, repository, and file filters
gh-grep "useEffect" -l TypeScript -r facebook/react --path "src/hooks"
```

## Query Construction

### Use Regular Expressions Effectively
```bash
# Find function definitions
gh-grep "function \w+\(|const \w+.*=.*\(" --use-regexp

# Find class definitions
gh-grep "class \w+.*\{" --use-regexp

# Find import statements
gh-grep "import.*from ['\"]\w+['\"]" --use-regexp
```

### Match Whole Words When Appropriate
```bash
# For exact term matching
gh-grep "test" --match-whole-words

# Avoids matching: "testing", "attest", "contest"
```

### Consider Case Sensitivity
```bash
# Case-sensitive search for specific APIs
gh-grep "Component" --match-case -l TypeScript

# Case-insensitive for general concepts
gh-grep "error handling" -l Python
```

## Repository Targeting

### Search Specific Repositories
```bash
# Search in specific high-quality repositories
gh-grep "useState" -r facebook/react
gh-grep "express" -r expressjs/express
gh-grep "component" -r vuejs/vue
```

### Use Repository Patterns
```bash
# Search in organization repositories
gh-grep "authentication" -r "microsoft/*"

# Search in specific types of projects
gh-grep "docker" -r "*-docker"
```

### Prioritize Established Projects
```bash
# Look for repositories with minimum stars
gh-grep "websocket" --min-stars 1000

# Combine with recent activity
gh-grep "microservice" --min-stars 500 --updated-after 2023-01-01
```

## File Path Filtering

### Target Specific File Types
```bash
# Search in configuration files
gh-grep "port" --file-extension json yaml yml

# Search in test files
gh-grep "describe\(" --file-extension test.js spec.js
```

### Focus on Relevant Directories
```bash
# Search in source code only
gh-grep "export" --path "src/*"

# Exclude documentation and tests
gh-grep "class \w+" --path "src/*" --not-path "docs/*" --not-path "test/*"
```

## Common Use Cases

### Learning New APIs
```bash
# Find real usage examples
gh-grep "fetchData.*useEffect" --use-regexp -l TypeScript

# Look for implementation patterns
gh-grep "createSlice" -l TypeScript --limit 20
```

### Finding Best Practices
```bash
# Error handling patterns
gh-grep "(?s)try.*{.*}.*catch" --use-regexp -l TypeScript

# Performance optimization
gh-grep "useMemo|useCallback" -l TypeScript
```

### Code Review Preparation
```bash
# Find similar implementations
gh-grep "authentication" -l JavaScript --min-stars 1000

# Security patterns
gh-grep "bcrypt|hash|salt" -l JavaScript --limit 15
```

## Output Optimization

### Use Appropriate Output Formats
```bash
# JSON for programmatic processing
gh-grep "useState" --format json > results.json

# Markdown for documentation
gh-grep "ErrorBoundary" --format markdown > patterns.md
```

### Limit Results for Focus
```bash
# Get a manageable number of examples
gh-grep "express" --limit 10

# Use smaller limits for complex searches
gh-grep "(?s)async.*{.*await" --use-regexp --limit 5
```

## Performance Tips

### Optimize Search Queries
```bash
# Be specific with patterns
gh-grep "useState\(" --use-regexp  # Better than just "useState"

# Use language filters to reduce search space
gh-grep "socket" -l JavaScript     # Better than searching all languages
```

### Filter Early
```bash
# Apply filters in the search rather than post-processing
gh-grep "test" -r facebook/react  # Better than searching all repos

# Use path filters for relevant files
gh-grep "export" --path "src/*"   # Better than including node_modules
```

## Research Workflows

### Comparative Analysis
```bash
# Compare implementations across frameworks
gh-grep "component" -r facebook/react -l TypeScript
gh-grep "component" -r vuejs/vue -l JavaScript

# Find patterns in similar projects
gh-grep "middleware" -l JavaScript --min-stars 1000
```

### Historical Research
```bash
# Find recent trends
gh-grep "hooks" --updated-after 2022-01-01

# Compare old vs new patterns
gh-grep "class.*Component" -l TypeScript
gh-grep "function.*Component" -l TypeScript
```

### Troubleshooting
```bash
# Find common error patterns
gh-grep "Cannot read property" --use-regexp

# Look for solutions
gh-grep "fix.*bug|hotfix" --file-extension md --use-regexp
```

## Configuration Management

### Set Up Useful Presets
```bash
# Configure common language combinations
gh-grep config --set languagePresets.react="TypeScript,JavaScript,HTML,CSS"
gh-grep config --set languagePresets.backend="Python,Go,Java,Node"

# Add repository shortcuts
gh-grep config --set repositoryShortcuts.react="facebook/react"
gh-grep config --set repositoryShortcuts.vue="vuejs/vue"
```

### Use Search Patterns
```bash
# Define reusable search patterns
gh-grep config --set searchPatterns.hooks="use\\w+"
gh-grep config --set searchPatterns.async="async.*await|Promise"

# Then use them in searches
gh-grep hooks -l TypeScript
gh-grep async -l JavaScript
```

## Quality Assessment

### Evaluate Search Results
1. **Repository Quality**: Check star count and recent activity
2. **Code Relevance**: Ensure results match your use case
3. **Implementation Quality**: Look for error handling and documentation
4. **Recency**: Prefer more recent implementations for current practices

### Validate Patterns
```bash
# Look for multiple examples
gh-grep "useEffect" -l TypeScript --limit 20

# Check for variations
gh-grep "useEffect.*\[\]" --use-regexp -l TypeScript
gh-grep "useEffect.*\[.*\]" --use-regexp -l TypeScript
```

## Common Pitfalls to Avoid

### Avoid Generic Searches
```bash
# Too broad - will return many irrelevant results
gh-grep "function"

# Better - be more specific
gh-grep "function.*fetchData" --use-regexp
```

### Don't Ignore Context
```bash
# Consider surrounding code patterns
gh-grep "(?s)try.*{.*await.*catch" --use-regexp

# Look for complete patterns
gh-grep "import.*React|from.*react" --use-regexp
```

### Be Mindful of Repository Age
```bash
# Filter out very old repositories
gh-grep "webpack" --updated-after 2020-01-01

# Combine with quality filters
gh-grep "testing" --min-stars 100 --updated-after 2022-01-01
```

## Integration with Development Workflow

### During Development
```bash
# Find implementation examples before coding
gh-grep "authentication middleware" -l JavaScript

# Look for best practices
gh-grep "error handling" -r your-org/* --limit 5
```

### Code Review
```bash
# Find similar patterns in other projects
gh-grep "pull request review" -l JavaScript --min-stars 500

# Check for security patterns
gh-grep "security.*scan|CORS|XSS" -l JavaScript
```

### Learning and Documentation
```bash
# Create pattern libraries
gh-grep "useState" --format markdown > react-hooks-patterns.md

# Document best practices
gh-grep "error boundary" -l TypeScript --limit 10 > error-handling.md
```

Remember: The key to effective GitHub code search is being specific, using appropriate filters, and evaluating the quality of search results critically.