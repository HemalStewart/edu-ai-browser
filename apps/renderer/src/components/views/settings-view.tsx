import { useEffect, useState } from "react";

export function SettingsView() {
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        window.eduAPI.getSettings().then(setSettings);
    }, []);

    const update = async (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await window.eduAPI.updateSettings(newSettings);
    };

    if (!settings) return null;

    return (
        <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

            <div className="space-y-6">
                <section className="glass-ultra p-6 rounded-3xl border border-white/50 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M12 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5" /></svg>
                        Appearance
                    </h3>
                    <div className="flex items-center justify-between">
                        <label className="text-foreground/80 font-medium text-sm">Theme</label>
                        <select
                            value={settings.theme || 'system'}
                            onChange={(e) => update('theme', e.target.value)}
                            className="bg-white/50 border border-white/60 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground cursor-pointer hover:bg-white/80 transition-colors"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                </section>

                <section className="glass-ultra p-6 rounded-3xl border border-white/50 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        Search
                    </h3>
                    <div className="flex items-center justify-between">
                        <label className="text-foreground/80 font-medium text-sm">Default Engine</label>
                        <select
                            value={settings.defaultSearchEngine || 'google'}
                            onChange={(e) => update('defaultSearchEngine', e.target.value)}
                            className="bg-white/50 border border-white/60 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground cursor-pointer hover:bg-white/80 transition-colors"
                        >
                            <option value="google">Google</option>
                            <option value="bing">Bing</option>
                            <option value="duckduckgo">DuckDuckGo</option>
                            <option value="perplexity">Perplexity</option>
                        </select>
                    </div>
                </section>

                <section className="glass-ultra p-6 rounded-3xl border border-white/50 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        Startup
                    </h3>
                    <div className="flex items-center justify-between">
                        <label className="text-foreground/80 font-medium text-sm">Restore previous session</label>
                        <input
                            type="checkbox"
                            checked={settings.restoreSession ?? true}
                            onChange={(e) => update('restoreSession', e.target.checked)}
                            className="w-5 h-5 rounded-md accent-blue-500 cursor-pointer"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
