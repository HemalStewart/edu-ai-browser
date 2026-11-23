# EduAI Mobile Browser 📱🎓

An AI-powered educational web browser built with **Flutter**, bringing the intelligence, study tools, and reader modes of the EduAI desktop browser to iOS and Android devices.

---

## ✨ Features

### 🌐 1. Multi-Tab Educational Web Browser
- **Dynamic Tab Strip**: Add, switch, close tabs, or open the visual **Tabs Overview Grid**.
- **Context-Aware Address Bar**: Intelligent search bar with search engine integration (Google, Bing, DuckDuckGo, Wikipedia, Perplexity).
- **In-App Web Rendering**: Full modern web navigation powered by `webview_flutter` with back/forward/refresh controls and loading progress indicators.
- **Bookmarks & History**: Instant bookmarking with one tap, searchable browsing history, and easy deletion.

### 🧠 2. AI Tutor & Multi-Model Chat
- **Dual AI Engine**: Seamlessly switch between **Google Gemini** (`gemini-2.5-flash`) and **OpenAI** (`gpt-4o-mini`).
- **Live Page Grounding ("Read Page")**: Extracts article headings, paragraphs, and active text selections directly from the DOM using in-engine JavaScript execution, injecting the live context into your conversations.
- **Rich Markdown Formatting**: AI responses render with clear headings, lists, tables, and syntax-highlighted code blocks.
- **Interactive Flashcards & Quizzes**: Tapping AI flashcards or quizzes launches interactive swipeable flashcard decks and scored multiple-choice quizzes.

### ⚡ 3. One-Tap Learning Tools
Quickly trigger targeted educational prompts against the active page:
1. **Summarize Page**: Generates concise takeaways and conclusions.
2. **Explain for Me**: Socratic, beginner-friendly explanations with intuitive analogies.
3. **Key Points**: Extracts bulleted checklists of critical ideas.
4. **Generate Quiz**: Builds an interactive 5-question multiple choice drill.
5. **Create Flashcards**: Produces active-recall flashcard pairs.
6. **Ask From Page**: Grounded Q&A targeted at the current document.

### 📖 4. Distraction-Free Reader Mode
- Strips away ads, banners, and clutter to render clean markdown text.
- **Key Highlights Bar**: Algorithmic sentence scoring surfaces the top highlights automatically.
- **Select-to-Explain**: Highlight any sentence or passage to trigger an instant contextual explanation card.
- Adjustable font size and quick resyncing.

### 📚 5. Study Library & Path Builder
- **Now Browsing**: High-level peek of your active tab's extracted text.
- **Study Toggles**: Focus Mode (distraction blocker), Inline Notes, and AI Auto-Sync.
- **Curriculum Path Builder**: Track long-term learning goals (e.g. *"Learn React in 30 Days"*), visual progress bar, and interactive daily task checklist.
- **Academic Integrity Mode**: Enforces Socratic guidance — prevents direct answer copying and encourages step-by-step reasoning.
- **Discovery Deck**: Quick-launch educational resources (React, MDN, TypeScript, AI Docs, Flutter Docs).

---

## 🏗️ Architecture

```
apps/mobile/lib/
├── core/
│   ├── constants/app_constants.dart      # Search engines, discovery deck, extraction JS
│   ├── theme/app_theme.dart              # Glassmorphic dark/light UI palette
│   └── utils/text_helpers.dart           # Highlights derivation & URL formatting
├── models/
│   ├── bookmark_entry.dart               # Bookmarks data model
│   ├── chat_message.dart                 # AI chat message history
│   ├── history_entry.dart                # Browsing history records
│   ├── learning_path.dart                # Goals, milestones, and task checklists
│   ├── quick_tool.dart                   # One-tap learning tool definitions
│   ├── tab_session.dart                  # Web tab state & controller
│   └── user_settings.dart                # API keys, theme, search engine preferences
├── providers/
│   ├── browser_provider.dart             # Multi-tab lifecycle, JS extraction, reader mode
│   ├── library_provider.dart             # Learning path, study session toggles
│   ├── settings_provider.dart            # User preferences & API key state
│   └── tutor_provider.dart               # AI reasoning, chat history, quick actions
├── screens/
│   ├── ai_tutor_sheet.dart               # AI Tutor bottom sheet with model switcher
│   ├── bookmarks_screen.dart             # Bookmarks manager
│   ├── history_screen.dart               # Searchable browsing history
│   ├── home_browser_screen.dart          # Primary browser scaffold & bottom bar
│   ├── library_screen.dart               # Curriculum path builder & study toggles
│   ├── reader_mode_screen.dart           # Distraction-free article reader
│   └── settings_screen.dart              # API keys and search engine settings
├── services/
│   ├── ai_service.dart                   # Gemini & OpenAI HTTP API integration
│   └── storage_service.dart              # SharedPreferences persistence
└── widgets/
    ├── address_bar.dart                  # URL input & reader mode action
    ├── glass_card.dart                   # Frosted glassmorphism container
    ├── interactive_flashcards_sheet.dart # Flippable flashcard deck
    ├── interactive_quiz_sheet.dart       # Multiple-choice quiz dialog
    ├── quick_tools_sheet.dart            # Learning tools bottom sheet
    ├── search_grid.dart                  # Default new-tab search engine portals
    └── tab_strip_bar.dart                # Horizontal tab strip & tabs modal trigger
```

---

## 🚀 Getting Started

### Prerequisites
- [Flutter SDK](https://flutter.dev) (v3.41+ or later)
- Android SDK / Xcode for mobile emulation or physical device testing

### Installation & Run

1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile
   ```

2. Fetch dependencies:
   ```bash
   flutter pub get
   ```

3. Run on your connected device or simulator:
   ```bash
   flutter run
   ```

4. Run tests:
   ```bash
   flutter test
   ```

---

## 🔑 Setting up API Keys

To use the AI Tutor with Gemini or OpenAI:
1. Tap the three-dot overflow menu (⋮) in the bottom-right corner.
2. Select **Settings & AI**.
3. Choose your default AI provider (**Gemini** or **OpenAI**) and enter your API key.
4. Your keys are securely stored locally on your device using encrypted `SharedPreferences`.
