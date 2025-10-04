"""Project management for organizing watched folders."""

import json
import re
import secrets
from pathlib import Path
from typing import Dict, List, Optional


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug.

    Args:
        text: The text to slugify

    Returns:
        URL-friendly slug
    """
    # Convert to lowercase and replace spaces with hyphens
    slug = text.lower().strip()
    # Remove special characters except hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace multiple spaces/hyphens with single hyphen
    slug = re.sub(r'[\s-]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug or generate_project_id()


def generate_project_id() -> str:
    """Generate a random project ID.

    Returns:
        Random 8-character ID
    """
    return secrets.token_urlsafe(6)


class Project:
    """Represents a project with metadata."""

    def __init__(
        self,
        path: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        slug: Optional[str] = None,
        project_id: Optional[str] = None
    ):
        """Initialize a project.

        Args:
            path: Absolute path to the project directory
            title: Human-readable project title
            description: Project description
            slug: URL-friendly slug (generated from title if not provided)
            project_id: Unique project ID (generated if not provided)
        """
        self.path = path
        self.title = title or Path(path).name
        self.description = description or ""
        self.project_id = project_id or generate_project_id()
        self.slug = slug or slugify(self.title)

    def to_dict(self) -> Dict:
        """Convert project to dictionary.

        Returns:
            Dictionary representation of the project
        """
        return {
            'id': self.project_id,
            'title': self.title,
            'description': self.description,
            'path': self.path,
            'slug': self.slug
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Project':
        """Create project from dictionary.

        Args:
            data: Dictionary with project data

        Returns:
            Project instance
        """
        return cls(
            path=data['path'],
            title=data.get('title'),
            description=data.get('description'),
            slug=data.get('slug'),
            project_id=data.get('id')
        )


class ProjectManager:
    """Manages projects and persists them to disk."""

    def __init__(self, config_file: Path):
        """Initialize the project manager.

        Args:
            config_file: Path to the JSON config file
        """
        self.config_file = config_file
        self.projects: Dict[str, Project] = {}
        self.load()

    def load(self) -> None:
        """Load projects from config file."""
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                data = json.load(f)

                # Handle old format (list of paths)
                if isinstance(data, list):
                    self._migrate_from_old_format(data)
                else:
                    # New format (dict of projects)
                    for project_data in data.get('projects', []):
                        project = Project.from_dict(project_data)
                        self.projects[project.project_id] = project

    def _migrate_from_old_format(self, paths: List[str]) -> None:
        """Migrate from old format (list of paths) to new format.

        Args:
            paths: List of folder paths
        """
        for path in paths:
            project = Project(
                path=path,
                title=Path(path).name,
                description=f"Migrated project from {path}"
            )
            self.projects[project.project_id] = project
        self.save()

    def save(self) -> None:
        """Save projects to config file."""
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        data = {
            'projects': [p.to_dict() for p in self.projects.values()]
        }
        with open(self.config_file, 'w') as f:
            json.dump(data, f, indent=2)

    def add_project(
        self,
        path: str,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> Project:
        """Add a new project.

        Args:
            path: Path to the project directory
            title: Project title
            description: Project description

        Returns:
            The created project
        """
        project = Project(path=path, title=title, description=description)
        self.projects[project.project_id] = project
        self.save()
        return project

    def update_project(
        self,
        project_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        path: Optional[str] = None
    ) -> Optional[Project]:
        """Update an existing project.

        Args:
            project_id: ID of the project to update
            title: New title
            description: New description
            path: New path

        Returns:
            Updated project or None if not found
        """
        project = self.projects.get(project_id)
        if not project:
            return None

        if title is not None:
            project.title = title
            project.slug = slugify(title)
        if description is not None:
            project.description = description
        if path is not None:
            project.path = path

        self.save()
        return project

    def remove_project(self, project_id: str) -> bool:
        """Remove a project.

        Args:
            project_id: ID of the project to remove

        Returns:
            True if removed, False if not found
        """
        if project_id in self.projects:
            del self.projects[project_id]
            self.save()
            return True
        return False

    def get_project(self, project_id: str) -> Optional[Project]:
        """Get a project by ID.

        Args:
            project_id: The project ID

        Returns:
            Project or None if not found
        """
        return self.projects.get(project_id)

    def get_project_by_slug(self, slug: str) -> Optional[Project]:
        """Get a project by slug.

        Args:
            slug: The project slug

        Returns:
            Project or None if not found
        """
        for project in self.projects.values():
            if project.slug == slug:
                return project
        return None

    def get_all_projects(self) -> List[Project]:
        """Get all projects.

        Returns:
            List of all projects
        """
        return list(self.projects.values())
