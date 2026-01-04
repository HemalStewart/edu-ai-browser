import React from "react";

interface SessionSummary {
    title: string;
    url: string;
    peek: string;
    status: string;
}

interface RecentEntry {
    id: string;
    title: string;
    url: string;
    status: string;
    time: string;
}

interface QuickTool {
    id: string;
    title: string;
    detail: string;
    badge: string;
    accent: string;
}

interface LearningPath {
    goal: string;
    timeline: string;
    progress: number;
    milestone: string;
    focus: string;
    tasks: Array<{ label: string; detail: string }>;
}

interface ComplianceFeature {
    title: string;
    description: string;
    status: string;
}

interface DiscoveryCard {
    title: string;
    description: string;
    label: string;
    url: string;
    accent: string;
}

interface ToolResult {
    title: string;
    detail: string;
}

interface LibraryPanelProps {
    session: SessionSummary;
    focusMode: boolean;
    notesEnabled: boolean;
    aiSyncEnabled: boolean;
    onToggleFocus: () => void;
    onToggleNotes: () => void;
    onToggleAiSync: () => void;
    recentSessions: RecentEntry[];
    onQuickLaunch: (url: string) => void;
    quickTools: QuickTool[];
    onTriggerTool: (tool: QuickTool) => void;
    toolInFlight: string | null;
    toolResult: ToolResult | null;
    learningPath: LearningPath;
    compliance: ComplianceFeature[];
    discoverCards: DiscoveryCard[];
}

const libraryItems = [
    { title: "React Hooks Guide", detail: "Last read 2h ago" },
    { title: "Electron Security", detail: "Bookmarked" },
    { title: "History of AI", detail: "PDF Document" },
];

