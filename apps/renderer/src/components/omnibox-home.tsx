"use client";

import { useMemo, useState, type RefObject } from "react";
import { Icon } from "@/components/icons";
import type { DiscoveryCard, LearningPath, QuickTool, RecentSession, SearchEngine, ToolResult } from "@/types/workspace";

type ResultFilter = "all" | "discover" | "recent";

interface OmniboxResult {
    id: string;
    kind: "discover" | "recent";
    title: string;
    url: string;
    label: string;
    description: string;
}

interface OmniboxHomeProps {
    inputRef: RefObject<HTMLInputElement | null>;
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onOpen: (url: string) => void;
    engines: SearchEngine[];
    engineLabel: string;
    discover: DiscoveryCard[];
    recent: RecentSession[];
    quickTools: QuickTool[];
    onTriggerTool: (tool: QuickTool) => void;
    toolInFlight: string | null;
    toolResult: ToolResult | null;
    learningPath: LearningPath;
    tabCount: number;
}

const hostOf = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
};

export function OmniboxHome({
    inputRef,
    value,
    onChange,
    onSubmit,
    onOpen,
    engines,
    engineLabel,
    discover,
    recent,
    quickTools,
    onTriggerTool,
    toolInFlight,
    toolResult,
    learningPath,
    tabCount,
}: OmniboxHomeProps) {
    const [filter, setFilter] = useState<ResultFilter>("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const results = useMemo<OmniboxResult[]>(() => {
        const discoverResults = discover.map((card) => ({
            id: `discover-${card.url}`,
            kind: "discover" as const,
            title: card.title,
            url: card.url,
            label: card.label,
            description: card.description,
        }));
        const recentResults = recent.map((entry) => ({
            id: `recent-${entry.id}`,
            kind: "recent" as const,
            title: entry.title,
            url: entry.url,
            label: entry.status,
            description: `Last opened ${entry.time.replace("•", "·")}. Reopen to keep studying where you left off.`,
        }));
        if (filter === "discover") return discoverResults;
        if (filter === "recent") return recentResults;
        return [...recentResults, ...discoverResults];
    }, [discover, recent, filter]);

    const filters: Array<{ id: ResultFilter; label: string; count: number }> = [
        { id: "all", label: "All sources", count: discover.length + recent.length },
        { id: "recent", label: "Recent spots", count: recent.length },
        { id: "discover", label: "Discover deck", count: discover.length },
    ];

    const copyLink = async (result: OmniboxResult) => {
        try {
            await navigator.clipboard?.writeText(result.url);
            setCopiedId(result.id);
            window.setTimeout(() => setCopiedId((current) => (current === result.id ? null : current)), 1600);
        } catch (error) {
            console.error("Copy link failed:", error);
        }
    };

    return (
        <div className="@container min-h-full bg-canvas">
            {/* Context banner */}
            <div className="border-b border-line-muted px-4 @xl:px-8 pb-5 pt-6">
                <div className="mx-auto max-w-[1280px]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-3">
                            <span className="font-semibold text-fg">Quantum Mind</span>
                            <span className="text-fg-4">{"//"}</span>
                            <span>Study browser</span>
                            <span className="text-fg-4">{"//"}</span>
                            <span className="text-fg-2">Omnibox</span>
                            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-fg" />
                        </p>
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em]">
                            <span className="flex items-center gap-1.5 rounded-sm bg-pane px-2 py-1 text-fg-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-fg" /> {tabCount} {tabCount === 1 ? "tab" : "tabs"} open
                            </span>
                            <span className="rounded-sm bg-pane px-2 py-1 text-fg-3">Search: {engineLabel}</span>
                            <span className="rounded-sm bg-pane px-2 py-1 text-fg-3">Drop a link or file to open</span>
                        </div>
                    </div>
                    <h1 className="mt-3 text-[30px] font-semibold leading-[38px] tracking-[-0.015em] text-fg">Omnibox Search &amp; Retrieval</h1>
                    <p className="mt-1 max-w-3xl text-[13.5px] text-fg-3">
                        Search the web, open a link, or reopen a study source. Read Page in the AI Tutor grounds every answer in the tab you are on.
                    </p>
                </div>
            </div>

            {/* Omnibox */}
            <div className="border-b border-line-muted bg-pane px-4 @xl:px-8 py-5">
                <form
                    className="mx-auto max-w-[1280px] rounded-lg border border-line bg-canvas p-4 transition-colors focus-within:border-line-active"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-fg">
                            <Icon name="terminal" className="h-6 w-6" />
                            <Icon name="sparkles" className="h-4 w-4 text-fg-3" />
                        </span>
                        <input
                            ref={inputRef}
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            aria-label="Search the web or enter a URL"
                            placeholder="Search the web or enter a URL..."
                            spellCheck={false}
                            autoFocus
                            className="min-w-0 flex-1 bg-transparent text-[22px] font-medium tracking-[-0.01em] text-fg caret-fg outline-none placeholder:text-fg-4 focus-visible:outline-none"
                        />
                        <button
                            type="submit"
                            className="flex h-9 shrink-0 items-center gap-2 rounded bg-accent px-4 font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-accent-fg transition-colors hover:bg-accent-hover active:bg-accent-active"
                        >
                            Open <Icon name="return" className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-muted pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="kicker mr-1">Engines</span>
                            {engines.map((engine) => (
                                <button
                                    key={engine.name}
                                    type="button"
                                    onClick={() => onOpen(engine.url)}
                                    className="flex h-7 items-center gap-2 rounded-sm border border-line bg-pane px-2.5 font-mono text-[11px] text-fg-2 transition-colors hover:border-line-active hover:text-fg"
                                >
                                    {/* Engine logos are drawn for a white backing, so it stays white in both themes. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={engine.icon} alt="" className="h-4 w-4 rounded-[2px] bg-[#fff] object-cover object-left p-px" />
                                    {engine.name}
                                </button>
                            ))}
                        </div>
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-4">Enter ↵ open · ⌘K focus</p>
                    </div>
                </form>
            </div>

            {/* Filters */}
            <div className="px-4 @xl:px-8 py-3">
                <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter sources">
                        {filters.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFilter(item.id)}
                                aria-pressed={filter === item.id}
                                className={`flex h-7 items-center gap-1.5 rounded-sm px-3 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                                    filter === item.id ? "bg-accent font-semibold text-accent-fg" : "bg-pane text-fg-3 hover:bg-raised hover:text-fg"
                                }`}
                            >
                                {filter === item.id && <span className="h-1.5 w-1.5 rounded-full bg-accent-fg" />}
                                {item.label} ({item.count})
                            </button>
                        ))}
                    </div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">
                        <span className="text-fg">{results.length}</span> results · recent first
                    </p>
                </div>
            </div>

            {/* Results + side column */}
            <div className="px-4 @xl:px-8 pb-10">
                <div className="mx-auto grid max-w-[1280px] gap-10 @5xl:grid-cols-[minmax(0,1fr)_340px]">
                    <ol className="min-w-0">
                        {results.map((result, index) => (
                            <li key={result.id} className="border-t border-line-muted py-5 first:border-t-0 first:pt-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">
                                            <Icon name={result.kind === "recent" ? "clock" : "compass"} className="h-3.5 w-3.5 text-fg-2" />
                                            <span className="text-fg-2">{result.kind === "recent" ? "Recent spot" : "Discover"}</span>
                                            <span className="text-fg-4">·</span>
                                            <span className="normal-case tracking-normal">{hostOf(result.url)}</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => onOpen(result.url)}
                                            className="mt-1.5 text-left text-[18px] font-medium leading-6 tracking-[-0.005em] text-fg underline-offset-4 hover:underline"
                                        >
                                            {result.title}
                                        </button>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-fg">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-fg-4">{result.label}</span>
                                    </div>
                                </div>
                                <p className="mt-3 rounded border border-line-muted bg-pane px-3.5 py-3 text-[13.5px] leading-relaxed text-fg-2">
                                    {result.description}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onOpen(result.url)}
                                        className="flex h-7 items-center gap-1.5 rounded-sm border border-accent bg-accent px-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-accent-fg transition-colors hover:bg-accent-hover"
                                    >
                                        Open <Icon name="external" className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => copyLink(result)}
                                        className="flex h-7 items-center gap-1.5 rounded-sm border border-line px-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-2 transition-colors hover:border-line-active hover:text-fg"
                                    >
                                        <Icon name={copiedId === result.id ? "check" : "copy"} className="h-3 w-3" />
                                        {copiedId === result.id ? "Copied" : "Copy link"}
                                    </button>
                                    <span className="ml-auto truncate font-mono text-[10.5px] text-fg-4">{result.url.replace(/^https?:\/\//, "")}</span>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <aside className="space-y-6 @5xl:sticky @5xl:top-6 @5xl:self-start">
                        <section className="rounded-lg border border-line bg-pane">
                            <div className="flex items-center justify-between border-b border-line px-4 py-3">
                                <h2 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-fg">
                                    <Icon name="sparkles" className="h-3.5 w-3.5" /> Learning tools
                                </h2>
                                <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">
                                    <span className={`h-1.5 w-1.5 rounded-full ${toolInFlight ? "animate-pulse bg-fg-2" : "bg-fg"}`} />
                                    {toolInFlight ? "Running" : "Ready"}
                                </span>
                            </div>
                            {toolResult && (
                                <div className="border-b border-line-muted bg-card px-4 py-3">
                                    <p className="text-[12.5px] font-medium text-fg">{toolResult.title}</p>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-fg-2">{toolResult.detail}</p>
                                </div>
                            )}
                            <div className="p-2">
                                {quickTools.map((tool) => (
                                    <button
                                        key={tool.id}
                                        type="button"
                                        onClick={() => onTriggerTool(tool)}
                                        aria-busy={toolInFlight === tool.id}
                                        className="group flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-raised"
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[13px] text-fg">{tool.title}</span>
                                            <span className="block text-[11.5px] text-fg-3">{tool.detail}</span>
                                        </span>
                                        <span className="shrink-0 rounded-sm border border-line px-1.5 py-px font-mono text-[9.5px] uppercase tracking-[0.08em] text-fg-3 group-hover:border-line-active group-hover:text-fg-2">
                                            {tool.badge}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="border-t border-line-muted px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-4">
                                Results stream into the AI Tutor
                            </p>
                        </section>

                        <section className="rounded-lg border border-line bg-pane p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-fg">
                                    <Icon name="route" className="h-3.5 w-3.5" /> Path builder
                                </h2>
                                <span className="font-mono text-[10.5px] text-fg-3">{learningPath.progress}%</span>
                            </div>
                            <p className="mt-3 text-[15px] font-medium text-fg">{learningPath.goal}</p>
                            <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">{learningPath.timeline}</p>
                            <div className="mt-3 h-0.5 bg-line">
                                <div className="relative h-full bg-fg" style={{ width: `${learningPath.progress}%` }}>
                                    <span className="absolute -right-[3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-fg" />
                                </div>
                            </div>
                            <p className="mt-3 text-[12.5px] text-fg-2">{learningPath.milestone}</p>
                            <ul className="mt-3 space-y-1.5 border-t border-line-muted pt-3">
                                {learningPath.tasks.map((task) => (
                                    <li key={task.label} className="flex items-center justify-between gap-3 text-[12px]">
                                        <span className="text-fg">{task.label}</span>
                                        <span className="text-right text-fg-3">{task.detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
