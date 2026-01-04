import React from "react";

interface AITutorPanelProps {
    onAnalyzePage?: () => Promise<{ title: string; content: string } | null>;
}

export function AITutorPanel({ onAnalyzePage }: AITutorPanelProps) {
    const [messages, setMessages] = React.useState<Array<{ role: 'ai' | 'user', text: string }>>([
        { role: 'ai', text: "Hello! I'm your AI Tutor. I can help you understand this validation logic. Would you like a summary of the active page?" }
    ]);
    const initialProvider = (process.env.NEXT_PUBLIC_AI_PROVIDER_DEFAULT === "openai" ? "openai" : "gemini") as 'gemini' | 'openai';
    const [provider, setProvider] = React.useState<'gemini' | 'openai'>(initialProvider);

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

        if (window.eduAPI) {
            try {
                const response = await window.eduAPI.aiChat({ messages: newMessages, context, provider });
                setMessages(prev => [...prev, { role: 'ai', text: response }]);
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
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex items-center justify-between glass-ultra">
                <h2 className="text-lg font-semibold text-foreground">AI Tutor</h2>
                <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-[11px] font-bold tracking-wide uppercase glass-medium text-blue-600 px-3 py-1 rounded-full border border-blue-500/20 transition-smooth">
                        {providerLabel}
                    </span>
                    <button onClick={handleAnalyze} className="text-[11px] font-bold tracking-wide uppercase glass-medium text-green-600 hover:shadow-md px-3 py-1 rounded-full border border-green-500/20 cursor-pointer transition-spring liquid-hover">
                        Read Page
                    </button>
                    <button onClick={handleToggleProvider} className="text-[11px] font-bold tracking-wide uppercase glass-ultra text-foreground/60 px-3 py-1 rounded-full border border-white/10 cursor-pointer transition-spring liquid-hover">
                        Switch Model
                    </button>
                </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col gap-2 ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                        <div className={`${msg.role === 'ai'
                            ? 'glass-panel rounded-tl-none spring-enter'
                            : 'bg-blue-500 text-white rounded-tr-none glow-hover'} 
                            p-4 rounded-3xl max-w-[90%] text-sm leading-relaxed transition-spring`}>
                            {msg.text}
                        </div>
                        <span className={`text-xs font-medium text-foreground/40 ${msg.role === 'ai' ? 'ml-2' : 'mr-2'}`}>
                            {msg.role === 'ai' ? 'AI Tutor' : 'You'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="p-4 mt-auto">
                <div className="relative group">
                    <input
                        id="ai-input"
                        onKeyDown={handleKeyDown}
                        className="w-full glass-ultra border-2 border-white/80 backdrop-blur-md rounded-full py-4 pl-6 pr-12 text-sm font-medium shadow-md transition-smooth duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 focus:shadow-lg placeholder:text-foreground/50"
                        placeholder="Ask a question..."
                    />
                    <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 rounded-full text-white shadow-lg hover:scale-105 active:scale-95 transition-spring glow-hover">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div >
    );
}
