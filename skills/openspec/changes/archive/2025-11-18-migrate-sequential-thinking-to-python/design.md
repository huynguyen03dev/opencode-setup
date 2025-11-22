# Design: Sequential Thinking Python Migration

## Architecture Overview

### Current JavaScript Architecture
```
sequential-thinking/
├── scripts/
│   ├── sequential-thinking (main CLI wrapper)
│   ├── api.js (core engine + interactive mode)
│   ├── cli.js (extended CLI + session management)
│   └── session-manager.js (session persistence)
├── package.json
└── SKILL.md
```

### Proposed Python Architecture
```
sequential-thinking/
├── scripts/
│   ├── sequential-thinking (Python main CLI)
│   ├── api.py (core engine + interactive mode)
│   ├── cli.py (extended CLI + session management)
│   ├── session_manager.py (session persistence)
│   └── archive-js/ (archived JavaScript files)
├── package.json (minimal, for metadata only)
└── SKILL.md (updated for Python)
```

## Module Design

### 1. Core Engine (`api.py`)

**Purpose**: Provides sequential thinking analysis and processing engine

**Classes**:
- `SequentialThinkingEngine`: Main reasoning engine
- `InteractiveMode`: Interactive session handler

**Key Methods**:
```python
class SequentialThinkingEngine:
    def process_sequential_thinking(self, params: dict) -> dict:
        """
        Main API method compatible with MCP tool
        
        Args:
            params: Dict with keys:
                - thought (str): Current reasoning step
                - nextThoughtNeeded (bool): Whether more reasoning needed
                - thoughtNumber (int): Current step number
                - totalThoughts (int): Estimated total steps
                - isRevision (bool, optional): Revision flag
                - revisesThought (int, optional): Thought being revised
                - branchFromThought (int, optional): Branching point
                - branchId (str, optional): Branch identifier
                
        Returns:
            Dict with keys: success, thoughtData, analysis, recommendations, context
        """
        pass
    
    def analyze_thought(self, thought: str, context: dict) -> dict:
        """Analyze thought complexity, type, confidence, scope"""
        pass
    
    def assess_complexity(self, thought: str) -> str:
        """Return: 'very low' | 'low' | 'medium' | 'high' | 'very high'"""
        pass
    
    def classify_thought_type(self, thought: str) -> str:
        """Return: 'question' | 'analysis' | 'solution' | 'planning' | etc."""
        pass
    
    def generate_recommendations(self, context: dict) -> list[str]:
        """Generate contextual recommendations"""
        pass
```

```python
class InteractiveMode:
    def __init__(self, engine: SequentialThinkingEngine):
        self.engine = engine
    
    async def start(self) -> None:
        """Start interactive reasoning session"""
        pass
    
    def display_result(self, result: dict) -> None:
        """Display formatted thought analysis"""
        pass
```

**Dependencies**: Python stdlib only
- `sys`: stdin/stdout
- `json`: JSON parsing
- `re`: Regex for analysis
- `datetime`: Timestamps

### 2. Main CLI Wrapper (`sequential-thinking`)

**Purpose**: Entry point for all CLI operations

**Commands**:
- `interactive`: Launch interactive mode
- `api`: Process JSON from stdin (for programmatic use)
- `test`: Run built-in tests

**Structure**:
```python
#!/usr/bin/env python3
"""Sequential Thinking CLI Wrapper"""

import sys
import json
from api import SequentialThinkingEngine, InteractiveMode

def print_usage():
    """Print CLI usage help"""
    pass

def run_test():
    """Execute test suite"""
    pass

def main():
    """Main CLI entry point"""
    args = sys.argv[1:]
    
    if not args or '-h' in args or '--help' in args:
        print_usage()
        return
    
    command = args[0]
    engine = SequentialThinkingEngine()
    
    if command == 'interactive':
        interactive = InteractiveMode(engine)
        interactive.start()
    elif command == 'api':
        # Read JSON from stdin, process, output to stdout
        input_data = sys.stdin.read()
        params = json.loads(input_data)
        result = engine.process_sequential_thinking(params)
        print(json.dumps(result, indent=2))
    elif command == 'test':
        run_test()
    else:
        print(f"Unknown command: {command}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Dependencies**: Python stdlib only
- `sys`: Arguments and streams
- `json`: JSON I/O

### 3. Extended CLI (`cli.py`)

**Purpose**: Full-featured CLI with session management and export

**Structure**:
```python
#!/usr/bin/env python3
"""Extended Sequential Thinking CLI"""

import argparse
import json
from datetime import datetime
from api import SequentialThinkingEngine

class SequentialThinkingSession:
    """In-memory session management (MCP pattern)"""
    
    def __init__(self):
        self.data = {
            'sessionId': self._generate_session_id(),
            'createdAt': datetime.utcnow().isoformat(),
            'topic': None,
            'thoughts': [],
            'branches': {},
            'currentBranch': 'main',
            'metadata': {
                'totalThoughts': 0,
                'completedThoughts': 0,
                'revisionCount': 0,
                'branchCount': 0
            }
        }
    
    def add_thought(self, thought_text: str, options: dict = None) -> dict:
        """Add new thought to session"""
        pass
    
    def revise_thought(self, thought_number: int, new_text: str) -> dict:
        """Revise existing thought"""
        pass
    
    def create_branch(self, thought_number: int, branch_id: str) -> dict:
        """Create reasoning branch"""
        pass
    
    def get_session_summary(self) -> dict:
        """Get session summary data"""
        pass

