import { contextBridge, ipcRenderer } from "electron";
console.log("!!! PRELOAD SCRIPT IS RUNNING !!!");
contextBridge.exposeInMainWorld("eduAPI", {
    ping: () => ipcRenderer.invoke("ping"),
    // Tab Management
    createTab: (tabId) => ipcRenderer.invoke("tab:create", tabId),
    removeTab: (tabId) => ipcRenderer.invoke("tab:remove", tabId),
    selectTab: (tabId) => ipcRenderer.invoke("tab:select", tabId),
    // BrowserView Actions (now require tabId)
    loadBrowserView: (tabId, url) => ipcRenderer.send("browser-view:load", { tabId, url }),
    resizeBrowserView: (tabId, bounds) => ipcRenderer.send("browser-view:resize", { tabId, bounds }),
    back: (tabId) => ipcRenderer.send("browser-view:back", tabId),
    forward: (tabId) => ipcRenderer.send("browser-view:forward", tabId),
    refresh: (tabId) => ipcRenderer.send("browser-view:refresh", tabId),
    extractText: (tabId) => ipcRenderer.invoke("browser-view:extract-text", tabId),
    aiChat: (payload) => ipcRenderer.invoke("ai:chat", payload),
});
