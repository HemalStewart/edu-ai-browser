import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';
import '../models/chat_message.dart';
import '../models/quick_tool.dart';
import '../providers/browser_provider.dart';
import '../providers/tutor_provider.dart';
import '../providers/settings_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/interactive_flashcards_sheet.dart';
import '../widgets/interactive_quiz_sheet.dart';

class AiTutorSheet extends StatefulWidget {
  const AiTutorSheet({super.key});

  @override
  State<AiTutorSheet> createState() => _AiTutorSheetState();
}

class _AiTutorSheetState extends State<AiTutorSheet> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    final tutor = context.read<TutorProvider>();
    final settings = context.read<SettingsProvider>().settings;
    final browser = context.read<BrowserProvider>();

    _textController.clear();

    Map<String, String>? contextMap;
    if (browser.activeTab != null && !browser.activeTab!.isNewTab) {
      contextMap = {
        'title': browser.activeTab!.title,
        'content': browser.activeTab!.peek,
      };
    }

    tutor.sendMessage(
      text: text,
      settings: settings,
      pageContext: contextMap,
    );
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final tutor = context.watch<TutorProvider>();
    final settings = context.watch<SettingsProvider>();
    final browser = context.watch<BrowserProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final providerLabel = settings.aiProvider == 'openai'
        ? "OpenAI (GPT-4o Mini)"
        : "Gemini (2.5 Flash)";

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag handle
          const SizedBox(height: 12),
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.black12,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF3B82F6),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      "AI Tutor",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    // Provider toggle pill
                    InkWell(
                      onTap: () => settings.toggleAiProvider(),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: const Color(0xFF3B82F6).withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              providerLabel,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF3B82F6),
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.sync_alt, size: 12, color: Color(0xFF3B82F6)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 20),
                      tooltip: "Clear Chat",
                      onPressed: () => tutor.clearChat(),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Active Page Context Bar
          if (browser.activeTab != null && !browser.activeTab!.isNewTab)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
              child: GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                borderRadius: 14,
                child: Row(
                  children: [
                    const Icon(Icons.link, size: 16, color: Color(0xFF10B981)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        "Grounded in: ${browser.activeTab!.title}",
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    InkWell(
                      onTap: () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final data = await browser.extractPageContext();
                        if (data != null) {
                          messenger.showSnackBar(
                            SnackBar(
                              content: Text("Synced context from: ${data['title']}"),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                      child: const Text(
                        "Sync",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF3B82F6),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          const Divider(height: 1),

          // Chat Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: tutor.messages.length + (tutor.isThinking ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == tutor.messages.length && tutor.isThinking) {
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: GlassCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      borderRadius: 18,
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          SizedBox(width: 10),
                          Text(
                            "Tutor is reasoning...",
                            style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                final msg = tutor.messages[index];
                final isUser = msg.role == MessageRole.user;

                // Check if message contains quiz or flashcard content
                final hasFlashcards = !isUser &&
                    (msg.text.contains("Front:") || msg.text.contains("front:"));
                final hasQuiz = !isUser &&
                    (msg.text.contains("Question") || msg.text.contains("Answer:"));

                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.85,
                    ),
                    decoration: BoxDecoration(
                      color: isUser
                          ? const Color(0xFF3B82F6)
                          : (isDark
                              ? const Color(0xFF1E293B)
                              : Colors.white),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(20),
                        topRight: const Radius.circular(20),
                        bottomLeft: isUser ? const Radius.circular(20) : const Radius.circular(4),
                        bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(20),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        MarkdownBody(
                          data: msg.text,
                          styleSheet: MarkdownStyleSheet.fromTheme(
                            Theme.of(context),
                          ).copyWith(
                            p: TextStyle(
                              fontSize: 14,
                              height: 1.45,
                              color: isUser
                                  ? Colors.white
                                  : (isDark ? const Color(0xFFE2E8F0) : const Color(0xFF1E293B)),
                            ),
                          ),
                        ),
                        // Interactive action buttons if parsed
                        if (hasFlashcards) ...[
                          const SizedBox(height: 10),
                          ElevatedButton.icon(
                            onPressed: () {
                              final cards =
                                  InteractiveFlashcardsSheet.parseFromMarkdown(msg.text);
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                builder: (_) =>
                                    InteractiveFlashcardsSheet(flashcards: cards),
                              );
                            },
                            icon: const Icon(Icons.style, size: 16),
                            label: const Text("Open Interactive Flashcards"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ],
                        if (hasQuiz) ...[
                          const SizedBox(height: 10),
                          ElevatedButton.icon(
                            onPressed: () {
                              final questions =
                                  InteractiveQuizSheet.parseFromMarkdown(msg.text);
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                builder: (_) =>
                                    InteractiveQuizSheet(questions: questions),
                              );
                            },
                            icon: const Icon(Icons.quiz, size: 16),
                            label: const Text("Take Interactive Quiz"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFF59E0B),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Quick Action Tools Carousel
          Container(
            height: 38,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: QuickTool.defaultTools.length,
              separatorBuilder: (context, index) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final tool = QuickTool.defaultTools[index];
                return ActionChip(
                  avatar: Icon(tool.icon, size: 14, color: tool.color),
                  label: Text(
                    tool.title,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  backgroundColor: isDark
                      ? Colors.white.withValues(alpha: 0.05)
                      : Colors.black.withValues(alpha: 0.04),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  onPressed: () async {
                    final page = await browser.extractPageContext();
                    final title = page?['title'] ?? browser.activeTab?.title ?? "Page";
                    final content = page?['content'] ?? "";

                    await tutor.executeQuickTool(
                      toolType: tool.type,
                      title: title,
                      content: content,
                      settings: settings.settings,
                    );
                    _scrollToBottom();
                  },
                );
              },
            ),
          ),

          // Input Bar
          Container(
            padding: EdgeInsets.fromLTRB(
              16,
              8,
              16,
              MediaQuery.of(context).viewInsets.bottom + 16,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark ? Colors.white12 : Colors.black12,
                      ),
                    ),
                    child: TextField(
                      controller: _textController,
                      onSubmitted: (_) => _sendMessage(),
                      style: const TextStyle(fontSize: 14),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Ask AI Tutor a question...",
                        hintStyle: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.white38 : Colors.black38,
                        ),
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: tutor.isThinking ? null : _sendMessage,
                  icon: const Icon(Icons.arrow_upward, size: 20),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF3B82F6),
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
