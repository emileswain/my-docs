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


    // Toggle expand/collapse all (file folders)
    let allExpanded = false;
    document.getElementById('toggleExpandBtn').addEventListener('click', async () => {
        if (allExpanded) {
            await collapseAllFolders();
            allExpanded = false;
        } else {
            await expandAllFolders();
            allExpanded = true;
        }
    });

    // File filter
    const fileFilterInput = document.getElementById('fileFilter');
    const clearFilterBtn = document.getElementById('clearFilterBtn');

    fileFilterInput.addEventListener('input', (e) => {
        const value = e.target.value;
        filterFiles(value);

        // Show/hide clear button
        if (value) {
            clearFilterBtn.style.display = 'block';
        } else {
            clearFilterBtn.style.display = 'none';
        }
    });

    clearFilterBtn.addEventListener('click', () => {
        fileFilterInput.value = '';
        clearFilterBtn.style.display = 'none';
        filterFiles('');
    });

    // Panel toggles
    document.getElementById('toggleLeftBtn').addEventListener('click', () => togglePanel('left', false));
    document.getElementById('showLeftBtn').addEventListener('click', () => togglePanel('left', true));
    document.getElementById('toggleRightBtn').addEventListener('click', () => togglePanel('right', false));
    document.getElementById('showRightBtn').addEventListener('click', () => togglePanel('right', true));

    // Prevent clicks inside panels from closing them
    document.getElementById('folderDropdown').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.getElementById('folderDropdown').classList.add('hidden');
    });

    // Save scroll position periodically
    const contentArea = document.getElementById('contentArea');
    contentArea.addEventListener('scroll', () => {
        if (currentFile) {
            localStorage.setItem('scrollPosition', contentArea.scrollTop);
        }
    });

    // Restore panel states
    restorePanelStates();
}

// Toggle panel visibility
function togglePanel(side, show) {
    const panel = document.getElementById(`${side}Panel`);
    const toggle = document.getElementById(`${side}PanelToggle`);

    if (show) {
        panel.classList.remove('hidden');
        toggle.classList.add('hidden');
    } else {
        panel.classList.add('hidden');
        toggle.classList.remove('hidden');
    }

    // Save state
    localStorage.setItem(`${side}PanelVisible`, show);
}

// Restore panel states from localStorage
function restorePanelStates() {
    const leftVisible = localStorage.getItem('leftPanelVisible');
    const rightVisible = localStorage.getItem('rightPanelVisible');

    if (leftVisible === 'false') {
        togglePanel('left', false);
    }
    if (rightVisible === 'false') {
        togglePanel('right', false);
    }
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

// Get list of open folders from localStorage
function getOpenFolders() {
    if (!currentProject) return [];
    const key = `openFolders_${currentProject.id}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
}

// Save list of open folders to localStorage
function saveOpenFolders(openFolders) {
    if (!currentProject) return;
    const key = `openFolders_${currentProject.id}`;
    localStorage.setItem(key, JSON.stringify(openFolders));
}

// Render file tree
function renderFileTree(items) {
    const tree = document.getElementById('fileTree');

    if (items.length === 0) {
        tree.innerHTML = '<p class="text-gray-400 italic">No supported files found</p>';
        return;
    }

    const openFolders = getOpenFolders();

    const html = items.map(item => {
        if (item.type === 'folder') {
            const isOpen = openFolders.includes(item.path);
            const folderIcon = isOpen ? 'fa-folder-open' : 'fa-folder';
            const childrenClass = isOpen ? '' : 'hidden';

            return `
                <div class="tree-item py-1 px-2 rounded" data-path="${item.path.replace(/"/g, '&quot;')}" onclick="toggleFolder(this, '${item.path.replace(/'/g, "\\'")}')">
                    <i class="fas ${folderIcon} text-blue-500 mr-2"></i>
                    <span>${item.name}</span>
                    <div class="tree-children ${childrenClass}"></div>
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

    // Load content for open folders
    setTimeout(() => loadOpenFolderContents(), 100);
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

    const openFolders = getOpenFolders();
    const isOpen = !childrenDiv.classList.contains('hidden');

    if (!isOpen) {
        // Opening folder
        if (childrenDiv.innerHTML === '') {
            await loadFolderContent(path, childrenDiv);
        }
        childrenDiv.classList.remove('hidden');
        icon.classList.remove('fa-folder');
        icon.classList.add('fa-folder-open');

        // Add to open folders list
        if (!openFolders.includes(path)) {
            openFolders.push(path);
            saveOpenFolders(openFolders);
        }
    } else {
        // Closing folder
        childrenDiv.classList.add('hidden');
        icon.classList.remove('fa-folder-open');
        icon.classList.add('fa-folder');

        // Remove from open folders list
        const index = openFolders.indexOf(path);
        if (index > -1) {
            openFolders.splice(index, 1);
            saveOpenFolders(openFolders);
        }
    }
}

