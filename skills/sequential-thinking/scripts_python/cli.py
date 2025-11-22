#!/usr/bin/env python3

"""
Sequential Thinking CLI - Local implementation of sequential reasoning
Extended CLI with session management and export capabilities
"""

import argparse
import json
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional
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

    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return f'session_{int(datetime.utcnow().timestamp() * 1000)}_{hash(str(datetime.utcnow())) % 1000000}'

    def add_thought(self, thought_text: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Add new thought to session"""
        if options is None:
            options = {}

        thought = {
            'id': len(self.data['thoughts']) + 1,
            'text': thought_text,
            'timestamp': datetime.utcnow().isoformat(),
            'branch': self.data['currentBranch'],
            'number': len(self.data['thoughts']) + 1,
            'isRevision': options.get('isRevision', False),
            'revisesThought': options.get('revisesThought'),
            'branchFromThought': options.get('branchFromThought'),
            'branchId': options.get('branchId'),
            'estimate': options.get('estimate'),
            'nextThoughtNeeded': options.get('nextThoughtNeeded', True),
            'needsMoreThoughts': options.get('needsMoreThoughts', True)
        }

        self.data['thoughts'].append(thought)
        self.data['metadata']['totalThoughts'] = len(self.data['thoughts'])

        if options.get('isRevision'):
            self.data['metadata']['revisionCount'] += 1

        return thought

    def revise_thought(self, thought_number: int, new_text: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Revise existing thought"""
        original_thought = None
        for t in self.data['thoughts']:
            if t['number'] == thought_number:
                original_thought = t
                break

        if not original_thought:
            raise ValueError(f'Thought {thought_number} not found')

        revision = {
            'id': len(self.data['thoughts']) + 1,
            'text': new_text,
            'timestamp': datetime.utcnow().isoformat(),
            'branch': self.data['currentBranch'],
            'number': len(self.data['thoughts']) + 1,
            'isRevision': True,
            'revisesThought': thought_number,
            'originalText': original_thought['text'],
            'branchFromThought': None,
            'branchId': None,
            'nextThoughtNeeded': True,
            'needsMoreThoughts': True
        }

        self.data['thoughts'].append(revision)
        self.data['metadata']['revisionCount'] += 1

        return revision

    def create_branch(self, thought_number: int, branch_id: str) -> Dict[str, Any]:
        """Create reasoning branch"""
        branch_from_thought = None
        for t in self.data['thoughts']:
            if t['number'] == thought_number:
                branch_from_thought = t
                break

        if not branch_from_thought:
            raise ValueError(f'Thought {thought_number} not found')

        self.data['branches'][branch_id] = {
            'id': branch_id,
            'createdAt': datetime.utcnow().isoformat(),
            'fromThought': thought_number,
            'thoughts': [branch_from_thought]
        }

        self.data['metadata']['branchCount'] += 1
        self.data['currentBranch'] = branch_id

        return self.data['branches'][branch_id]

    def get_latest_thought(self) -> Optional[Dict[str, Any]]:
        """Get the most recent thought"""
        if not self.data['thoughts']:
            return None
        return self.data['thoughts'][-1]

    def get_session_summary(self) -> Dict[str, Any]:
        """Get session summary data"""
        latest_thought = self.get_latest_thought()

        status = 'Not Started'
        if latest_thought:
            status = 'In Progress' if latest_thought['nextThoughtNeeded'] else 'Complete'

        return {
            'sessionId': self.data['sessionId'],
            'topic': self.data['topic'],
            'totalThoughts': len(self.data['thoughts']),
            'createdAt': self.data['createdAt'],
            'updatedAt': datetime.utcnow().isoformat(),
            'currentStatus': status,
            'branches': len(self.data['branches']),
            'revisions': self.data['metadata']['revisionCount']
        }


def parse_arguments() -> argparse.Namespace:
    """Parse CLI arguments using argparse"""
    parser = argparse.ArgumentParser(
        description='Sequential Thinking CLI - Local reasoning and analysis tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Interactive Mode:
  python3 cli.py                    Start interactive reasoning session
  python3 cli.py -t "initial"      Start with initial thought topic

File Mode:
  python3 cli.py session.json      Load and continue existing session
  python3 cli.py -f session.json   Specify session file explicitly

Session Options:
  -t, --topic <topic>     Initial reasoning topic or question
  -o, --output <file>     Output file for session results
  --format <format>       Output format: json, markdown [default: json]

Thought Options (for batch processing):
  --thought <text>        Add a thought to current session
  --revise <number>       Revise thought number
  --branch <number>       Create branch from thought number
  --branch-id <id>        Branch identifier
  --estimate <number>     Estimated total thoughts needed
  --complete              Mark current reasoning as complete

Session Management:
  --clear                 Clear current session from memory

Output Options:
  -v, --verbose           Show detailed reasoning output
  --history               Show thought history only
  --summary               Show session summary
  --export <format>       Export session: json, markdown, compact

Examples:
  # Start interactive session
  python3 cli.py "How to optimize database queries?"

  # Add thought to session
  python3 cli.py --thought "Need to analyze query patterns" --estimate 5

  # Create branch from thought 3
  python3 cli.py --branch 3 --branch-id "alternative-approach"

  # Revise thought 2
  python3 cli.py --revise 2 --thought "Updated analysis with new data"

  # Export session as markdown
  python3 cli.py --export markdown --output reasoning.md
        '''
    )

    # Session options
    parser.add_argument('-t', '--topic', help='Initial reasoning topic or question')
    parser.add_argument('-o', '--output', help='Output file for session results')
    parser.add_argument('--format', choices=['json', 'markdown'], default='json',
                       help='Output format [default: json]')

    # Thought options
    parser.add_argument('--thought', help='Add a thought to current session')
    parser.add_argument('--revise', type=int, help='Revise thought number')
    parser.add_argument('--branch', type=int, help='Create branch from thought number')
    parser.add_argument('--branch-id', help='Branch identifier')
    parser.add_argument('--estimate', type=int, help='Estimated total thoughts needed')
    parser.add_argument('--complete', action='store_true', help='Mark current reasoning as complete')

    # Session management
    parser.add_argument('--clear', action='store_true', help='Clear current session from memory')

    # Output options
    parser.add_argument('-v', '--verbose', action='store_true', help='Show detailed reasoning output')
    parser.add_argument('--history', action='store_true', help='Show thought history only')
    parser.add_argument('--summary', action='store_true', help='Show session summary')
    parser.add_argument('--export', choices=['json', 'markdown', 'compact'],
                       help='Export session in specified format')

    # Positional arguments
    parser.add_argument('input_file', nargs='?', help='Input session file (deprecated in MCP mode)')

    return parser.parse_args()


def main():
    """Main CLI logic"""
    try:
        args = parse_arguments()

        # Create session (MCP pattern: fresh memory-only session each time)
        session = SequentialThinkingSession()
        engine = SequentialThinkingEngine()

        # Handle different modes
        if args.topic:
            # Start new session with topic
            session.data['topic'] = args.topic
            initial_thought = session.add_thought(f"Starting analysis: {args.topic}", {
                'estimate': args.estimate or 5
            })

            print('Started new reasoning session:')
            print(f'Topic: {args.topic}')
            print(f'Session ID: {session.data["sessionId"]}')
            print(f'Initial thought: {initial_thought["text"]}')

        elif args.thought:
            # Add thought to existing session
            if args.revise:
                revision = session.revise_thought(args.revise, args.thought)
                print(f'Revised thought {args.revise}:')
                print(f'Original: {revision["originalText"]}')
                print(f'Revised: {args.thought}')
            else:
                thought = session.add_thought(args.thought, {
                    'estimate': args.estimate,
                    'branchFromThought': args.branch,
                    'branchId': args.branch_id,
                    'nextThoughtNeeded': not args.complete
                })
                print(f'Added thought {thought["number"]}: {thought["text"]}')

        elif args.branch and args.branch_id:
            # Create branch
            branch = session.create_branch(args.branch, args.branch_id)
            print(f'Created branch "{args.branch_id}" from thought {args.branch}')

        elif args.clear:
            # Clear session
            session.data.update({
                'thoughts': [],
                'branches': {},
                'currentBranch': 'main',
                'metadata': {
                    'totalThoughts': 0,
                    'completedThoughts': 0,
                    'revisionCount': 0,
                    'branchCount': 0
                }
            })
            print('Session cleared')

        elif args.history:
            # Show thought history
            print('Thought History:')
            for index, thought in enumerate(session.data['thoughts']):
                revision_tag = f'[REVISED {thought["revisesThought"]}]' if thought['isRevision'] else ''
                branch_tag = f'[BRANCH: {thought["branchId"]}]' if thought.get('branchId') else ''
                print(f"{index + 1}. {thought['text']} {revision_tag} {branch_tag}")

        elif args.summary:
            # Show session summary
            summary = session.get_session_summary()
            print('Session Summary:')
            print(json.dumps(summary, indent=2))

        else:
            # Default: show session status
            summary = session.get_session_summary()
            print('Current Session Status:')
            print(f'Session ID: {summary["sessionId"]}')
            print(f'Topic: {summary["topic"] or "Not set"}')
            print(f'Thoughts: {summary["totalThoughts"]}')
            print(f'Status: {summary["currentStatus"]}')
            print(f'Branches: {summary["branches"]}')
            print(f'Revisions: {summary["revisions"]}')

        # Export if requested
        if args.export:
            export_data = None
            extension = 'txt'

            if args.export == 'json':
                export_data = json.dumps(session.data, indent=2)
                extension = 'json'
            elif args.export == 'markdown':
                export_data = _session_to_markdown(session.data)
                extension = 'md'
            elif args.export == 'compact':
                export_data = _session_to_compact(session.data)
                extension = 'txt'

            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    f.write(export_data)
                print(f'Session exported to: {args.output}')
            else:
                print(export_data)

    except Exception as error:
        print(f'Error: {error}', file=sys.stderr)
        sys.exit(1)


def _session_to_markdown(session_data: Dict[str, Any]) -> str:
    """Convert session to markdown format"""
    lines = []

    lines.append('# Sequential Thinking Session')
    lines.append('')
    lines.append(f'**Session ID:** {session_data["sessionId"]}')
    lines.append(f'**Topic:** {session_data.get("topic", "No topic specified")}')
    lines.append(f'**Created:** {session_data["createdAt"]}')
    lines.append(f'**Total Thoughts:** {len(session_data["thoughts"])}')
    lines.append(f'**Revisions:** {session_data["metadata"]["revisionCount"]}')
    lines.append(f'**Branches:** {len(session_data["branches"])}')
    lines.append('')

    lines.append('## Thoughts')
    lines.append('')

    for thought in session_data["thoughts"]:
        revision_tag = f' (revises #{thought["revisesThought"]})' if thought.get("isRevision") else ''
        branch_tag = f' [branch: {thought["branchId"]}]' if thought.get("branchId") else ''

        lines.append(f'### Thought #{thought["number"]}{revision_tag}{branch_tag}')
        lines.append('')
        lines.append(f'**Time:** {thought["timestamp"]}')
        lines.append(f'**Next Needed:** {thought.get("nextThoughtNeeded", True)}')
        if thought.get("estimate"):
            lines.append(f'**Estimated Total:** {thought["estimate"]} thoughts')
        lines.append('')
        lines.append(thought["text"])
        lines.append('')

        if thought.get("isRevision") and thought.get("originalText"):
            lines.append('**Original Text:**')
            lines.append(f'> {thought["originalText"]}')
            lines.append('')

    if session_data["branches"]:
        lines.append('## Branches')
        lines.append('')

        for branch_id, branch in session_data["branches"].items():
            lines.append(f'### Branch: {branch_id}')
            lines.append('')
            lines.append(f'**From Thought:** #{branch["fromThought"]}')
            lines.append(f'**Created:** {branch["createdAt"]}')
            lines.append('')

    return '\n'.join(lines)


def _session_to_compact(session_data: Dict[str, Any]) -> str:
    """Convert session to compact format"""
    lines = []

    lines.append(f'Session: {session_data["sessionId"]}')
    lines.append(f'Topic: {session_data.get("topic", "No topic")}')
    lines.append(f'Thoughts: {len(session_data["thoughts"])}')
    lines.append('')

    for thought in session_data["thoughts"]:
        prefix = f'REV[#{thought["revisesThought"]}]' if thought.get("isRevision") else 'THOUGHT'
        lines.append(f'{prefix}[{thought["number"]}]: {thought["text"]}')

    return '\n'.join(lines)


if __name__ == '__main__':
    main()