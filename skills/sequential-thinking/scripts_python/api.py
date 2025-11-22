#!/usr/bin/env python3

"""
Sequential Thinking API
Provides the core reasoning engine for sequential thought processing
Compatible with the original MCP sequential thinking tool interface
"""

import json
import sys
import re
from typing import Dict, Any, List, Optional, Union


class SequentialThinkingEngine:
    """Core reasoning engine for sequential thought processing"""

    def __init__(self):
        self.current_session = None
        self.mode = 'interactive'  # 'interactive', 'batch', 'api'

    def process_sequential_thinking(self, params: Dict[str, Any]) -> Dict[str, Any]:
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
        # Extract parameters with defaults
        thought = params.get('thought')
        next_thought_needed = params.get('nextThoughtNeeded')
        thought_number = params.get('thoughtNumber')
        total_thoughts = params.get('totalThoughts')
        is_revision = params.get('isRevision', False)
        revises_thought = params.get('revisesThought')
        branch_from_thought = params.get('branchFromThought')
        branch_id = params.get('branchId')
        needs_more_thoughts = params.get('needsMoreThoughts', False)

        # Validate required parameters
        if not thought or not isinstance(thought, str):
            raise ValueError('Thought is required and must be a string')

        if not isinstance(next_thought_needed, bool):
            raise ValueError('nextThoughtNeeded must be a boolean')

        if not isinstance(thought_number, int) or thought_number < 1:
            raise ValueError('thoughtNumber must be a positive integer')

        if not isinstance(total_thoughts, int) or total_thoughts < thought_number:
            raise ValueError('totalThoughts must be an integer >= thoughtNumber')

        # Process the thinking step
        result = self._process_thought({
            'thought': thought,
            'thoughtNumber': thought_number,
            'totalThoughts': total_thoughts,
            'isRevision': is_revision,
            'revisesThought': revises_thought,
            'branchFromThought': branch_from_thought,
            'branchId': branch_id,
            'nextThoughtNeeded': next_thought_needed,
            'needsMoreThoughts': needs_more_thoughts
        })

        return result

    def _process_thought(self, thinking_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single thought and return minimal response"""
        thought = thinking_data['thought']
        thought_number = thinking_data['thoughtNumber']
        total_thoughts = thinking_data['totalThoughts']
        next_thought_needed = thinking_data.get('nextThoughtNeeded')

        # Create minimal response with only essential fields
        response = {
            'thought': thought,
            'thoughtNumber': thought_number,
            'totalThoughts': total_thoughts,
            'nextThoughtNeeded': bool(next_thought_needed)
        }

        return response

  

class InteractiveMode:
    """Interactive session handler for sequential thinking"""

    def __init__(self, engine: SequentialThinkingEngine):
        self.engine = engine

    def start(self):
        """Start interactive reasoning session"""
        print('\n🧠 Sequential Thinking - Interactive Mode')
        print('=====================================\n')

        try:
            topic = input('What would you like to reason about? ')
            if not topic.strip():
                print('No topic provided. Exiting.')
                return

            print(f'\nStarting sequential thinking about: {topic}')
            print('Type "help" for commands, "exit" to quit.\n')

            thought_number = 1
            total_thoughts = 5  # Initial estimate
            is_complete = False

            while not is_complete:
                prompt = f'Thought {thought_number}/{total_thoughts} > '
                thought = input(prompt)

                if thought.lower() == 'exit':
                    break

                if thought.lower() == 'help':
                    self._show_help()
                    continue

                if thought.lower() == 'revise':
                    try:
                        revise_num = int(input('Which thought number to revise? '))
                        new_thought = input('New thought text: ')

                        result = self.engine.process_sequential_thinking({
                            'thought': new_thought,
                            'thoughtNumber': revise_num,
                            'totalThoughts': total_thoughts,
                            'isRevision': True,
                            'revisesThought': revise_num,
                            'nextThoughtNeeded': True
                        })
                        self._display_result(result)
                    except (ValueError, KeyboardInterrupt) as error:
                        print(f'Error: {error}')
                    continue

                if thought.strip():
                    try:
                        continue_response = input('Continue with more thoughts? (y/n): ')
                        next_thought_needed = continue_response.lower().startswith('y')

                        result = self.engine.process_sequential_thinking({
                            'thought': thought,
                            'thoughtNumber': thought_number,
                            'totalThoughts': total_thoughts,
                            'nextThoughtNeeded': next_thought_needed
                        })

                        self._display_result(result)

                        if not next_thought_needed:
                            is_complete = True
                        else:
                            thought_number += 1

                            # Optionally adjust estimate
                            adjust_response = input('Adjust total thoughts estimate? (y/n): ')
                            if adjust_response.lower().startswith('y'):
                                try:
                                    new_total = int(input(f'New total estimate (current: {total_thoughts}): '))
                                    if new_total >= thought_number:
                                        total_thoughts = new_total
                                except ValueError:
                                    print('Invalid number, keeping current estimate.')

                    except Exception as error:
                        print(f'Error processing thought: {error}')

            print('\n🎉 Sequential thinking session completed!')

        except KeyboardInterrupt:
            print('\n\nSession interrupted by user. Exiting...')
        except Exception as error:
            print(f'\nUnexpected error: {error}')

    def _display_result(self, result: Dict[str, Any]):
        """Display formatted thought analysis"""
        print('\n📝 Thought Processed:')
        print(f'   Thought {result["thoughtNumber"]}/{result["totalThoughts"]}')

        if result["nextThoughtNeeded"]:
            print('   Ready for next thought')
        else:
            print('   Reasoning complete')
        print('')

    def _show_help(self):
        """Show help information"""
        print('\nCommands:')
        print('  help    - Show this help')
        print('  revise  - Revise a previous thought')
        print('  exit    - Exit the session')
        print('  Just type your thoughts normally to add them')
        print('')


def main():
    """CLI entry point for the API module"""
    args = sys.argv[1:]
    engine = SequentialThinkingEngine()

    if len(args) == 0:
        # Interactive mode
        interactive = InteractiveMode(engine)
        interactive.start()
    elif args[0] == 'api':
        # API mode - read JSON from stdin
        try:
            input_data = sys.stdin.read()
            params = json.loads(input_data)
            result = engine.process_sequential_thinking(params)
            print(json.dumps(result, indent=2))
        except json.JSONDecodeError as error:
            raise ValueError(f'Invalid JSON: {error}')
        except Exception as error:
            raise error
    else:
        # Batch mode with arguments
        print('Usage:')
        print('  python3 api.py              # Interactive mode')
        print('  python3 api.py api          # API mode (JSON from stdin)')
        print('')


if __name__ == '__main__':
    main()