import 'package:flutter/material.dart';
import '../widgets/glass_card.dart';

class FlashcardItem {
  final String front;
  final String back;

  const FlashcardItem({required this.front, required this.back});
}

class InteractiveFlashcardsSheet extends StatefulWidget {
  final List<FlashcardItem> flashcards;

  const InteractiveFlashcardsSheet({
    super.key,
    required this.flashcards,
  });

  @override
  State<InteractiveFlashcardsSheet> createState() =>
      _InteractiveFlashcardsSheetState();

  static List<FlashcardItem> parseFromMarkdown(String text) {
    final List<FlashcardItem> items = [];
    final lines = text.split('\n');
    String currentFront = '';
    String currentBack = '';

    for (var line in lines) {
      final trimmed = line.trim();
      final frontMatch = RegExp(r'^(?:\*\*)?Front:?(?:\*\*)?\s*(.*)', caseSensitive: false)
          .firstMatch(trimmed);
      final backMatch = RegExp(r'^(?:\*\*)?Back:?(?:\*\*)?\s*(.*)', caseSensitive: false)
          .firstMatch(trimmed);

      if (frontMatch != null) {
        if (currentFront.isNotEmpty && currentBack.isNotEmpty) {
          items.add(FlashcardItem(front: currentFront, back: currentBack));
          currentBack = '';
        }
        currentFront = frontMatch.group(1)?.replaceAll('*', '').trim() ?? '';
      } else if (backMatch != null) {
        currentBack = backMatch.group(1)?.replaceAll('*', '').trim() ?? '';
      }
    }

    if (currentFront.isNotEmpty && currentBack.isNotEmpty) {
      items.add(FlashcardItem(front: currentFront, back: currentBack));
    }

    // Fallback if separator format Front: ... | Back: ... was used
    if (items.isEmpty) {
      for (var line in lines) {
        if (line.contains('|') && line.toLowerCase().contains('front:')) {
          final parts = line.split('|');
          if (parts.length >= 2) {
            final f = parts[0].replaceAll(RegExp(r'front:?', caseSensitive: false), '').replaceAll('*', '').trim();
            final b = parts[1].replaceAll(RegExp(r'back:?', caseSensitive: false), '').replaceAll('*', '').trim();
            if (f.isNotEmpty && b.isNotEmpty) {
              items.add(FlashcardItem(front: f, back: b));
            }
          }
        }
      }
    }

    return items;
  }
}

class _InteractiveFlashcardsSheetState
    extends State<InteractiveFlashcardsSheet> {
  int _currentIndex = 0;
  bool _isFlipped = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final total = widget.flashcards.length;

    if (total == 0) {
      return Container(
        padding: const EdgeInsets.all(24),
        child: const Text("No flashcards found in this message."),
      );
    }

    final card = widget.flashcards[_currentIndex];

    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
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
                "Flashcards (${_currentIndex + 1}/$total)",
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
          const SizedBox(height: 16),
          // Interactive Card
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _isFlipped = !_isFlipped;
                });
              },
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                transitionBuilder: (child, animation) {
                  return ScaleTransition(scale: animation, child: child);
                },
                child: GlassCard(
                  key: ValueKey(_isFlipped),
                  borderRadius: 24,
                  backgroundColor: _isFlipped
                      ? const Color(0xFF10B981).withValues(alpha: 0.15)
                      : const Color(0xFF3B82F6).withValues(alpha: 0.12),
                  border: Border.all(
                    color: _isFlipped
                        ? const Color(0xFF10B981).withValues(alpha: 0.4)
                        : const Color(0xFF3B82F6).withValues(alpha: 0.4),
                    width: 2,
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Center(
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: (_isFlipped
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFF3B82F6))
                                  .withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _isFlipped ? "ANSWER / EXPLANATION" : "QUESTION / CONCEPT",
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1,
                                color: _isFlipped
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFF3B82F6),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            _isFlipped ? card.back : card.front,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            "Tap card to flip",
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Navigation controls
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ElevatedButton.icon(
                onPressed: _currentIndex > 0
                    ? () {
                        setState(() {
                          _currentIndex--;
                          _isFlipped = false;
                        });
                      }
                    : null,
                icon: const Icon(Icons.arrow_back),
                label: const Text("Previous"),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              ElevatedButton.icon(
                onPressed: _currentIndex < total - 1
                    ? () {
                        setState(() {
                          _currentIndex++;
                          _isFlipped = false;
                        });
                      }
                    : null,
                icon: const Icon(Icons.arrow_forward),
                label: const Text("Next"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
