"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getTool } from "./catalog";
import { quantumHubUrl, quantumToken } from "./hub";
import { Icon } from "./icons";
import { Markdown } from "./markdown";

export type AssistantConfig = {
  /** What the user is looking at now; sent as `context` with every question. */
  getContext?: () => string | Promise<string>;
  /** Starter prompts shown as chips. */
  suggestions?: string[];
  /** Panel title. Default "Assistant". */
  title?: string;
  /**
   * Starts Quantum ID sign-in when the hub answers 401. Tools pass
   * `useQuantumId().signIn` so the user returns signed in; without it the
   * button links to the hub's sign-in page.
   */
  onSignIn?: () => void;
};

export type AssistantPanelProps = AssistantConfig & {
  /** Catalog slug of the tool (or "hub"). */
  tool: string;
  /** When set, a close button is shown in the header (the shell uses this). */
  onClose?: () => void;
  className?: string;
};

type ErrorKind = "offline" | "auth" | "network" | "server" | "empty";
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  error?: { kind: ErrorKind; title: string; text: string };
};

let seq = 0;
const nextId = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

const DEFAULT_SUGGESTIONS = ["What can I do here?", "How do I get started?", "Where are the settings?"];

function errorFor(kind: ErrorKind, detail?: string): ChatMessage["error"] {
  switch (kind) {
    case "offline":
      return { kind, title: "You're offline", text: "The assistant needs an internet connection. Reconnect and try again." };
    case "auth":
      return { kind, title: "Sign in with Quantum ID to use the assistant", text: "Your Quantum ID keeps the assistant available in every tool." };
    case "network":
      return { kind, title: "Couldn't reach the assistant", text: "The Quantum service didn't respond. Check your connection and try again." };
    case "empty":
      return { kind, title: "No reply", text: "The assistant finished without an answer. Try asking again." };
    default:
      return { kind, title: "The assistant ran into a problem", text: detail || "Something went wrong on the server. Try again in a moment." };
  }
}

/**
 * The right-side AI assistant every Quantum tool shares. Streams replies from
 * `POST {hub}/api/assistant` ({ tool, messages, context }) as text/plain.
 */