def parse_arguments() -> argparse.Namespace:
    """Parse CLI arguments using argparse"""
    parser = argparse.ArgumentParser(
        description='Sequential Thinking CLI - Local reasoning tool'
    )
    # Add all argument definitions
    return parser.parse_args()

def main():
    """Main CLI logic"""
    args = parse_arguments()
    session = SequentialThinkingSession()
    
    # Handle different operations based on args
    # ...

if __name__ == '__main__':
    main()
```

**Dependencies**: Python stdlib only
- `argparse`: Argument parsing
- `json`: Data serialization
- `datetime`: Timestamps
- `sys`: I/O streams

## Data Structures

### Thought Object
```python
{
    'id': int,               # Sequential ID
    'text': str,             # Thought content
    'timestamp': str,        # ISO 8601 timestamp
    'branch': str,           # Branch name
    'number': int,           # Thought number in sequence
    'isRevision': bool,      # Is this a revision?
    'revisesThought': int,   # Original thought number (if revision)
    'branchFromThought': int,# Branch point (if branch)
    'branchId': str,         # Branch identifier (if branch)
    'estimate': int,         # Total thoughts estimate
    'nextThoughtNeeded': bool,  # Continue reasoning?
}
```

### Analysis Result
```python
{
    'success': bool,
    'thoughtData': Thought,
    'analysis': {
        'complexity': str,   # very low|low|medium|high|very high
        'type': str,         # question|analysis|solution|planning|etc.
        'confidence': float, # 0.0 to 1.0
        'scope': str,        # narrow|medium|broad
        'progress': float    # 0.0 to 1.0
    },
    'recommendations': list[str],
    'context': {
        'sessionProgress': float,
        'hasRevisions': bool,
        'hasBranches': bool,
        'estimatedCompletion': str,  # early|developing|advanced|complete
        'suggestedNextSteps': list[str]
    }
}
```

## Design Decisions

### 1. Python Version Target
**Decision**: Target Python 3.6+
**Rationale**: 
- Widely available across systems
- Supports f-strings, type hints, async/await
- Balance between features and compatibility

### 2. Dependency Strategy
**Decision**: Use stdlib only, no external packages
**Rationale**:
- Matches current JavaScript approach (zero deps)
- Simplifies installation and distribution
- Reduces maintenance burden
- `argparse` in stdlib is sufficient for CLI parsing

### 3. Async/Await Usage
**Decision**: Use regular synchronous I/O, not async
**Rationale**:
- Current JavaScript version uses sync I/O
- No concurrent operations needed
- Simpler implementation
- Can add async later if needed

### 4. Type Hints
**Decision**: Add optional type hints
**Rationale**:
- Improves code documentation
- Enables IDE support
- Optional (no runtime requirement)
- Helps with refactoring

### 5. File Organization
**Decision**: Mirror JavaScript structure exactly
**Rationale**:
- Easier to compare during migration
- Maintains conceptual organization
- Clear 1:1 mapping for review

### 6. Naming Conventions
**Decision**: Use Python conventions (snake_case)
**Rationale**:
- Follow PEP 8 standards
- More Pythonic
- API preserves camelCase for compatibility

### 7. Error Handling
**Decision**: Use try/except with specific error messages
**Rationale**:
- Maintain same error behavior as JavaScript
- Provide clear user feedback
- Enable debugging

## Migration Strategy

### Phase 1: Direct Port
1. Create Python files with identical structure
2. Port logic line-by-line where possible
3. Maintain same function signatures (in snake_case)
4. Keep same behavior and output

### Phase 2: Testing
1. Run test suite against both versions
2. Compare outputs for identical inputs
3. Verify edge cases
4. Test all CLI modes

### Phase 3: Documentation
1. Update all examples to Python
2. Update installation instructions
3. Add Python version requirements
4. Preserve functionality descriptions

### Phase 4: Deployment
1. Archive JavaScript files
2. Make Python scripts executable
3. Update package.json scripts
4. Final validation

## Risks & Trade-offs

### Risk: Regex Differences
**JavaScript**: Uses JS regex engine
**Python**: Uses Python `re` module
**Mitigation**: Test regex patterns carefully, document any differences

### Risk: Interactive Input Handling
**JavaScript**: Uses `readline` module
**Python**: Uses `input()` or `readline` module
**Mitigation**: Test interactive mode thoroughly on different terminals

### Risk: JSON Serialization
**JavaScript**: Flexible with types
**Python**: Stricter type handling
**Mitigation**: Explicit type conversion, comprehensive testing

### Trade-off: Performance
**Consideration**: Python may have different performance characteristics
**Acceptance**: I/O-bound operations should perform similarly
**Monitoring**: Benchmark if performance concerns arise

## Testing Strategy

### Unit Testing
- Test each analysis function independently
- Verify classification logic
- Test edge cases in complexity assessment

### Integration Testing
- Test API mode with sample JSON inputs
- Test interactive mode workflows
- Test extended CLI operations

### Compatibility Testing
- Compare outputs between JS and Python versions
- Test with existing automation (if any)
- Verify JSON API format matches exactly

### User Acceptance Testing
- Manual testing of interactive flows
- Verify help text and error messages
- Test on different operating systems
