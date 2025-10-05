export type FileSystemEvent = {
  type: string;
  path: string;
  project_id: string;
}

export type FileSystemEventHandler = (event: FileSystemEvent) => void;

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
