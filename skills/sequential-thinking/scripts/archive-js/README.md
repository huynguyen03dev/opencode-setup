# Archived JavaScript Implementation

**Status**: ARCHIVED - November 18, 2025
**Replaced By**: Python implementation in `../../scripts_python/`

## Files in this Archive

- `sequential-thinking` - Main CLI wrapper (JavaScript)
- `api.js` - Core reasoning engine (JavaScript)
- `cli.js` - Extended CLI with session management (JavaScript)
- `session-manager.js` - Session persistence utilities (JavaScript)

## Migration Details

The sequential-thinking skill has been successfully migrated from JavaScript to Python for:
- Better ecosystem alignment with AI/ML workflows
- Improved accessibility for Python developers
- Cleaner syntax and standard library advantages
- Maintained 100% API compatibility

## Accessing Legacy Code

If you need to reference or run the JavaScript implementation:

```bash
# Run legacy version directly
node /home/hazeruno/.config/opencode/skills/sequential-thinking/scripts/archive-js/sequential-thinking test

# Or use npm scripts
npm run start:legacy
npm run test:legacy
```

## Compatibility

The Python implementation maintains **100% backward compatibility**:
- Identical JSON API structure
- Same CLI arguments and options
- Identical output format
- All features preserved

## Support

For any issues with the Python implementation, see the migration guide: `../../MIGRATION_GUIDE.md`