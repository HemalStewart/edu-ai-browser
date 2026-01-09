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
// Map<TabID, BrowserView>
const tabs = new Map();
let activeTabId = null;
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
    ipcMain.handle("ping", async () => "pong");
    // --- Tab Management ---
    ipcMain.handle("tab:create", (_, tabId) => {
        console.log(`[Main] tab:create ${tabId}`);
        if (!mainWindow)
            return;
        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
            },
        });
        // Default to a blank page or specific new tab page
        view.webContents.loadURL("about:blank");
        tabs.set(tabId, view);
        // If it's the first tab, make it active automatically, or wait for explicit select
        if (!activeTabId) {
            activeTabId = tabId;
            mainWindow.setBrowserView(view);
            // Initialize bounds to 0 until resized
            view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
        }
        return true;
    });
    ipcMain.handle("tab:remove", (_, tabId) => {
        const view = tabs.get(tabId);
        if (!view)
            return;
        // If closing the active tab, we detach it first
        if (mainWindow && activeTabId === tabId) {
            mainWindow.setBrowserView(null);
        }
        // Explicitly destroy usage if needed, but simple dereference usually suffices in JS.
        // However, Electron recommends explicit destruction for BrowserViews sometimes if they are detached.
        // view.webContents.destroy(); // Optional, but good for cleanup
        tabs.delete(tabId);
        if (activeTabId === tabId) {
            activeTabId = null;
        }
    });
    ipcMain.handle("tab:select", (_, tabId) => {
        console.log(`[Main] tab:select ${tabId}`);
        if (!mainWindow)
            return;
        const view = tabs.get(tabId);
        if (view) {
            activeTabId = tabId;
            mainWindow.setBrowserView(view);
            // Note: The renderer normally sends a resize event immediately after selection to ensure bounds are correct.
        }
    });
    // --- Browser View Actions (Targeted by Tab ID) ---
    const getTab = (id) => {
        // If no ID provided, default to active (legacy support or convenience)
        if (!id && activeTabId)
            return tabs.get(activeTabId);
        if (id)
            return tabs.get(id);
        return null;
    };
    ipcMain.on("browser-view:load", (_, { tabId, url }) => {
        console.log(`[Main] browser-view:load ${tabId} -> ${url}`);
        const view = getTab(tabId);
        if (view) {
            view.webContents.loadURL(url).catch((e) => {
                console.error("Failed to load URL:", url, e);
            });
        }
        else {
            console.warn(`[Main] load failed - view not found for ${tabId}`);
        }
    });
    ipcMain.on("browser-view:resize", (_, { tabId, bounds }) => {
        // Only resize if it's the active tab, or resize background tabs too?
        // Usually we only care about the active one mapping to the placeholder.
        // But if we resize background tabs, they might be ready when switched.
        // However, setBrowserView(view) replaces the view.
        const view = getTab(tabId);
        if (view) {
            // console.log(`[Main] browser-view:resize ${tabId}`, bounds); 
            view.setBounds(bounds);
        }
    });
    ipcMain.on("browser-view:back", (_, tabId) => {
        const view = getTab(tabId);
        if (view && view.webContents.canGoBack()) {
            view.webContents.goBack();
        }
    });
    ipcMain.on("browser-view:forward", (_, tabId) => {
        const view = getTab(tabId);
        if (view && view.webContents.canGoForward()) {
            view.webContents.goForward();
        }
    });
    ipcMain.on("browser-view:refresh", (_, tabId) => {
        const view = getTab(tabId);
        if (view) {
            view.webContents.reload();
        }
    });
    // Extraction Handler
    ipcMain.handle("browser-view:extract-text", async (_, tabId) => {
        const view = getTab(tabId);
        if (!view)
            return { title: "", content: "" };
        try {
            // Execute script in the BrowserView to get title and simple text
            const result = await view.webContents.executeJavaScript(`
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
    ipcMain.handle("ai:chat", async (_, payload) => {
        try {
            const { messages, context, provider: requestedProvider } = (payload ?? {});
            if (!Array.isArray(messages) || messages.length === 0) {
                return "Please send a question first.";
            }
            const sanitizedHistory = [];
            let hasSeenUser = false;
            for (const msg of messages.slice(0, -1)) {
                const normalizedRole = msg.role === "ai" ? "ai" : "user";
                if (!hasSeenUser && normalizedRole === "ai") {
                    continue; // strip placeholder greetings so the history starts with the user
                }
                if (normalizedRole === "user") {
                    hasSeenUser = true;
                }
                sanitizedHistory.push({
                    role: normalizedRole,
                    text: msg.text,
                });
            }
            // Add context to the latest message if available
            const lastMessage = messages[messages.length - 1];
            let prompt = lastMessage?.text ?? "";
            if (context) {
                prompt = `Context from current page(${context.title}): \n${context.content.substring(0, 5000)} \n\nUser Question: ${prompt} `;
            }
            const provider = (requestedProvider ||
                process.env.AI_PROVIDER ||
                (process.env.OPENAI_API_KEY ? "openai" : "gemini")).toLowerCase();
            if (provider === "openai") {
                const openAiKey = process.env.OPENAI_API_KEY;
                if (!openAiKey)
                    return "Please set OPENAI_API_KEY in .env file.";
                const openAiHistory = sanitizedHistory.map((msg) => ({
                    role: msg.role === "ai" ? "assistant" : "user",
                    content: msg.text,
                }));
                const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${openAiKey}`,
                    },
                    body: JSON.stringify({
                        model: openAiModel,
                        messages: [...openAiHistory, { role: "user", content: prompt }],
                    }),
                });
                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
                }
                const data = await response.json();
                const completionText = data.choices?.[0]?.message?.content ?? "I couldn't generate a response.";
                return completionText;
            }
            const geminiKey = process.env.GEMINI_API_KEY;
            if (!geminiKey)
                return "Please set GEMINI_API_KEY in .env file.";
            const genAI = new GoogleGenerativeAI(geminiKey);
            const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
            const model = genAI.getGenerativeModel({ model: modelName });
            const geminiHistory = sanitizedHistory.map((msg) => ({
                role: msg.role === "ai" ? "model" : "user",
                parts: [{ text: msg.text }],
            }));
            const chat = model.startChat({
                history: geminiHistory,
            });
            const result = await chat.sendMessage(prompt);
            const geminiResponse = await result.response;
            return geminiResponse.text();
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