export function LibraryPanel({
    session,
    focusMode,
    notesEnabled,
    aiSyncEnabled,
    onToggleFocus,
    onToggleNotes,
    onToggleAiSync,
    recentSessions,
    onQuickLaunch,
    quickTools,
    onTriggerTool,
    toolInFlight,
    toolResult,
    learningPath,
    compliance,
    discoverCards,
}: LibraryPanelProps) {
    return (
        <div className="p-4 h-full flex flex-col gap-4 overflow-y-auto">
            <div className="space-y-4">
                <div className="rounded-2xl bg-white/75 border border-white/60 p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Now Browsing</p>
                    <h3 className="text-lg font-semibold text-foreground mt-2">{session.title}</h3>
                    <p className="text-xs text-foreground/60 mt-2 leading-relaxed line-clamp-3">{session.peek}</p>
                    <div className="flex items-center justify-between mt-4 text-xs text-foreground/50">
                        <span className="truncate">{session.url.replace(/^https?:\/\//, "")}</span>
                        <span className="font-semibold">{session.status}</span>
                    </div>
                </div>

                <div className="rounded-2xl bg-white/75 border border-white/60 p-4 shadow-sm space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Live Toggles</p>
                    <button
                        type="button"
                        onClick={onToggleFocus}
                        className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                            focusMode ? "bg-blue-500/10 text-blue-600 border border-blue-500/30" : "bg-white text-foreground/70 border border-white/70"
                        }`}
                    >
                        Focus session <span>{focusMode ? "On" : "Off"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onToggleNotes}
                        className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                            notesEnabled ? "bg-purple-500/10 text-purple-600 border border-purple-500/30" : "bg-white text-foreground/70 border border-white/70"
                        }`}
                    >
                        Inline notes <span>{notesEnabled ? "On" : "Off"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onToggleAiSync}
                        className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                            aiSyncEnabled ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-white text-foreground/70 border border-white/70"
                        }`}
                    >
                        AI auto-sync <span>{aiSyncEnabled ? "On" : "Off"}</span>
                    </button>
                </div>

                <div className="rounded-2xl bg-white/75 border border-white/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Recent Spots</p>
                        <span className="text-[10px] font-semibold text-foreground/40">Tap to reopen</span>
                    </div>
                    <div className="space-y-2">
                        {recentSessions.map((entry) => (
                            <button
                                key={entry.id}
                                type="button"
                                onClick={() => onQuickLaunch(entry.url)}
                                className="w-full rounded-2xl bg-white border border-white/70 px-3 py-2 text-left hover:bg-white/90 transition"
                            >
                                <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                                <p className="text-[11px] text-foreground/50">{entry.time}</p>
                                <span className="inline-flex mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-foreground/5 text-foreground/60">
                                    {entry.status}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl bg-white/75 border border-white/60 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Learning Tools</p>
                            <p className="text-xs text-foreground/60">One-tap actions grounded in this page.</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-white/90 border border-white/70 text-foreground/50">
                            {toolInFlight ? "Running…" : "Ready"}
                        </span>
                    </div>
                    {toolResult && (
                        <div className="rounded-2xl bg-white/90 border border-white/70 px-3 py-2">
                            <p className="text-xs font-semibold text-foreground">{toolResult.title}</p>
                            <p className="text-[11px] text-foreground/60">{toolResult.detail}</p>
                        </div>
                    )}
                    {quickTools.map((tool) => (
                        <button
                            key={tool.id}
                            type="button"
                            onClick={() => onTriggerTool(tool)}
                            className={`w-full rounded-2xl p-3 text-left text-white shadow-md hover:shadow-lg transition bg-gradient-to-r ${tool.accent}`}
                        >
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{tool.badge}</span>
                            <p className="text-sm font-semibold mt-1">{tool.title}</p>
                            <p className="text-xs text-white/80">{tool.detail}</p>
                        </button>
                    ))}
                </div>

                <div className="rounded-2xl bg-white/75 border border-white/60 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Path Builder</p>
                            <p className="text-sm font-semibold text-foreground">{learningPath.goal}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-foreground/50">{learningPath.timeline}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/60 border border-white/80 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                            style={{ width: `${learningPath.progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-foreground/70">{learningPath.milestone}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/50">{learningPath.focus}</p>
                    <ul className="space-y-1">
                        {learningPath.tasks.map((task) => (
                            <li key={task.label} className="flex items-center justify-between text-xs text-foreground/70">
                                <span className="font-semibold text-foreground/80">{task.label}</span>
                                <span className="text-right">{task.detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl bg-white/75 border border-white/60 p-4 shadow-sm space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Integrity Stack</p>
                    {compliance.map((feature) => (
                        <div key={feature.title} className="rounded-2xl bg-white/90 border border-white/70 px-3 py-2 flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                                <p className="text-xs text-foreground/60">{feature.description}</p>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-foreground/5 text-foreground/60">
                                {feature.status}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl bg-white/75 border border-white/60 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Discover</p>
                        <span className="text-[10px] font-semibold text-foreground/40">Command Center</span>
                    </div>
                    {discoverCards.map((card) => (
                        <button
                            key={card.title}
                            type="button"
                            onClick={() => onQuickLaunch(card.url)}
                            className={`w-full rounded-2xl text-left p-3 text-white shadow-lg hover:shadow-xl transition bg-gradient-to-br ${card.accent}`}
                        >
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                                {card.label}
                            </span>
                            <p className="text-base font-semibold mt-1">{card.title}</p>
                            <p className="text-xs text-white/80">{card.description}</p>
                            <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                                Jump in <span aria-hidden="true">↗</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 mt-auto pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">Library</p>
                {libraryItems.map((item) => (
                    <div
                        key={item.title}
                        className="flex flex-col p-3 rounded-2xl bg-white/80 border border-white/60 shadow-sm"
                    >
                        <span className="text-sm font-semibold text-foreground">{item.title}</span>
                        <span className="text-xs text-foreground/50">{item.detail}</span>
                    </div>
                ))}
                <button className="w-full py-2 text-sm border rounded-2xl bg-white hover:bg-white/80 transition">
                    + New Study Plan
                </button>
            </div>
        </div>
    );
}
