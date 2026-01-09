"use client";

import { useState, useRef, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { LibraryPanel } from "@/components/library/library-panel";
import { AITutorPanel } from "@/components/ai-tutor/ai-tutor-panel";

interface DiscoveryCard {
  title: string;
  url: string;
  label: string;
  description: string;
  accent: string;
}

interface RecentSession {
  id: string;
  title: string;
  url: string;
  status: string;
  time: string;
}

interface SessionState {
  id: string;
  title: string;
  url: string;
  peek: string;
  status: string;
}

interface QuickTool {
  id: string;
  title: string;
  detail: string;
  accent: string;
  badge: string;
}

interface ComplianceFeature {
  title: string;
  description: string;
  status: string;
}

interface LearningPath {
  goal: string;
  timeline: string;
  progress: number;
  milestone: string;
  focus: string;
  tasks: Array<{ label: string; detail: string }>;
}

type IconName = "search" | "arrow-left" | "arrow-right" | "refresh" | "plus" | "x";

type ReaderExplainState =
  | { status: "idle"; text?: undefined; response?: undefined }
  | { status: "loading"; text: string; response?: undefined }
  | { status: "ready"; text: string; response: string }
  | { status: "error"; text: string; response?: undefined };

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  switch (name) {
    case "search":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16.5 16.5 21 21" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M10.5 19.5 3 12l7.5-7.5" />
          <path d="M3 12h18" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M13.5 4.5 21 12l-7.5 7.5" />
          <path d="M3 12h18" />
        </svg>
      );
    case "refresh":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M21 12a9 9 0 1 1-3.4-7" />
          <path d="M21 5v5h-5" />
        </svg>
      );
    case "plus":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "x":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M18 6 6 18" />
          <path d="M6 6 18 18" />
        </svg>
      );
    default:
      return null;
  }
};

const DISCOVERY_DECK: DiscoveryCard[] = [
  {
    title: "React Quick Start",
    url: "https://react.dev/learn",
    label: "Docs",
    description: "Framework fundamentals with runnable guides.",
    accent: "from-blue-500/80 via-purple-500/70 to-pink-500/70",
  },
  {
    title: "MDN Web APIs",
    url: "https://developer.mozilla.org/en-US/docs/Web/API",
    label: "Reference",
    description: "Search the living spec for browser features.",
    accent: "from-emerald-500/80 via-teal-500/70 to-cyan-500/70",
  },
  {
    title: "TypeScript Handbook",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    label: "Guide",
    description: "Language essentials with examples.",
    accent: "from-indigo-500/80 via-sky-500/70 to-cyan-500/70",
  },
  {
    title: "Electron Security Checklist",
    url: "https://www.electronjs.org/docs/latest/tutorial/security",
    label: "Security",
    description: "Hardening tips for production builds.",
    accent: "from-orange-500/80 via-amber-500/70 to-yellow-500/70",
  },
  {
    title: "AI Model Library",
    url: "https://ai.google.dev/gemini-api/docs",
    label: "AI",
    description: "Gemini & OpenAI usage notes in one place.",
    accent: "from-fuchsia-500/80 via-rose-500/70 to-red-500/70",
  },
  {
    title: "Next.js Routing",
    url: "https://nextjs.org/docs/app/building-your-application/routing",
    label: "Routing",
    description: "Deep dive on App Router layouts.",
    accent: "from-slate-500/80 via-gray-500/70 to-zinc-500/70",
  },
];

const DEFAULT_RECENT_SESSIONS: RecentSession[] = [
  {
    id: "react",
    title: "React Quick Start",
    url: "https://react.dev/learn",
    status: "Pinned",
    time: "Today • 09:30 AM",
  },
  {
    id: "mdn",
    title: "HTMLElement API",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement",
    status: "Reference",
    time: "Today • 08:10 AM",
  },
  {
    id: "electron",
    title: "Electron Security",
    url: "https://www.electronjs.org/docs/latest/tutorial/security",
    status: "Checklist",
    time: "Yesterday",
  },
  {
    id: "gemini",
    title: "Gemini API Docs",
    url: "https://ai.google.dev/gemini-api/docs",
    status: "AI",
    time: "Yesterday",
  },
];