// Load folder content
async function loadFolderContent(path, childrenDiv) {
    if (!currentProject) return;

    try {
        const relativePath = path.startsWith(currentProject.path)
            ? path.substring(currentProject.path.length).replace(/^\/+/, '')
            : '';

        const url = relativePath
            ? `/api/projects/${currentProject.id}/browse/${relativePath}`
            : `/api/projects/${currentProject.id}/browse`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const openFolders = getOpenFolders();

            const html = data.items.map(item => {
                if (item.type === 'folder') {
                    const isOpen = openFolders.includes(item.path);
                    const folderIcon = isOpen ? 'fa-folder-open' : 'fa-folder';
                    const childrenClass = isOpen ? '' : 'hidden';

                    return `
                        <div class="tree-item py-1 px-2 rounded" data-path="${item.path.replace(/"/g, '&quot;')}" onclick="toggleFolder(this, '${item.path.replace(/'/g, "\\'")}')">
                            <i class="fas ${folderIcon} text-blue-500 mr-2"></i>
                            <span>${item.name}</span>
                            <div class="tree-children ${childrenClass}"></div>
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

            // Load content for any nested open folders
            setTimeout(() => loadOpenFolderContents(), 100);
        }
    } catch (error) {
        console.error('Error loading folder:', error);
    }
}

// Load content for all open folders
async function loadOpenFolderContents() {
    if (!currentProject) return;

    const openFolders = getOpenFolders();

    for (const folderPath of openFolders) {
        const folderElement = document.querySelector(`#fileTree [data-path="${folderPath.replace(/"/g, '&quot;')}"]`);
        if (folderElement) {
            const childrenDiv = folderElement.querySelector('.tree-children');
            if (childrenDiv && childrenDiv.innerHTML === '') {
                await loadFolderContent(folderPath, childrenDiv);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }
    }
}

// Get all folder paths in the tree recursively
async function getAllFolderPaths() {
    if (!currentProject) return [];

    const allPaths = [];

    async function collectPaths(path = '') {
        const relativePath = path.startsWith(currentProject.path)
            ? path.substring(currentProject.path.length).replace(/^\/+/, '')
            : '';

        const url = relativePath
            ? `/api/projects/${currentProject.id}/browse/${relativePath}`
            : `/api/projects/${currentProject.id}/browse`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                for (const item of data.items) {
                    if (item.type === 'folder') {
                        allPaths.push(item.path);
                        await collectPaths(item.path);
                    }
                }
            }
        } catch (error) {
            console.error('Error collecting folder paths:', error);
        }
    }

    await collectPaths(currentProject.path);
    return allPaths;
}

// Expand all folders
async function expandAllFolders() {
    const allPaths = await getAllFolderPaths();
    saveOpenFolders(allPaths);
    await loadProjectContents(currentProject);
}

// Collapse all folders
function collapseAllFolders() {
    saveOpenFolders([]);
    loadProjectContents(currentProject);
}

// Fuzzy match function
function fuzzyMatch(str, pattern) {
    if (!pattern) return true;

    str = str.toLowerCase();
    pattern = pattern.toLowerCase();

    let patternIdx = 0;
    let strIdx = 0;

    while (strIdx < str.length && patternIdx < pattern.length) {
        if (str[strIdx] === pattern[patternIdx]) {
            patternIdx++;
        }
        strIdx++;
    }

    return patternIdx === pattern.length;
}

// Search entire project tree recursively
async function searchProjectTree(searchTerm) {
    if (!currentProject) return [];

    const matches = [];

    async function searchFolder(path = '') {
        const relativePath = path.startsWith(currentProject.path)
            ? path.substring(currentProject.path.length).replace(/^\/+/, '')
            : '';

        const url = relativePath
            ? `/api/projects/${currentProject.id}/browse/${relativePath}`
            : `/api/projects/${currentProject.id}/browse`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                for (const item of data.items) {
                    // Check if item matches
                    if (fuzzyMatch(item.path, searchTerm) || fuzzyMatch(item.name, searchTerm)) {
                        matches.push(item);

                        // If it's a folder, also search inside it
                        if (item.type === 'folder') {
                            await searchFolder(item.path);
                        }
                    } else if (item.type === 'folder') {
                        // Even if folder doesn't match, search inside it
                        await searchFolder(item.path);
                    }
                }
            }
        } catch (error) {
            console.error('Error searching folder:', error);
        }
    }

    await searchFolder(currentProject.path);
    return matches;
}

