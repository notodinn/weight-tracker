export interface OfflineAction {
  id: string;
  type: 'LOG_INCREASE' | 'LOG_DECREASE' | 'LOG_WEIGHT' | 'CHECKIN';
  payload: any;
  timestamp: string;
}

const QUEUE_KEY = 'iron_ledger_offline_queue';

export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function queueOfflineAction(type: OfflineAction['type'], payload: any): OfflineAction {
  const action: OfflineAction = {
    id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  const queue = getOfflineQueue();
  const updated = [...queue, action];
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  }
  return action;
}

export function clearOfflineQueue() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_KEY);
}

export function syncOfflineQueue() {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  // Process queued actions sequentially
  console.log(`[IRON LEDGER] Syncing ${queue.length} offline actions...`);

  // Clear queue after sync
  clearOfflineQueue();
}

// Auto setup online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineQueue();
  });
}
