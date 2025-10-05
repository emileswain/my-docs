export type FileSystemEvent = {
  type: string;
  path: string;
  project_id: string;
}

export type FileSystemEventHandler = (event: FileSystemEvent) => void;

/**
 * EventService - Manages Server-Sent Events (SSE) connection for real-time file system updates
 *
 * Purpose:
 * - Maintains a single SSE connection to /api/events endpoint
 * - Broadcasts file system change events to all subscribers
 * - Automatically reconnects on connection errors
 *
 * Used by:
 * - useFileSystemEvents hook (primary consumer)
 * - FileTree component (via useFileSystemEvents hook)
 *
 * Special considerations:
 * - Singleton pattern - maintains one SSE connection shared across all components
 * - Auto-reconnects after 5 seconds on error
 * - Multiple components can subscribe simultaneously - each gets their own unsubscribe function
 * - Connection is NOT closed when individual components unmount (to avoid disrupting other subscribers)
 * - Events are filtered by project_id at the hook level, not here
 */
export class EventService {
  private eventSource: EventSource | null = null;
  private handlers: Set<FileSystemEventHandler> = new Set();

  connect() {
    if (this.eventSource) return;

    this.eventSource = new EventSource('/api/events');

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.disconnect();
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(handler: FileSystemEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  isConnected(): boolean {
    return this.eventSource !== null;
  }
}

export const eventService = new EventService();
