import { contextBridge, ipcRenderer } from "electron";

console.log("!!! PRELOAD SCRIPT IS RUNNING !!!");


contextBridge.exposeInMainWorld("eduAPI", {
  ping: () => ipcRenderer.invoke("ping"),

  // Tab Management
  createTab: (tabId: string) => ipcRenderer.invoke("tab:create", tabId),
  removeTab: (tabId: string) => ipcRenderer.invoke("tab:remove", tabId),
  selectTab: (tabId: string) => ipcRenderer.invoke("tab:select", tabId),

  // BrowserView Actions (now require tabId)
  loadBrowserView: (tabId: string, url: string) => ipcRenderer.send("browser-view:load", { tabId, url }),
  resizeBrowserView: (tabId: string, bounds: { x: number; y: number; width: number; height: number }) =>
    ipcRenderer.send("browser-view:resize", { tabId, bounds }),

  back: (tabId: string) => ipcRenderer.send("browser-view:back", tabId),
  forward: (tabId: string) => ipcRenderer.send("browser-view:forward", tabId),
  refresh: (tabId: string) => ipcRenderer.send("browser-view:refresh", tabId),
  extractText: (tabId: string) => ipcRenderer.invoke("browser-view:extract-text", tabId),

  aiChat: (payload: any) => ipcRenderer.invoke("ai:chat", payload),

  // History
  getHistory: () => ipcRenderer.invoke("history:get"),
  clearHistory: () => ipcRenderer.invoke("history:clear"),

  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke("bookmarks:get"),
  addBookmark: (bookmark: { title: string; url: string; favicon?: string }) => ipcRenderer.invoke("bookmarks:add", bookmark),
  removeBookmark: (id: string) => ipcRenderer.invoke("bookmarks:remove", id),

  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (settings: any) => ipcRenderer.invoke("settings:update", settings),
});
