import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/chat_message.dart';
import '../models/quick_tool.dart';
import '../models/user_settings.dart';
import '../services/ai_service.dart';

class TutorProvider with ChangeNotifier {
  final AiService _aiService;
  final Uuid _uuid = const Uuid();

  final List<ChatMessage> _messages = [
    ChatMessage(
      id: "seed-greeting",
      role: MessageRole.ai,
      text:
          "Hello! I'm your **EduAI Tutor**. I can analyze the page you're reading, explain tricky concepts, quiz you, or create flashcards. Tap **Read Page** or ask me anything!",
    ),
  ];

  bool _isThinking = false;
  String? _pendingToolAction;

  TutorProvider(this._aiService);

  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isThinking => _isThinking;
  String? get pendingToolAction => _pendingToolAction;

  Future<void> sendMessage({
    required String text,
    required UserSettings settings,
    Map<String, String>? pageContext,
  }) async {
    if (text.trim().isEmpty) return;

    final userMessage = ChatMessage(
      id: _uuid.v4(),
      role: MessageRole.user,
      text: text.trim(),
      contextTitle: pageContext?['title'],
    );
    _messages.add(userMessage);
    _isThinking = true;
    notifyListeners();

    try {
      final responseText = await _aiService.sendMessage(
        history: _messages,
        prompt: userMessage.text,
        settings: settings,
        pageContext: pageContext,
      );

      final aiMessage = ChatMessage(
        id: _uuid.v4(),
        role: MessageRole.ai,
        text: responseText,
      );
      _messages.add(aiMessage);
    } catch (e) {
      _messages.add(ChatMessage(
        id: _uuid.v4(),
        role: MessageRole.ai,
        text: "⚠️ Something went wrong processing your request: $e",
      ));
    } finally {
      _isThinking = false;
      notifyListeners();
    }
  }

  Future<void> executeQuickTool({
    required QuickToolType toolType,
    required String title,
    required String content,
    required UserSettings settings,
  }) async {
    String userQuery = "";
    String systemPrompt = "";

    switch (toolType) {
      case QuickToolType.summarize:
        userQuery = "Summarize: $title";
        systemPrompt =
            "Provide a clear, structured summary of the key ideas, findings, and conclusions of this content.";
        break;
      case QuickToolType.explain:
        userQuery = "Explain this page: $title";
        systemPrompt =
            "Explain the concepts on this page in simple terms for a student. Use analogies and break down complex jargon.";
        break;
      case QuickToolType.keypoints:
        userQuery = "Key points for: $title";
        systemPrompt =
            "Extract the most important key points and takeaways from this page as a bulleted checklist.";
        break;
      case QuickToolType.quiz:
        userQuery = "Generate a quiz for: $title";
        systemPrompt =
            "Based on the content, create a 5-question multiple choice quiz to test understanding. Include question options (A, B, C, D) and specify the correct answers with explanations at the end.";
        break;
      case QuickToolType.flashcards:
        userQuery = "Create flashcards for: $title";
        systemPrompt =
            "Create 5-8 flashcards covering the core vocabulary and concepts in this content. Format each flashcard as:\n**Front:** [Concept]\n**Back:** [Explanation/Definition]";
        break;
      case QuickToolType.context:
        userQuery = "Analyze page context: $title";
        systemPrompt =
            "Give me an overview of what this page is about and suggest 3 high-yield questions I should ask about it.";
        break;
    }

    _pendingToolAction = userQuery;
    notifyListeners();

    await sendMessage(
      text: systemPrompt,
      settings: settings,
      pageContext: {'title': title, 'content': content},
    );

    _pendingToolAction = null;
    notifyListeners();
  }

  void clearChat() {
    _messages.clear();
    _messages.add(
      ChatMessage(
        id: _uuid.v4(),
        role: MessageRole.ai,
        text: "Chat cleared. What topic are you studying right now?",
      ),
    );
    notifyListeners();
  }
}
