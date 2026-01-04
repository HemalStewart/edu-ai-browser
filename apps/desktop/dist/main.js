import { app, BrowserWindow, ipcMain, BrowserView } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Fallback: try loading from CWD if not found above (for different build structures)
if (!process.env.GEMINI_API_KEY) {
    dotenv.config({ path: path.join(process.cwd(), "../../.env") });
}
const isDev = process.env.NODE_ENV === "development";
let mainWindow = null;
let browserView = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: "#0a0a0a",
        webPreferences: {
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false,
            preload: (() => {
                const preloadPath = path.join(__dirname, "preload.mjs");
                console.log("----------------------------------------");
                return preloadPath;
            })(),
        },
    });
    // Initialize BrowserView
    browserView = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
        },
    });
    mainWindow.setBrowserView(browserView);
    // Default bounds (hidden initially)
    browserView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    browserView.webContents.loadURL("about:blank");
    ipcMain.handle("ping", async () => "pong");
    ipcMain.on("browser-view:load", (_, url) => {
        if (browserView) {
            browserView.webContents.loadURL(url).catch((e) => {
                console.error("Failed to load URL:", url, e);
            });
        }
    });
    ipcMain.on("browser-view:resize", (_, bounds) => {
        if (browserView) {
            // Adjust bounds logic if needed, but direct mapping is usually fine
            // if the renderer provides window-relative coordinates
            browserView.setBounds(bounds);
        }
    });
    ipcMain.on("browser-view:back", () => {
        if (browserView && browserView.webContents.canGoBack()) {
            browserView.webContents.goBack();
        }
    });
    ipcMain.on("browser-view:forward", () => {
        if (browserView && browserView.webContents.canGoForward()) {
            browserView.webContents.goForward();
        }
    });
    ipcMain.on("browser-view:refresh", () => {
        if (browserView) {
            browserView.webContents.reload();
        }
    });
    // Extraction Handler
    ipcMain.handle("browser-view:extract-text", async () => {
        if (!browserView)
            return { title: "", content: "" };
        try {
            // Execute script in the BrowserView to get title and simple text
            const result = await browserView.webContents.executeJavaScript(`
  (function () {
    const title = document.title;
    const selection = window.getSelection().toString();
    if (selection) return { title, content: selection, selection: true };

    const body = document.body.innerText;
    return { title, content: body };
  })();
`);
            return result;
        }
        catch (e) {
            console.error("Extraction failed:", e);
            return { title: "", content: "", error: String(e) };
        }
    });
    // AI Chat Handler
    ipcMain.handle("ai:chat", async (_, { messages, context }) => {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey)
                return "Please set GEMINI_API_KEY in .env file.";
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = model.startChat({
                history: messages.map((m) => ({
                    role: m.role === 'ai' ? 'model' : 'user', // Gemini uses 'model' instead of 'ai'
                    parts: [{ text: m.text }],
                })),
            });
            // Add context to the latest message if available
            let prompt = messages[messages.length - 1].text;
            if (context) {
                prompt = `Context from current page(${context.title}): \n${context.content.substring(0, 5000)} \n\nUser Question: ${prompt} `;
            }
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error("AI Error:", error);
            return "Sorry, I encountered an error connecting to the AI.";
        }
    });
    if (isDev) {
        mainWindow.loadURL("http://localhost:3000");
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadURL("http://localhost:3000");
    }
}
app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});