export function AssistantPanel({ tool, getContext, suggestions, title = "Assistant", onSignIn, onClose, className }: AssistantPanelProps) {
  const toolInfo = getTool(tool);
  const toolName = tool === "hub" ? "Quantum Hub" : (toolInfo?.name ?? tool);
  const chips = suggestions && suggestions.length ? suggestions : DEFAULT_SUGGESTIONS;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickRef = useRef(true);

  // Keep the thread pinned to the bottom while streaming, unless the user scrolled up.
  useEffect(() => {
    const el = threadRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const autosize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };
  useEffect(autosize, [draft]);

  const patch = (id: string, fn: (m: ChatMessage) => ChatMessage) => setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));

  const send = useCallback(
    async (text: string, base?: ChatMessage[]) => {
      const question = text.trim();
      if (!question || abortRef.current) return;

      const prior = (base ?? messages).filter((m) => !m.error && !m.streaming && m.content);
      const user: ChatMessage = { id: nextId(), role: "user", content: question };
      const replyId = nextId();
      setMessages([...(base ?? messages), user, { id: replyId, role: "assistant", content: "", streaming: true }]);
      setDraft("");
      stickRef.current = true;

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        patch(replyId, (m) => ({ ...m, streaming: false, error: errorFor("offline") }));
        return;
      }

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setBusy(true);
      let received = "";
      try {
        let context = "";
        if (getContext) {
          try {
            context = (await getContext()) ?? "";
          } catch {
            context = "";
          }
        }
        const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "text/plain" };
        const token = tool === "hub" ? null : quantumToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(quantumHubUrl("/api/assistant"), {
          method: "POST",
          headers,
          // On the hub the session cookie authenticates; tools send the Bearer token and no cookies
          // (the hub's CORS reply does not allow credentials, so "include" would be blocked).
          credentials: tool === "hub" ? "include" : "omit",
          signal: ctrl.signal,
          body: JSON.stringify({
            tool,
            messages: [...prior, user].map(({ role, content }) => ({ role, content })),
            context,
          }),
        });

        if (res.status === 401 || res.status === 403) {
          patch(replyId, (m) => ({ ...m, streaming: false, error: errorFor("auth") }));
          return;
        }
        if (!res.ok) {
          let detail = "";
          try {
            const body = (await res.text()).trim();
            if (body && body.length < 280 && !body.startsWith("<")) {
              try {
                const j = JSON.parse(body) as { error?: unknown; message?: unknown };
                detail = String(j.error ?? j.message ?? body);
              } catch {
                detail = body;
              }
            }
          } catch {
            /* ignore */
          }
          patch(replyId, (m) => ({ ...m, streaming: false, error: errorFor("server", detail || `The server answered ${res.status}. Try again in a moment.`) }));
          return;
        }

        if (res.body && typeof res.body.getReader === "function") {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) {
              received += chunk;
              patch(replyId, (m) => ({ ...m, content: m.content + chunk }));
            }
          }
          const tail = decoder.decode();
          if (tail) {
            received += tail;
            patch(replyId, (m) => ({ ...m, content: m.content + tail }));
          }
        } else {
          received = await res.text();
          patch(replyId, (m) => ({ ...m, content: received }));
        }

        patch(replyId, (m) => (received.trim() ? { ...m, streaming: false } : { ...m, streaming: false, error: errorFor("empty") }));
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") {
          // Stopped by the user: keep what arrived, drop an empty bubble.
          setMessages((prev) =>
            prev.flatMap((m) => (m.id !== replyId ? [m] : m.content.trim() ? [{ ...m, streaming: false, content: `${m.content}\n\n*Stopped.*` }] : [])),
          );
        } else {
          const kind: ErrorKind = typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "network";
          patch(replyId, (m) => ({ ...m, streaming: false, error: errorFor(kind), content: received }));
        }
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setBusy(false);
      }
    },
    [messages, getContext, tool],
  );

  const retry = (errorId: string) => {
    const idx = messages.findIndex((m) => m.id === errorId);
    const question = idx > 0 ? messages[idx - 1] : undefined;
    if (!question || question.role !== "user") return;
    void send(question.content, messages.slice(0, idx - 1));
  };

  const stop = () => abortRef.current?.abort();

  const clear = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setBusy(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(draft);
    }
  };

  const signInHref = tool === "hub" ? quantumHubUrl(`/signin?next=${encodeURIComponent(typeof location !== "undefined" ? location.pathname : "/")}`) : quantumHubUrl("/signin");

  return (
    <section className={["q-asst", className].filter(Boolean).join(" ")} aria-label={`${title} for ${toolName}`}>
      <header className="q-asst__head">
        <div className="q-asst__titlebar">
          <div className="q-asst__id">
            <span className="q-asst__tile" aria-hidden>
              <Icon name="sparkles" size={15} strokeWidth={1.8} />
            </span>
            <div style={{ minWidth: 0 }}>
              <h2 className="q-asst__title">{title}</h2>
              <div className="q-asst__sub">{toolName}</div>
            </div>
          </div>
          <div className="q-asst__tools">
            <button type="button" className="q-btn q-btn--ghost q-btn--sm" onClick={clear} disabled={!messages.length} aria-label="Clear conversation">
              <Icon name="eraser" size={14} />
              Clear
            </button>
            {onClose ? (
              <button type="button" className="q-icon-btn q-icon-btn--sm" onClick={onClose} aria-label={`Close ${title}`} title={`Close ${title}`}>
                <Icon name="x" size={14} />
              </button>
            ) : null}
          </div>
        </div>
        <div className="q-asst__chips" role="group" aria-label="Suggested questions">
          {chips.map((s) => (
            <button key={s} type="button" className="q-chip" onClick={() => void send(s)} disabled={busy} title={s}>
              <Icon name="sparkles" size={12} />
              {s}
            </button>
          ))}
        </div>
      </header>

      <div
        ref={threadRef}
        className="q-asst__thread"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        onScroll={(e) => {
          const el = e.currentTarget;
          stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
      >
        {messages.length === 0 ? (
          <div className="q-asst__intro">
            <span className="q-kicker">How can I help?</span>
            <p>
              Ask how to do anything in <strong style={{ color: "var(--q-fg)", fontWeight: 500 }}>{toolName}</strong>
              {getContext ? ". I can see what you're working on, so you can ask about it directly." : "."}
            </p>
            <p>Pick a suggestion above or type a question below.</p>
          </div>
        ) : null}

        {messages.map((m) => {
          const who = m.role === "user" ? "You" : title;
          if (m.error) {
            return (
              <div key={m.id} className={`q-msg q-msg--assistant ${m.error.kind === "auth" || m.error.kind === "offline" ? "q-msg--notice" : "q-msg--error"}`}>
                <span className="q-kicker q-msg__who">
                  <Icon name="sparkles" size={11} /> {who}
                </span>
                <div className="q-msg__bubble" role="alert">
                  {m.content ? <Markdown text={m.content} /> : null}
                  <p className="q-msg__error-title">
                    <Icon name={m.error.kind === "offline" ? "wifi-off" : m.error.kind === "auth" ? "lock" : "alert"} size={14} />
                    {m.error.title}
                  </p>
                  <p className="q-msg__error-text">{m.error.text}</p>
                  <div className="q-msg__error-actions">
                    {m.error.kind === "auth" ? (
                      onSignIn ? (
                        <button type="button" className="q-btn q-btn--primary q-btn--sm" onClick={onSignIn}>
                          <Icon name="user" size={14} />
                          Sign in with Quantum ID
                        </button>
                      ) : (
                        <a className="q-btn q-btn--primary q-btn--sm" href={signInHref} target={tool === "hub" ? undefined : "_blank"} rel="noopener noreferrer">
                          <Icon name="user" size={14} />
                          Sign in with Quantum ID
                        </a>
                      )
                    ) : null}
                    <button type="button" className="q-btn q-btn--sm" onClick={() => retry(m.id)} disabled={busy}>
                      <Icon name="refresh" size={14} />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className={`q-msg q-msg--${m.role}`}>
              <span className="q-kicker q-msg__who">
                {m.role === "assistant" ? <Icon name="sparkles" size={11} /> : null} {who}
              </span>
              <div className="q-msg__bubble">
                {m.role === "user" ? (
                  m.content
                ) : m.content ? (
                  <>
                    <Markdown text={m.content} />
                    {m.streaming ? <span className="q-caret" aria-hidden /> : null}
                  </>
                ) : (
                  <span className="q-thinking">Thinking…</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="q-asst__composer">
        <form
          className="q-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Ask about ${toolName}…`}
            aria-label={`Ask the ${title.toLowerCase()} about ${toolName}`}
          />
          {busy ? (
            <button type="button" className="q-icon-btn" onClick={stop} aria-label="Stop answering" title="Stop">
              <Icon name="stop" size={14} strokeWidth={2} />
            </button>
          ) : (
            <button type="submit" className="q-icon-btn" disabled={!draft.trim()} aria-label="Send question" title="Send">
              <Icon name="arrow-up" size={16} strokeWidth={2} />
            </button>
          )}
        </form>
        <p className="q-asst__hint">Enter to send · Shift+Enter for a new line</p>
      </div>
    </section>
  );
}
