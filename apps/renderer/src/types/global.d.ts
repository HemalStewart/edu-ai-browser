export interface IElectronAPI {
    ping: () => Promise<string>;
    loadBrowserView: (url: string) => void;
    resizeBrowserView: (bounds: { x: number; y: number; width: number; height: number }) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    extractText: () => Promise<{ title: string; content: string; selection?: boolean; error?: string }>;
    aiChat: (payload: { messages: Array<{ role: string, text: string }>, context?: { title: string, content: string } }) => Promise<string>;
}

declare global {
    interface Window {
        eduAPI: IElectronAPI;
    }
}
