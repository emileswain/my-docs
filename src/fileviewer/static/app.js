// State management
let currentProject = null;
let projects = [];
let currentFile = null;
let currentFileData = null;
let globalDepth = 2; // Default depth
let showRaw = false; // Toggle between rendered and raw content

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    setupEventListeners();

    // Check for project in URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get('project');

    if (projectParam) {
        // Find project by slug or ID
        const project = projects.find(p => p.slug === projectParam || p.id === projectParam);
        if (project) {
            await selectProject(project, false); // Don't update URL when loading from URL

            // Check localStorage for previously selected file in this project
            const savedFile = localStorage.getItem('currentFile');
            if (savedFile && savedFile.startsWith(project.path)) {
                const fileName = savedFile.split('/').pop();
                await selectFile(savedFile, fileName);
            }
        }
    } else {
        // Fallback to localStorage
        const savedProjectId = localStorage.getItem('currentProjectId');
        if (savedProjectId) {
            const project = projects.find(p => p.id === savedProjectId);
            if (project) {
                await selectProject(project);

                // Restore previously selected file
                const savedFile = localStorage.getItem('currentFile');
                if (savedFile && savedFile.startsWith(project.path)) {
                    const fileName = savedFile.split('/').pop();
                    await selectFile(savedFile, fileName);
                }
            }
        }
    }
});

// Setup event listeners
function setupEventListeners() {
    // Project dropdown toggle
    document.getElementById('folderDropdownBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProjectDropdown();
    });

    // Expand/collapse all
    document.getElementById('expandAllBtn').addEventListener('click', () => changeDepth(10));
    document.getElementById('collapseAllBtn').addEventListener('click', () => changeDepth(1));

    // Prevent clicks inside panels from closing them
    document.getElementById('folderDropdown').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.getElementById('folderDropdown').classList.add('hidden');
    });
}

// Toggle project dropdown
function toggleProjectDropdown() {
    const dropdown = document.getElementById('folderDropdown');
    dropdown.classList.toggle('hidden');
}

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        projects = await response.json();
        renderProjects();
        renderProjectDropdown();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Render projects list (not needed in main view anymore)
function renderProjects() {
    // Projects are managed in admin panel
}

// Render project dropdown
function renderProjectDropdown() {
    const dropdown = document.getElementById('folderList');

    if (projects.length === 0) {
        dropdown.innerHTML = '<p class="px-4 py-2 text-gray-400 italic text-sm">No projects available</p>';
        return;
    }

    dropdown.innerHTML = projects.map(project => `
        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" onclick="selectProjectById('${project.id}')">
            <div class="text-sm font-semibold text-gray-800">${escapeHtml(project.title)}</div>
            ${project.description ? `<div class="text-xs text-gray-500">${escapeHtml(project.description)}</div>` : ''}
        </div>
    `).join('');
}

// Select project by ID (helper)
function selectProjectById(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        selectProject(project);
    }
}

// Select project
async function selectProject(project, updateUrl = true) {
    currentProject = project;
    document.getElementById('currentFolderName').textContent = project.title;
    document.getElementById('folderDropdown').classList.add('hidden');

    // Save to localStorage
    localStorage.setItem('currentProjectId', project.id);

    // Update URL with clean slug path
    if (updateUrl) {
        window.history.pushState({}, '', `/?project=${project.slug}`);
    }

    await loadProjectContents(project);
}

// Load project contents
async function loadProjectContents(project) {
    try {
        const response = await fetch(`/api/projects/${project.id}/browse`);
        const data = await response.json();

        if (response.ok) {
            renderFileTree(data.items);
        } else {
            document.getElementById('fileTree').innerHTML = `<p class="text-red-500">${data.error}</p>`;
        }
    } catch (error) {
        console.error('Error loading project:', error);
        document.getElementById('fileTree').innerHTML = '<p class="text-red-500">Error loading project</p>';
    }
}

