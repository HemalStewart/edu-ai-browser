export interface IElectronAPI {
    ping: () => Promise<string>;
    loadBrowserView: (url: string) => void;
    resizeBrowserView: (bounds: { x: number; y: number; width: number; height: number }) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    extractText: () => Promise<{ title: string; content: string; selection?: boolean; error?: string }>;
}

declare global {
    interface Window {
        eduAPI: IElectronAPI;
    }
}