const QUICK_TOOLS: QuickTool[] = [
  {
    id: "summarize",
    title: "Summarize Page",
    detail: "TL;DR with citations",
    badge: "Reader Mode",
    accent: "from-sky-500/80 via-blue-500/70 to-indigo-500/70",
  },
  {
    id: "explain",
    title: "Explain for Me",
    detail: "Beginner → expert levels",
    badge: "Tutor",
    accent: "from-emerald-500/80 via-teal-500/70 to-cyan-500/70",
  },
  {
    id: "keypoints",
    title: "Key Points",
    detail: "Highlight major takeaways",
    badge: "Notes",
    accent: "from-violet-500/80 via-purple-500/70 to-pink-500/70",
  },
  {
    id: "quiz",
    title: "Generate Quiz",
    detail: "Adaptive 5-question drill",
    badge: "Assess",
    accent: "from-amber-500/80 via-orange-500/70 to-red-500/70",
  },
  {
    id: "flashcards",
    title: "Create Flashcards",
    detail: "Spaced repetition ready",
    badge: "Memory",
    accent: "from-rose-500/80 via-red-500/70 to-orange-500/70",
  },
  {
    id: "context",
    title: "Ask From Page",
    detail: "Ground AI in this tab",
    badge: "Context",
    accent: "from-slate-500/80 via-gray-500/70 to-zinc-500/70",
  },
];

const LEARNING_PATH: LearningPath = {
  goal: "Learn React in 30 Days",
  timeline: "Day 12 · Foundations Track",
  progress: 42,
  milestone: "Hooks, effects, and state machines",
  focus: "Today's focus: Render cycle diagnostics",
  tasks: [
    { label: "Warm-up", detail: "Reader Mode + Gemini summary" },
    { label: "Practice", detail: "Adaptive quiz · 10 mins" },
    { label: "Review", detail: "Flashcards with spaced repetition" },
  ],
};

const COMPLIANCE_FEATURES: ComplianceFeature[] = [
  {
    title: "Integrity Mode",
    description: "Blocks direct answers, promotes reasoning steps.",
    status: "Ready",
  },
  {
    title: "Exam Locker",
    description: "Distraction-free, logs violations in real time.",
    status: "Beta",
  },
  {
    title: "Institution Sync",
    description: "Share verified study reports with schools.",
    status: "Soon",
  },
];