// Render file tree
function renderFileTree(items) {
    const tree = document.getElementById('fileTree');

    if (items.length === 0) {
        tree.innerHTML = '<p class="text-gray-400 italic">No supported files found</p>';
        return;
    }

    const html = items.map(item => {
        if (item.type === 'folder') {
            return `
                <div class="tree-item py-1 px-2 rounded" onclick="toggleFolder(this, '${item.path.replace(/'/g, "\\'")}')">
                    <i class="fas fa-folder text-blue-500 mr-2"></i>
                    <span>${item.name}</span>
                    <div class="tree-children hidden"></div>
                </div>
            `;
        } else {
            const icon = getFileIcon(item.extension);
            return `
                <div class="tree-item py-1 px-2 rounded" onclick="selectFile('${item.path.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')">
                    <i class="fas ${icon} text-gray-500 mr-2"></i>
                    <span>${item.name}</span>
                </div>
            `;
        }
    }).join('');

    tree.innerHTML = html;
}

// Get file icon
function getFileIcon(extension) {
    const icons = {
        '.md': 'fa-file-alt',
        '.json': 'fa-file-code',
        '.yml': 'fa-file-code',
        '.yaml': 'fa-file-code'
    };
    return icons[extension] || 'fa-file';
}

// Toggle folder
async function toggleFolder(element, path) {
    event.stopPropagation();
    const childrenDiv = element.querySelector('.tree-children');
    const icon = element.querySelector('i');

    if (!currentProject) {
        console.error('No current project selected');
        return;
    }

    if (childrenDiv.classList.contains('hidden')) {
        // Expand
        if (childrenDiv.innerHTML === '') {
            // Load contents - need to get relative path from project root
            try {
                // Calculate relative path from project root
                const relativePath = path.startsWith(currentProject.path)
                    ? path.substring(currentProject.path.length).replace(/^\/+/, '')
                    : '';

                const url = relativePath
                    ? `/api/projects/${currentProject.id}/browse/${relativePath}`
                    : `/api/projects/${currentProject.id}/browse`;

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok) {
                    const html = data.items.map(item => {
                        if (item.type === 'folder') {
                            return `
                                <div class="tree-item py-1 px-2 rounded" onclick="toggleFolder(this, '${item.path.replace(/'/g, "\\'")}')">
                                    <i class="fas fa-folder text-blue-500 mr-2"></i>
                                    <span>${item.name}</span>
                                    <div class="tree-children hidden"></div>
                                </div>
                            `;
                        } else {
                            const iconClass = getFileIcon(item.extension);
                            return `
                                <div class="tree-item py-1 px-2 rounded" onclick="selectFile('${item.path.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')">
                                    <i class="fas ${iconClass} text-gray-500 mr-2"></i>
                                    <span>${item.name}</span>
                                </div>
                            `;
                        }
                    }).join('');
                    childrenDiv.innerHTML = html;
                }
            } catch (error) {
                console.error('Error loading folder:', error);
            }
        }
        childrenDiv.classList.remove('hidden');
        icon.classList.remove('fa-folder');
        icon.classList.add('fa-folder-open');
    } else {
        // Collapse
        childrenDiv.classList.add('hidden');
        icon.classList.remove('fa-folder-open');
        icon.classList.add('fa-folder');
    }
}

// Select file
async function selectFile(path, name) {
    if (event) event.stopPropagation();
    currentFile = path;
    showRaw = false; // Reset to rendered view when selecting new file

    // Save file to localStorage (no URL change)
    localStorage.setItem('currentFile', path);

    try {
        const encodedPath = path.substring(1);
        const response = await fetch(`/api/file/${encodedPath}`);
        const data = await response.json();

        if (response.ok) {
            renderFileContent(data, name, path);
            renderStructureTree(data.tree);
        } else {
            document.getElementById('contentArea').innerHTML = `<p class="text-red-500">${data.error}</p>`;
        }
    } catch (error) {
        console.error('Error loading file:', error);
        document.getElementById('contentArea').innerHTML = '<p class="text-red-500">Error loading file</p>';
    }
}

