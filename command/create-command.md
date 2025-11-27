# Rule: Create Command

## Goal

Create a new project-level command file in `.opencode/command/` following OpenCode conventions.

## Process

1. **Analyze Request:** Understand what the command should do
2. **Create File:** Generate command with structure below
3. **Save:** Save as `[command-name].md` in `.opencode/command/`

## Template

```markdown
# Rule: [Command Name]

## Goal

[Brief description of what this command does]

## Process

1. **Step 1:** [Description]
2. **Step 2:** [Description]
3. **Step 3:** [Description]

```

## Notes

- Use kebab-case filenames: `create-api-route.md`
- Keep steps clear and actionable
- Specify file locations relative to project root

<UserRequest>
  $ARGUMENTS
</UserRequest>
