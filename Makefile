.PHONY: help install dev run clean test lint format venv build-css watch-css

help:
	@echo "Available commands:"
	@echo "  make venv       - Create a virtual environment with uv"
	@echo "  make install    - Install the project dependencies using uv"
	@echo "  make dev        - Install the project in development mode"
	@echo "  make build-css  - Build Tailwind CSS"
	@echo "  make watch-css  - Watch and rebuild CSS on changes"
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
	npm install

build-css:
	npm run build:css

watch-css:
	npm run watch:css

run: build-css
	uv run fileviewer

clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf src/*.egg-info
	rm -rf node_modules/
	rm -f src/fileviewer/static/output.css
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
