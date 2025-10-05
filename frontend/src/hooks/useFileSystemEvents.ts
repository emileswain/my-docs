import { useEffect } from 'react';
import { eventService } from '../services/eventService';
import type { FileSystemEvent } from '../services/eventService';

/**
 * useFileSystemEvents - Custom hook for subscribing to real-time file system changes
 *
 * Purpose:
 * - Connects to SSE endpoint for file system change notifications
 * - Filters events by project ID
 * - Calls callback when relevant events occur
 *
 * Used by:
 * - FileTree component (to refresh cache when files change)
 *
 * Parameters:
 * - projectId: ID of project to monitor (null disables monitoring)
 * - onEvent: Callback function called when a file system event occurs for this project
 *
 * Special considerations:
 * - Automatically connects to SSE on mount
 * - Filters events to only call onEvent for matching projectId
 * - Cleans up subscription on unmount
 * - Does NOT disconnect SSE connection on unmount (shared across components)
 * - No-op if projectId is null
 */
export function useFileSystemEvents(
  projectId: string | null,
  onEvent: (event: FileSystemEvent) => void
) {
  useEffect(() => {
    if (!projectId) return;

    // Connect to SSE
    eventService.connect();

    // Subscribe to events
    const unsubscribe = eventService.subscribe((event) => {
      if (event.project_id === projectId) {
        onEvent(event);
      }
    });

    return () => {
      unsubscribe();
      // Note: We don't disconnect here because other components might be using SSE
    };
  }, [projectId, onEvent]);
}
