import { useEffect, useState } from "react";

export function BookmarksView({ onNavigate }: { onNavigate: (url: string) => void }) {
    const [bookmarks, setBookmarks] = useState<any[]>([]);

    useEffect(() => {
        window.eduAPI.getBookmarks().then(setBookmarks);
    }, []);

    const removeBookmark = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await window.eduAPI.removeBookmark(id);
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-foreground mb-8">Bookmarks</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((b) => (
                    <div key={b.id} onClick={() => onNavigate(b.url)}
                        className="group relative p-5 rounded-3xl glass-ultra border border-white/50 hover:border-blue-500/30 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            </div>
                            <button onClick={(e) => removeBookmark(e, b.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-foreground/40 hover:text-red-500 transition-all bg-white/50 rounded-full hover:bg-white/80">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <h3 className="font-bold text-base text-foreground truncate">{b.title}</h3>
                        <p className="text-xs text-foreground/50 truncate mt-1">{b.url}</p>
                    </div>
                ))}
                {bookmarks.length === 0 && (
                    <div className="col-span-full text-center py-20 text-foreground/40">
                        <p className="text-lg font-medium">No bookmarks yet</p>
                        <p className="text-sm opacity-70">Save your favorite pages for quick access.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
