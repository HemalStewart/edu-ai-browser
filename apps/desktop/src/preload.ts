import { contextBridge, ipcRenderer } from "electron";

console.log("!!! PRELOAD SCRIPT IS RUNNING !!!");


contextBridge.exposeInMainWorld("eduAPI", {
  ping: () => ipcRenderer.invoke("ping"),
  loadBrowserView: (url: string) => ipcRenderer.send("browser-view:load", url),
  resizeBrowserView: (bounds: { x: number; y: number; width: number; height: number }) =>
    ipcRenderer.send("browser-view:resize", bounds),
  back: () => ipcRenderer.send("browser-view:back"),
  forward: () => ipcRenderer.send("browser-view:forward"),
  refresh: () => ipcRenderer.send("browser-view:refresh"),
  extractText: () => ipcRenderer.invoke("browser-view:extract-text"),
  aiChat: (payload: any) => ipcRenderer.invoke("ai:chat", payload),
});
