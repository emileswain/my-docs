interface FileViewerHeaderProps {
  fileName: string;
  currentHeading: string;
  canToggleRaw: boolean;
  showRaw: boolean;
  onToggleRaw: () => void;
}

export function FileViewerHeader({
  fileName,
  currentHeading,
  canToggleRaw,
  showRaw,
  onToggleRaw
}: FileViewerHeaderProps) {
  return (
    <div className="border-b border-gray-200 px-6 bg-gray-50" style={{ height: '60px' }}>
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold truncate text-gray-800">
            {fileName || ''}
          </h2>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {currentHeading}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          {canToggleRaw && (
            <button
              onClick={onToggleRaw}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              <i className={`fas fa-${showRaw ? 'eye' : 'code'} mr-1`}></i>
              {showRaw ? 'Show Rendered' : 'Show Raw'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
