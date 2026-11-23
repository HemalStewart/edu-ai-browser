import React from "react";
import { Icon, type IconName } from "@/components/icons";
import type {
    ComplianceFeature,
    DiscoveryCard,
    LearningPath,
    QuickTool,
    RecentSession,
    ToolResult,
} from "@/types/workspace";

interface SessionSummary {
    title: string;
    url: string;
    peek: string;
    status: string;
}

interface LibraryPanelProps {
    session: SessionSummary;
    focusMode: boolean;
    notesEnabled: boolean;
    aiSyncEnabled: boolean;
    onToggleFocus: () => void;
    onToggleNotes: () => void;
    onToggleAiSync: () => void;
    recentSessions: RecentSession[];
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

const browserLinks: Array<{ label: string; url: string; icon: IconName }> = [
    { label: "History", url: "edu://history", icon: "clock" },
    { label: "Bookmarks", url: "edu://bookmarks", icon: "bookmark" },
    { label: "Settings", url: "edu://settings", icon: "settings" },
];

/** Extracted page text can be markdown; show it as plain prose in the preview. */
const plainPeek = (peek: string) => peek.replace(/[#*_`>]+/g, "").replace(/\s+/g, " ").trim();

const indexLabel = (index: number) => String(index + 1).padStart(2, "0");

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="border-b border-line-muted px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="kicker">{title}</h3>
                {aside}
            </div>
            {children}
        </section>
    );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            onClick={onClick}
            className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-[13px] text-fg-2 transition-colors hover:bg-raised hover:text-fg"
        >
            {label}
            <span className="flex items-center gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">{on ? "On" : "Off"}</span>
                <span
                    className={`relative h-4 w-7 rounded-sm border transition-colors ${on ? "border-fg bg-fg" : "border-line-active bg-canvas"}`}
                >
                    <span
                        className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-[1px] transition-all ${on ? "left-[13px] bg-canvas" : "left-[2px] bg-fg-3"}`}
                    />
                </span>
            </span>
        </button>
    );
}

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
    const isBlank = session.url === "about:blank" || session.url === "";

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
                <p className="text-[14px] font-medium text-fg">Library</p>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">
                    {recentSessions.length} recent · {discoverCards.length} sources
                </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <Section title="Now browsing">
                    <div className="rounded border border-line bg-card p-3">
                        <p className="text-[14px] font-medium leading-snug text-fg">{session.title}</p>
                        <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-fg-2">{plainPeek(session.peek)}</p>
                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line-muted pt-2 font-mono text-[10.5px] text-fg-3">
                            <span className="truncate">{isBlank ? "omnibox" : session.url.replace(/^https?:\/\//, "")}</span>
                            <span className="shrink-0 uppercase tracking-[0.1em] text-fg-2">{session.status}</span>
                        </div>
                    </div>
                </Section>

                <Section title="Live toggles">
                    <div className="-mx-2 space-y-0.5">
                        <Toggle label="Focus session" on={focusMode} onClick={onToggleFocus} />
                        <Toggle label="Inline notes" on={notesEnabled} onClick={onToggleNotes} />
                        <Toggle label="AI auto-sync" on={aiSyncEnabled} onClick={onToggleAiSync} />
                    </div>
                </Section>

                <Section title="Recent spots" aside={<span className="font-mono text-[10.5px] text-fg-4">Tap to reopen</span>}>
                    <ol className="-mx-2 space-y-0.5">
                        {recentSessions.map((entry, index) => (
                            <li key={entry.id}>
                                <button
                                    type="button"
                                    onClick={() => onQuickLaunch(entry.url)}
                                    className="group flex w-full items-start gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-raised"
                                >
                                    <span className="pt-px font-mono text-[11px] text-fg-3">{indexLabel(index)}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[13px] text-fg">{entry.title}</span>
                                        <span className="mt-0.5 block font-mono text-[10.5px] text-fg-3">{entry.time}</span>
                                    </span>
                                    <span className="shrink-0 rounded-sm border border-line px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.08em] text-fg-2">
                                        {entry.status}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ol>
                </Section>

                <Section
                    title="Learning tools"
                    aside={
                        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">
                            <span className={`h-1.5 w-1.5 rounded-full ${toolInFlight ? "animate-pulse bg-fg-2" : "bg-fg"}`} />
                            {toolInFlight ? "Running…" : "Ready"}
                        </span>
                    }
                >
                    <p className="-mt-1 mb-3 text-[12.5px] text-fg-3">One-tap actions grounded in this page.</p>
                    {toolResult && (
                        <div className="mb-3 rounded border border-line-active bg-raised px-3 py-2">
                            <p className="text-[12.5px] font-medium text-fg">{toolResult.title}</p>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-fg-2">{toolResult.detail}</p>
                        </div>
                    )}
                    <div className="-mx-2 space-y-0.5">
                        {quickTools.map((tool) => (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={() => onTriggerTool(tool)}
                                aria-busy={toolInFlight === tool.id}
                                className="group flex w-full items-center gap-3 rounded border border-transparent px-2 py-2 text-left transition-colors hover:border-line hover:bg-card"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fg-3">{tool.badge}</span>
                                    <span className="mt-0.5 block text-[13px] text-fg">{tool.title}</span>
                                    <span className="block text-[12px] text-fg-3">{tool.detail}</span>
                                </span>
                                <Icon
                                    name={toolInFlight === tool.id ? "refresh" : "arrow-right"}
                                    className={`h-3.5 w-3.5 shrink-0 text-fg-4 group-hover:text-fg ${toolInFlight === tool.id ? "animate-spin" : ""}`}
                                />
                            </button>
                        ))}
                    </div>
                </Section>

                <Section title="Path builder" aside={<span className="font-mono text-[10.5px] text-fg-3">{learningPath.timeline}</span>}>
                    <p className="text-[14px] font-medium text-fg">{learningPath.goal}</p>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="h-0.5 flex-1 bg-line" role="progressbar" aria-valuenow={learningPath.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Path progress">
                            <div className="relative h-full bg-fg" style={{ width: `${learningPath.progress}%` }}>
                                <span className="absolute -right-[3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-fg" />
                            </div>
                        </div>
                        <span className="font-mono text-[11px] text-fg-2">{learningPath.progress}%</span>
                    </div>
                    <p className="mt-3 text-[12.5px] text-fg-2">{learningPath.milestone}</p>
                    <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">{learningPath.focus}</p>
                    <ul className="mt-3 space-y-1.5 border-t border-line-muted pt-3">
                        {learningPath.tasks.map((task) => (
                            <li key={task.label} className="flex items-center justify-between gap-3 text-[12px]">
                                <span className="font-medium text-fg">{task.label}</span>
                                <span className="text-right text-fg-3">{task.detail}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section title="Integrity stack">
                    <div className="space-y-2">
                        {compliance.map((feature) => (
                            <div key={feature.title} className="flex items-start justify-between gap-3 rounded border border-line bg-card px-3 py-2.5">
                                <div>
                                    <p className="text-[13px] font-medium text-fg">{feature.title}</p>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-fg-3">{feature.description}</p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-sm px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.08em] ${
                                        feature.status === "Ready" ? "bg-fg text-canvas" : "border border-line-active text-fg-2"
                                    }`}
                                >
                                    {feature.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Discover" aside={<span className="font-mono text-[10.5px] text-fg-4">Command center</span>}>
                    <div className="-mx-2 space-y-0.5">
                        {discoverCards.map((card) => (
                            <button
                                key={card.title}
                                type="button"
                                onClick={() => onQuickLaunch(card.url)}
                                className="group flex w-full items-start gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-raised"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fg-3">{card.label}</span>
                                    <span className="mt-0.5 block text-[13px] text-fg">{card.title}</span>
                                    <span className="block text-[12px] text-fg-3">{card.description}</span>
                                </span>
                                <Icon name="external" className="mt-1 h-3.5 w-3.5 shrink-0 text-fg-4 group-hover:text-fg" />
                            </button>
                        ))}
                    </div>
                </Section>

                <Section title="Browser">
                    <div className="grid grid-cols-3 gap-2">
                        {browserLinks.map((link) => (
                            <button
                                key={link.url}
                                type="button"
                                onClick={() => onQuickLaunch(link.url)}
                                className="flex flex-col items-center justify-center gap-1.5 rounded border border-line py-3 text-fg-2 transition-colors hover:border-line-active hover:bg-card hover:text-fg"
                            >
                                <Icon name={link.icon} className="h-4 w-4" />
                                <span className="text-[11.5px]">{link.label}</span>
                            </button>
                        ))}
                    </div>
                </Section>

                <section className="px-4 py-4">
                    <h3 className="kicker mb-3">Library</h3>
                    <div className="space-y-2">
                        {libraryItems.map((item) => (
                            <div key={item.title} className="flex items-center gap-3 rounded border border-line bg-card px-3 py-2.5">
                                <Icon name="file" className="h-4 w-4 shrink-0 text-fg-3" />
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] text-fg">{item.title}</p>
                                    <p className="font-mono text-[10.5px] text-fg-3">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        disabled
                        title="Study plans are coming soon"
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-dashed border-line py-2 text-[12.5px] text-fg-3 disabled:cursor-not-allowed"
                    >
                        <Icon name="plus" className="h-3.5 w-3.5" /> New study plan
                        <span className="rounded-sm border border-line px-1 font-mono text-[9.5px] uppercase tracking-[0.08em]">Soon</span>
                    </button>
                </section>
            </div>
        </div>
    );
}
