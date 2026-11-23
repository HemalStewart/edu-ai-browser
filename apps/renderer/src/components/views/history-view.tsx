import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import type { IElectronAPI } from "@/types/global";

type HistoryEntry = Awaited<ReturnType<IElectronAPI["getHistory"]>>[number];

export function HistoryView({ onNavigate }: { onNavigate: (url: string) => void }) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        if (window.eduAPI?.getHistory) {
            window.eduAPI.getHistory().then(setHistory);
        }
    }, []);

    const clearHistory = async () => {
        await window.eduAPI?.clearHistory();
        setHistory([]);
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-4xl px-8 py-8">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
                    <div>
                        <p className="kicker">edu://history</p>
                        <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.02em] text-fg">History</h1>
                        <p className="mt-1 text-[13px] text-fg-3">
                            {history.length} {history.length === 1 ? "page" : "pages"} visited in this browser.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={clearHistory}
                        disabled={history.length === 0}
                        className="flex h-9 items-center gap-2 rounded border border-line px-3 text-[13px] text-fg transition-colors hover:border-line-active hover:bg-card disabled:cursor-not-allowed disabled:text-fg-4 disabled:hover:border-line disabled:hover:bg-transparent"
                    >
                        <Icon name="trash" className="h-4 w-4" /> Clear history
                    </button>
                </div>

                <ol className="mt-2">
                    {history.map((entry, index) => (
                        <li key={entry.id}>
                            <button
                                type="button"
                                onClick={() => onNavigate(entry.url)}
                                className="group flex w-full items-center gap-4 border-b border-line-muted px-2 py-3 text-left transition-colors hover:bg-pane"
                            >
                                <span className="w-7 font-mono text-[11px] text-fg-3">{String(index + 1).padStart(2, "0")}</span>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line text-fg-3 group-hover:border-line-active group-hover:text-fg">
                                    <Icon name="clock" className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[14px] text-fg">{entry.title || entry.url}</span>
                                    <span className="block truncate font-mono text-[11.5px] text-fg-3">{entry.url}</span>
                                </span>
                                <span className="whitespace-nowrap font-mono text-[11px] text-fg-3">
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>

                {history.length === 0 && (
                    <div className="mt-6 rounded-lg border border-dashed border-line px-6 py-16 text-center">
                        <Icon name="clock" className="mx-auto h-6 w-6 text-fg-3" />
                        <p className="mt-3 text-[15px] font-medium text-fg">No history yet</p>
                        <p className="mt-1 text-[13px] text-fg-3">Start browsing to populate this list.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
