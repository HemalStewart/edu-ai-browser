import Store from 'electron-store';

export interface Bookmark {
    id: string;
    title: string;
    url: string;
    favicon?: string;
    parentId?: string; // For folders later
    createdAt: number;
}

interface BookmarksStore {
    bookmarks: Bookmark[];
}

export class BookmarksManager {
    private store: Store<BookmarksStore>;

    constructor() {
        this.store = new Store<BookmarksStore>({
            name: 'bookmarks',
            defaults: {
                bookmarks: [],
            },
        });
    }

    addBookmark(entry: Omit<Bookmark, 'id' | 'createdAt'>) {
        const bookmarks = this.store.get('bookmarks');
        // Check if already exists to prevent dupes (optional, but good UX)
        // For now, allow dupes or just check URL

        const newBookmark: Bookmark = {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
        };
        this.store.set('bookmarks', [...bookmarks, newBookmark]);
        return newBookmark;
    }

    getBookmarks(): Bookmark[] {
        return this.store.get('bookmarks');
    }

    removeBookmark(id: string) {
        const bookmarks = this.store.get('bookmarks');
        this.store.set('bookmarks', bookmarks.filter(b => b.id !== id));
    }
}
