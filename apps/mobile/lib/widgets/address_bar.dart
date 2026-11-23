import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/browser_provider.dart';
import '../providers/settings_provider.dart';

class AddressBar extends StatefulWidget {
  final VoidCallback onReaderToggled;

  const AddressBar({
    super.key,
    required this.onReaderToggled,
  });

  @override
  State<AddressBar> createState() => _AddressBarState();
}

class _AddressBarState extends State<AddressBar> {
  late TextEditingController _controller;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final browser = context.watch<BrowserProvider>();
    final active = browser.activeTab;
    if (!_focusNode.hasFocus && active != null) {
      if (active.isNewTab) {
        if (_controller.text.isNotEmpty) _controller.text = "";
      } else {
        if (_controller.text != active.url) {
          _controller.text = active.url;
        }
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _submit() {
    final text = _controller.text.trim();
    if (text.isNotEmpty) {
      final settings = context.read<SettingsProvider>();
      context.read<BrowserProvider>().navigate(
            text,
            defaultEngine: settings.defaultSearchEngine,
          );
      _focusNode.unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final browser = context.watch<BrowserProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeTab = browser.activeTab;
    final isBookmarked = browser.isCurrentBookmarked();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Loading Progress Line
        if (activeTab != null &&
            activeTab.loadingProgress > 0 &&
            activeTab.loadingProgress < 100)
          LinearProgressIndicator(
            value: activeTab.loadingProgress / 100.0,
            minHeight: 2.5,
            backgroundColor: Colors.transparent,
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF3B82F6)),
          ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          child: Row(
            children: [
              // Address Field Container
              Expanded(
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: isDark
                        ? const Color(0xFF14141E)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: _focusNode.hasFocus
                          ? const Color(0xFF3B82F6)
                          : (isDark
                              ? Colors.white.withValues(alpha: 0.15)
                              : Colors.black.withValues(alpha: 0.1)),
                      width: _focusNode.hasFocus ? 1.5 : 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 12),
                      Icon(
                        activeTab?.isNewTab ?? true ? Icons.search : Icons.lock_outline,
                        size: 18,
                        color: isDark ? Colors.white54 : Colors.black45,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          focusNode: _focusNode,
                          onSubmitted: (_) => _submit(),
                          keyboardType: TextInputType.url,
                          textInputAction: TextInputAction.go,
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.w500,
                          ),
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: "Search or enter educational URL...",
                            hintStyle: TextStyle(
                              fontSize: 13,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                      if (_controller.text.isNotEmpty && _focusNode.hasFocus)
                        IconButton(
                          icon: const Icon(Icons.cancel, size: 16),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          onPressed: () {
                            _controller.clear();
                          },
                        ),
                      // Bookmark icon button
                      if (!(activeTab?.isNewTab ?? true))
                        IconButton(
                          icon: Icon(
                            isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                            size: 20,
                            color: isBookmarked
                                ? const Color(0xFF3B82F6)
                                : (isDark ? Colors.white54 : Colors.black45),
                          ),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                          tooltip: isBookmarked ? "Remove bookmark" : "Add bookmark",
                          onPressed: () => browser.toggleBookmarkCurrent(),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Reader Mode Toggle Button
              if (!(activeTab?.isNewTab ?? true))
                InkWell(
                  onTap: widget.onReaderToggled,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    height: 44,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: browser.isReaderMode
                          ? const Color(0xFF3B82F6).withValues(alpha: 0.15)
                          : (isDark
                              ? Colors.white.withValues(alpha: 0.08)
                              : Colors.black.withValues(alpha: 0.05)),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: browser.isReaderMode
                            ? const Color(0xFF3B82F6)
                            : (isDark
                                ? Colors.white.withValues(alpha: 0.1)
                                : Colors.black.withValues(alpha: 0.08)),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.chrome_reader_mode_outlined,
                          size: 18,
                          color: browser.isReaderMode
                              ? const Color(0xFF3B82F6)
                              : (isDark ? Colors.white70 : Colors.black87),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
