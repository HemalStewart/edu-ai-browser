import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/chat_message.dart';
import '../models/user_settings.dart';

class AiService {
  static const String _defaultGeminiModel = 'gemini-2.5-flash';
  static const String _defaultOpenAiModel = 'gpt-4o-mini';

  Future<String> sendMessage({
    required List<ChatMessage> history,
    required String prompt,
    required UserSettings settings,
    Map<String, String>? pageContext,
    bool forceIntegrity = false,
  }) async {
    final isGemini = settings.aiProvider == 'gemini';

    String systemInstruction = "";
    if (settings.integrityMode || forceIntegrity) {
      systemInstruction =
          "You are an educational AI tutor operating in Academic Integrity Mode. "
          "Do not give direct answers or write homework solutions directly. "
          "Instead, explain concepts step-by-step, use analogies, ask guiding questions, "
          "and help the student think through the solution themselves.\n\n";
    }

    String contextualPrompt = prompt;
    if (pageContext != null &&
        pageContext['content'] != null &&
        pageContext['content']!.isNotEmpty) {
      final title = pageContext['title'] ?? 'Current Page';
      final content = pageContext['content']!;
      final truncated = content.length > 10000 ? content.substring(0, 10000) : content;
      contextualPrompt =
          "${systemInstruction}Context from current page ($title):\n$truncated\n\nStudent Question / Instruction:\n$prompt";
    } else if (systemInstruction.isNotEmpty) {
      contextualPrompt = "$systemInstruction$prompt";
    }

    if (isGemini) {
      return _callGemini(history, contextualPrompt, settings);
    } else {
      return _callOpenAi(history, contextualPrompt, settings);
    }
  }

  Future<String> _callGemini(
    List<ChatMessage> history,
    String finalPrompt,
    UserSettings settings,
  ) async {
    final apiKey = settings.geminiApiKey.trim();
    if (apiKey.isEmpty) {
      return "⚠️ Gemini API Key not configured.\n\nPlease open **Settings** (⚙️) and enter your Google Gemini API key to enable the AI Tutor.";
    }

    final model = settings.geminiModel.isNotEmpty
        ? settings.geminiModel
        : _defaultGeminiModel;

    final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey',
    );

    // Build contents
    final contents = <Map<String, dynamic>>[];

    // Add prior history (excluding introductory system greetings)
    for (final msg in history) {
      if (msg.role == MessageRole.user) {
        contents.add({
          "role": "user",
          "parts": [
            {"text": msg.text}
          ]
        });
      } else if (msg.role == MessageRole.ai) {
        contents.add({
          "role": "model",
          "parts": [
            {"text": msg.text}
          ]
        });
      }
    }

    // Add current prompt
    contents.add({
      "role": "user",
      "parts": [
        {"text": finalPrompt}
      ]
    });

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({"contents": contents}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final candidates = data['candidates'] as List?;
        if (candidates != null && candidates.isNotEmpty) {
          final parts = candidates[0]['content']?['parts'] as List?;
          if (parts != null && parts.isNotEmpty) {
            return parts[0]['text'] as String? ?? "No response generated.";
          }
        }
        return "I received an empty response from the AI.";
      } else {
        final error = jsonDecode(response.body)['error']?['message'] ?? response.body;
        return "⚠️ Gemini API Error (${response.statusCode}): $error";
      }
    } catch (e) {
      return "⚠️ Connection error contacting Gemini: $e";
    }
  }

  Future<String> _callOpenAi(
    List<ChatMessage> history,
    String finalPrompt,
    UserSettings settings,
  ) async {
    final apiKey = settings.openAiApiKey.trim();
    if (apiKey.isEmpty) {
      return "⚠️ OpenAI API Key not configured.\n\nPlease open **Settings** (⚙️) and enter your OpenAI API key, or switch to Gemini.";
    }

    final model = settings.openAiModel.isNotEmpty
        ? settings.openAiModel
        : _defaultOpenAiModel;

    final url = Uri.parse('https://api.openai.com/v1/chat/completions');

    final messages = <Map<String, dynamic>>[];
    for (final msg in history) {
      if (msg.role == MessageRole.user) {
        messages.add({"role": "user", "content": msg.text});
      } else if (msg.role == MessageRole.ai) {
        messages.add({"role": "assistant", "content": msg.text});
      }
    }
    messages.add({"role": "user", "content": finalPrompt});

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $apiKey',
        },
        body: jsonEncode({
          "model": model,
          "messages": messages,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final choices = data['choices'] as List?;
        if (choices != null && choices.isNotEmpty) {
          return choices[0]['message']?['content'] as String? ??
              "No response generated.";
        }
        return "I received an empty response from OpenAI.";
      } else {
        final error = jsonDecode(response.body)['error']?['message'] ?? response.body;
        return "⚠️ OpenAI API Error (${response.statusCode}): $error";
      }
    } catch (e) {
      return "⚠️ Connection error contacting OpenAI: $e";
    }
  }
}
