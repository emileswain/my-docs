.PHONY: help install dev run clean test lint format venv

help:
	@echo "Available commands:"
	@echo "  make venv       - Create a virtual environment with uv"
	@echo "  make install    - Install the project dependencies using uv"
	@echo "  make dev        - Install the project in development mode"
	@echo "  make run        - Run the file viewer server"
	@echo "  make clean      - Remove build artifacts and cache files"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linting checks"
	@echo "  make format     - Format code with black"

venv:
	@if [ ! -d .venv ]; then uv venv; fi

install: venv
	uv pip install -e .

dev: venv
	uv pip install -e ".[dev]"

run:
	uv run fileviewer

clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf src/*.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*~" -delete

test:
	uv run pytest

lint:
	uv run flake8 src/

format:
	uv run black src/
