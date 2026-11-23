"use client";

import { useState, useRef, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { LibraryPanel } from "@/components/library/library-panel";
import { AITutorPanel, PendingAiAction } from "@/components/ai-tutor/ai-tutor-panel";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { HistoryView } from "@/components/views/history-view";
import { BookmarksView } from "@/components/views/bookmarks-view";
import { SettingsView } from "@/components/views/settings-view";
import { OmniboxHome } from "@/components/omnibox-home";
import { Icon, type IconName } from "@/components/icons";
import type {
  ComplianceFeature,
  DiscoveryCard,
  LearningPath,
  QuickTool,
  RecentSession,
  SearchEngine,
  SessionState,
} from "@/types/workspace";

type ReaderExplainState =
  | { status: "idle"; text?: undefined; response?: undefined }
  | { status: "loading"; text: string; response?: undefined }
  | { status: "ready"; text: string; response: string }
  | { status: "error"; text: string; response?: undefined };

const DISCOVERY_DECK: DiscoveryCard[] = [
  {
    title: "React Quick Start",
    url: "https://react.dev/learn",
    label: "Docs",
    description: "Framework fundamentals with runnable guides.",
  },
  {
    title: "MDN Web APIs",
    url: "https://developer.mozilla.org/en-US/docs/Web/API",
    label: "Reference",
    description: "Search the living spec for browser features.",
  },
  {
    title: "TypeScript Handbook",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    label: "Guide",
    description: "Language essentials with examples.",
  },
  {
    title: "Electron Security Checklist",
    url: "https://www.electronjs.org/docs/latest/tutorial/security",
    label: "Security",
    description: "Hardening tips for production builds.",
  },
  {
    title: "AI Model Library",
    url: "https://ai.google.dev/gemini-api/docs",
    label: "AI",
    description: "Gemini & OpenAI usage notes in one place.",
  },
  {
    title: "Next.js Routing",
    url: "https://nextjs.org/docs/app/building-your-application/routing",
    label: "Routing",
    description: "Deep dive on App Router layouts.",
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
  { id: "summarize", title: "Summarize Page", detail: "TL;DR with citations", badge: "Reader Mode" },
  { id: "explain", title: "Explain for Me", detail: "Beginner → expert levels", badge: "Tutor" },
  { id: "keypoints", title: "Key Points", detail: "Highlight major takeaways", badge: "Notes" },
  { id: "quiz", title: "Generate Quiz", detail: "Adaptive 5-question drill", badge: "Assess" },
  { id: "flashcards", title: "Create Flashcards", detail: "Spaced repetition ready", badge: "Memory" },
  { id: "context", title: "Ask From Page", detail: "Ground AI in this tab", badge: "Context" },
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

const SEARCH_ENGINES: SearchEngine[] = [
  { name: "Google", url: "https://google.com", icon: "/icons/google.svg" },
  { name: "Bing", url: "https://bing.com", icon: "/icons/bing.svg" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com", icon: "/icons/duckduckgo.svg" },
  { name: "Wikipedia", url: "https://wikipedia.org", icon: "/icons/wikipedia.svg" },
  { name: "Perplexity", url: "https://perplexity.ai", icon: "/icons/perplexity.svg" },
];

/** Query endpoints for the "Default search engine" setting. */
const SEARCH_QUERY_URLS: Record<string, { label: string; url: string }> = {
  google: { label: "Google", url: "https://www.google.com/search?q=" },
  bing: { label: "Bing", url: "https://www.bing.com/search?q=" },
  duckduckgo: { label: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  perplexity: { label: "Perplexity", url: "https://www.perplexity.ai/search?q=" },
};

const hasScheme = (value: string) => /^[a-z][a-z0-9+.-]*:\/\//i.test(value) || /^(about|edu):/i.test(value);

/** True when the omnibox text should be opened as an address rather than searched. */
const looksLikeAddress = (value: string) =>
  hasScheme(value) ||
  /^localhost(:\d+)?([/?#].*)?$/i.test(value) ||
  /^\d{1,3}(\.\d{1,3}){3}(:\d+)?([/?#].*)?$/.test(value) ||
  (!/\s/.test(value) && /^[^\s/]+\.[a-z]{2,}(:\d+)?([/?#].*)?$/i.test(value));

function StatusDot({ status }: { status: string }) {
  if (status === "Syncing") return <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-fg-2" />;
  if (status === "Idle") return <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full border border-fg-3" />;
  return <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-fg" />;
}

function RailButton({
  icon,
  label,
  active,
  pressed,
  onClick,
}: {
  icon: IconName;
  label: string;
  active: boolean;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`relative flex h-10 w-10 items-center justify-center rounded transition-colors ${
        active ? "bg-raised text-fg" : "text-fg-3 hover:bg-raised hover:text-fg"
      }`}
    >
      {active && <span aria-hidden className="absolute -left-2 bottom-2 top-2 w-0.5 bg-fg" />}
      <Icon name={icon} className="h-[18px] w-[18px]" />
    </button>
  );
}

function ChromeIconButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-line text-fg-2 transition-colors hover:border-line-active hover:bg-card hover:text-fg"
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}

function ChromeToggle({
  icon,
  label,
  active,
  onClick,
}: {
  icon: IconName;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`flex h-9 shrink-0 items-center gap-2 rounded border px-3 text-[12.5px] transition-colors ${
        active
          ? "border-fg bg-fg font-medium text-canvas hover:bg-line-strong"
          : "border-line text-fg-2 hover:border-line-active hover:bg-card hover:text-fg"
      }`}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

export default function Home() {
  const browserContainerRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const omniboxInputRef = useRef<HTMLInputElement>(null);
  const [urlValue, setUrlValue] = useState("");
  const [searchEngine, setSearchEngine] = useState("google");
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pendingAiAction, setPendingAiAction] = useState<PendingAiAction | null>(null);
  const [bookmarkedUrl, setBookmarkedUrl] = useState<string | null>(null);

  const nextSessionId = () => {
    sessionCounterRef.current += 1;
    return `session-${sessionCounterRef.current}`;
  };

  // Tab State
  const [tabs, setTabs] = useState<SessionState[]>([
    {
      id: "session-seed",
      title: "New Tab",
      url: "about:blank",
      peek: "Ready to explore",
      status: "Idle",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("session-seed");

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isNewTab = activeTab.url === "about:blank" || activeTab.url === "";
  const isInternalPage = activeTab.url.startsWith("edu://");
  const engineLabel = SEARCH_QUERY_URLS[searchEngine]?.label ?? "Google";

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    // Check for URL
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http") || url.startsWith("www"))) {
      navigate(url);
      return;
    }

    // Check for Files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Mock File Handling -> Reader Mode
      setReaderMode(true);
      setReaderLoading(true);
      setReaderContext({
        title: file.name,
        // Mock content for the file since we can't fully read it without FS access in this context easily yet
        content: `Extracted content from ${file.name}...\n\n(This is a simulation of local file reading. In a full implementation, we would stream the file content here.)`
      });
      setTimeout(() => setReaderLoading(false), 1500);
    }
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
        setIsReady(true);
      });
    }
  }, []);

  // Default search engine comes from persisted settings and follows edits made in edu://settings.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    window.eduAPI?.getSettings().then((settings) => {
      if (!cancelled && settings?.defaultSearchEngine) {
        setSearchEngine(settings.defaultSearchEngine);
      }
    }).catch((error) => {
      console.error("Failed to load settings:", error);
    });

    const handleSettingsEvent = (event: Event) => {
      const next = (event as CustomEvent<{ defaultSearchEngine?: string }>).detail;
      if (next?.defaultSearchEngine) setSearchEngine(next.defaultSearchEngine);
    };
    window.addEventListener("edu-settings-change", handleSettingsEvent as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("edu-settings-change", handleSettingsEvent as EventListener);
    };
  }, []);

  // ⌘K / ⌘L focus the omnibox
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key !== "k" && key !== "l") return;
      event.preventDefault();
      const target = omniboxInputRef.current ?? addressInputRef.current;
      target?.focus();
      target?.select();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
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

    if (readerMode || isNewTab || isInternalPage) {
      if (activeTabId) window.eduAPI.resizeBrowserView(activeTabId, { x: 0, y: 0, width: 0, height: 0 });
      return;
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
  }, [libraryCollapsed, tutorCollapsed, readerMode, activeTabId, isReady, isNewTab, isInternalPage]);

  const navigate = (targetOverride?: string) => {
    const raw = (targetOverride ?? urlValue).trim();
    if (!raw) return;

    let target: string;
    let title: string;

    if (looksLikeAddress(raw)) {
      target = hasScheme(raw) ? raw : `https://${raw}`;
      title = formatUrlLabel(target);
    } else {
      // Plain words go to the default search engine instead of becoming a broken https:// URL.
      const engine = SEARCH_QUERY_URLS[searchEngine] ?? SEARCH_QUERY_URLS.google;
      target = `${engine.url}${encodeURIComponent(raw)}`;
      title = raw;
    }

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
        id: `recent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      // Only load strict web URLs in the BrowserView.
      // Internal edu:// pages are handled by the React renderer overlay.
      if (!target.startsWith("edu://")) {
        window.eduAPI.loadBrowserView(activeTabId, target);
      }
    }

    // Simulate loading progress
    setLoadingProgress(10);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 500);
    }, 1500);
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

  const handleBookmark = async () => {
    if (isNewTab || isInternalPage || !window.eduAPI?.addBookmark) return;
    try {
      await window.eduAPI.addBookmark({ title: activeTab.title, url: activeTab.url });
      setBookmarkedUrl(activeTab.url);
    } catch (error) {
      console.error("Failed to add bookmark:", error);
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

    if (['quiz', 'summarize', 'explain', 'keypoints', 'flashcards'].includes(tool.id)) {
      setPendingAiAction({
        type: tool.id as PendingAiAction["type"],
        context: { title: anchorTitle, content: context.content }
      });
      setTutorCollapsed(false);
    }
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

  const isBookmarked = bookmarkedUrl === activeTab.url;
  const workspaceHidden = libraryCollapsed && tutorCollapsed;
  const activeLocation = isNewTab ? "omnibox" : activeTab.url.replace(/^https?:\/\//, "");

  const topBar = (
    <header className="shrink-0 border-b border-line bg-canvas">
      {/* Brand + tab strip */}
      <div className="flex h-11 items-center gap-3 px-3">
        <div className="flex shrink-0 items-center gap-2 pr-1">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-fg text-canvas">
            <Icon name="atom" className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-fg">Quantum Mind</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-fg-4 md:inline">/</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-fg-3 md:inline">Study</span>
        </div>

        <div role="tablist" aria-label="Open tabs" className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                role="tab"
                tabIndex={0}
                aria-selected={active}
                onClick={() => switchTab(tab.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    switchTab(tab.id);
                  }
                }}
                className={`group flex h-7 min-w-[150px] max-w-[230px] shrink-0 items-center gap-2 rounded border px-2.5 text-[12.5px] transition-colors ${
                  active ? "border-line-active bg-card text-fg" : "border-transparent text-fg-3 hover:bg-raised hover:text-fg"
                }`}
              >
                <StatusDot status={tab.status} />
                <span className="min-w-0 flex-1 select-none truncate">{tab.title || "New Tab"}</span>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => closeTab(e, tab.id)}
                    aria-label={`Close ${tab.title || "tab"}`}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-fg-3 transition-opacity hover:bg-hover hover:text-fg focus-visible:opacity-100 ${
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Icon name="x" className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={createNewTab}
            aria-label="New tab"
            title="New tab"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-fg-3 transition-colors hover:bg-raised hover:text-fg"
          >
            <Icon name="plus" className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden shrink-0 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] lg:flex">
          <span className="flex h-6 items-center gap-1.5 rounded-sm border border-line bg-pane px-2 text-fg-2">
            <StatusDot status={activeTab.status} />
            {activeTab.status}
          </span>
          <span className="flex h-6 items-center rounded-sm border border-line px-2 text-fg-3">
            {tabs.length} {tabs.length === 1 ? "tab" : "tabs"}
          </span>
        </div>
      </div>

      {/* Navigation + address omnibox */}
      <div className="flex h-12 items-center gap-2 border-t border-line-muted bg-pane px-3">
        <ChromeIconButton icon="arrow-left" label="Back" onClick={() => handleBrowserAction("back")} />
        <ChromeIconButton icon="arrow-right" label="Forward" onClick={() => handleBrowserAction("forward")} />
        <ChromeIconButton icon="refresh" label="Refresh" onClick={() => handleBrowserAction("refresh")} />

        <div className="flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded border border-line bg-canvas px-3 transition-colors focus-within:border-fg-2">
          <Icon name={isNewTab ? "search" : "globe"} className="h-4 w-4 shrink-0 text-fg-3" />
          <input
            ref={addressInputRef}
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Address and search"
            placeholder={`Search ${engineLabel} or enter a URL`}
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-fg outline-none placeholder:text-fg-4 focus-visible:outline-none"
          />
          {!isNewTab && !isInternalPage && (
            <button
              type="button"
              onClick={handleBookmark}
              aria-label={isBookmarked ? "Bookmarked" : "Bookmark this page"}
              title={isBookmarked ? "Bookmarked" : "Bookmark this page"}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm transition-colors ${
                isBookmarked ? "text-fg" : "text-fg-3 hover:bg-raised hover:text-fg"
              }`}
            >
              <Icon name="bookmark" className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          )}
          <kbd className="hidden h-5 shrink-0 items-center rounded-sm border border-line px-1.5 font-mono text-[10px] text-fg-3 md:flex">⌘K</kbd>
        </div>

        <button
          type="button"
          onClick={() => navigate()}
          className="flex h-9 shrink-0 items-center gap-2 rounded bg-fg px-3.5 font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-canvas transition-colors hover:bg-line-strong active:bg-zinc-300"
        >
          Go <Icon name="return" className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <ChromeToggle icon="book-open" label={readerMode ? "Close Reader" : "Reader Mode"} active={readerMode} onClick={handleReaderToggle} />
        <ChromeToggle
          icon="focus"
          label={workspaceHidden ? "Show workspace" : "Focus on page"}
          active={false}
          onClick={handleFocusToggle}
        />
      </div>
    </header>
  );

  const rail = (
    <nav aria-label="Workspace" className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-pane px-2 py-3">
      <RailButton
        icon="panel-left"
        label={libraryCollapsed ? "Show library" : "Hide library"}
        active={!libraryCollapsed}
        pressed={!libraryCollapsed}
        onClick={() => setLibraryCollapsed((prev) => !prev)}
      />
      <RailButton
        icon="sparkles"
        label={tutorCollapsed ? "Show AI tutor" : "Hide AI tutor"}
        active={!tutorCollapsed}
        pressed={!tutorCollapsed}
        onClick={() => setTutorCollapsed((prev) => !prev)}
      />
      <RailButton
        icon="book-open"
        label={readerMode ? "Close reader mode" : "Reader mode"}
        active={readerMode}
        pressed={readerMode}
        onClick={handleReaderToggle}
      />
      <span aria-hidden className="my-2 h-px w-6 bg-line" />
      <RailButton icon="compass" label="New tab (omnibox)" active={isNewTab && !readerMode} onClick={createNewTab} />
      <RailButton icon="clock" label="History" active={activeTab.url === "edu://history"} onClick={() => navigate("edu://history")} />
      <RailButton icon="bookmark" label="Bookmarks" active={activeTab.url === "edu://bookmarks"} onClick={() => navigate("edu://bookmarks")} />
      <div className="mt-auto">
        <RailButton icon="settings" label="Settings" active={activeTab.url === "edu://settings"} onClick={() => navigate("edu://settings")} />
      </div>
    </nav>
  );

  const statusBar = (
    <footer className="flex h-7 shrink-0 items-center justify-between gap-4 border-t border-line bg-canvas px-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex items-center gap-1.5 text-fg-2">
          <StatusDot status={activeTab.status} /> {activeTab.status}
        </span>
        <span className="min-w-0 truncate">
          Active: <span className="normal-case tracking-normal text-fg-2">{activeLocation}</span>
        </span>
        <span className="hidden md:inline">Search: {engineLabel}</span>
      </div>
      <div className="hidden shrink-0 items-center gap-4 lg:flex">
        <span>Reader: {readerMode ? "On" : "Off"}</span>
        <span>⌘K omnibox</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full border border-fg-3 bg-[linear-gradient(90deg,#71717a_50%,transparent_50%)]" />
          OLED monochrome
        </span>
      </div>
    </footer>
  );

  return (
    <WorkspaceLayout
      topBar={topBar}
      rail={rail}
      statusBar={statusBar}
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
      rightPanel={
        <AITutorPanel
          onAnalyzePage={handleAnalyzePage}
          pendingAction={pendingAiAction}
          onActionComplete={() => setPendingAiAction(null)}
        />
      }
      hideLeftPanel={libraryCollapsed}
      hideRightPanel={tutorCollapsed}
    >
      <div
        className="relative z-0 flex h-full flex-col bg-canvas"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-canvas/85">
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-active bg-pane px-14 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded bg-fg text-canvas">
                <Icon name="plus" className="h-6 w-6" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-[22px] font-semibold text-fg">Drop to open</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-3">Links open in this tab · files open in reader</p>
              </div>
            </div>
          </div>
        )}

        {loadingProgress > 0 && (
          <div className="absolute left-0 right-0 top-0 z-50 h-0.5">
            <div
              className="h-full bg-fg transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%`, opacity: loadingProgress === 100 ? 0 : 1 }}
            />
          </div>
        )}

        <div className="relative w-full flex-1" ref={browserContainerRef}>
          {isInternalPage && (
            <div className="absolute inset-0 z-20 overflow-hidden bg-canvas">
              {activeTab.url === 'edu://history' && <HistoryView onNavigate={navigate} />}
              {activeTab.url === 'edu://bookmarks' && <BookmarksView onNavigate={navigate} />}
              {activeTab.url === 'edu://settings' && <SettingsView />}
            </div>
          )}

          {!readerMode && isNewTab && !isInternalPage && (
            <div className="absolute inset-0 z-10 overflow-y-auto">
              <OmniboxHome
                inputRef={omniboxInputRef}
                value={urlValue}
                onChange={setUrlValue}
                onSubmit={() => navigate()}
                onOpen={handleQuickLaunch}
                engines={SEARCH_ENGINES}
                engineLabel={engineLabel}
                discover={DISCOVERY_DECK}
                recent={recentSessions}
                quickTools={QUICK_TOOLS}
                onTriggerTool={triggerQuickTool}
                toolInFlight={toolInFlight}
                toolResult={toolResult}
                learningPath={LEARNING_PATH}
                tabCount={tabs.length}
              />
            </div>
          )}

          {!readerMode && !isNewTab && !isInternalPage && (
            <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
              {/* BrowserView overlays this region */}
              <div className="text-center">
                <p className="kicker">Live surface</p>
                <p className="mt-2 font-mono text-[12.5px] text-fg-2">{formatUrlLabel(activeTab.url)}</p>
                <p className="mt-1 text-[13px] text-fg-3">Pages render here in the desktop app. Use the omnibox to open another site.</p>
              </div>
            </div>
          )}

          {readerMode && (
            <div className="absolute inset-0 z-10 flex flex-col bg-canvas">
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-3">
                <div className="min-w-0">
                  <p className="kicker flex items-center gap-2">
                    Reader mode <span className="text-fg-4">{"//"}</span> <span className="normal-case tracking-normal">{readerSyncedLabel}</span>
                  </p>
                  <p className="mt-1 truncate text-[18px] font-medium tracking-[-0.005em] text-fg">
                    {readerContext?.title || activeTab.title}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={readerLoading}
                    onClick={refreshReaderContext}
                    className="flex h-8 items-center gap-1.5 rounded border border-line px-3 text-[12.5px] text-fg transition-colors hover:border-line-active hover:bg-card disabled:cursor-not-allowed disabled:text-fg-4"
                  >
                    <Icon name="refresh" className={`h-3.5 w-3.5 ${readerLoading ? "animate-spin" : ""}`} />
                    {readerLoading ? "Syncing…" : "Resync"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReaderToggle}
                    className="flex h-8 items-center gap-1.5 rounded px-3 text-[12.5px] text-fg-2 transition-colors hover:bg-raised hover:text-fg"
                  >
                    <Icon name="x" className="h-3.5 w-3.5" /> Close
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto" onMouseUp={handleReaderSelection}>
                <div className="mx-auto max-w-[860px] px-8 py-10 text-[16px]">
                  {readerLoading && (
                    <div className="rounded border border-dashed border-line p-6 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-3">
                      Extracting the latest copy of this page…
                    </div>
                  )}
                  {!readerLoading && readerContext?.content && (
                    <MarkdownRenderer content={readerContext.content} />
                  )}
                  {!readerLoading && readerParagraphs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-line px-6 py-20 text-center">
                      <Icon name="book-open" className="mx-auto h-6 w-6 text-fg-3" />
                      <p className="mt-3 text-[15px] font-medium text-fg">No content extracted yet.</p>
                      <p className="mt-1 text-[13px] text-fg-3">Open a page, then press Resync to pull it into the reader.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Popover / Explain */}
              {selectionText && (
                <div className="absolute bottom-6 right-6 w-[360px] max-w-[calc(100%-3rem)] rounded-lg border border-line-active bg-raised p-4">
                  <p className="kicker">Selected text</p>
                  <p className="my-2 line-clamp-3 text-[13px] italic text-fg-2">&ldquo;{selectionPreview}&rdquo;</p>

                  {readerExplainState.status === 'ready' ? (
                    <div className="mt-3 rounded border border-line bg-card p-3">
                      <p className="kicker mb-1.5 flex items-center gap-1.5">
                        <Icon name="sparkles" className="h-3 w-3" /> Explanation
                      </p>
                      <p className="text-[13px] leading-relaxed text-fg-2">{readerExplainState.response}</p>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleExplainSelection}
                        disabled={readerExplainState.status === 'loading'}
                        className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded bg-fg text-[13px] font-medium text-canvas transition-colors hover:bg-line-strong disabled:cursor-wait disabled:bg-fg-2"
                      >
                        <Icon name="sparkles" className="h-4 w-4" />
                        {readerExplainState.status === 'loading' ? 'Thinking...' : 'Explain This'}
                      </button>
                      {readerExplainState.status === 'error' && (
                        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-2">
                          ✕ Couldn&apos;t explain this passage. Try again.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
