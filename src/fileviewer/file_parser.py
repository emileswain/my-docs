"""File parser for extracting structure from markdown, JSON, and YAML files."""

import json
import re
from pathlib import Path
from typing import List, Dict, Any

import yaml


class FileParser:
    """Parses files and extracts their structure."""

    def __init__(self, file_path: str):
        """Initialize the file parser.

        Args:
            file_path: Path to the file to parse
        """
        self.file_path = Path(file_path)
        self.extension = self.file_path.suffix.lower()

    def parse(self) -> List[Dict[str, Any]]:
        """Parse the file and return its structure.

        Returns:
            List of tree nodes representing the file structure
        """
        if self.extension == '.md':
            return self._parse_markdown()
        elif self.extension == '.json':
            return self._parse_json()
        elif self.extension in ['.yml', '.yaml']:
            return self._parse_yaml()
        else:
            return []

    def get_raw_content(self) -> str:
        """Get the raw content of the file.

        Returns:
            Raw file content as string
        """
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"

    def _parse_markdown(self) -> List[Dict[str, Any]]:
        """Parse markdown file and extract headers.

        Returns:
            List of tree nodes for markdown headers
        """
        content = self.get_raw_content()
        nodes = []
        header_stack = []

        for line in content.split('\n'):
            # Match markdown headers (# to ######)
            match = re.match(r'^(#{1,6})\s+(.+)$', line.strip())
            if match:
                level = len(match.group(1))
                title = match.group(2).strip()

                # Remove headers from stack that are same level or deeper
                while header_stack and header_stack[-1]['level'] >= level:
                    header_stack.pop()

                node = {
                    'label': title,
                    'type': f'h{level}',
                    'level': level,
                    'children': []
                }

                if header_stack:
                    # Add as child to parent
                    header_stack[-1]['children'].append(node)
                else:
                    # Top-level header
                    nodes.append(node)

                header_stack.append(node)

        return nodes

    def _parse_json(self) -> List[Dict[str, Any]]:
        """Parse JSON file and extract structure.

        Returns:
            List of tree nodes for JSON structure
        """
        try:
            content = self.get_raw_content()
            data = json.loads(content)
            return self._build_json_tree(data)
        except json.JSONDecodeError as e:
            return [{'label': f'JSON Parse Error: {str(e)}', 'children': []}]
        except Exception as e:
            return [{'label': f'Error: {str(e)}', 'children': []}]

    def _parse_yaml(self) -> List[Dict[str, Any]]:
        """Parse YAML file and extract structure.

        Returns:
            List of tree nodes for YAML structure
        """
        try:
            content = self.get_raw_content()
            data = yaml.safe_load(content)
            return self._build_json_tree(data)  # Same structure as JSON
        except yaml.YAMLError as e:
            return [{'label': f'YAML Parse Error: {str(e)}', 'children': []}]
        except Exception as e:
            return [{'label': f'Error: {str(e)}', 'children': []}]

    def _build_json_tree(self, data: Any, key: str = None) -> List[Dict[str, Any]]:
        """Build tree structure from JSON/YAML data.

        Args:
            data: The data to build tree from
            key: Optional key name for this node

        Returns:
            List of tree nodes
        """
        if isinstance(data, dict):
            if key:
                # This is a nested object
                children = []
                for k, v in data.items():
                    children.extend(self._build_json_tree(v, k))
                return [{
                    'label': key,
                    'type': 'object',
                    'children': children
                }]
            else:
                # Root level object
                nodes = []
                for k, v in data.items():
                    nodes.extend(self._build_json_tree(v, k))
                return nodes

        elif isinstance(data, list):
            children = []
            for i, item in enumerate(data):
                children.extend(self._build_json_tree(item, f'[{i}]'))

            if key:
                return [{
                    'label': key,
                    'type': f'array[{len(data)}]',
                    'children': children
                }]
            else:
                return [{
                    'label': 'Root Array',
                    'type': f'array[{len(data)}]',
                    'children': children
                }]

        else:
            # Primitive value
            type_name = type(data).__name__
            if data is None:
                type_name = 'null'
            elif isinstance(data, bool):
                type_name = 'boolean'
            elif isinstance(data, (int, float)):
                type_name = 'number'
            else:
                type_name = 'string'

            return [{
                'label': key if key else str(data),
                'type': type_name,
                'children': []
            }]