// Render file content
function renderFileContent(data, name, path) {
    const contentArea = document.getElementById('contentArea');
    const extension = path.substring(path.lastIndexOf('.')).toLowerCase();

    // Store current file data for toggle functionality
    currentFileData = { data, name, path };

    let renderedContent = '';

    if (showRaw) {
        // Always show raw content when toggle is on
        renderedContent = `<pre class="bg-gray-50 p-4 rounded overflow-x-auto"><code>${escapeHtml(data.content)}</code></pre>`;
    } else if (extension === '.md' && data.html) {
        // Render markdown as HTML
        renderedContent = `<div class="prose prose-slate max-w-none">${data.html}</div>`;
    } else if (extension === '.json') {
        // Pretty print JSON
        try {
            const formatted = JSON.stringify(JSON.parse(data.content), null, 2);
            renderedContent = `<pre class="bg-gray-50 p-4 rounded overflow-x-auto"><code class="language-json">${escapeHtml(formatted)}</code></pre>`;
        } catch (e) {
            renderedContent = `<pre class="bg-gray-50 p-4 rounded overflow-x-auto"><code>${escapeHtml(data.content)}</code></pre>`;
        }
    } else {
        renderedContent = `<pre class="bg-gray-50 p-4 rounded overflow-x-auto"><code>${escapeHtml(data.content)}</code></pre>`;
    }

    // Add toggle button for markdown files
    const toggleButton = (extension === '.md' && data.html) ? `
        <button id="toggleViewBtn" onclick="toggleView()" class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded">
            <i class="fas fa-${showRaw ? 'eye' : 'code'} mr-1"></i>
            ${showRaw ? 'Show Rendered' : 'Show Raw'}
        </button>
    ` : '';

    contentArea.innerHTML = `
        <div>
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-2xl font-bold mb-1">${name}</h2>
                    <p class="text-sm text-gray-500">${path}</p>
                </div>
                ${toggleButton}
            </div>
            ${renderedContent}
        </div>
    `;
}

// Toggle between rendered and raw view
function toggleView() {
    showRaw = !showRaw;
    if (currentFileData) {
        renderFileContent(currentFileData.data, currentFileData.name, currentFileData.path);
    }
}

// Render structure tree
function renderStructureTree(tree) {
    const structureTree = document.getElementById('structureTree');

    if (!tree || tree.length === 0) {
        structureTree.innerHTML = '<p class="text-gray-400 italic">No structure found</p>';
        return;
    }

    structureTree.innerHTML = renderTreeNodes(tree, 1);
}

// Render tree nodes
function renderTreeNodes(nodes, depth) {
    return nodes.map(node => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = depth <= globalDepth;

        return `
            <div class="mb-1">
                <div class="tree-item py-1 px-2 rounded flex items-center" onclick="toggleTreeNode(this)">
                    ${hasChildren ? `<i class="fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs mr-2 text-gray-400"></i>` : '<span class="w-4 inline-block"></span>'}
                    <span class="text-sm">${escapeHtml(node.label)}</span>
                    ${node.type ? `<span class="ml-2 text-xs text-gray-400">${node.type}</span>` : ''}
                </div>
                ${hasChildren ? `<div class="tree-children ${isExpanded ? '' : 'hidden'}">${renderTreeNodes(node.children, depth + 1)}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Toggle tree node
function toggleTreeNode(element) {
    event.stopPropagation();
    const parent = element.parentElement;
    const childrenDiv = parent.querySelector('.tree-children');
    const icon = element.querySelector('i');

    if (childrenDiv && icon) {
        if (childrenDiv.classList.contains('hidden')) {
            childrenDiv.classList.remove('hidden');
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        } else {
            childrenDiv.classList.add('hidden');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        }
    }
}

// Change depth
function changeDepth(newDepth) {
    globalDepth = newDepth;
    if (currentFile) {
        // Reload structure tree with new depth
        selectFile(currentFile, currentFile.split('/').pop());
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
