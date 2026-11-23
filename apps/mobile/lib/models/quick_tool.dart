import 'package:flutter/material.dart';

enum QuickToolType {
  summarize,
  explain,
  keypoints,
  quiz,
  flashcards,
  context,
}

class QuickTool {
  final QuickToolType type;
  final String title;
  final String detail;
  final String badge;
  final IconData icon;
  final Color color;

  const QuickTool({
    required this.type,
    required this.title,
    required this.detail,
    required this.badge,
    required this.icon,
    required this.color,
  });

  static const List<QuickTool> defaultTools = [
    QuickTool(
      type: QuickToolType.summarize,
      title: "Summarize Page",
      detail: "Concise TL;DR with key conclusions",
      badge: "Reader",
      icon: Icons.article_outlined,
      color: Color(0xFF38BDF8),
    ),
    QuickTool(
      type: QuickToolType.explain,
      title: "Explain for Me",
      detail: "Beginner-friendly breakdown with analogies",
      badge: "Tutor",
      icon: Icons.school_outlined,
      color: Color(0xFF34D399),
    ),
    QuickTool(
      type: QuickToolType.keypoints,
      title: "Key Points",
      detail: "Bullet points of major takeaways",
      badge: "Notes",
      icon: Icons.checklist_outlined,
      color: Color(0xFFA78BFA),
    ),
    QuickTool(
      type: QuickToolType.quiz,
      title: "Generate Quiz",
      detail: "Adaptive 5-question multiple choice drill",
      badge: "Assess",
      icon: Icons.quiz_outlined,
      color: Color(0xFFFBBF24),
    ),
    QuickTool(
      type: QuickToolType.flashcards,
      title: "Create Flashcards",
      detail: "Interactive cards for spaced repetition",
      badge: "Memory",
      icon: Icons.style_outlined,
      color: Color(0xFFF87171),
    ),
    QuickTool(
      type: QuickToolType.context,
      title: "Ask From Page",
      detail: "Ground questions directly in active text",
      badge: "Context",
      icon: Icons.psychology_outlined,
      color: Color(0xFF94A3B8),
    ),
  ];
}
