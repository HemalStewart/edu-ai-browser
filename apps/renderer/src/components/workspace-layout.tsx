import React from "react";

interface WorkspaceLayoutProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    children: React.ReactNode;
    hideLeftPanel?: boolean;
    hideRightPanel?: boolean;
}

export function WorkspaceLayout({
    leftPanel,
    rightPanel,
    children,
    hideLeftPanel = false,
    hideRightPanel = false,
}: WorkspaceLayoutProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden p-3 gap-3">
            {/* Left Panel: Library */}
            <aside
                className={`flex-shrink-0 overflow-hidden flex flex-col transition-spring ${hideLeftPanel
                        ? "w-0 opacity-0 pointer-events-none scale-95"
                        : "w-[360px] glass-panel rounded-3xl liquid-hover spring-enter"
                    }`}
            >
                {!hideLeftPanel && leftPanel}
            </aside>

            {/* Center Panel: Reader/Browser - Opaque center for readability, but rounded */}
            <main className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden rounded-3xl glass-ultra shadow-inner ring-1 ring-black/5 transition-smooth">
                {children}
            </main>

            {/* Right Panel: AI Tutor */}
            <aside
                className={`flex-shrink-0 overflow-hidden flex flex-col transition-spring ${hideRightPanel
                        ? "w-0 opacity-0 pointer-events-none scale-95"
                        : "w-[420px] glass-panel rounded-3xl liquid-hover spring-enter"
                    }`}
            >
                {!hideRightPanel && rightPanel}
            </aside>
        </div>
    );
}
