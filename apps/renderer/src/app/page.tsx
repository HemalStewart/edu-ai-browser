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

type IconName = "search" | "arrow-left" | "arrow-right" | "refresh";

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
  const [activeSessionId, setActiveSessionId] = useState<string>("session-seed");
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>(DEFAULT_RECENT_SESSIONS);
  const [currentSession, setCurrentSession] = useState<SessionState>({
    id: "session-seed",
    title: "Ready to explore",
    url: "https://react.dev/learn",
    peek: "Use the hyper address bar to jump into any doc or save a link from the cards below.",
    status: "Idle",
  });
  const sessionCounterRef = useRef(0);
  const [libraryCollapsed, setLibraryCollapsed] = useState(true);
  const [tutorCollapsed, setTutorCollapsed] = useState(true);
  const [toolInFlight, setToolInFlight] = useState<string | null>(null);
  const [toolResult, setToolResult] = useState<{ title: string; detail: string } | null>(null);

  const nextSessionId = () => {
    sessionCounterRef.current += 1;
    return `session-${sessionCounterRef.current}`;
  };

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

  const fetchPageContext = async () => {
    if (typeof window === "undefined" || !window.eduAPI) return null;
    try {
      return await window.eduAPI.extractText();
    } catch (error) {
      console.error("Failed to extract page context:", error);
      return null;
    }
  };

  // Handle BrowserView resizing
  useEffect(() => {
    if (!browserContainerRef.current || typeof window === "undefined" || !window.eduAPI) return;

    const updateBounds = () => {
      if (!browserContainerRef.current) return;
      const rect = browserContainerRef.current.getBoundingClientRect();
      const inset = 0; // No padding - completely full-screen
      const nextWidth = Math.max(0, rect.width - inset * 2);
      const nextHeight = Math.max(0, rect.height - inset * 2);

      window.eduAPI.resizeBrowserView({
        x: Math.round(rect.x + inset),
        y: Math.round(rect.y + inset),
        width: Math.round(nextWidth),
        height: Math.round(nextHeight),
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    resizeObserver.observe(browserContainerRef.current);
    setTimeout(updateBounds, 120);
    window.addEventListener("resize", updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
      if (window.eduAPI) {
        window.eduAPI.resizeBrowserView({ x: 0, y: 0, width: 0, height: 0 });
      }
    };
  }, []);


  const navigate = (targetOverride?: string) => {
    let target = (targetOverride ?? urlValue).trim();
    if (!target) return;

    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    setUrlValue(target);

    const sessionId = nextSessionId();
    const title = formatUrlLabel(target);
    setActiveSessionId(sessionId);
    setCurrentSession({
      id: sessionId,
      title,
      url: target,
      peek: "Connected. Tap “Read Page” to sync context with the AI Tutor.",
      status: "Live",
    });

    setRecentSessions((prev) => {
      const filtered = prev.filter((entry) => entry.url !== target);
      const nextEntry: RecentSession = {
        id: sessionId,
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
      window.eduAPI.loadBrowserView(target);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate();
    }
  };

  const handleBrowserAction = (action: "back" | "forward" | "refresh") => {
    if (typeof window === "undefined" || !window.eduAPI) return;
    if (action === "back") window.eduAPI.back();
    if (action === "forward") window.eduAPI.forward();
    if (action === "refresh") window.eduAPI.refresh();
  };

  const handleQuickLaunch = (url: string) => {
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
    setCurrentSession((prev) => ({ ...prev, status: "Syncing" }));
    try {
      const data = await fetchPageContext();
      if (data) {
        setCurrentSession((prev) => ({
          ...prev,
          title: data.title || prev.title,
          peek: data.content ? data.content.slice(0, 160) : prevPeekFallback(prev.peek),
          status: "Synced",
        }));

        setRecentSessions((prev) =>
          prev.map((entry) =>
            entry.id === activeSessionId
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

    setCurrentSession((prev) => ({ ...prev, status: "Live" }));
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

    const anchorTitle = context.title || formatUrlLabel(currentSession.url);
    setToolResult({
      title: `${tool.title} queued`,
      detail: `Anchored to “${anchorTitle}”. Results will surface in the AI Tutor shortly.`,
    });
  };

  return (
    <WorkspaceLayout
      leftPanel={
        <LibraryPanel
          session={currentSession}
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
        <div className="border-b border-white/30 px-6 py-5 glass-ultra backdrop-blur-2xl rounded-t-3xl transition-smooth">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-foreground/40">
                Study Session
              </p>
              <p className="text-lg font-semibold text-foreground/80">Hypersearch Control Surface</p>
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
                  className={`w-2 h-2 rounded-full ${currentSession.status === "Synced"
                    ? "bg-emerald-500"
                    : currentSession.status === "Live"
                      ? "bg-blue-500"
                      : "bg-amber-400"
                    }`}
                />
                <span className="text-xs font-semibold text-foreground/60">{currentSession.status}</span>
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 w-full relative border-t border-white/30" ref={browserContainerRef}>
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none select-none">
              {/* BrowserView overlays this region */}
              <div className="text-center pointer-events-none select-none">
                <p className="text-lg font-semibold text-foreground/40">Loading browser surface…</p>
                <p className="text-sm text-foreground/30">Use the address field or quick cards to open a site.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
