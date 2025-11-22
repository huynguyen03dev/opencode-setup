# Common Search Patterns

This document provides commonly used search patterns for effective GitHub code searching with gh-grep.

## Language-Specific Patterns

### JavaScript/TypeScript
```bash
# React Hooks
gh-grep "use\w+" --use-regexp -l TypeScript JavaScript

# Async/Await patterns
gh-grep "async.*await|Promise\." --use-regexp -l TypeScript JavaScript

# Error handling
gh-grep "try.*catch|throw new|Error\(" --use-regexp -l TypeScript JavaScript

# Import/Export statements
gh-grep "import.*from|require\(" --use-regexp -l TypeScript JavaScript
gh-grep "export.*|module\.exports" --use-regexp -l TypeScript JavaScript
```

### Python
```bash
# Function definitions
gh-grep "def \w+" --use-regexp -l Python

# Class definitions
gh-grep "class \w+" --use-regexp -l Python

# Decorators
gh-grep "@\w+" --use-regexp -l Python

# Exception handling
gh-grep "try:|except|raise" --use-regexp -l Python
```

### Java
```bash
# Class definitions
gh-grep "public class \w+" --use-regexp -l Java

# Method definitions
gh-grep "public.*\w+\(" --use-regexp -l Java

# Annotations
gh-grep "@\w+" --use-regexp -l Java

# Exception handling
gh-grep "try.*catch|throws" --use-regexp -l Java
```

## Framework-Specific Patterns

### React
```bash
# Component definitions
gh-grep "function.*Component|const.*=.*\(\) =>" --use-regexp -r facebook/react

# JSX elements
gh-grep "<[A-Z]\w*" --use-regexp -l TypeScript JavaScript

# useEffect hooks
gh-grep "useEffect\(" --use-regexp -l TypeScript JavaScript

# State management
gh-grep "useState|useReducer" --use-regexp -l TypeScript JavaScript
```

### Express.js
```bash
# Route definitions
gh-grep "app\.(get|post|put|delete)" --use-regexp -r expressjs/express

# Middleware
gh-grep "app\.use" --use-regexp -r expressjs/express

# Error handling middleware
gh-grep "err.*req.*res.*next" --use-regexp -l JavaScript
```

### Django
```bash
# View functions
gh-grep "def \w+\(request" --use-regexp -l Python

# URL patterns
gh-grep "path\(|url\(" --use-regexp -l Python

# Models
gh-grep "class.*models\.Model" --use-regexp -l Python
```

## Common Programming Patterns

### Error Handling
```bash
# Try-catch blocks
gh-grep "(?s)try\s*{.*?}.*?catch" --use-regexp

# Error classes
gh-grep "class.*Error|throw new" --use-regexp

# Validation patterns
gh-grep "validate|validation" --match-whole-words
```

### API Integration
```bash
# HTTP requests
gh-grep "fetch\(|axios\.|XMLHttpRequest" --use-regexp

# Response handling
gh-grep "\.json\(\)|\.then\(|response\." --use-regexp

# API endpoints
gh-grep "\/api\/|endpoint|route" --use-regexp
```

### Database Operations
```bash
# SQL queries
gh-grep "SELECT.*FROM|INSERT.*INTO|UPDATE.*SET" --use-regexp

# Database connections
gh-grep "connect\(|connection|database" --use-regexp

# ORM patterns
gh-grep "\.find\(|\.create\(|\.update\(" --use-regexp
```

### Testing Patterns
```bash
# Test functions
gh-grep "test\(|it\(|describe\(" --use-regexp

# Assertions
gh-grep "expect\(|assert\(|should\." --use-regexp

# Mock functions
gh-grep "jest\.fn\(|mock|stub" --use-regexp
```

## Configuration Patterns

### Package.json
```bash
# Scripts section
gh-grep "\"scripts\":" --path "package.json" --use-regexp

# Dependencies
gh-grep "\"dependencies\"|\"devDependencies\"" --path "package.json" --use-regexp

# Build scripts
gh-grep "build|start|test|dev" --path "package.json"
```

### Docker Files
```bash
# Dockerfile patterns
gh-grep "FROM.*|RUN.*|COPY.*|CMD.*" --path "Dockerfile" --use-regexp

# Docker Compose
gh-grep "services:|image:|ports:" --path "docker-compose.yml" --use-regexp
```

### CI/CD Files
```bash
# GitHub Actions
gh-grep "on:|jobs:|steps:" --path ".github/workflows" --use-regexp

# GitLab CI
gh-grep "stages:|script:|artifacts:" --path ".gitlab-ci.yml" --use-regexp
```

## Security Patterns

### Authentication
```bash
# JWT patterns
gh-grep "jwt|jsonwebtoken|Bearer" --use-regexp

# Password handling
gh-grep "password|hash|bcrypt|salt" --use-regexp

# Session management
gh-grep "session|cookie|auth" --use-regexp
```

### Input Validation
```bash
# Sanitization
gh-grep "sanitize|escape|validate" --use-regexp

# XSS prevention
gh-grep "xss|sanitize|escapeHTML" --use-regexp

# SQL injection prevention
gh-grep "prepared|parameterized|execute" --use-regexp
```

## Performance Patterns

### Optimization
```bash
# Caching
gh-grep "cache|memo|localStorage" --use-regexp

# Lazy loading
gh-grep "lazy|defer|async" --use-regexp

# Performance monitoring
gh-grep "performance|timing|benchmark" --use-regexp
```

### Memory Management
```bash
# Memory patterns
gh-grep "memory|malloc|dispose|cleanup" --use-regexp

# Event listeners
gh-grep "addEventListener|removeEventListener" --use-regexp
```

## File Type Specific

### Configuration Files
```bash
# Environment files
gh-grep "process\.env|\.env" --use-regexp --file-extension env

# YAML configurations
gh-grep "port|host|database" --file-extension yml yaml

# JSON configurations
gh-grep "\"name\"|\"version\"|\"main\"" --file-extension json
```

### Documentation
```bash
# README patterns
gh-grep "# Installation|# Usage|# Examples" --path README.md --use-regexp

# API documentation
gh-grep "@param|@return|@example" --file-extension md --use-regexp
```

## Tips for Effective Searching

1. **Use specific patterns**: Instead of generic terms, use specific code patterns
2. **Combine with language filters**: Always specify the programming language
3. **Use repository filters**: Focus on specific repositories when appropriate
4. **Leverage regex**: Use regular expressions for flexible pattern matching
5. **Consider file extensions**: Filter by file types for more relevant results
6. **Use context patterns**: Search for related code around your main query

## Example Workflow

```bash
# 1. Find React hook usage patterns
gh-grep "useState\(" -l TypeScript --limit 10

# 2. Look for error handling in a specific repository
gh-grep "try.*catch" -r facebook/react --use-regexp

# 3. Find API integration patterns
gh-grep "fetch\(|axios\." --use-regexp -l JavaScript

# 4. Search for testing patterns
gh-grep "describe\(|it\(" --use-regexp --file-extension test.js spec.js
```