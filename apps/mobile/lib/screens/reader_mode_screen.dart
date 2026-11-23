import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';
import '../providers/browser_provider.dart';
import '../providers/tutor_provider.dart';
import '../providers/settings_provider.dart';
import '../widgets/glass_card.dart';

class ReaderModeScreen extends StatefulWidget {
  final VoidCallback onOpenAiTutor;

  const ReaderModeScreen({super.key, required this.onOpenAiTutor});

  @override
  State<ReaderModeScreen> createState() => _ReaderModeScreenState();
}

class _ReaderModeScreenState extends State<ReaderModeScreen> {
  String _selectedText = "";
  double _fontSize = 16.0;

  @override
  Widget build(BuildContext context) {
    final browser = context.watch<BrowserProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "READER MODE",
              style: TextStyle(
                fontSize: 10,
                letterSpacing: 2,
                fontWeight: FontWeight.w800,
                color: Color(0xFF3B82F6),
              ),
            ),
            Text(
              browser.readerTitle.isNotEmpty
                  ? browser.readerTitle
                  : "Reader View",
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.format_size, size: 20),
            tooltip: "Adjust text size",
            onPressed: () {
              setState(() {
                _fontSize = _fontSize == 16.0 ? 18.0 : (_fontSize == 18.0 ? 20.0 : 16.0);
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.sync, size: 20),
            tooltip: "Resync page text",
            onPressed: () => browser.toggleReaderMode(),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 20),
            tooltip: "Close Reader Mode",
            onPressed: () => browser.toggleReaderMode(),
          ),
        ],
      ),
      body: browser.readerLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text("Extracting clean article content..."),
                ],
              ),
            )
          : Stack(
              children: [
                SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Highlights Bar if any
                      if (browser.readerHighlights.isNotEmpty) ...[
                        GlassCard(
                          padding: const EdgeInsets.all(14),
                          borderRadius: 16,
                          backgroundColor: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.auto_awesome,
                                      color: Color(0xFF3B82F6), size: 16),
                                  SizedBox(width: 6),
                                  Text(
                                    "KEY HIGHLIGHTS",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1,
                                      color: Color(0xFF3B82F6),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              ...browser.readerHighlights.take(3).map((h) => Padding(
                                    padding: const EdgeInsets.only(bottom: 4),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text("• ",
                                            style: TextStyle(
                                                fontWeight: FontWeight.bold)),
                                        Expanded(
                                          child: Text(
                                            h,
                                            style: TextStyle(
                                              fontSize: 12,
                                              height: 1.3,
                                              color: isDark
                                                  ? Colors.white70
                                                  : Colors.black87,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  )),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Selectable Reader Content
                      SelectableRegion(
                        focusNode: FocusNode(),
                        selectionControls: materialTextSelectionControls,
                        onSelectionChanged: (selectedText) {
                          final text = selectedText?.plainText.trim() ?? '';
                          if (text.length > 5) {
                            setState(() {
                              _selectedText = text;
                            });
                          }
                        },
                        child: MarkdownBody(
                          data: browser.readerContent,
                          styleSheet: MarkdownStyleSheet.fromTheme(
                            Theme.of(context),
                          ).copyWith(
                            p: TextStyle(
                              fontSize: _fontSize,
                              height: 1.6,
                              color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF1E293B),
                            ),
                            h1: TextStyle(
                              fontSize: _fontSize + 8,
                              fontWeight: FontWeight.bold,
                              height: 1.3,
                            ),
                            h2: TextStyle(
                              fontSize: _fontSize + 5,
                              fontWeight: FontWeight.bold,
                              height: 1.3,
                            ),
                            h3: TextStyle(
                              fontSize: _fontSize + 2,
                              fontWeight: FontWeight.w600,
                              height: 1.3,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Floating Action if text is selected
                if (_selectedText.isNotEmpty)
                  Positioned(
                    bottom: 24,
                    left: 20,
                    right: 20,
                    child: GlassCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      borderRadius: 20,
                      backgroundColor: const Color(0xFF1E293B).withValues(alpha: 0.95),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  "SELECTED PASSAGE",
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF3B82F6),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '"$_selectedText"',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton.icon(
                            onPressed: () {
                              final textToExplain = _selectedText;
                              setState(() {
                                _selectedText = "";
                              });
                              widget.onOpenAiTutor();
                              final settings = context.read<SettingsProvider>().settings;
                              context.read<TutorProvider>().sendMessage(
                                    text: "Please explain this passage simply:\n\n\"$textToExplain\"",
                                    settings: settings,
                                    pageContext: {
                                      'title': browser.readerTitle,
                                      'content': browser.readerContent,
                                    },
                                  );
                            },
                            icon: const Icon(Icons.school, size: 16),
                            label: const Text("Explain This"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF3B82F6),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
