.PHONY: help install dev run clean test lint format venv build-css watch-css kill-ports dev-frontend dev-backend build

help:
	@echo "Available commands:"
	@echo "  make venv          - Create a virtual environment with uv"
	@echo "  make install       - Install project with dependencies and build assets"
	@echo "  make dev           - Run development servers (React + Flask) with auto-reload"
	@echo "  make dev-frontend  - Run React dev server only"
	@echo "  make dev-backend   - Run Flask API server only"
	@echo "  make build         - Build React app for production"
	@echo "  make build-css     - Build Tailwind CSS"
	@echo "  make watch-css     - Watch and rebuild CSS on changes"
	@echo "  make run           - Run the file viewer server in production mode"
	@echo "  make kill-ports    - Kill any processes on ports 3000 and 6060"
	@echo "  make clean         - Remove build artifacts and cache files"
	@echo "  make test          - Run tests"
	@echo "  make lint          - Run linting checks"
	@echo "  make format        - Format code with black"

venv:
	@if [ ! -d .venv ]; then uv venv; fi

install: venv
	uv pip install -e ".[dev]"
	npm install
	cd frontend && npm install
	npm run build:css

kill-ports:
	@echo "Killing any processes on ports 3000 and 6060..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:6060 | xargs kill -9 2>/dev/null || true
	@echo "Ports cleared"

dev-frontend:
	@echo "Starting React dev server on port 3000..."
	cd frontend && npm run dev

dev-backend:
	@echo "Starting Flask API server on port 6060..."
	FLASK_ENV=development uv run fileviewer

dev: kill-ports
	@echo "Starting development servers..."
	@echo "  - React dev server: http://localhost:3000"
	@echo "  - Flask API server: http://localhost:6060"
	@echo ""
	@echo "Press Ctrl+C to stop all servers"
	@trap 'kill 0' EXIT; \
	(cd frontend && npm run dev) & \
	FLASK_ENV=development uv run fileviewer

build:
	@echo "Building React app for production..."
	cd frontend && npm run build
	@echo "React app built to src/fileviewer/static/dist/"

build-css:
	npm run build:css

watch-css:
	npm run watch:css

run: build build-css
	@echo "Starting production server..."
	FLASK_ENV=production uv run fileviewer

clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf src/*.egg-info
	rm -rf node_modules/
	rm -rf frontend/node_modules/
	rm -rf frontend/dist/
	rm -rf src/fileviewer/static/dist/
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
