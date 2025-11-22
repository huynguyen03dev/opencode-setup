# Migrate Sequential Thinking to Python

## Summary
Convert the sequential-thinking skill CLI from JavaScript (Node.js) to Python to align with common data science and AI tooling ecosystems while maintaining all existing functionality.

## Why
Migrating the sequential-thinking skill from JavaScript to Python offers several strategic advantages:

1. **Better Ecosystem Fit**: Python is the dominant language in AI/ML workflows, data science, and analytical tools. Users working with OpenCode's AI assistant are more likely to have Python as their primary language.

2. **Improved Accessibility**: Python's clearer syntax and widespread teaching in academic settings means more contributors can understand and improve the tool.

3. **Consistent Toolchain**: Many OpenCode users already have Python installed for other AI/ML tasks, reducing setup friction compared to requiring Node.js specifically for this skill.

4. **Standard Library Strength**: Python's stdlib provides excellent support for CLI tools (`argparse`), data manipulation, and text processing that align well with this tool's needs.

## Motivation
- **Ecosystem alignment**: Python is more prevalent in AI/ML workflows and data analysis
- **Dependency management**: Python's package management may be more familiar to target users
- **Performance considerations**: Python offers comparable or better performance for I/O-bound operations
- **Maintainability**: Python's syntax may be more accessible for contributions

## Current State
The sequential-thinking skill is implemented in JavaScript with:
- `scripts/sequential-thinking`: Main CLI wrapper (167 lines)
- `scripts/api.js`: Core reasoning engine with interactive mode (498 lines)
- `scripts/cli.js`: Extended CLI with session management (419 lines)
- `scripts/session-manager.js`: Session persistence utilities
- Zero external dependencies (Node.js built-ins only)
- Features: interactive mode, API mode, test mode, revision tracking, branching

## Proposed Changes
Migrate all JavaScript code to Python while:
1. **Preserving all functionality**: Interactive mode, API mode, test mode, revisions, branching
2. **Maintaining CLI interface**: Same command structure and arguments
3. **Keeping zero external dependencies**: Use Python standard library only
4. **Ensuring compatibility**: Same JSON API for drop-in replacement
5. **Updating documentation**: Reflect Python usage in SKILL.md and README.md

## Implementation Approach
1. Create Python equivalents for each JavaScript module
2. Use `argparse` for CLI argument parsing (replacing manual parsing)
3. Use `json` module for API mode (stdin/stdout)
4. Use `readline` or `input()` for interactive mode
5. Maintain same file structure under `scripts/`
6. Update shebang from `#!/usr/bin/env node` to `#!/usr/bin/env python3`
7. Update package.json scripts to reference Python commands

## Success Criteria
- [ ] All existing features work identically in Python
- [ ] CLI interface remains backward compatible
- [ ] API mode accepts same JSON input format
- [ ] Interactive mode provides same user experience
- [ ] Test mode validates all functionality
- [ ] No external dependencies required (stdlib only)
- [ ] Documentation updated with Python examples
- [ ] All absolute path patterns preserved

## Risks & Mitigations
- **Risk**: Python availability on user systems
  - **Mitigation**: Python 3.6+ is widely available; document requirements clearly
- **Risk**: Performance differences
  - **Mitigation**: I/O-bound operations should show comparable performance
- **Risk**: Breaking existing integrations
  - **Mitigation**: Maintain same CLI interface and API format

## Dependencies
None - this change is self-contained within the sequential-thinking skill.

## Timeline
Estimated 1-2 development sessions to complete migration and testing.
