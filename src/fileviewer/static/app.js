// State management
let currentFolder = null;
let watchedFolders = [];
let currentFile = null;
let globalDepth = 2; // Default depth

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadWatchedFolders();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Account panel toggle
    document.getElementById('accountBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAccountPanel();
    });

    // Folder dropdown toggle
    document.getElementById('folderDropdownBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFolderDropdown();
    });

    // Add folder
    document.getElementById('addFolderBtn').addEventListener('click', addFolder);

    // Enter key in folder input
    document.getElementById('newFolderPath').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addFolder();
        }
    });

    // Expand/collapse all
    document.getElementById('expandAllBtn').addEventListener('click', () => changeDepth(10));
    document.getElementById('collapseAllBtn').addEventListener('click', () => changeDepth(1));

    // Prevent clicks inside panels from closing them
    document.getElementById('accountPanel').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.getElementById('folderDropdown').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.getElementById('accountPanel').classList.add('hidden');
        document.getElementById('folderDropdown').classList.add('hidden');
    });
}

// Toggle account panel
function toggleAccountPanel() {
    const panel = document.getElementById('accountPanel');
    panel.classList.toggle('hidden');
    document.getElementById('folderDropdown').classList.add('hidden');
}

// Toggle folder dropdown
function toggleFolderDropdown() {
    const dropdown = document.getElementById('folderDropdown');
    dropdown.classList.toggle('hidden');
    document.getElementById('accountPanel').classList.add('hidden');
}

// Load watched folders
async function loadWatchedFolders() {
    try {
        const response = await fetch('/api/folders');
        watchedFolders = await response.json();
        renderWatchedFolders();
        renderFolderDropdown();
    } catch (error) {
        console.error('Error loading folders:', error);
    }
}

// Render watched folders list
function renderWatchedFolders() {
    const list = document.getElementById('watchedFoldersList');

    if (watchedFolders.length === 0) {
        list.innerHTML = '<p class="text-gray-400 italic text-sm">No folders being watched</p>';
        return;
    }

    list.innerHTML = watchedFolders.map(folder => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
            <span class="text-sm text-gray-700 truncate flex-1" title="${folder}">${folder}</span>
            <button onclick="removeFolder('${folder.replace(/'/g, "\\'")}')" class="ml-2 text-red-600 hover:text-red-800">
                <i class="fas fa-trash text-sm"></i>
            </button>
        </div>
    `).join('');
}

// Render folder dropdown
function renderFolderDropdown() {
    const dropdown = document.getElementById('folderList');

    if (watchedFolders.length === 0) {
        dropdown.innerHTML = '<p class="px-4 py-2 text-gray-400 italic text-sm">No folders available</p>';
        return;
    }

    dropdown.innerHTML = watchedFolders.map(folder => `
        <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onclick="selectFolder('${folder.replace(/'/g, "\\'")}')">
            <i class="fas fa-folder text-blue-500 mr-2"></i>
            ${folder}
        </div>
    `).join('');
}

// Add folder
async function addFolder() {
    const input = document.getElementById('newFolderPath');
    const path = input.value.trim();

    if (!path) {
        alert('Please enter a folder path');
        return;
    }

    try {
        const response = await fetch('/api/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });

        const result = await response.json();

        if (response.ok) {
            input.value = '';
            await loadWatchedFolders();
        } else {
            alert(result.error || 'Failed to add folder');
        }
    } catch (error) {
        console.error('Error adding folder:', error);
        alert('Failed to add folder');
    }
}

// Remove folder
async function removeFolder(path) {
    if (!confirm(`Remove ${path} from watched folders?`)) {
        return;
    }

    try {
        const encodedPath = path.substring(1); // Remove leading /
        const response = await fetch(`/api/folders/${encodedPath}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            if (currentFolder === path) {
                currentFolder = null;
                document.getElementById('currentFolderName').textContent = 'Select Folder';
                document.getElementById('fileTree').innerHTML = '<p class="text-gray-400 italic">Select a folder to browse</p>';
            }
            await loadWatchedFolders();
        } else {
            const result = await response.json();
            alert(result.error || 'Failed to remove folder');
        }
    } catch (error) {
        console.error('Error removing folder:', error);
        alert('Failed to remove folder');
    }
}

// Select folder
async function selectFolder(path) {
    currentFolder = path;
    document.getElementById('currentFolderName').textContent = path.split('/').pop() || path;
    document.getElementById('folderDropdown').classList.add('hidden');

    await loadFolderContents(path);
}

// Load folder contents
async function loadFolderContents(path) {
    try {
        const encodedPath = path.substring(1); // Remove leading /
        const response = await fetch(`/api/browse/${encodedPath}`);
        const data = await response.json();

        if (response.ok) {
            renderFileTree(data.items, path);
        } else {
            document.getElementById('fileTree').innerHTML = `<p class="text-red-500">${data.error}</p>`;
        }
    } catch (error) {
        console.error('Error loading folder:', error);
        document.getElementById('fileTree').innerHTML = '<p class="text-red-500">Error loading folder</p>';
    }
}

// Render file tree
function renderFileTree(items, basePath) {
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

    if (childrenDiv.classList.contains('hidden')) {
        // Expand
        if (childrenDiv.innerHTML === '') {
            // Load contents
            try {
                const encodedPath = path.substring(1);
                const response = await fetch(`/api/browse/${encodedPath}`);
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
    event.stopPropagation();
    currentFile = path;

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

    let renderedContent = '';
    if (extension === '.md' && data.html) {
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

    contentArea.innerHTML = `
        <div>
            <h2 class="text-2xl font-bold mb-2">${name}</h2>
            <p class="text-sm text-gray-500 mb-4">${path}</p>
            ${renderedContent}
        </div>
    `;
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
