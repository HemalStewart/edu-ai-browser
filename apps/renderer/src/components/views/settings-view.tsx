import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";

interface RendererSettings {
    theme?: "light" | "dark" | "system";
    defaultSearchEngine?: string;
    restoreSession?: boolean;
}

function SettingRow({
    icon,
    title,
    description,
    children,
}: {
    icon: IconName;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-muted px-5 py-4 last:border-b-0">
            <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line text-fg-2">
                    <Icon name={icon} className="h-4 w-4" />
                </span>
                <div>
                    <p className="text-[14px] font-medium text-fg">{title}</p>
                    <p className="mt-0.5 text-[12.5px] text-fg-3">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export function SettingsView() {
    const [settings, setSettings] = useState<RendererSettings>({});

    useEffect(() => {
        window.eduAPI?.getSettings().then((loaded) => setSettings(loaded ?? {}));
    }, []);

    const update = async <K extends keyof RendererSettings>(key: K, value: RendererSettings[K]) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await window.eduAPI?.updateSettings(newSettings);
        window.dispatchEvent(new CustomEvent("edu-settings-change", { detail: newSettings }));
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl px-8 py-8">
                <div className="border-b border-line pb-5">
                    <p className="kicker">edu://settings</p>
                    <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.02em] text-fg">Settings</h1>
                    <p className="mt-1 text-[13px] text-fg-3">Browser preferences are stored locally on this device.</p>
                </div>

                <div className="mt-6 overflow-hidden rounded-lg border border-line bg-pane">
                    <SettingRow icon="layers" title="Appearance" description="OLED monochrome. True black canvas, hairline structure, no colour.">
                        <span className="flex h-8 items-center gap-2 rounded border border-line px-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-fg-2">
                            <span className="h-2 w-2 rounded-full border border-fg bg-[linear-gradient(90deg,#fff_50%,transparent_50%)]" />
                            Dark only
                        </span>
                    </SettingRow>

                    <SettingRow icon="search" title="Default search engine" description="Used when the omnibox text is not a web address.">
                        <select
                            value={settings.defaultSearchEngine || 'google'}
                            onChange={(e) => update('defaultSearchEngine', e.target.value)}
                            aria-label="Default search engine"
                            className="h-9 cursor-pointer rounded border border-line bg-canvas px-3 text-[13px] text-fg transition-colors hover:border-line-active focus:border-fg-2 focus:outline-none"
                        >
                            <option value="google">Google</option>
                            <option value="bing">Bing</option>
                            <option value="duckduckgo">DuckDuckGo</option>
                            <option value="perplexity">Perplexity</option>
                        </select>
                    </SettingRow>

                    <SettingRow icon="refresh" title="Restore previous session" description="Reopen your tabs the next time the browser starts.">
                        <input
                            type="checkbox"
                            checked={settings.restoreSession ?? true}
                            onChange={(e) => update('restoreSession', e.target.checked)}
                            aria-label="Restore previous session"
                            className="h-4 w-4 cursor-pointer rounded-sm accent-white"
                        />
                    </SettingRow>
                </div>
            </div>
        </div>
    );
}