// Filter files and folders
async function filterFiles(searchTerm) {
    if (!searchTerm.trim()) {
        // Restore original view
        await loadProjectContents(currentProject);

        // If there's a current file, expand folders to show it
        if (currentFile) {
            const pathParts = currentFile.split('/').filter(p => p);
            const foldersToOpen = [];
            let currentPath = '';

            for (let i = 0; i < pathParts.length - 1; i++) {
                currentPath += '/' + pathParts[i];
                foldersToOpen.push(currentPath);
            }

            saveOpenFolders(foldersToOpen);
            await loadProjectContents(currentProject);
        }
        return;
    }

    // Search entire tree
    const matches = await searchProjectTree(searchTerm);

    if (matches.length === 0) {
        document.getElementById('fileTree').innerHTML = '<p class="text-gray-400 italic text-sm">No matches found</p>';
        return;
    }

    // Get all unique parent folders for matches
    const foldersToOpen = new Set();
    matches.forEach(match => {
        const pathParts = match.path.split('/').filter(p => p);
        let currentPath = '';
        for (let i = 0; i < pathParts.length - 1; i++) {
            currentPath += '/' + pathParts[i];
            foldersToOpen.add(currentPath);
        }
    });

    // Temporarily expand all folders needed to show matches
    const originalOpenFolders = getOpenFolders();
    saveOpenFolders(Array.from(foldersToOpen));

    // Reload tree with expanded folders
    await loadProjectContents(currentProject);

    // Wait for DOM to update, then hide non-matching items
    setTimeout(() => {
        const matchPaths = new Set(matches.map(m => m.path));
        const allItems = document.querySelectorAll('#fileTree .tree-item');

        allItems.forEach(item => {
            const path = item.getAttribute('data-path');
            const isFile = !item.querySelector('.tree-children');

            if (isFile) {
                // For files, show only if it matches
                const fileName = item.textContent.trim();
                const matchesFilter = matchPaths.has(path) ||
                                     fuzzyMatch(path || '', searchTerm) ||
                                     fuzzyMatch(fileName, searchTerm);

                if (!matchesFilter) {
                    item.style.display = 'none';
                } else {
                    item.style.display = '';
                }
            } else {
                // For folders, show if they contain matches
                const hasVisibleChildren = item.querySelectorAll('.tree-item:not([style*="display: none"])').length > 0;
                if (!hasVisibleChildren && !matchPaths.has(path)) {
                    item.style.display = 'none';
                } else {
                    item.style.display = '';
                }
            }
        });

        // Restore original open folders state
        saveOpenFolders(originalOpenFolders);
    }, 200);
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
    const fileHeader = document.getElementById('fileHeader');
    const fileName = document.getElementById('fileName');
    const headerActions = document.getElementById('headerActions');
    const extension = path.substring(path.lastIndexOf('.')).toLowerCase();

    // Store current file data for toggle functionality
    currentFileData = { data, name, path };

    // Update header (always visible now)
    fileName.textContent = name;

    let renderedContent = '';

    if (showRaw) {
        // Always show raw content when toggle is on
        renderedContent = `<pre class="bg-gray-50 p-4 rounded overflow-x-auto max-w-full"><code>${escapeHtml(data.content)}</code></pre>`;
    } else if (extension === '.md' && data.html) {
        // Render markdown as HTML
        renderedContent = `<div id="markdownContent" class="prose prose-slate max-w-none">${data.html}</div>`;
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
    if (extension === '.md' && data.html) {
        headerActions.innerHTML = `
            <button id="toggleViewBtn" onclick="toggleView()" class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded">
                <i class="fas fa-${showRaw ? 'eye' : 'code'} mr-1"></i>
                ${showRaw ? 'Show Rendered' : 'Show Raw'}
            </button>
        `;
    } else {
        headerActions.innerHTML = '';
    }

    // Render content
    contentArea.innerHTML = renderedContent;

    // Set up scroll tracking for markdown headers
    if (extension === '.md' && data.html && !showRaw) {
        setTimeout(() => setupHeaderTracking(), 100);
    }

    // Restore scroll position
    setTimeout(() => {
        const savedScroll = localStorage.getItem('scrollPosition');
        if (savedScroll) {
            contentArea.scrollTop = parseInt(savedScroll);
        }
    }, 150);
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

// Render tree nodes - always expanded, clickable to scroll to section
function renderTreeNodes(nodes, depth) {
    return nodes.map(node => {
        const hasChildren = node.children && node.children.length > 0;
        const indent = depth * 12; // 12px per level
        const safeLabel = escapeHtml(node.label).replace(/'/g, "\\'");

        return `
            <div class="mb-1">
                <div class="structure-tree-item py-1 px-2 rounded flex items-center cursor-pointer hover:bg-gray-100" style="padding-left: ${indent}px" data-section="${safeLabel}" onclick="scrollToSection('${safeLabel}')">
                    ${hasChildren ? '<i class="fas fa-angle-right text-xs mr-2 text-gray-400"></i>' : '<span class="w-4 inline-block"></span>'}
                    <span class="text-sm">${escapeHtml(node.label)}</span>
                    ${node.type ? `<span class="ml-2 text-xs text-gray-400">${node.type}</span>` : ''}
                </div>
                ${hasChildren ? renderTreeNodes(node.children, depth + 1) : ''}
            </div>
        `;
    }).join('');
}

// Scroll to section in the content area
function scrollToSection(label) {
    const contentArea = document.getElementById('contentArea');
    const markdownContent = document.getElementById('markdownContent');

    if (!markdownContent) return;

    // Find all headings in the markdown content
    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');

    // Find the heading that matches the label
    for (const heading of headings) {
        if (heading.textContent.trim() === label) {
            // Calculate the position relative to the content area
            const contentAreaRect = contentArea.getBoundingClientRect();
            const headingRect = heading.getBoundingClientRect();
            const scrollOffset = contentArea.scrollTop + (headingRect.top - contentAreaRect.top) - 20; // 20px offset

            // Smooth scroll to the heading
            contentArea.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
            });
            break;
        }
    }
}

// Global scroll handler reference for cleanup
let currentScrollHandler = null;

// Setup header tracking for markdown files
function setupHeaderTracking() {
    const markdownContent = document.getElementById('markdownContent');
    const currentHeadingElement = document.getElementById('currentHeading');
    const contentArea = document.getElementById('contentArea');

    if (!markdownContent || !currentHeadingElement || !contentArea) {
        console.log('Missing elements for header tracking');
        return;
    }

    // Get all headings in the markdown content
    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');

    if (headings.length === 0) {
        console.log('No headings found in markdown content');
        return;
    }

    console.log(`Found ${headings.length} headings`);

    // Remove old scroll listener if exists
    if (currentScrollHandler) {
        contentArea.removeEventListener('scroll', currentScrollHandler);
    }

    // Track current heading on scroll
    function updateCurrentHeading() {
        const contentAreaRect = contentArea.getBoundingClientRect();
        const contentAreaTop = contentAreaRect.top;

        let currentHeading = null;

        // Find the last heading that's scrolled past the content area top
        headings.forEach(heading => {
            const headingRect = heading.getBoundingClientRect();
            // Check if heading has scrolled past the top of the content area
            if (headingRect.top <= contentAreaTop + 20) {
                currentHeading = heading;
            }
        });

        // Update the display
        if (currentHeading) {
            currentHeadingElement.textContent = currentHeading.textContent;
            highlightStructureTreeItem(currentHeading.textContent);
        } else {
            currentHeadingElement.textContent = '';
            highlightStructureTreeItem(null);
        }
    }

    // Listen to scroll events on the panel with throttling
    let scrollTimeout;
    currentScrollHandler = () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateCurrentHeading, 50);
    };

    contentArea.addEventListener('scroll', currentScrollHandler);

    // Initial update
    updateCurrentHeading();
}

// Highlight the corresponding item in the structure tree
function highlightStructureTreeItem(headingText) {
    // Remove all existing highlights
    document.querySelectorAll('.structure-tree-item').forEach(item => {
        item.classList.remove('bg-blue-100', 'font-semibold');
    });

    if (!headingText) return;

    // Find and highlight the matching item
    document.querySelectorAll('.structure-tree-item').forEach(item => {
        const section = item.getAttribute('data-section');
        if (section === headingText) {
            item.classList.add('bg-blue-100', 'font-semibold');
        }
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
