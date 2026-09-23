import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export type FileSystemEvent = {
  type: string;
  path: string;
  /** Empty string means "unknown project" — treated as a broadcast. */
  project_id: string;
}

export type FileSystemEventHandler = (event: FileSystemEvent) => void;

/** Payload emitted by the Rust watcher. */
interface FsChange {
  paths: string[];
}

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
  private unlisten: UnlistenFn | null = null;
  private connecting = false;
  private handlers: Set<FileSystemEventHandler> = new Set();

  async connect() {
    if (this.unlisten || this.connecting) return;
    this.connecting = true;
    try {
      // Replaces the SSE EventSource with the Rust watcher's `fs-change` event.
      this.unlisten = await listen<FsChange>('fs-change', (event) => {
        for (const path of event.payload.paths) {
          // project_id is unknown at the engine level; '' = broadcast, and the
          // hook treats it as matching any project.
          this.handlers.forEach((handler) =>
            handler({ type: 'change', path, project_id: '' })
          );
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to fs-change:', error);
    } finally {
      this.connecting = false;
    }
  }

  disconnect() {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
  }

  subscribe(handler: FileSystemEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  isConnected(): boolean {
    return this.unlisten !== null;
  }
}

export const eventService = new EventService();
