import React from "react";
import { AlphaMindHeader } from "@/components/alpha-mind-header";

interface WorkspaceLayoutProps {
    topBar: React.ReactNode;
    rail: React.ReactNode;
    statusBar?: React.ReactNode;
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    children: React.ReactNode;
    hideLeftPanel?: boolean;
    hideRightPanel?: boolean;
}

/**
 * Tripartite studio workspace: icon rail · library (sources) · browser canvas · AI tutor.
 * Columns are split by 1px hairlines instead of gutters. Side panels stay mounted while hidden
 * so the tutor keeps its conversation when it is toggled.
 */
export function WorkspaceLayout({
    topBar,
    rail,
    statusBar,
    leftPanel,
    rightPanel,
    children,
    hideLeftPanel = false,
    hideRightPanel = false,
}: WorkspaceLayoutProps) {
    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-fg">
            {topBar}
            <AlphaMindHeader />

            <div className="flex min-h-0 flex-1 overflow-hidden">
                {rail}

                <aside
                    aria-label="Library"
                    hidden={hideLeftPanel}
                    className="flex w-[300px] shrink-0 flex-col overflow-hidden border-r border-line bg-pane xl:w-[320px]"
                >
                    {leftPanel}
                </aside>

                <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">{children}</main>

                <aside
                    aria-label="AI Tutor"
                    hidden={hideRightPanel}
                    className="flex w-[360px] shrink-0 flex-col overflow-hidden border-l border-line bg-pane xl:w-[380px]"
                >
                    {rightPanel}
                </aside>
            </div>

            {statusBar}
        </div>
    );
}
