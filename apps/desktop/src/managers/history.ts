import Store from 'electron-store';

export interface HistoryEntry {
    id: string;
    title: string;
    url: string;
    timestamp: number;
    favicon?: string;
}

interface HistoryStore {
    history: HistoryEntry[];
}

export class HistoryManager {
    private store: Store<HistoryStore>;

    constructor() {
        this.store = new Store<HistoryStore>({
            name: 'history',
            defaults: {
                history: [],
            },
        });
    }

    addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
        const history = this.store.get('history');
        const newEntry: HistoryEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        // Add to beginning, limit to 1000 entries
        this.store.set('history', [newEntry, ...history].slice(0, 1000));
        return newEntry;
    }

    getEntries(): HistoryEntry[] {
        return this.store.get('history');
    }

    clear() {
        this.store.set('history', []);
    }

    deleteEntry(id: string) {
        const history = this.store.get('history');
        this.store.set('history', history.filter(h => h.id !== id));
    }
}
