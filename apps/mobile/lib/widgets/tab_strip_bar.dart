import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/browser_provider.dart';
import '../models/tab_session.dart';

class TabStripBar extends StatelessWidget {
  final VoidCallback onOpenTabsGrid;

  const TabStripBar({
    super.key,
    required this.onOpenTabsGrid,
  });

  @override
  Widget build(BuildContext context) {
    final browser = context.watch<BrowserProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: browser.tabs.length,
              separatorBuilder: (context, index) => const SizedBox(width: 6),
              itemBuilder: (context, index) {
                final tab = browser.tabs[index];
                final isActive = index == browser.activeTabIndex;

                return GestureDetector(
                  onTap: () => browser.selectTab(index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    constraints: const BoxConstraints(minWidth: 100, maxWidth: 160),
                    decoration: BoxDecoration(
                      color: isActive
                          ? (isDark
                              ? const Color(0xFF1E293B)
                              : Colors.white)
                          : (isDark
                              ? Colors.white.withValues(alpha: 0.05)
                              : Colors.black.withValues(alpha: 0.03)),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isActive
                            ? const Color(0xFF3B82F6).withValues(alpha: 0.5)
                            : (isDark
                                ? Colors.white.withValues(alpha: 0.08)
                                : Colors.black.withValues(alpha: 0.06)),
                        width: isActive ? 1.5 : 1,
                      ),
                      boxShadow: isActive
                          ? [
                              BoxShadow(
                                color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              )
                            ]
                          : null,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Status indicator
                        Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: tab.status == TabStatus.loading
                                ? const Color(0xFFF59E0B)
                                : tab.status == TabStatus.synced
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFF3B82F6),
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
                              fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                              color: isActive
                                  ? (isDark ? Colors.white : Colors.black87)
                                  : (isDark ? Colors.white60 : Colors.black54),
                            ),
                          ),
                        ),
                        if (browser.tabs.length > 1) ...[
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () => browser.closeTab(index),
                            child: Icon(
                              Icons.close,
                              size: 14,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(width: 6),
          IconButton(
            onPressed: () => browser.createTab(),
            icon: const Icon(Icons.add, size: 20),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            tooltip: "New Tab",
          ),
          IconButton(
            onPressed: onOpenTabsGrid,
            icon: Stack(
              alignment: Alignment.center,
              children: [
                const Icon(Icons.crop_square_rounded, size: 22),
                Text(
                  "${browser.tabs.length}",
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            tooltip: "Tabs overview",
          ),
        ],
      ),
    );
  }
}
