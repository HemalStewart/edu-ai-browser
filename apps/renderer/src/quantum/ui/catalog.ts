/**
 * The Quantum suite catalog: every tool, in one place.
 *
 * This is the single source of truth read by the hub website (app pages, downloads),
 * the shared app switcher in every tool, the Quantum ID profile (which apps a user has),
 * and the right-side assistant (each tool's `assistantGuide` primes the chat).
 *
 * `devUrl` follows the suite's local port convention (31xx). In production each tool
 * gets its own URL via the `QUANTUM_<SLUG>_URL` environment variable on the hub.
 */

export type ToolCategory = "Learn" | "Create" | "Teach" | "Communicate" | "Assist";
export type ToolPlatform = "desktop" | "web";

export interface QuantumTool {
  /** Stable id used in URLs, tokens and the profile. */
  slug: string;
  name: string;
  /** One short line, shown under the name. */
  tagline: string;
  /** Two or three sentences for the app page. */
  description: string;
  category: ToolCategory;
  /** Short monogram shown on the app tile (2 letters). */
  mark: string;
  /** Folder in "Sameera's Projects". */
  repoDir: string;
  /** GitHub repository (owner/name). */
  github: string;
  devUrl: string;
  platforms: ToolPlatform[];
  features: string[];
  /** What the right-side assistant should know about using this tool. */
  assistantGuide: string;
}

