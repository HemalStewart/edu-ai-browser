import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/library_provider.dart';
import '../providers/browser_provider.dart';
import '../core/constants/app_constants.dart';
import '../widgets/glass_card.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final library = context.watch<LibraryProvider>();
    final browser = context.watch<BrowserProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeTab = browser.activeTab;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Study Library & Learning Path"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Now Browsing Card
            if (activeTab != null && !activeTab.isNewTab) ...[
              GlassCard(
                borderRadius: 20,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "NOW BROWSING",
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2,
                        color: Color(0xFF3B82F6),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      activeTab.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      activeTab.peek.isNotEmpty
                          ? activeTab.peek
                          : "Tap 'Read Page' in AI Tutor to sync context.",
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white60 : Colors.black54,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Study Session Toggles
            GlassCard(
              borderRadius: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "STUDY SESSION TOGGLES",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2,
                      color: Color(0xFF8B5CF6),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text("Focus Mode",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    subtitle: const Text("Hide non-essential distractions",
                        style: TextStyle(fontSize: 12)),
                    value: library.focusMode,
                    activeTrackColor: const Color(0xFF3B82F6),
                    onChanged: (_) => library.toggleFocusMode(),
                  ),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text("Inline Notes",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    subtitle: const Text("Enable contextual annotations on pages",
                        style: TextStyle(fontSize: 12)),
                    value: library.notesEnabled,
                    activeTrackColor: const Color(0xFF8B5CF6),
                    onChanged: (_) => library.toggleNotes(),
                  ),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text("AI Auto-Sync",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    subtitle: const Text("Keep AI Tutor updated with current page text",
                        style: TextStyle(fontSize: 12)),
                    value: library.aiSyncEnabled,
                    activeTrackColor: const Color(0xFF10B981),
                    onChanged: (_) => library.toggleAiSync(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Path Builder / Curriculum
            GlassCard(
              borderRadius: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "PATH BUILDER",
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 2,
                          color: Color(0xFF10B981),
                        ),
                      ),
                      Text(
                        "${library.learningPath.progress}% Complete",
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    library.learningPath.goal,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    library.learningPath.timeline,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: library.learningPath.progress / 100.0,
                      minHeight: 8,
                      backgroundColor: isDark ? Colors.white12 : Colors.black12,
                      valueColor:
                          const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "Today's Study Checklist",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  ...List.generate(library.learningPath.tasks.length, (index) {
                    final task = library.learningPath.tasks[index];
                    return CheckboxListTile.adaptive(
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      controlAffinity: ListTileControlAffinity.leading,
                      title: Text(
                        task.label,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          decoration:
                              task.isCompleted ? TextDecoration.lineThrough : null,
                        ),
                      ),
                      subtitle: Text(task.detail, style: const TextStyle(fontSize: 11)),
                      value: task.isCompleted,
                      activeColor: const Color(0xFF10B981),
                      onChanged: (_) => library.toggleTask(index),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Academic Integrity & Compliance
            GlassCard(
              borderRadius: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "ACADEMIC INTEGRITY",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2,
                      color: Color(0xFFF59E0B),
                    ),
                  ),
                  const SizedBox(height: 10),
                  ...AppConstants.complianceFeatures.map((c) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                c['status']!,
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFF59E0B),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    c['title']!,
                                    style: const TextStyle(
                                        fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    c['description']!,
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: isDark ? Colors.white60 : Colors.black54,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
