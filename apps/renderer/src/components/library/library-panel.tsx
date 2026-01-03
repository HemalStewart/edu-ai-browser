import React from "react";

export function LibraryPanel() {
    return (
        <div className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="font-semibold text-2xl tracking-tight text-foreground/90">Library</h2>
            </div>

            <div className="space-y-3">
                <div className="group flex flex-col p-4 rounded-2xl bg-white/60 border border-white/40 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <div className="text-base font-semibold text-foreground/90">React Hooks Guide</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium opacity-70">Last read 2h ago</div>
                </div>

                <div className="group flex flex-col p-4 rounded-2xl bg-white/60 border border-white/40 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <div className="text-base font-semibold text-foreground/90">Electron Security</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium opacity-70">Bookmarked</div>
                </div>

                <div className="group flex flex-col p-4 rounded-2xl bg-white/60 border border-white/40 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <div className="text-base font-semibold text-foreground/90">History of AI</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium opacity-70">PDF Document</div>
                </div>
            </div>

            <div className="mt-auto">
                <button className="w-full py-2 text-sm border rounded-md hover:bg-accent transition-colors">
                    + New Study Plan
                </button>
            </div>
        </div>
    );
}
