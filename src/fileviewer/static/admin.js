// State
let projects = [];
let editingProjectId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
}

// Show section
function showSection(sectionName) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-blue-50', 'text-blue-600');
    });
    event.target.closest('.nav-link').classList.add('active', 'bg-blue-50', 'text-blue-600');

    // Show section (for now only projects, but ready for more)
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
}

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        projects = await response.json();
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Render projects
function renderProjects() {
    const container = document.getElementById('projectsList');

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No projects yet. Add your first project to get started.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">${escapeHtml(project.title)}</h3>
                        <span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">${project.slug}</span>
                    </div>
                    ${project.description ? `<p class="text-gray-600 mb-3">${escapeHtml(project.description)}</p>` : ''}
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <div class="flex items-center">
                            <i class="fas fa-folder text-gray-400 mr-2"></i>
                            <code class="bg-gray-50 px-2 py-1 rounded">${escapeHtml(project.path)}</code>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <a href="/?project=${project.slug}"
                       class="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                       title="View Project">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button onclick="editProject('${project.id}')"
                            class="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Edit Project">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProject('${project.id}')"
                            class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Project">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Show add project modal
function showAddProjectModal() {
    editingProjectId = null;
    document.getElementById('modalTitle').textContent = 'Add Project';
    document.getElementById('saveButtonText').textContent = 'Add Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('projectModal').classList.remove('hidden');
}

// Edit project
function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    editingProjectId = projectId;
    document.getElementById('modalTitle').textContent = 'Edit Project';
    document.getElementById('saveButtonText').textContent = 'Save Changes';
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectPath').value = project.path;
    document.getElementById('projectModal').classList.remove('hidden');
}

// Close modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.add('hidden');
    editingProjectId = null;
}

// Handle project form submit
async function handleProjectSubmit(e) {
    e.preventDefault();

    const projectId = document.getElementById('projectId').value;
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const path = document.getElementById('projectPath').value.trim();

    if (!title || !path) {
        alert('Title and path are required');
        return;
    }

    try {
        let response;
        if (projectId) {
            // Update existing project
            response = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, path })
            });
        } else {
            // Create new project
            response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, path })
            });
        }

        const result = await response.json();

        if (response.ok) {
            closeProjectModal();
            await loadProjects();
        } else {
            alert(result.error || 'Failed to save project');
        }
    } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project');
    }
}

// Delete project
async function deleteProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadProjects();
        } else {
            const result = await response.json();
            alert(result.error || 'Failed to delete project');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
});

// Close modal on backdrop click
document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        closeProjectModal();
    }
});
