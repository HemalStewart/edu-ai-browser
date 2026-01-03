import React from "react";

interface WorkspaceLayoutProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    children: React.ReactNode;
}

export function WorkspaceLayout({
    leftPanel,
    rightPanel,
    children,
}: WorkspaceLayoutProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden p-3 gap-3">
            {/* Left Panel: Library */}
            <aside className="w-72 flex-shrink-0 glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg">
                {leftPanel}
            </aside>

            {/* Center Panel: Reader/Browser - Opaque center for readability, but rounded */}
            <main className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden rounded-3xl bg-white/90 shadow-inner ring-1 ring-black/5">
                {children}
            </main>

            {/* Right Panel: AI Tutor */}
            <aside className="w-[420px] flex-shrink-0 glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg">
                {rightPanel}
            </aside>
        </div>
    );
}
