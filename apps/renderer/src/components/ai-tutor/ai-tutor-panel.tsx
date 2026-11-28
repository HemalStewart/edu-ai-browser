import React from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Icon } from "@/components/icons";

export interface PendingAiAction {
    type: 'quiz' | 'summarize' | 'explain' | 'keypoints' | 'flashcards';
    context?: { title: string; content: string };
}

interface AITutorPanelProps {
    onAnalyzePage?: () => Promise<{ title: string; content: string } | null>;
    pendingAction?: PendingAiAction | null;
    onActionComplete?: () => void;
}

export function AITutorPanel({ onAnalyzePage, pendingAction, onActionComplete }: AITutorPanelProps) {
    const [messages, setMessages] = React.useState<Array<{ role: 'ai' | 'user', text: string }>>([
        { role: 'ai', text: "Hello! I'm your AI Tutor. I can help you understand this validation logic. Would you like a summary of the active page?" }
    ]);
    const initialProvider = (process.env.NEXT_PUBLIC_AI_PROVIDER_DEFAULT === "openai" ? "openai" : "gemini") as 'gemini' | 'openai';
    const [provider, setProvider] = React.useState<'gemini' | 'openai'>(initialProvider);
    const processingAction = React.useRef<string | null>(null);
    const threadRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const thread = threadRef.current;
        if (thread) thread.scrollTop = thread.scrollHeight;
    }, [messages]);

    React.useEffect(() => {
        if (pendingAction && pendingAction.context && processingAction.current !== pendingAction.type) {
            processingAction.current = pendingAction.type;
            const { title, content } = pendingAction.context;

            const executeAction = async () => {
                let prompt = "";
                let userMessage = "";

                switch (pendingAction.type) {
                    case 'quiz':
                        userMessage = `Generate a quiz for: ${title}`;
                        prompt = `Based on the following content, generate a 5-question multiple choice quiz to test understanding. 
                    
Content: "${title}"
${content.slice(0, 15000)}...

Format:
1. Question
   a) Option
   b) Option
   c) Option
   d) Option
   Answer: X`;
                        break;
                    case 'summarize':
                        userMessage = `Summarize: ${title}`;
                        prompt = `Provide a concise summary of the following content, highlighting the main argument and conclusion.
                        
Content: "${title}"
${content.slice(0, 15000)}...`;
                        break;
                    case 'explain':
                        userMessage = `Explain this page: ${title}`;
                        prompt = `Explain the following content in simple terms, as if you were teaching a beginner. Use analogies if helpful.
                        
Content: "${title}"
${content.slice(0, 15000)}...`;
                        break;
                    case 'keypoints':
                        userMessage = `Key points for: ${title}`;
                        prompt = `Extract the key takeaways and important points from the following content as a bulleted list.
                        
Content: "${title}"
${content.slice(0, 15000)}...`;
                        break;
                    case 'flashcards':
                        userMessage = `Create flashcards for: ${title}`;
                        prompt = `Create a set of 5-10 flashcards based on the key concepts in this content. Format them as "Front: [Concept] | Back: [Definition/Answer]".
                        
Content: "${title}"
${content.slice(0, 15000)}...`;
                        break;
                    default:
                        return;
                }

                setMessages(prev => [...prev, { role: 'user', text: userMessage }, { role: 'ai', text: '' }]);

                try {
                    if (window.eduAPI?.aiChatStream) {
                        window.eduAPI.aiChatStream(
                            { messages: [{ role: 'user', text: prompt }], context: { title, content }, provider },
                            (chunk) => {
                                setMessages(prev => {
                                    const copy = [...prev];
                                    const last = copy[copy.length - 1];
                                    if (last?.role === 'ai') {
                                        copy[copy.length - 1] = { ...last, text: last.text + chunk };
                                    }
                                    return copy;
                                });
                            },
                            () => {
                                processingAction.current = null;
                                onActionComplete?.();
                            },
                            (err) => {
                                setMessages(prev => {
                                    const copy = [...prev];
                                    const last = copy[copy.length - 1];
                                    if (last?.role === 'ai') {
                                        copy[copy.length - 1] = { ...last, text: last.text + `\n(Error: ${err})` };
                                    }
                                    return copy;
                                });
                                processingAction.current = null;
                                onActionComplete?.();
                            }
                        );
                    }
                } catch (e) {
                    console.error(`${pendingAction.type} failed`, e);
                    setMessages(prev => {
                        // Fix up the empty AI message if it exists, or add one
                        const copy = [...prev];
                        const last = copy[copy.length - 1];
                        if (last?.role === 'ai' && !last.text) {
                            copy[copy.length - 1] = { ...last, text: "Sorry, I couldn't complete the request." };
                            return copy;
                        }
                        return [...prev, { role: 'ai', text: "Sorry, I couldn't complete the request." }];
                    });
                    processingAction.current = null;
                    onActionComplete?.();
                }
            };

            executeAction();
        }
    }, [pendingAction, provider, onActionComplete]);

    const handleAnalyze = async () => {
        if (onAnalyzePage) {
            setMessages(prev => [...prev, { role: 'user', text: "Analyze this page." }]);
            const data = await onAnalyzePage();
            if (data) {
                setMessages(prev => [...prev, { role: 'ai', text: `I've read the page: "${data.title}".\n\nI can answer questions about it now.` }]);
                // Ideally store 'data' in state to pass as context later
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "I couldn't read the page. Make sure a website is loaded." }]);
            }
        }
    };

    const handleSendMessage = async () => {
        const input = document.getElementById('ai-input') as HTMLInputElement;
        if (!input || !input.value.trim()) return;

        const userText = input.value;
        input.value = ''; // Clear input

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', text: userText } as const];
        setMessages(newMessages);

        // Get context if available (you might want to store this in state from handleAnalyze)
        let context = undefined;
        if (onAnalyzePage) {
            // Quick hack: re-extract text for every message for freshness
            const data = await onAnalyzePage();
            if (data) context = { title: data.title, content: data.content };
        }

        if (!window.eduAPI?.aiChatStream) {
            // Opened in a plain browser tab (no Electron bridge): say so instead of leaving the question unanswered.
            setMessages(prev => [...prev, { role: 'ai', text: "The AI Tutor runs inside the Quantum Mind desktop app, where it can read your open tabs. Here in the browser, ask the Quantum assistant on the right." }]);
            return;
        }

        if (window.eduAPI?.aiChatStream) {
            try {
                // Add empty AI message
                setMessages(prev => [...prev, { role: 'ai', text: '' }]);

                window.eduAPI.aiChatStream(
                    { messages: newMessages, context, provider },
                    (chunk) => {
                        setMessages(prev => {
                            const copy = [...prev];
                            const last = copy[copy.length - 1];
                            if (last?.role === 'ai') {
                                copy[copy.length - 1] = { ...last, text: last.text + chunk };
                            }
                            return copy;
                        });
                    },
                    () => { },
                    (err) => {
                        setMessages(prev => {
                            const copy = [...prev];
                            const last = copy[copy.length - 1];
                            if (last?.role === 'ai') {
                                copy[copy.length - 1] = { ...last, text: last.text + `\n(Error: ${err})` };
                            }
                            return copy;
                        });
                    }
                );
            } catch (error) {
                console.error("AI chat failed:", error);
                setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI." }]);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage();
    }

    const handleToggleProvider = () => {
        const nextProvider = provider === 'gemini' ? 'openai' : 'gemini';
        setProvider(nextProvider);
        setMessages(prev => [...prev, {
            role: 'ai',
            text: `Switched to ${nextProvider === 'openai' ? 'OpenAI (GPT-4o Mini)' : 'Gemini (2.5 Flash)'}.`
        }]);
    };

    const providerLabel = provider === 'openai' ? 'OpenAI (GPT-4o Mini)' : 'Gemini (2.5 Flash)';

    return (
        <div className="flex h-full flex-col">
            {/* The Quantum sections panel supplies the "AI Tutor" title bar. */}
            <div className="shrink-0 border-b border-line px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="kicker">Model</p>
                    <span className="flex items-center gap-1.5 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-fg-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-fg" />
                        {providerLabel}
                    </span>
                </div>
                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={handleAnalyze}
                        className="flex h-8 items-center gap-1.5 rounded border border-line px-2.5 text-[12px] text-fg transition-colors hover:border-line-active hover:bg-card"
                    >
                        <Icon name="book-open" className="h-3.5 w-3.5" /> Read page
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleProvider}
                        className="flex h-8 items-center gap-1.5 rounded px-2.5 text-[12px] text-fg-2 transition-colors hover:bg-raised hover:text-fg"
                    >
                        <Icon name="refresh" className="h-3.5 w-3.5" /> Switch model
                    </button>
                </div>
            </div>

            <div ref={threadRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5" aria-live="polite">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col gap-1.5 ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                        <span className="kicker flex items-center gap-1.5">
                            {msg.role === 'ai' && <Icon name="sparkles" className="h-3 w-3" />}
                            {msg.role === 'ai' ? 'AI Tutor' : 'You'}
                        </span>
                        {msg.role === 'ai' ? (
                            <div className="w-full rounded border border-line bg-card px-3.5 py-3 text-[13.5px] leading-relaxed">
                                {msg.text ? (
                                    <MarkdownRenderer content={msg.text} />
                                ) : (
                                    <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-3">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fg-2" /> Thinking…
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="max-w-[88%] rounded border border-line bg-raised px-3.5 py-2.5 text-[13.5px] leading-relaxed text-fg">
                                {msg.text}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="shrink-0 border-t border-line p-3">
                <div className="flex items-center gap-2 rounded border border-line bg-canvas py-1 pl-3 pr-1 transition-colors focus-within:border-fg-2">
                    <input
                        id="ai-input"
                        onKeyDown={handleKeyDown}
                        aria-label="Ask the AI tutor"
                        className="h-8 min-w-0 flex-1 bg-transparent text-[13.5px] text-fg outline-none placeholder:text-fg-4 focus-visible:outline-none"
                        placeholder="Ask about this page..."
                    />
                    <button
                        type="button"
                        onClick={handleSendMessage}
                        aria-label="Send question"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent text-accent-fg transition-colors hover:bg-accent-hover"
                    >
                        <Icon name="send" className="h-4 w-4" strokeWidth={2} />
                    </button>
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-4">Enter to send · grounded in the active tab</p>
            </div>
        </div>
    );
}
