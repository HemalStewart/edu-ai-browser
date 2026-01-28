import { useEffect, useState } from "react";

export function HistoryView({ onNavigate }: { onNavigate: (url: string) => void }) {
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (window.eduAPI?.getHistory) {
            window.eduAPI.getHistory().then(setHistory);
        }
    }, []);

    const clearHistory = async () => {
        await window.eduAPI.clearHistory();
        setHistory([]);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">History</h1>
                <button onClick={clearHistory} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm">
                    Clear History
                </button>
            </div>
            <div className="space-y-2">
                {history.map((entry) => (
                    <div key={entry.id} onClick={() => onNavigate(entry.url)}
                        className="flex items-center gap-4 p-4 rounded-2xl glass-ultra border border-white/50 hover:bg-white/40 cursor-pointer transition-all group">
                        <div className="p-2 bg-white/50 rounded-xl group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-foreground text-sm">{entry.title || entry.url}</p>
                            <p className="text-xs text-foreground/50 truncate opacity-70">{entry.url}</p>
                        </div>
                        <span className="text-xs text-foreground/40 whitespace-nowrap font-medium">
                            {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="text-center py-20 text-foreground/40">
                        <p className="text-lg font-medium">No history yet</p>
                        <p className="text-sm opacity-70">Start browsing to populate this list.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
