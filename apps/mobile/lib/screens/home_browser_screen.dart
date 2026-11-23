import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../providers/browser_provider.dart';
import '../widgets/tab_strip_bar.dart';
import '../widgets/address_bar.dart';
import '../widgets/search_grid.dart';
import '../widgets/tabs_overview_sheet.dart';
import '../widgets/quick_tools_sheet.dart';
import 'reader_mode_screen.dart';
import 'ai_tutor_sheet.dart';
import 'library_screen.dart';
import 'history_screen.dart';
import 'bookmarks_screen.dart';
import 'settings_screen.dart';

class HomeBrowserScreen extends StatefulWidget {
  const HomeBrowserScreen({super.key});

  @override
  State<HomeBrowserScreen> createState() => _HomeBrowserScreenState();
}

class _HomeBrowserScreenState extends State<HomeBrowserScreen> {
  void _openAiTutor() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AiTutorSheet(),
    );
  }

  void _openTabsOverview() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const TabsOverviewSheet(),
    );
  }

  void _openQuickTools() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => QuickToolsSheet(
        onOpenAiTutor: _openAiTutor,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final browser = context.watch<BrowserProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeTab = browser.activeTab;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Tab Strip Bar
            TabStripBar(
              onOpenTabsGrid: _openTabsOverview,
            ),

            // Address & Navigation Bar
            AddressBar(
              onReaderToggled: () => browser.toggleReaderMode(),
            ),

            // Main View Area: Reader Mode, New Tab Search, or Live WebView
            Expanded(
              child: browser.isReaderMode
                  ? ReaderModeScreen(onOpenAiTutor: _openAiTutor)
                  : (activeTab == null || activeTab.isNewTab
                      ? const SearchGrid()
                      : (activeTab.controller != null
                          ? WebViewWidget(controller: activeTab.controller!)
                          : const Center(child: CircularProgressIndicator()))),
            ),
          ],
        ),
      ),
      // Bottom Navigation Control Surface
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? Colors.white10 : Colors.black12,
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Browser navigation: Back, Forward, Reload
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                    onPressed: () => browser.goBack(),
                    tooltip: "Back",
                  ),
                  IconButton(
                    icon: const Icon(Icons.arrow_forward_ios, size: 18),
                    onPressed: () => browser.goForward(),
                    tooltip: "Forward",
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, size: 22),
                    onPressed: () => browser.reload(),
                    tooltip: "Reload",
                  ),
                ],
              ),

              // Middle: Learning Quick Tools Trigger
              InkWell(
                onTap: _openQuickTools,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                    ),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.bolt, size: 16, color: Color(0xFFF59E0B)),
                      SizedBox(width: 4),
                      Text(
                        "Tools",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFF59E0B),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // AI Tutor Main Trigger Button
              ElevatedButton.icon(
                onPressed: _openAiTutor,
                icon: const Icon(Icons.auto_awesome, size: 16),
                label: const Text("AI Tutor"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  elevation: 2,
                ),
              ),

              // Overflow Menu
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                onSelected: (val) {
                  switch (val) {
                    case 'library':
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LibraryScreen()),
                      );
                      break;
                    case 'bookmarks':
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const BookmarksScreen()),
                      );
                      break;
                    case 'history':
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const HistoryScreen()),
                      );
                      break;
                    case 'settings':
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const SettingsScreen()),
                      );
                      break;
                    case 'share':
                      if (activeTab != null && !activeTab.isNewTab) {
                        SharePlus.instance.share(
                          ShareParams(
                            text: activeTab.url,
                            subject: activeTab.title,
                          ),
                        );
                      }
                      break;
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'library',
                    child: Row(
                      children: [
                        Icon(Icons.local_library_outlined, size: 18),
                        SizedBox(width: 10),
                        Text("Study Library"),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'bookmarks',
                    child: Row(
                      children: [
                        Icon(Icons.bookmark_border, size: 18),
                        SizedBox(width: 10),
                        Text("Bookmarks"),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'history',
                    child: Row(
                      children: [
                        Icon(Icons.history, size: 18),
                        SizedBox(width: 10),
                        Text("History"),
                      ],
                    ),
                  ),
                  const PopupMenuDivider(),
                  const PopupMenuItem(
                    value: 'share',
                    child: Row(
                      children: [
                        Icon(Icons.share_outlined, size: 18),
                        SizedBox(width: 10),
                        Text("Share Page"),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'settings',
                    child: Row(
                      children: [
                        Icon(Icons.settings_outlined, size: 18),
                        SizedBox(width: 10),
                        Text("Settings & AI"),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
