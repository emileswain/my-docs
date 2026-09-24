import type { FileItem } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import { useFavouritesStore } from '../../store/useFavouritesStore';
import { useAppStore } from '../../store/useAppStore';

interface FileTreeItemProps {
  item: FileItem;
  onFileSelect: (path: string, name: string) => void;
  openFolders: string[];
  allItems: Map<string, FileItem[]>;
  onToggle: (path: string) => void;
  filter?: string;
}

export function FileTreeItem({
  item,
  onFileSelect,
  openFolders,
  allItems,
  onToggle,
  filter
}: FileTreeItemProps) {
  const currentFile = useProjectStore((state) => state.currentFile);
  const isFavourite = useFavouritesStore((state) => state.favourites.includes(item.path));
  const toggleFavourite = useFavouritesStore((state) => state.toggleFavourite);
  const setImageViewerFolder = useAppStore((state) => state.setImageViewerFolder);

  const isOpen = openFolders.includes(item.path);
  const isSelected = item.type === 'file' && currentFile === item.path;
  const children = allItems.get(item.path) || [];

  // Check if this item matches the filter (only check filename, not path)
  const itemMatches = !filter || fuzzyMatch(item.name, filter);

  // For folders, show if folder itself matches OR if it's in openFolders (meaning it has matching children)
  const shouldShowFolder = !filter || itemMatches || isOpen;

  // For files, show only if matches
  const shouldShowFile = !filter || itemMatches;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(item.path);
  };

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(item.path, item.name);
  };

  if (item.type === 'folder') {
    if (!shouldShowFolder) return null;

    const folderIcon = isOpen ? 'fa-folder-open' : 'fa-folder';
    return (
      <div>
        <div
          className="tree-item group flex items-center py-1 px-2 rounded cursor-pointer"
          onClick={handleToggle}
        >
          <i className={`fas ${folderIcon} mr-2`} style={{ color: 'var(--accent-primary)' }}></i>
          <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
          {item.has_images && (
            <button
              className="p-0.5 ml-1 rounded flex-shrink-0 opacity-60 group-hover:opacity-100"
              style={{ color: 'var(--accent-primary)' }}
              title="View images"
              onClick={(e) => {
                e.stopPropagation();
                setImageViewerFolder({ path: item.path, name: item.name });
              }}
            >
              <i className="fas fa-images text-xs" />
            </button>
          )}
        </div>
        {isOpen && (
          <div className="ml-4">
            {children.map((child) => (
              <FileTreeItem
                key={child.path}
                item={child}
                onFileSelect={onFileSelect}
                openFolders={openFolders}
                allItems={allItems}
                onToggle={onToggle}
                filter={filter}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File rendering
  if (!shouldShowFile) return null;

  const icon = getFileIcon(item.extension || '');
  return (
    <div
      className="tree-item group flex items-center py-1 px-2 rounded cursor-pointer"
      style={{
        backgroundColor: isSelected ? 'var(--accent-secondary)' : 'transparent',
        fontWeight: isSelected ? 600 : 400
      }}
      onClick={handleFileClick}
    >
      <i
        className={`fas ${icon} mr-2`}
        style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
      ></i>
      <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
      <button
        className={`p-0.5 ml-1 rounded flex-shrink-0 transition-opacity ${isFavourite ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}
        style={{ color: isFavourite ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
        title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavourite(item.path);
        }}
      >
        <i className={`${isFavourite ? 'fas' : 'far'} fa-star text-xs`} />
      </button>
    </div>
  );
}

function getFileIcon(extension: string): string {
  const icons: Record<string, string> = {
    '.md': 'fa-file-alt',
    '.json': 'fa-file-code',
    '.yml': 'fa-file-code',
    '.yaml': 'fa-file-code',
  };
  return icons[extension] || 'fa-file';
}

function fuzzyMatch(str: string, pattern: string): boolean {
  if (!pattern) return true;

  str = str.toLowerCase();
  pattern = pattern.toLowerCase();

  // Simple substring match - pattern must appear consecutively in the string
  return str.includes(pattern);
}
