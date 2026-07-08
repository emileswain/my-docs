"""Project management for organizing watched folders with group hierarchy."""

import json
import re
import secrets
from pathlib import Path
from typing import Dict, List, Optional


VALID_SUBPROJECT_TYPES = [
    'mobile', 'web', 'firmware', 'services', 'docs',
    'desktop', 'database', 'cloud', 'testing', 'design',
    'workspace',
]


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug.

    Args:
        text: The text to slugify

    Returns:
        URL-friendly slug
    """
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')
    return slug or generate_id()


def generate_id() -> str:
    """Generate a random ID.

    Returns:
        Random 8-character ID
    """
    return secrets.token_urlsafe(6)


class Project:
    """Represents a sub-project with metadata."""

    def __init__(
        self,
        path: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        slug: Optional[str] = None,
        project_id: Optional[str] = None,
        project_type: Optional[str] = None,
        watches: Optional[List[Dict]] = None,
        disabled_watches: Optional[List[str]] = None,
        enabled_watches: Optional[List[str]] = None,
    ):
        self.path = path
        self.title = title or Path(path).name
        self.description = description or ""
        self.project_id = project_id or generate_id()
        self.slug = slug or slugify(self.title)
        self.project_type = project_type or 'web'
        if self.project_type not in VALID_SUBPROJECT_TYPES:
            self.project_type = 'web'
        self.watches: List[Dict] = watches or []
        self.disabled_watches: List[str] = disabled_watches or []
        self.enabled_watches: List[str] = enabled_watches or []

    def to_dict(self) -> Dict:
        d = {
            'id': self.project_id,
            'title': self.title,
            'description': self.description,
            'path': self.path,
            'slug': self.slug,
            'type': self.project_type,
        }
        if self.watches:
            d['watches'] = self.watches
        if self.disabled_watches:
            d['disabled_watches'] = self.disabled_watches
        if self.enabled_watches:
            d['enabled_watches'] = self.enabled_watches
        return d

    @classmethod
    def from_dict(cls, data: Dict) -> 'Project':
        return cls(
            path=data['path'],
            title=data.get('title'),
            description=data.get('description'),
            slug=data.get('slug'),
            project_id=data.get('id'),
            project_type=data.get('type'),
            watches=data.get('watches'),
            disabled_watches=data.get('disabled_watches'),
            enabled_watches=data.get('enabled_watches'),
        )


class ProjectGroup:
    """Represents a group of related sub-projects."""

    def __init__(
        self,
        title: str,
        slug: Optional[str] = None,
        group_id: Optional[str] = None,
        subprojects: Optional[List[Project]] = None,
    ):
        self.title = title
        self.group_id = group_id or generate_id()
        self.slug = slug or slugify(title)
        self.subprojects: List[Project] = subprojects or []

    def to_dict(self) -> Dict:
        return {
            'id': self.group_id,
            'title': self.title,
            'slug': self.slug,
            'subprojects': [p.to_dict() for p in self.subprojects],
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'ProjectGroup':
        subprojects = [Project.from_dict(sp) for sp in data.get('subprojects', [])]
        return cls(
            title=data['title'],
            slug=data.get('slug'),
            group_id=data.get('id'),
            subprojects=subprojects,
        )

    def get_subproject(self, sub_id: str) -> Optional[Project]:
        for sp in self.subprojects:
            if sp.project_id == sub_id:
                return sp
        return None

    def get_subproject_by_slug(self, slug: str) -> Optional[Project]:
        for sp in self.subprojects:
            if sp.slug == slug:
                return sp
        return None


class ProjectManager:
    """Manages project groups and persists them to disk."""

    def __init__(self, config_file: Path):
        self.config_file = config_file
        self.groups: Dict[str, ProjectGroup] = {}
        self.load()

    def load(self) -> None:
        """Load groups from config file, migrating old formats if needed."""
        if not self.config_file.exists():
            return

        with open(self.config_file, 'r') as f:
            data = json.load(f)

        # Old format: list of paths
        if isinstance(data, list):
            self._migrate_from_paths(data)
            return

        version = data.get('version', 1)

        if version >= 2:
            # Current format
            for group_data in data.get('groups', []):
                group = ProjectGroup.from_dict(group_data)
                self.groups[group.group_id] = group
        else:
            # v1 format: flat projects list
            self._migrate_from_v1(data.get('projects', []))

    def _migrate_from_paths(self, paths: List[str]) -> None:
        """Migrate from oldest format (list of paths)."""
        projects = []
        for path in paths:
            projects.append({
                'path': path,
                'title': Path(path).name,
                'description': f"Migrated from {path}",
            })
        self._migrate_from_v1(projects)

    def _migrate_from_v1(self, projects_data: List[Dict]) -> None:
        """Migrate flat projects into groups based on path patterns."""
        # Build path-based grouping rules
        grouping = {
            'Alpha': {
                'paths': ['/Work/alpha/'],
                'type_overrides': {
                    'alpha_device': 'firmware',
                    'alpha_mobile': 'mobile',
                    'alpha_studio': 'web',
                    'alpha_services': 'services',
                    'alpha_docs': 'docs',
                    'aiworkflow': 'cloud',
                    'workspace_alpha': 'workspace',
                    'combine_will': 'testing',
                },
            },
            'Beta': {
                'paths': ['/Work/beta/'],
                'type_overrides': {
                    'platform-docs': 'docs',
                    'platform': 'services',
                    'results': 'testing',
                },
            },
            'Gamma': {
                'paths': ['/Work/example-workspace/'],
                'type_overrides': {
                    'scripts': 'services',
                    'workspace_alpha': 'workspace',
                },
            },
            'Emile': {
                'paths': ['/Work/emile/'],
                'type_overrides': {
                    'my-docs': 'docs',
                    'Haystack': 'desktop',
                    'meta-code': 'desktop',
                    'blender-3dprintkit': 'design',
                    'datocms-white-label': 'web',
                    'workspace_llm': 'cloud',
                },
            },
            'System': {
                'paths': ['/.claude'],
                'type_overrides': {
                    '.claude': 'cloud',
                },
            },
        }

        # Track seen paths to deduplicate
        seen_paths = set()
        group_buckets: Dict[str, List[Dict]] = {name: [] for name in grouping}
        group_buckets['Other'] = []

        for proj in projects_data:
            path = proj.get('path', '')

            # Skip duplicates
            if path in seen_paths:
                continue
            seen_paths.add(path)

            # Find matching group
            matched = False
            for group_name, rules in grouping.items():
                if any(p in path for p in rules['paths']):
                    # Determine type from path components
                    proj_type = 'web'
                    for key, t in rules['type_overrides'].items():
                        if key in path:
                            proj_type = t
                            break

                    proj['type'] = proj_type
                    group_buckets[group_name].append(proj)
                    matched = True
                    break

            if not matched:
                proj['type'] = 'web'
                group_buckets['Other'].append(proj)

        # Create groups from buckets
        for group_name, projects in group_buckets.items():
            if not projects:
                continue

            subprojects = []
            for p in projects:
                project = Project(
                    path=p['path'],
                    title=p.get('title', Path(p['path']).name),
                    description=p.get('description', ''),
                    slug=p.get('slug'),
                    project_id=p.get('id'),
                    project_type=p.get('type', 'web'),
                )
                subprojects.append(project)

            group = ProjectGroup(title=group_name, subprojects=subprojects)
            self.groups[group.group_id] = group

        self.save()

    def save(self) -> None:
        """Save groups to config file."""
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        data = {
            'version': 2,
            'groups': [g.to_dict() for g in self.groups.values()],
        }
        with open(self.config_file, 'w') as f:
            json.dump(data, f, indent=2)

    # --- Group CRUD ---

    def add_group(self, title: str) -> ProjectGroup:
        group = ProjectGroup(title=title)
        self.groups[group.group_id] = group
        self.save()
        return group

    def update_group(self, group_id: str, title: Optional[str] = None) -> Optional[ProjectGroup]:
        group = self.groups.get(group_id)
        if not group:
            return None
        if title is not None:
            group.title = title
            group.slug = slugify(title)
        self.save()
        return group

    def remove_group(self, group_id: str) -> bool:
        if group_id in self.groups:
            del self.groups[group_id]
            self.save()
            return True
        return False

    def get_group(self, group_id: str) -> Optional[ProjectGroup]:
        return self.groups.get(group_id)

    def get_group_by_slug(self, slug: str) -> Optional[ProjectGroup]:
        for group in self.groups.values():
            if group.slug == slug:
                return group
        return None

    def get_all_groups(self) -> List[ProjectGroup]:
        return list(self.groups.values())

    # --- Sub-project CRUD ---

    def add_subproject(
        self,
        group_id: str,
        path: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        project_type: Optional[str] = None,
    ) -> Optional[Project]:
        group = self.groups.get(group_id)
        if not group:
            return None
        project = Project(
            path=path,
            title=title,
            description=description,
            project_type=project_type,
        )
        group.subprojects.append(project)
        self.save()
        return project

    def update_subproject(
        self,
        group_id: str,
        sub_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        path: Optional[str] = None,
        project_type: Optional[str] = None,
    ) -> Optional[Project]:
        group = self.groups.get(group_id)
        if not group:
            return None
        project = group.get_subproject(sub_id)
        if not project:
            return None
        if title is not None:
            project.title = title
            project.slug = slugify(title)
        if description is not None:
            project.description = description
        if path is not None:
            project.path = path
        if project_type is not None and project_type in VALID_SUBPROJECT_TYPES:
            project.project_type = project_type
        self.save()
        return project

    def remove_subproject(self, group_id: str, sub_id: str) -> bool:
        group = self.groups.get(group_id)
        if not group:
            return False
        original_len = len(group.subprojects)
        group.subprojects = [sp for sp in group.subprojects if sp.project_id != sub_id]
        if len(group.subprojects) < original_len:
            self.save()
            return True
        return False

    # --- Compatibility helpers ---

    def get_all_projects(self) -> List[Project]:
        """Get flat list of all sub-projects across all groups (for file access checks)."""
        result = []
        for group in self.groups.values():
            result.extend(group.subprojects)
        return result

    def get_project(self, project_id: str) -> Optional[Project]:
        """Get a sub-project by ID from any group."""
        for group in self.groups.values():
            proj = group.get_subproject(project_id)
            if proj:
                return proj
        return None

    def get_project_by_slug(self, slug: str) -> Optional[Project]:
        """Get a sub-project by slug from any group (for backward compat)."""
        for group in self.groups.values():
            proj = group.get_subproject_by_slug(slug)
            if proj:
                return proj
        return None

    def get_subproject_by_slugs(self, group_slug: str, sub_slug: str) -> Optional[Project]:
        """Get a sub-project by group slug + sub-project slug."""
        group = self.get_group_by_slug(group_slug)
        if not group:
            return None
        return group.get_subproject_by_slug(sub_slug)

    def get_group_for_project(self, project_id: str) -> Optional[ProjectGroup]:
        """Find which group a sub-project belongs to."""
        for group in self.groups.values():
            if group.get_subproject(project_id):
                return group
        return None
