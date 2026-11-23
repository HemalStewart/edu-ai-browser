import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/utils/text_helpers.dart';
import 'package:mobile/models/user_settings.dart';
import 'package:mobile/models/learning_path.dart';
import 'package:mobile/models/chat_message.dart';
import 'package:mobile/widgets/interactive_flashcards_sheet.dart';
import 'package:mobile/widgets/interactive_quiz_sheet.dart';

void main() {
  group('TextHelpers Tests', () {
    test('formatUrlLabel extracts host without www', () {
      expect(TextHelpers.formatUrlLabel('https://www.google.com/search?q=test'), 'google.com');
      expect(TextHelpers.formatUrlLabel('https://react.dev/learn'), 'react.dev');
      expect(TextHelpers.formatUrlLabel('about:blank'), 'New Tab');
      expect(TextHelpers.formatUrlLabel(''), 'New Tab');
    });

    test('deriveHighlights extracts top scored sentences', () {
      const text =
          "React is a library for web and native user interfaces. "
          "It lets you build user interfaces out of individual pieces called components. "
          "Components can be combined and nested to build entire applications with rich state.";
      final highlights = TextHelpers.deriveHighlights(text);
      expect(highlights, isNotEmpty);
    });
  });

  group('Models Serialization Tests', () {
    test('UserSettings serialization & deserialization', () {
      final settings = UserSettings(
        geminiApiKey: 'test-key-123',
        defaultSearchEngine: 'duckduckgo',
        aiProvider: 'openai',
        integrityMode: true,
      );

      final json = settings.toJson();
      final restored = UserSettings.fromJson(json);

      expect(restored.geminiApiKey, 'test-key-123');
      expect(restored.defaultSearchEngine, 'duckduckgo');
      expect(restored.aiProvider, 'openai');
      expect(restored.integrityMode, true);
    });

    test('LearningPath serialization & progress calculation', () {
      final path = LearningPath.defaultPath();
      expect(path.tasks.length, 3);
      final json = path.toJson();
      final restored = LearningPath.fromJson(json);
      expect(restored.goal, path.goal);
      expect(restored.tasks.length, 3);
    });

    test('ChatMessage json conversion', () {
      final msg = ChatMessage(
        id: 'msg-1',
        role: MessageRole.ai,
        text: 'Test reply',
        contextTitle: 'React Docs',
      );
      final json = msg.toJson();
      final restored = ChatMessage.fromJson(json);
      expect(restored.id, 'msg-1');
      expect(restored.role, MessageRole.ai);
      expect(restored.text, 'Test reply');
      expect(restored.contextTitle, 'React Docs');
    });
  });

  group('Interactive Parser Tests', () {
    test('InteractiveFlashcardsSheet parses markdown flashcards', () {
      const md = """
Here are your flashcards:
Front: React Hook
Back: Special function that lets you use state and other React features.

Front: Virtual DOM
Back: In-memory representation of real DOM elements kept in sync by ReactDOM.
""";
      final cards = InteractiveFlashcardsSheet.parseFromMarkdown(md);
      expect(cards.length, 2);
      expect(cards[0].front, 'React Hook');
      expect(cards[0].back, 'Special function that lets you use state and other React features.');
      expect(cards[1].front, 'Virtual DOM');
    });

    test('InteractiveQuizSheet parses markdown quiz questions', () {
      const md = """
1. What is the primary purpose of useEffect?
a) Manage component styling
b) Synchronize with an external system
c) Cache values between renders
d) Directly mutate the DOM
Answer: B

2. Which hook holds mutable state?
a) useState
b) useMemo
c) useCallback
d) useId
Answer: A
""";
      final questions = InteractiveQuizSheet.parseFromMarkdown(md);
      expect(questions.length, 2);
      expect(questions[0].question, 'What is the primary purpose of useEffect?');
      expect(questions[0].options.length, 4);
      expect(questions[0].answer, 'B');
      expect(questions[1].answer, 'A');
    });
  });
}
