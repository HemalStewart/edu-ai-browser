import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/browser_provider.dart';
import '../widgets/glass_card.dart';

class TabsOverviewSheet extends StatelessWidget {
  const TabsOverviewSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final browser = context.watch<BrowserProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0A0A0E) : const Color(0xFFF8FAFC),
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
                "Tabs (${browser.tabs.length})",
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Row(
                children: [
                  TextButton.icon(
                    onPressed: () {
                      browser.createTab();
                      Navigator.pop(context);
                    },
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text("New Tab"),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF3B82F6),
                      textStyle: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemCount: browser.tabs.length,
              itemBuilder: (context, index) {
                final tab = browser.tabs[index];
                final isActive = index == browser.activeTabIndex;

                return GestureDetector(
                  onTap: () {
                    browser.selectTab(index);
                    Navigator.pop(context);
                  },
                  child: GlassCard(
                    padding: const EdgeInsets.all(12),
                    borderRadius: 18,
                    border: Border.all(
                      color: isActive
                          ? const Color(0xFF3B82F6)
                          : (isDark ? Colors.white12 : Colors.black12),
                      width: isActive ? 2 : 1,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isActive
                                    ? const Color(0xFF3B82F6)
                                    : (isDark ? Colors.white30 : Colors.black26),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                tab.title.isEmpty ? "New Tab" : tab.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight:
                                      isActive ? FontWeight.bold : FontWeight.w600,
                                ),
                              ),
                            ),
                            if (browser.tabs.length > 1)
                              GestureDetector(
                                onTap: () => browser.closeTab(index),
                                child: Icon(
                                  Icons.close,
                                  size: 16,
                                  color: isDark ? Colors.white38 : Colors.black38,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          tab.url.isEmpty || tab.url == "about:blank"
                              ? "about:blank"
                              : tab.url,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark ? Colors.white38 : Colors.black38,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.04)
                                : Colors.black.withValues(alpha: 0.03),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            tab.peek.isNotEmpty
                                ? tab.peek
                                : "Ready to explore",
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 10,
                              color: isDark ? Colors.white60 : Colors.black54,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
