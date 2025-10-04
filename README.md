# File Viewer

A Python web application for browsing and viewing markdown, JSON, and YAML files with a modern interface.

## Features

- Web-based file browser with live folder monitoring
- Support for markdown, JSON, and YAML files
- Tree-view content navigation with expandable depth control
- Multiple folder watching capability
- Modern Tailwind CSS interface

## Prerequisites

- [uv](https://github.com/astral-sh/uv) - Fast Python package installer

## Installation

```bash
# Install dependencies
make install

# Or install with development dependencies
make dev
```

## Usage

```bash
# Run the server
make run

# Or directly with uv
uv run fileviewer
```

The server will start on port 6060 by default (or the next available port).

## Development

### Available Make Commands

- `make help` - Show all available commands
- `make venv` - Create a virtual environment (automatically run by install/dev)
- `make install` - Install the project dependencies
- `make dev` - Install with development dependencies
- `make run` - Run the file viewer server
- `make clean` - Remove build artifacts and cache files
- `make test` - Run tests
- `make lint` - Run linting checks
- `make format` - Format code with black
