import 'package:flutter/material.dart';
import '../widgets/glass_card.dart';

class QuizQuestion {
  final String question;
  final List<String> options;
  final String answer;

  const QuizQuestion({
    required this.question,
    required this.options,
    required this.answer,
  });
}

class InteractiveQuizSheet extends StatefulWidget {
  final List<QuizQuestion> questions;

  const InteractiveQuizSheet({super.key, required this.questions});

  @override
  State<InteractiveQuizSheet> createState() => _InteractiveQuizSheetState();

  static List<QuizQuestion> parseFromMarkdown(String text) {
    final List<QuizQuestion> questions = [];
    final lines = text.split('\n');

    String currentQuestion = '';
    List<String> currentOptions = [];
    String currentAnswer = '';

    for (var line in lines) {
      final trimmed = line.trim();

      // Check question match: "1. What is..." or "### Question 1: ..."
      final qMatch = RegExp(r'^(?:(?:\d+\.|\#\#\# Question \d+:?))\s*(.*)', caseSensitive: false)
          .firstMatch(trimmed);
      // Check option match: "a) ...", "A. ...", "- [ ] A) ..."
      final optMatch = RegExp(r'^(?:[-*]\s*)?[a-dA-D][\)\.]\s*(.*)').firstMatch(trimmed);
      // Check answer match: "Answer: A" or "**Answer:** B"
      final ansMatch = RegExp(r'^(?:\*\*)?Answer:?(?:\*\*)?\s*([a-dA-D])', caseSensitive: false)
          .firstMatch(trimmed);

      if (qMatch != null) {
        if (currentQuestion.isNotEmpty && currentOptions.isNotEmpty) {
          questions.add(QuizQuestion(
            question: currentQuestion,
            options: List.from(currentOptions),
            answer: currentAnswer,
          ));
          currentOptions.clear();
          currentAnswer = '';
        }
        currentQuestion = qMatch.group(1)?.trim() ?? '';
      } else if (optMatch != null) {
        currentOptions.add(trimmed);
      } else if (ansMatch != null) {
        currentAnswer = ansMatch.group(1)?.toUpperCase() ?? '';
      }
    }

    if (currentQuestion.isNotEmpty && currentOptions.isNotEmpty) {
      questions.add(QuizQuestion(
        question: currentQuestion,
        options: currentOptions,
        answer: currentAnswer,
      ));
    }

    return questions;
  }
}

class _InteractiveQuizSheetState extends State<InteractiveQuizSheet> {
  final Map<int, int> _selectedOptions = {};
  bool _submitted = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final total = widget.questions.length;

    int score = 0;
    if (_submitted) {
      for (int i = 0; i < total; i++) {
        final q = widget.questions[i];
        final selectedIndex = _selectedOptions[i];
        if (selectedIndex != null && selectedIndex < q.options.length) {
          final optText = q.options[selectedIndex].toUpperCase();
          if (q.answer.isNotEmpty && optText.contains(q.answer)) {
            score++;
          }
        }
      }
    }

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag handle
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
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Interactive Quiz ($total Questions)",
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          if (_submitted) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.emoji_events, color: Color(0xFF10B981), size: 28),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Quiz Completed!",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      Text(
                        "Your Score: $score / $total (${((score / total) * 100).round()}%)",
                        style: const TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          Expanded(
            child: ListView.separated(
              itemCount: total,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, qIndex) {
                final q = widget.questions[qIndex];
                final selected = _selectedOptions[qIndex];

                return GlassCard(
                  borderRadius: 18,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "${qIndex + 1}. ${q.question}",
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...List.generate(q.options.length, (optIndex) {
                        final option = q.options[optIndex];
                        final isSelected = selected == optIndex;
                        Color? optionColor;

                        if (_submitted) {
                          final isCorrect = q.answer.isNotEmpty &&
                              option.toUpperCase().contains(q.answer);
                          if (isCorrect) {
                            optionColor = const Color(0xFF10B981).withValues(alpha: 0.2);
                          } else if (isSelected) {
                            optionColor = const Color(0xFFEF4444).withValues(alpha: 0.2);
                          }
                        }

                        return InkWell(
                          onTap: _submitted
                              ? null
                              : () {
                                  setState(() {
                                    _selectedOptions[qIndex] = optIndex;
                                  });
                                },
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: optionColor ??
                                  (isSelected
                                      ? const Color(0xFF3B82F6).withValues(alpha: 0.15)
                                      : Colors.transparent),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected
                                    ? const Color(0xFF3B82F6)
                                    : (isDark ? Colors.white12 : Colors.black12),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isSelected
                                      ? Icons.radio_button_checked
                                      : Icons.radio_button_off,
                                  size: 18,
                                  color: isSelected
                                      ? const Color(0xFF3B82F6)
                                      : (isDark ? Colors.white38 : Colors.black38),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    option,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: isSelected
                                          ? FontWeight.w600
                                          : FontWeight.normal,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                setState(() {
                  _submitted = !_submitted;
                  if (!_submitted) _selectedOptions.clear();
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3B82F6),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: Text(
                _submitted ? "Retake Quiz" : "Submit Answers",
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
