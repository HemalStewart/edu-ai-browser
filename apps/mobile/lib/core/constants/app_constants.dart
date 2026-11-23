class SearchEngine {
  final String name;
  final String url;
  final String queryUrl;
  final String iconKey;

  const SearchEngine({
    required this.name,
    required this.url,
    required this.queryUrl,
    required this.iconKey,
  });
}

class AppConstants {
  static const List<SearchEngine> searchEngines = [
    SearchEngine(
      name: "Google",
      url: "https://www.google.com",
      queryUrl: "https://www.google.com/search?q=",
      iconKey: "google",
    ),
    SearchEngine(
      name: "Bing",
      url: "https://www.bing.com",
      queryUrl: "https://www.bing.com/search?q=",
      iconKey: "bing",
    ),
    SearchEngine(
      name: "DuckDuckGo",
      url: "https://duckduckgo.com",
      queryUrl: "https://duckduckgo.com/?q=",
      iconKey: "duckduckgo",
    ),
    SearchEngine(
      name: "Wikipedia",
      url: "https://en.wikipedia.org",
      queryUrl: "https://en.wikipedia.org/wiki/Special:Search?search=",
      iconKey: "wikipedia",
    ),
    SearchEngine(
      name: "Perplexity",
      url: "https://www.perplexity.ai",
      queryUrl: "https://www.perplexity.ai/search?q=",
      iconKey: "perplexity",
    ),
  ];

  static const List<Map<String, String>> discoveryDeck = [
    {
      "title": "React Quick Start",
      "url": "https://react.dev/learn",
      "label": "Docs",
      "description": "Framework fundamentals with runnable guides.",
      "accent": "0xFF3B82F6",
    },
    {
      "title": "MDN Web APIs",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API",
      "label": "Reference",
      "description": "Search the living spec for browser features.",
      "accent": "0xFF10B981",
    },
    {
      "title": "TypeScript Handbook",
      "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
      "label": "Guide",
      "description": "Language essentials with examples.",
      "accent": "0xFF6366F1",
    },
    {
      "title": "Electron Security",
      "url": "https://www.electronjs.org/docs/latest/tutorial/security",
      "label": "Security",
      "description": "Hardening tips for production builds.",
      "accent": "0xFFF59E0B",
    },
    {
      "title": "Gemini API Docs",
      "url": "https://ai.google.dev/gemini-api/docs",
      "label": "AI",
      "description": "Gemini & OpenAI usage notes in one place.",
      "accent": "0xFFEC4899",
    },
    {
      "title": "Flutter Documentation",
      "url": "https://docs.flutter.dev",
      "label": "Mobile",
      "description": "Build high-speed native apps across any screen.",
      "accent": "0xFF06B6D4",
    },
  ];

  static const List<Map<String, String>> complianceFeatures = [
    {
      "title": "Integrity Mode",
      "description": "Guides learners through Socratic reasoning instead of giving direct homework answers.",
      "status": "Ready",
    },
    {
      "title": "Exam Locker",
      "description": "Distraction-free environment that pauses side tabs during focus periods.",
      "status": "Beta",
    },
    {
      "title": "Institution Sync",
      "description": "Share verified study reports and summary notes with advisors or schools.",
      "status": "Soon",
    },
  ];

  static const String extractPageJs = """
    (function() {
      const title = document.title || "";
      const selection = window.getSelection() ? window.getSelection().toString() : "";
      if (selection && selection.trim().length > 0) {
        return JSON.stringify({ title: title, content: selection.trim(), selection: true });
      }

      try {
        const root = document.querySelector('article') || document.querySelector('main') || document.body;
        if (!root) {
          return JSON.stringify({ title: title, content: "" });
        }
        const elements = Array.from(root.querySelectorAll('p, h1, h2, h3, h4, li, blockquote, pre'));
        let content = '';
        
        elements.forEach(el => {
          if (el.closest('nav, footer, header, aside, .menu, script, style')) return;
          const text = el.innerText ? el.innerText.trim() : '';
          if (!text) return;
          
          const tag = el.tagName.toLowerCase();
          if (tag === 'h1') content += '# ' + text + '\\n\\n';
          else if (tag === 'h2') content += '## ' + text + '\\n\\n';
          else if (tag === 'h3') content += '### ' + text + '\\n\\n';
          else if (tag === 'li') content += '- ' + text + '\\n';
          else if (tag === 'blockquote') content += '> ' + text + '\\n\\n';
          else if (tag === 'pre') content += '```\\n' + text + '\\n```\\n\\n';
          else content += text + '\\n\\n';
        });
        
        if (content.length > 50) {
          return JSON.stringify({ title: title, content: content });
        }
      } catch(e) {}

      return JSON.stringify({ title: title, content: document.body ? (document.body.innerText || "") : "" });
    })();
  """;
}
