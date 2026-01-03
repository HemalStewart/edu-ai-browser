const { contextBridge, ipcRenderer } = require("electron");

console.log("!!! PRELOAD (CJS) LOADED !!!");

contextBridge.exposeInMainWorld("eduAPI", {
    ping: () => ipcRenderer.invoke("ping"),
    loadBrowserView: (url) => ipcRenderer.send("browser-view:load", url),
    resizeBrowserView: (bounds) => ipcRenderer.send("browser-view:resize", bounds),
    back: () => ipcRenderer.send("browser-view:back"),
    forward: () => ipcRenderer.send("browser-view:forward"),
    refresh: () => ipcRenderer.send("browser-view:refresh"),
    extractText: () => ipcRenderer.invoke("browser-view:extract-text"),
});
