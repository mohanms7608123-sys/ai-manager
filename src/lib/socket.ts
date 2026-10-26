export type SocketEventType = 
  | 'attendance:updated' 
  | 'worklog:added' 
  | 'stats:updated'
  | 'project:created'
  | 'project:updated'
  | 'project:workflow_step'
  | 'notification:new'
  | 'workspace:chat'
  | 'task:progress';

type SocketCallback = (data: any) => void;

class RealTimeSocketHub {
  private listeners: Map<SocketEventType, Set<SocketCallback>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('smart_construction_realtime_socket');
        this.broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type && data) {
            this.notifyLocalListeners(type as SocketEventType, data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel fallback enabled:', e);
      }
    }
  }

  public on(event: SocketEventType, callback: SocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: SocketEventType, callback: SocketCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  public emit(event: SocketEventType, data: any) {
    this.notifyLocalListeners(event, data);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: event, data });
      } catch (e) {
        console.error('Error broadcasting socket event:', e);
      }
    }
  }

  private notifyLocalListeners(event: SocketEventType, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }
}

export const socketHub = new RealTimeSocketHub();