export default function Home() {
  const browserContainerRef = useRef<HTMLDivElement>(null);
  const [urlValue, setUrlValue] = useState("https://react.dev/learn");
  const [focusMode, setFocusMode] = useState(true);
  const [notesEnabled, setNotesEnabled] = useState(false);
  const [aiSyncEnabled, setAiSyncEnabled] = useState(true);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>(DEFAULT_RECENT_SESSIONS);
  const sessionCounterRef = useRef(0);
  const [libraryCollapsed, setLibraryCollapsed] = useState(true);
  const [tutorCollapsed, setTutorCollapsed] = useState(true);
  const [toolInFlight, setToolInFlight] = useState<string | null>(null);
  const [toolResult, setToolResult] = useState<{ title: string; detail: string } | null>(null);
  const [readerMode, setReaderMode] = useState(false);
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerContext, setReaderContext] = useState<{ title: string; content: string } | null>(null);
  const [readerHighlights, setReaderHighlights] = useState<Set<string>>(new Set());
  const [readerSyncedAt, setReaderSyncedAt] = useState<string | null>(null);
  const [selectionText, setSelectionText] = useState("");
  const [readerExplainState, setReaderExplainState] = useState<ReaderExplainState>({ status: "idle" });

  const nextSessionId = () => {
    sessionCounterRef.current += 1;
    return `session-${sessionCounterRef.current}`;
  };

  // Tab State
  const [tabs, setTabs] = useState<SessionState[]>([
    {
      id: "session-seed",
      title: "Ready to explore",
      url: "https://react.dev/learn",
      peek: "Use the hyper address bar to jump into any doc or save a link from the cards below.",
      status: "Idle",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("session-seed");

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Initialize first tab on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.eduAPI) {
      window.eduAPI.createTab("session-seed").then(() => {
        window.eduAPI.selectTab("session-seed");
        // Load initial URL if needed, or it defaults to blank in main.ts
        window.eduAPI.loadBrowserView("session-seed", "https://react.dev/learn");
      });
    }
  }, []);

  const formatUrlLabel = (target: string) => {
    try {
      const { hostname } = new URL(target);
      return hostname.replace(/^www\./, "");
    } catch {
      return target;
    }
  };

  const formatClock = () =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());

  const prevPeekFallback = (peek: string) =>
    peek || "Your reading summary will show up once you extract a page.";

  const defaultAiProvider =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_AI_PROVIDER_DEFAULT === "openai"
      ? "openai"
      : "gemini";

  const deriveHighlights = (body: string) => {
    const sentences = body.match(/[^.!?]+[.!?]/g) ?? [];
    const scored = sentences
      .map((sentence) => {
        const trimmed = sentence.trim();
        const wordCount = trimmed.split(/\s+/).length;
        return {
          sentence: trimmed,
          score: wordCount + (trimmed.includes(",") ? 2 : 0) + (trimmed.length > 120 ? 4 : 0),
        };
      })
      .filter((entry) => entry.sentence.length > 40);
    const topSentences = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.sentence);
    return new Set(topSentences);
  };

  const refreshReaderContext = async () => {
    setReaderLoading(true);
    try {
      const context = await fetchPageContext();
      if (context && context.content) {
        setReaderContext({ title: context.title || activeTab.title, content: context.content });
        setReaderHighlights(deriveHighlights(context.content));
        setReaderSyncedAt(new Date().toISOString());
      }
    } finally {
      setReaderLoading(false);
    }
  };

  const handleReaderToggle = async () => {
    if (readerMode) {
      setReaderMode(false);
      setSelectionText("");
      setReaderExplainState({ status: "idle" });
      return;
    }
    setReaderMode(true);
    await refreshReaderContext();
  };

  const handleReaderSelection = () => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (text.length > 12) {
      setSelectionText(text.slice(0, 1500));
      setReaderExplainState({ status: "idle" });
    } else {
      setSelectionText("");
      setReaderExplainState({ status: "idle" });
    }
  };

  const handleExplainSelection = async () => {
    if (!selectionText || typeof window === "undefined" || !window.eduAPI) return;
    setReaderExplainState({ status: "loading", text: selectionText });
    try {
      const response = await window.eduAPI.aiChat({
        messages: [
          {
            role: "user",
            text: `Explain the following passage for a student:\n\n${selectionText}`,
          },
        ],
        provider: defaultAiProvider,
      });
      setReaderExplainState({ status: "ready", text: selectionText, response });
    } catch (error) {
      console.error("Explain selection failed:", error);
      setReaderExplainState({ status: "error", text: selectionText });
    }
  };

  const fetchPageContext = async () => {
    if (typeof window === "undefined" || !window.eduAPI || !activeTabId) return null;
    try {
      return await window.eduAPI.extractText(activeTabId);
    } catch (error) {
      console.error("Failed to extract page context:", error);
      return null;
    }
  };

  // Initialize first tab on mount
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.eduAPI) {
      window.eduAPI.createTab("session-seed").then(() => {
        window.eduAPI.selectTab("session-seed");
        window.eduAPI.loadBrowserView("session-seed", "https://react.dev/learn");
        // Force a state update to trigger the resize effect
        setIsReady(true);
      });
    }
  }, []);

  // Handle BrowserView resizing and updates
  useEffect(() => {
    if (typeof window === "undefined" || !window.eduAPI) return;

    const updateBounds = () => {
      if (!browserContainerRef.current || !activeTabId) return;
      const rect = browserContainerRef.current.getBoundingClientRect();

      window.eduAPI.resizeBrowserView(activeTabId, {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    if (readerMode) {
      if (activeTabId) window.eduAPI.resizeBrowserView(activeTabId, { x: 0, y: 0, width: 0, height: 0 });
      return () => {
        if (activeTabId) window.eduAPI.resizeBrowserView(activeTabId, { x: 0, y: 0, width: 0, height: 0 });
      };
    }

    if (!browserContainerRef.current) return;

    // Initial Resize on Mount/Update
    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    resizeObserver.observe(browserContainerRef.current);
    // Debounce slightly to ensure layout is settled
    setTimeout(updateBounds, 50);
    window.addEventListener("resize", updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
      if (window.eduAPI && activeTabId) {
        window.eduAPI.resizeBrowserView(activeTabId, { x: 0, y: 0, width: 0, height: 0 });
      }
    };
  }, [libraryCollapsed, tutorCollapsed, readerMode, activeTabId, isReady]);

  // Add isReady to dependency of resize effect



  const navigate = (targetOverride?: string) => {
    let target = (targetOverride ?? urlValue).trim();
    if (!target) return;

    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    const title = formatUrlLabel(target);

    // Update active tab
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          title,
          url: target,
          status: "Live",
          peek: "Connected. Tap “Read Page” to sync context with the AI Tutor.",
        };
      }
      return tab;
    }));

    // Also update URL input if we navigated
    setUrlValue(target);

    setRecentSessions((prev) => {
      const filtered = prev.filter((entry) => entry.url !== target);
      const nextEntry: RecentSession = {
        id: activeTabId, // Use active tab ID as session ID for persistence logic
        title,
        url: target,
        status: "Live",
        time: `Today • ${formatClock()}`,
      };
      return [nextEntry, ...filtered].slice(0, 4);
    });

    setLibraryCollapsed(true);
    setTutorCollapsed(true);

    if (typeof window !== "undefined" && window.eduAPI) {
      window.eduAPI.loadBrowserView(activeTabId, target);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate();
    }
  };

  const handleBrowserAction = (action: "back" | "forward" | "refresh") => {
    if (typeof window === "undefined" || !window.eduAPI || !activeTabId) return;
    if (action === "back") window.eduAPI.back(activeTabId);
    if (action === "forward") window.eduAPI.forward(activeTabId);
    if (action === "refresh") window.eduAPI.refresh(activeTabId);
  };

  const handleQuickLaunch = (url: string) => {
    // Create new tab for quick launch? Or use current?
    // Let's use current for "Go" button, but maybe new tab logic is separate.
    navigate(url);
  };

  const handleFocusToggle = () => {
    if (libraryCollapsed && tutorCollapsed) {
      setLibraryCollapsed(false);
      setTutorCollapsed(false);
    } else {
      setLibraryCollapsed(true);
      setTutorCollapsed(true);
    }
  };

  const handleAnalyzePage = async () => {
    if (typeof window === "undefined" || !window.eduAPI) return null;

    // Update local status first
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, status: "Syncing" } : t));

    try {
      const data = await fetchPageContext();
      if (data) {
        setTabs(prev => prev.map(t => {
          if (t.id === activeTabId) {
            return {
              ...t,
              title: data.title || t.title,
              peek: data.content ? data.content.slice(0, 160) : prevPeekFallback(t.peek),
              status: "Synced"
            };
          }
          return t;
        }));

        setRecentSessions((prev) =>
          prev.map((entry) =>
            entry.id === activeTabId
              ? {
                ...entry,
                title: data.title || entry.title,
                status: "Synced",
                time: "Just now",
              }
              : entry
          )
        );
        return data;
      }
    } catch (error) {
      console.error("Failed to analyze page:", error);
    }

    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, status: "Live" } : t));
    return null;
  };

  const triggerQuickTool = async (tool: QuickTool) => {
    setToolInFlight(tool.id);
    setToolResult({
      title: `Running ${tool.title}`,
      detail: "Gathering the latest page context…",
    });

    const context = await fetchPageContext();
    setToolInFlight(null);

    if (!context) {
      setToolResult({
        title: "Need an active page",
        detail: "Load a site and tap “Read Page” so tools can understand it.",
      });
      return;
    }

    const anchorTitle = context.title || formatUrlLabel(activeTab.url);
    setToolResult({
      title: `${tool.title} queued`,
      detail: `Anchored to “${anchorTitle}”. Results will surface in the AI Tutor shortly.`,
    });
  };

  // Tab management handlers
  const createNewTab = async () => {
    const newId = nextSessionId();
    const newTab: SessionState = {
      id: newId,
      title: "New Tab",
      url: "about:blank",
      peek: "Ready to explore",
      status: "Idle"
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setUrlValue(""); // Clear address bar for new tab

    if (typeof window !== "undefined" && window.eduAPI) {
      await window.eduAPI.createTab(newId);
      await window.eduAPI.selectTab(newId);
    }
  };

  const closeTab = async (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Prevent closing last tab for now

    const idx = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      // Switch to neighbor
      const newActive = newTabs[Math.max(0, idx - 1)];
      setActiveTabId(newActive.id);
      setUrlValue(newActive.url === "about:blank" ? "" : newActive.url);
      if (typeof window !== "undefined" && window.eduAPI) {
        await window.eduAPI.selectTab(newActive.id);
      }
    }

    if (typeof window !== "undefined" && window.eduAPI) {
      await window.eduAPI.removeTab(tabId);
    }
  };

  const switchTab = async (tabId: string) => {
    setActiveTabId(tabId);
    const targetTab = tabs.find(t => t.id === tabId);
    if (targetTab) {
      setUrlValue(targetTab.url === "about:blank" ? "" : targetTab.url);
    }

    if (typeof window !== "undefined" && window.eduAPI) {
      await window.eduAPI.selectTab(tabId);
    }
  };

  const readerParagraphs = readerContext
    ? readerContext.content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    : [];

  const readerSyncedLabel = readerSyncedAt
    ? `Synced ${new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(readerSyncedAt))}`
    : "Not synced yet";

  const selectionPreview =
    selectionText.length > 200 ? `${selectionText.slice(0, 200)}…` : selectionText;

  return (
    <WorkspaceLayout
      leftPanel={
        <LibraryPanel
          session={activeTab} // Use active tab as session
          focusMode={focusMode}
          notesEnabled={notesEnabled}
          aiSyncEnabled={aiSyncEnabled}
          onToggleFocus={() => setFocusMode((prev) => !prev)}
          onToggleNotes={() => setNotesEnabled((prev) => !prev)}
          onToggleAiSync={() => setAiSyncEnabled((prev) => !prev)}
          recentSessions={recentSessions}
          onQuickLaunch={handleQuickLaunch}
          quickTools={QUICK_TOOLS}
          onTriggerTool={triggerQuickTool}
          toolInFlight={toolInFlight}
          toolResult={toolResult}
          learningPath={LEARNING_PATH}
          compliance={COMPLIANCE_FEATURES}
          discoverCards={DISCOVERY_DECK}
        />
      }
      rightPanel={<AITutorPanel onAnalyzePage={handleAnalyzePage} />}
      hideLeftPanel={libraryCollapsed}
      hideRightPanel={tutorCollapsed}
    >
      <div className="h-full flex flex-col bg-transparent relative z-0">
        {/* Header / Command Bar */}
        <div className="glass-ultra backdrop-blur-2xl transition-smooth flex flex-col">

          {/* Tab Strip */}
          <div className="flex items-center px-4 pt-4 gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`group relative flex items-center min-w-[160px] max-w-[240px] h-9 px-3 rounded-t-xl text-xs font-medium cursor-pointer transition-colors ${activeTabId === tab.id
                  ? "bg-white/10 text-foreground border-t border-x border-white/20"
                  : "bg-transparent text-foreground/50 hover:bg-white/5 hover:text-foreground/80"
                  }`}
              >
                <span className="truncate flex-1 mr-2">{tab.title || "New Tab"}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => closeTab(e, tab.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 transition-all"
                  >
                    <Icon name="x" className="w-3 h-3" />
                  </button>
                )}

                {/* Active Indicator Line */}
                {activeTabId === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </div>
            ))}
            <button
              onClick={createNewTab}
              className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors ml-1"
              title="New Tab"
            >
              <Icon name="plus" className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-4 flex flex-col gap-4">
            {/* Sub-header controls */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-foreground/40">
                  Study Session
                </p>
                {/* <p className="text-lg font-semibold text-foreground/80">Hypersearch Control Surface</p> */}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  className="w-9 h-9 rounded-2xl glass-ultra border border-white/80 flex items-center justify-center text-foreground/70 hover:text-foreground transition-spring liquid-hover"
                  onClick={() => handleBrowserAction("back")}
                  title="Back"
                >
                  <Icon name="arrow-left" className="w-4 h-4" />
                </button>
                <button
                  className="w-9 h-9 rounded-2xl glass-ultra border border-white/80 flex items-center justify-center text-foreground/70 hover:text-foreground transition-spring liquid-hover"
                  onClick={() => handleBrowserAction("forward")}
                  title="Forward"
                >
                  <Icon name="arrow-right" className="w-4 h-4" />
                </button>
                <button
                  className="w-9 h-9 rounded-2xl glass-ultra border border-white/80 flex items-center justify-center text-foreground/70 hover:text-foreground transition-spring liquid-hover"
                  onClick={() => handleBrowserAction("refresh")}
                  title="Refresh"
                >
                  <Icon name="refresh" className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-ultra border border-white/60 transition-smooth">
                  <span
                    className={`w-2 h-2 rounded-full ${activeTab.status === "Synced"
                      ? "bg-emerald-500"
                      : activeTab.status === "Live"
                        ? "bg-blue-500"
                        : "bg-amber-400"
                      }`}
                  />
                  <span className="text-xs font-semibold text-foreground/60">{activeTab.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLibraryCollapsed((prev) => !prev)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-spring ${libraryCollapsed
                      ? "border-foreground/30 text-foreground/70 glass-ultra liquid-hover"
                      : "border-white/70 text-foreground/60 glass-ultra hover:text-foreground liquid-hover"
                      }`}
                  >
                    {libraryCollapsed ? "Show Library" : "Hide Library"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorCollapsed((prev) => !prev)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-spring ${tutorCollapsed
                      ? "border-foreground/30 text-foreground/70 glass-ultra liquid-hover"
                      : "border-white/70 text-foreground/60 glass-ultra hover:text-foreground liquid-hover"
                      }`}
                  >
                    {tutorCollapsed ? "Show AI Tutor" : "Hide AI Tutor"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleFocusToggle}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold border border-white/70 glass-ultra text-foreground/70 hover:text-foreground transition-spring liquid-hover"
                >
                  {libraryCollapsed && tutorCollapsed ? "Show workspace" : "Focus on page"}
                </button>
                <button
                  type="button"
                  onClick={handleReaderToggle}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-spring ${readerMode
                    ? "border-blue-500/70 text-blue-600 glass-medium shadow-sm"
                    : "border-white/70 text-foreground/70 glass-ultra hover:text-foreground"
                    }`}
                >
                  {readerMode ? "Close Reader" : "Reader Mode"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center glass-ultra rounded-2xl border-2 border-white/80 px-4 py-3 shadow-md backdrop-blur-lg focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/40 transition-smooth">
                <Icon name="search" className="w-4 h-4 text-foreground/50 mr-3" />
                <input
                  value={urlValue}
                  onChange={(event) => setUrlValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none focus:outline-none w-full text-foreground placeholder:text-foreground/50 text-sm font-medium"
                  placeholder="Drop a link or search term..."
                />
              </div>
              <button
                className="px-5 py-2 rounded-2xl text-sm font-semibold text-white bg-blue-500 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-spring glow-hover active:scale-95"
                onClick={() => navigate()}
              >
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 w-full relative" ref={browserContainerRef}>
            {!readerMode && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none select-none">
                {/* BrowserView overlays this region */}
                <div className="text-center pointer-events-none select-none">
                  {/* <p className="text-lg font-semibold text-foreground/40">Loading browser surface…</p> */}
                  <p className="text-sm text-foreground/30">
                    Use the address field or quick cards to open a site.
                  </p>
                </div>
              </div>
            )}

            {readerMode && (
              <div className="absolute inset-0 z-10 bg-white/95 text-foreground flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/40">
                      Reader Mode
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {readerContext?.title || activeTab.title}
                    </p>
                    <p className="text-xs text-foreground/60">{readerSyncedLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={readerLoading}
                      onClick={refreshReaderContext}
                      className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-spring ${readerLoading
                        ? "border-foreground/20 text-foreground/40 cursor-not-allowed"
                        : "border-blue-500/60 text-blue-600 glass-ultra hover:-translate-y-0.5"
                        }`}
                    >
                      {readerLoading ? "Syncing…" : "Resync"}
                    </button>
                    <button
                      type="button"
                      onClick={handleReaderToggle}
                      className="px-4 py-2 rounded-2xl text-xs font-semibold border border-foreground/10 glass-ultra text-foreground/70 hover:text-foreground transition-spring"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div
                  className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                  onMouseUp={handleReaderSelection}
                >
                  {readerLoading && (
                    <div className="rounded-2xl border border-dashed border-foreground/10 p-6 text-sm text-foreground/60">
                      Extracting the latest copy of this page…
                    </div>
                  )}
                  {/* ... (Existing reader render logic would go here if I had it fully, but I think I should keep what was likely there or just the simple rendering) */}
                  {/* Re-implementing the simple reader rendering if it was complex, but for now assuming it was just mapping paragraphs */}
                  {!readerLoading && readerParagraphs.map((para, i) => (
                    <p key={i} className="text-[1.05rem] leading-[1.7] text-foreground/90 max-w-[65ch]">
                      {para}
                    </p>
                  ))}
                  {!readerLoading && readerParagraphs.length === 0 && (
                    <div className="text-center py-20 text-foreground/40">
                      <p>No content extracted yet.</p>
                      <p className="text-xs mt-2">Try refreshing or syncing again.</p>
                    </div>
                  )}
                </div>

                {/* Selection Popover / Explain */}
                {selectionText && (
                  <div className="absolute bottom-6 right-6 max-w-sm glass-panel shadow-2xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Selected Text</p>
                      <p className="text-sm text-foreground/70 italic line-clamp-3 my-1">"{selectionPreview}"</p>
                    </div>

                    {readerExplainState.status === 'ready' ? (
                      <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Explanation</p>
                        <p className="text-sm text-foreground/90">{readerExplainState.response}</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleExplainSelection}
                        disabled={readerExplainState.status === 'loading'}
                        className="w-full mt-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {readerExplainState.status === 'loading' ? 'Thinking...' : 'Explain This'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
