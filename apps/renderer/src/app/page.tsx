"use client";

import { useState, useRef, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { LibraryPanel } from "@/components/library/library-panel";
import { AITutorPanel } from "@/components/ai-tutor/ai-tutor-panel";

export default function Home() {
  const [status, setStatus] = useState("not connected");
  const browserContainerRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Keep the ping functionality for now to verify Electron IPC still works
  async function ping() {
    if (typeof window !== 'undefined' && window.eduAPI) {
      const res = await window.eduAPI.ping();
      setStatus(res);
    }
  }

  // Handle BrowserView resizing
  useEffect(() => {
    if (!browserContainerRef.current || typeof window === 'undefined' || !window.eduAPI) return;

    const updateBounds = () => {
      if (browserContainerRef.current) {
        const rect = browserContainerRef.current.getBoundingClientRect();
        window.eduAPI.resizeBrowserView({
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    resizeObserver.observe(browserContainerRef.current);

    // Initial update
    setTimeout(updateBounds, 100);

    // Also update on window resize just in case
    window.addEventListener('resize', updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
      // Hide/collapse view on unmount
      if (window.eduAPI) {
        window.eduAPI.resizeBrowserView({ x: 0, y: 0, width: 0, height: 0 });
      }
    };
  }, []);

  const navigate = () => {
    console.log("Navigate called");
    if (urlInputRef.current) {
      console.log("Input value:", urlInputRef.current.value);
    }
    if (window.eduAPI) {
      console.log("eduAPI available");
    } else {
      console.error("eduAPI NOT available");
    }

    if (urlInputRef.current && window.eduAPI) {
      let url = urlInputRef.current.value.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      window.eduAPI.loadBrowserView(url);
      // Update input to show the actual URL visited
      urlInputRef.current.value = url;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate();
    }
  };

  const handleAnalyzePage = async () => {
    if (window.eduAPI) {
      console.log("Analyzing page...");
      const data = await window.eduAPI.extractText();
      console.log("Extracted data:", data);
      return data;
    }
    return null;
  };

  return (
    <WorkspaceLayout
      leftPanel={<LibraryPanel />}
      rightPanel={<AITutorPanel onAnalyzePage={handleAnalyzePage} />}
    >
      <div className="h-full flex flex-col bg-transparent relative z-0">
        {/* Address Bar / Header */}
        <div className="h-14 border-b border-white/20 flex items-center px-4 gap-4 bg-white/40 backdrop-blur-md shrink-0 z-50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>

          <div className="flex-1 max-w-3xl mx-auto">
            <div className="flex items-center w-full bg-white/20 rounded-lg border border-white/20 px-3 py-1.5 text-sm shadow-sm transition-all focus-within:bg-white/40 focus-within:ring-2 focus-within:ring-blue-500/20">
              <span className="text-muted-foreground mr-2 opacity-70">🔒</span>
              <input
                ref={urlInputRef}
                onKeyDown={handleKeyDown}
                defaultValue="https://react.dev/learn"
                className="bg-transparent border-none focus:outline-none w-full text-foreground/80 placeholder:text-foreground/40"
                placeholder="Enter URL to browse..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            {/* IPC Debug Indicator (Subtle) */}
            <div className={`w-2 h-2 rounded-full ${status === "pong" ? "bg-green-500" : "bg-red-500"}`} title={`IPC Status: ${status}`}></div>
          </div>
        </div>

        {/* Content Area - BrowserView Target */}
        <div className="flex-1 w-full relative" ref={browserContainerRef}>
          {/* The web contents will appear ON TOP of this div via Electron BrowserView. */}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground -z-10 opacity-0">
            {/* Hidden placeholder behind browser view */}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
