import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import type { IElectronAPI } from "@/types/global";

type Bookmark = Awaited<ReturnType<IElectronAPI["getBookmarks"]>>[number];

export function BookmarksView({ onNavigate }: { onNavigate: (url: string) => void }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    useEffect(() => {
        window.eduAPI?.getBookmarks().then(setBookmarks);
    }, []);

    const removeBookmark = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await window.eduAPI?.removeBookmark(id);
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-5xl px-8 py-8">
                <div className="border-b border-line pb-5">
                    <p className="kicker">edu://bookmarks</p>
                    <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.02em] text-fg">Bookmarks</h1>
                    <p className="mt-1 text-[13px] text-fg-3">
                        {bookmarks.length} saved {bookmarks.length === 1 ? "page" : "pages"}. Use the bookmark button in the address bar to add more.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {bookmarks.map((b) => (
                        <div
                            key={b.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => onNavigate(b.url)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onNavigate(b.url);
                                }
                            }}
                            className="group relative rounded border border-line bg-card p-4 transition-colors hover:border-line-active"
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <span className="flex h-8 w-8 items-center justify-center rounded border border-line text-fg-2">
                                    <Icon name="bookmark" className="h-4 w-4" />
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => removeBookmark(e, b.id)}
                                    aria-label={`Remove ${b.title}`}
                                    className="flex h-7 w-7 items-center justify-center rounded text-fg-3 opacity-0 transition-all hover:bg-raised hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
                                >
                                    <Icon name="x" className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <h3 className="truncate text-[14px] font-medium text-fg">{b.title}</h3>
                            <p className="mt-1 truncate font-mono text-[11.5px] text-fg-3">{b.url}</p>
                        </div>
                    ))}
                    {bookmarks.length === 0 && (
                        <div className="col-span-full rounded-lg border border-dashed border-line px-6 py-16 text-center">
                            <Icon name="bookmark" className="mx-auto h-6 w-6 text-fg-3" />
                            <p className="mt-3 text-[15px] font-medium text-fg">No bookmarks yet</p>
                            <p className="mt-1 text-[13px] text-fg-3">Save your favorite pages for quick access.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
