import { useEffect } from 'react';
import { eventService } from '../services/eventService';
import type { FileSystemEvent } from '../services/eventService';

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