export const QUANTUM_TOOLS: QuantumTool[] = [
  {
    slug: "mind",
    name: "Quantum Mind",
    tagline: "AI study browser",
    description:
      "A focused study browser with an omnibox, reader mode and an AI tutor that is grounded in the pages you have open.",
    category: "Learn",
    mark: "Mi",
    repoDir: "edu-ai-browser",
    github: "HemalStewart/edu-ai-browser",
    devUrl: "http://localhost:3101",
    platforms: ["desktop"],
    features: ["Tabs with reader mode", "AI tutor that reads the page", "Quizzes, summaries and flashcards from any page", "History and bookmarks"],
    assistantGuide:
      "Quantum Mind is a study browser. Users open pages in tabs, switch on Reader mode for clean text, and use the AI tutor to summarise, explain, quiz or make flashcards from the current page. History and Bookmarks are in the left rail.",
  },
  {
    slug: "live",
    name: "Quantum Live",
    tagline: "Live classes and meetings",
    description: "Schedule and run live classes with video, screen sharing and chat, built for teachers and study groups.",
    category: "Communicate",
    mark: "Li",
    repoDir: "zoom-clone-main",
    github: "HemalStewart/zoom-clone-main",
    devUrl: "http://localhost:3102",
    platforms: ["desktop", "web"],
    features: ["Instant and scheduled meetings", "Screen sharing", "Recordings", "Personal meeting room"],
    assistantGuide:
      "Quantum Live runs video meetings. Users start an instant meeting, schedule one for later, join with a link, and find recordings in the Recordings section.",
  },
  {
    slug: "intelligence",
    name: "Quantum Intelligence",
    tagline: "AI chat assistant",
    description: "A general AI assistant for studying and work, with saved conversations and focused modes.",
    category: "Assist",
    mark: "In",
    repoDir: "chat-bot",
    github: "HemalStewart/chat-bot",
    devUrl: "http://localhost:3103",
    platforms: ["desktop", "web"],
    features: ["Saved conversations", "Model selection", "Markdown and code answers", "Prompt shortcuts"],
    assistantGuide:
      "Quantum Intelligence is a chat assistant. Users start a new chat, pick a model, and revisit earlier chats from the history list.",
  },
  {
    slug: "short-notes",
    name: "Quantum Studio Short Notes",
    tagline: "Short notes from any lesson",
    description: "Turn lessons, PDFs and videos into concise, well-structured short notes you can revise from.",
    category: "Learn",
    mark: "Sn",
    repoDir: "quantum-short-notes",
    github: "HemalStewart/quantum-short-notes",
    devUrl: "http://localhost:3104",
    platforms: ["desktop", "web"],
    features: ["Notes from text, PDF or video", "Section-by-section actions", "Export and share", "Revision mode"],
    assistantGuide:
      "Quantum Studio Short Notes creates short notes. Users start a new note, add a source (text, PDF or video), then refine each section with actions such as expand, simplify or add examples.",
  },
  {
    slug: "notes",
    name: "Quantum Notes",
    tagline: "Notebook grounded in your sources",
    description: "Collect sources into a notebook and ask questions, generate study guides and audio overviews from them.",
    category: "Learn",
    mark: "No",
    repoDir: "notebook-lm",
    github: "HemalStewart/notebook-lm",
    devUrl: "http://localhost:3105",
    platforms: ["desktop", "web"],
    features: ["Source-grounded answers", "Study guides", "Audio overviews", "Citations back to sources"],
    assistantGuide:
      "Quantum Notes is a source notebook. Users add sources on the left, ask questions in the middle, and generate study guides or audio overviews from the studio panel.",
  },
  {
    slug: "exam-hub",
    name: "Quantum Exam Hub",
    tagline: "Past papers and exam practice",
    description: "Browse past papers by subject and year, practise under timed conditions and review marked answers.",
    category: "Learn",
    mark: "Ex",
    repoDir: "exam-hub",
    github: "HemalStewart/exam-hub",
    devUrl: "http://localhost:3106",
    platforms: ["desktop", "web"],
    features: ["Paper library by subject and year", "Timed practice", "Marking schemes", "Progress tracking"],
    assistantGuide:
      "Quantum Exam Hub holds past papers. Users filter by subject and year, open a paper, practise it with a timer, and check answers against the marking scheme.",
  },
  {
    slug: "spoken",
    name: "Quantum Spoken English",
    tagline: "Speaking practice with an AI partner",
    description: "Practise spoken English in real conversations with instant feedback on pronunciation, grammar and fluency.",
    category: "Learn",
    mark: "Sp",
    repoDir: "VoiceAgent",
    github: "HemalStewart/VoiceAgent",
    devUrl: "http://localhost:3107",
    platforms: ["desktop"],
    features: ["Voice conversations", "Pronunciation feedback", "Scenario practice", "Progress history"],
    assistantGuide:
      "Quantum Spoken English is a speaking coach. Users pick a scenario, press the microphone to talk, and read feedback on pronunciation, grammar and fluency after each turn.",
  },
  {
    slug: "video-compiler",
    name: "Quantum Video Compiler",
    tagline: "Lesson videos from scripts",
    description: "Turn a lesson script into a narrated teaching video with slides, voice-over and captions.",
    category: "Teach",
    mark: "Vc",
    repoDir: "ai-teacher-video-compiler",
    github: "HemalStewart/ai-teacher-video-compiler",
    devUrl: "http://localhost:3108",
    platforms: ["desktop"],
    features: ["Script to scenes", "AI voice-over", "Captions", "Export to MP4"],
    assistantGuide:
      "Quantum Video Compiler makes lesson videos. Users paste or write a script, review the generated scenes, choose a voice, then render and export the video.",
  },
  {
    slug: "quiz",
    name: "Quantum Quiz",
    tagline: "Quizzes and assessments",
    description: "Create quizzes, assign them to classes and see results, or practise as a student with instant feedback.",
    category: "Teach",
    mark: "Qz",
    repoDir: "education-ai-platform",
    github: "HemalStewart/education-ai-platform",
    devUrl: "http://localhost:3109",
    platforms: ["desktop", "web"],
    features: ["AI-generated questions", "Assign to classes", "Instant marking", "Results analytics"],
    assistantGuide:
      "Quantum Quiz builds and runs quizzes. Teachers create a quiz (manually or with AI), assign it to a class and review results; students take quizzes and see feedback immediately.",
  },
  {
    slug: "planner",
    name: "Quantum Planner",
    tagline: "Study schedules that adapt",
    description: "Plan study time around your exams and classes, run focus sessions and keep notes and mind maps per subject.",
    category: "Learn",
    mark: "Pl",
    repoDir: "quantum-study-planner",
    github: "HemalStewart/quantum-study-planner",
    devUrl: "http://localhost:3110",
    platforms: ["desktop", "web"],
    features: ["Smart weekly schedule", "Focus sessions", "Subject notes", "Mind maps"],
    assistantGuide:
      "Quantum Planner schedules study. Users add subjects and exam dates during onboarding, review the generated schedule, start focus sessions from Study, and keep notes or mind maps per subject.",
  },
  {
    slug: "research",
    name: "Quantum Research",
    tagline: "University research assistant",
    description: "Search papers, organise references and draft literature reviews with citations you can trust.",
    category: "Learn",
    mark: "Re",
    repoDir: "quantum-research",
    github: "HemalStewart/quantum-research",
    devUrl: "http://localhost:3111",
    platforms: ["desktop", "web"],
    features: ["Paper search", "Reference library", "Literature review drafts", "Citation export"],
    assistantGuide:
      "Quantum Research helps with academic research. Users search for papers, save them to a library, and draft literature reviews with citations.",
  },
  {
    slug: "dictionary",
    name: "Quantum Dictionary",
    tagline: "Smart dictionary and language coach",
    description: "Look up words with examples and pronunciation, then practise reading, writing and speaking around them.",
    category: "Learn",
    mark: "Di",
    repoDir: "quantum-smart-dictionary",
    github: "HemalStewart/quantum-smart-dictionary",
    devUrl: "http://localhost:3112",
    platforms: ["desktop", "web"],
    features: ["Definitions and examples", "Pronunciation practice", "Vocabulary graph", "Word quizzes"],
    assistantGuide:
      "Quantum Dictionary looks up words. Users search a word, listen to pronunciation, save it, and practise it in the Pronounce, Speaking, Writing, Reading and Quiz sections.",
  },
  {
    slug: "mindmap",
    name: "Quantum Mind Map",
    tagline: "Mind maps from your notes",
    description: "Build mind maps by hand or generate them from notes and documents, then present or export them.",
    category: "Create",
    mark: "Mm",
    repoDir: "quantum-mindmap-studio",
    github: "HemalStewart/quantum-mindmap-studio",
    devUrl: "http://localhost:3113",
    platforms: ["desktop", "web"],
    features: ["Infinite canvas", "Generate from text", "Themes and layouts", "Export to image or PDF"],
    assistantGuide:
      "Quantum Mind Map builds mind maps. Users add nodes on the canvas or generate a map from text, rearrange branches, then export or present it.",
  },
  {
    slug: "workspace",
    name: "Quantum Workspace",
    tagline: "Read, annotate and reshape PDFs",
    description: "A PDF workspace: open documents in tabs, annotate them, merge, split, rotate, watermark and protect them, with an AI reading assistant beside the page.",
    category: "Create",
    mark: "Ws",
    repoDir: "quantum-smart-workspace",
    github: "HemalStewart/quantum-smart-workspace",
    devUrl: "http://localhost:3114",
    platforms: ["desktop", "web"],
    features: ["Tabbed PDF viewer", "Annotations", "Merge, split, rotate, watermark", "AI reading assistant"],
    assistantGuide:
      "Quantum Workspace is a PDF workspace. Users open or create PDFs in tabs, annotate them, use the toolkit (merge, split, rotate, watermark, page numbers, password protection, images to PDF), and ask the AI reading assistant about the open document.",
  },
  {
    slug: "write",
    name: "Quantum Write",
    tagline: "AI writing assistant",
    description: "Real-time grammar, vocabulary and tone checks, academic writing modes, citations and plagiarism checks.",
    category: "Create",
    mark: "Wr",
    repoDir: "quantum-writing-ai",
    github: "HemalStewart/quantum-writing-ai",
    devUrl: "http://localhost:3115",
    platforms: ["desktop", "web"],
    features: ["Grammar and tone checks", "Academic modes", "Citation assistant", "Integrity checks"],
    assistantGuide:
      "Quantum Write checks writing. Users paste or type text in the Smart Editor, review suggestions, switch to Academic Studio for academic modes and citations, and run checks in the Integrity lab.",
  },
  {
    slug: "chat",
    name: "Quantum Chat",
    tagline: "Messaging for classes and teams",
    description: "Direct and group messaging with media sharing, built for classes, study groups and staff.",
    category: "Communicate",
    mark: "Ch",
    repoDir: "whatsapp-clone-master",
    github: "HemalStewart/whatsapp-clone-master",
    devUrl: "http://localhost:3116",
    platforms: ["desktop", "web"],
    features: ["Direct and group chats", "Media sharing", "Read receipts", "Search"],
    assistantGuide:
      "Quantum Chat is a messenger. Users start a chat from the contacts list, create groups, and share files or images in a conversation.",
  },
  {
    slug: "jarvis",
    name: "Quantum Jarvis",
    tagline: "Voice assistant for the whole suite",
    description: "A voice and text assistant that plans tasks across Quantum tools, with approvals and a full audit trail.",
    category: "Assist",
    mark: "Ja",
    repoDir: "quantum-jarvis",
    github: "HemalStewart/quantum-jarvis",
    devUrl: "http://localhost:3117",
    platforms: ["desktop", "web"],
    features: ["Voice and text", "Task planning", "Approvals", "Workflow runs"],
    assistantGuide:
      "Quantum Jarvis is a voice assistant. Users press the Jarvis button to talk, review plans in Planner, approve actions in Approvals and watch runs in Workflows.",
  },
  {
    slug: "atlas",
    name: "Quantum Human Atlas",
    tagline: "3D human anatomy",
    description: "Explore the human body in 3D by system, isolate structures and learn with guided explanations.",
    category: "Learn",
    mark: "At",
    repoDir: "quantum-human-atlas-ai",
    github: "HemalStewart/quantum-human-atlas-ai",
    devUrl: "http://localhost:3118",
    platforms: ["desktop", "web"],
    features: ["Interactive 3D model", "Body systems", "Structure inspector", "Exploded views"],
    assistantGuide:
      "Quantum Human Atlas shows 3D anatomy. Users pick a body system, click a structure to inspect it, rotate or explode the model, and ask questions about what they see.",
  },
  {
    slug: "lms",
    name: "Quantum LMS",
    tagline: "Courses for teachers",
    description: "Publish courses, manage students and track progress from one teacher dashboard.",
    category: "Teach",
    mark: "Lm",
    repoDir: "LMS",
    github: "Shuvouits/YouTubeLMS",
    devUrl: "http://localhost:3119",
    platforms: ["web"],
    features: ["Course builder", "Student management", "Progress tracking", "Site settings"],
    assistantGuide:
      "Quantum LMS manages courses. Teachers create courses and lessons, enrol students, and track progress from the dashboard.",
  },
];

export const QUANTUM_CATEGORIES: ToolCategory[] = ["Learn", "Create", "Teach", "Communicate", "Assist"];

export function getTool(slug: string): QuantumTool | undefined {
  return QUANTUM_TOOLS.find((t) => t.slug === slug);
}
