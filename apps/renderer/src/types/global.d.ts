export interface IElectronAPI {
    ping: () => Promise<string>;

    createTab: (tabId: string) => Promise<boolean>;
    removeTab: (tabId: string) => Promise<void>;
    selectTab: (tabId: string) => Promise<void>;

    loadBrowserView: (tabId: string, url: string) => void;
    resizeBrowserView: (tabId: string, bounds: { x: number; y: number; width: number; height: number }) => void;
    back: (tabId: string) => void;
    forward: (tabId: string) => void;
    refresh: (tabId: string) => void;
    extractText: (tabId: string) => Promise<{ title: string; content: string; selection?: boolean; error?: string }>;
    aiChat: (payload: { messages: Array<{ role: string, text: string }>, context?: { title: string, content: string }, provider?: string }) => Promise<string>;
}

declare global {
    interface Window {
        eduAPI: IElectronAPI;
    }
}
