import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../models/tab_session.dart';
import '../models/history_entry.dart';
import '../models/bookmark_entry.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/text_helpers.dart';
import '../services/storage_service.dart';

class BrowserProvider with ChangeNotifier {
  final StorageService _storageService;
  final Uuid _uuid = const Uuid();

  final List<TabSession> _tabs = [];
  int _activeTabIndex = 0;

  List<HistoryEntry> _history = [];
  List<BookmarkEntry> _bookmarks = [];

  // Reader Mode state
  bool _isReaderMode = false;
  bool _readerLoading = false;
  String _readerTitle = "";
  String _readerContent = "";
  List<String> _readerHighlights = [];
  DateTime? _readerSyncedAt;

  BrowserProvider(this._storageService) {
    _init();
  }

  List<TabSession> get tabs => List.unmodifiable(_tabs);
  int get activeTabIndex => _activeTabIndex;
  TabSession? get activeTab =>
      _tabs.isNotEmpty && _activeTabIndex < _tabs.length ? _tabs[_activeTabIndex] : null;

  List<HistoryEntry> get history => List.unmodifiable(_history);
  List<BookmarkEntry> get bookmarks => List.unmodifiable(_bookmarks);

  bool get isReaderMode => _isReaderMode;
  bool get readerLoading => _readerLoading;
  String get readerTitle => _readerTitle;
  String get readerContent => _readerContent;
  List<String> get readerHighlights => _readerHighlights;
  DateTime? get readerSyncedAt => _readerSyncedAt;

  Future<void> _init() async {
    _bookmarks = await _storageService.loadBookmarks();
    _history = await _storageService.loadHistory();

    final saved = await _storageService.loadSavedTabs();
    if (saved.isNotEmpty) {
      for (final t in saved) {
        _createTabInternal(url: t['url'] ?? 'about:blank', title: t['title'] ?? 'New Tab');
      }
    }

    if (_tabs.isEmpty) {
      _createTabInternal();
    }

    notifyListeners();
  }

  void _createTabInternal({String url = "about:blank", String title = "New Tab"}) {
    final id = _uuid.v4();
    final tab = TabSession(
      id: id,
      title: title,
      url: url,
      status: url == "about:blank" ? TabStatus.idle : TabStatus.loading,
    );
    _setupController(tab);
    _tabs.add(tab);
  }

  void _setupController(TabSession tab) {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            tab.url = url;
            tab.status = TabStatus.loading;
            tab.loadingProgress = 20;
            notifyListeners();
          },
          onProgress: (progress) {
            tab.loadingProgress = progress;
            notifyListeners();
          },
          onPageFinished: (url) async {
            tab.url = url;
            tab.loadingProgress = 100;
            tab.status = TabStatus.live;

            try {
              final title = await tab.controller?.getTitle();
              if (title != null && title.isNotEmpty) {
                tab.title = title;
              } else {
                tab.title = TextHelpers.formatUrlLabel(url);
              }
            } catch (_) {
              tab.title = TextHelpers.formatUrlLabel(url);
            }

            // Add to history if not internal/blank
            if (url.isNotEmpty && !url.startsWith("about:")) {
              addHistory(title: tab.title, url: url);
            }

            _saveTabsState();
            notifyListeners();
          },
          onWebResourceError: (error) {
            tab.status = TabStatus.error;
            notifyListeners();
          },
        ),
      );

    if (tab.url.isNotEmpty && tab.url != "about:blank") {
      controller.loadRequest(Uri.parse(tab.url));
    }
    tab.controller = controller;
  }

  void createTab({String url = "about:blank"}) {
    _createTabInternal(url: url);
    _activeTabIndex = _tabs.length - 1;
    _isReaderMode = false;
    _saveTabsState();
    notifyListeners();
  }

  void closeTab(int index) {
    if (_tabs.isEmpty) return;
    if (_tabs.length == 1) {
      // Don't close last tab, just reset to new tab
      final tab = _tabs[0];
      tab.title = "New Tab";
      tab.url = "about:blank";
      tab.status = TabStatus.idle;
      tab.controller?.loadRequest(Uri.parse("about:blank"));
      _isReaderMode = false;
      _saveTabsState();
      notifyListeners();
      return;
    }

    _tabs.removeAt(index);
    if (_activeTabIndex >= _tabs.length) {
      _activeTabIndex = _tabs.length - 1;
    }
    _isReaderMode = false;
    _saveTabsState();
    notifyListeners();
  }

  void selectTab(int index) {
    if (index >= 0 && index < _tabs.length) {
      _activeTabIndex = index;
      _isReaderMode = false;
      notifyListeners();
    }
  }

  void navigate(String input, {String defaultEngine = 'google'}) {
    final tab = activeTab;
    if (tab == null) return;

    String target = input.trim();
    if (target.isEmpty) return;

    final isUrl = target.contains('.') && !target.contains(' ') ||
        target.startsWith('http://') ||
        target.startsWith('https://');

    if (isUrl) {
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://$target';
      }
    } else {
      final engine = AppConstants.searchEngines.firstWhere(
        (e) => e.name.toLowerCase() == defaultEngine.toLowerCase(),
        orElse: () => AppConstants.searchEngines[0],
      );
      target = '${engine.queryUrl}${Uri.encodeComponent(target)}';
    }

    tab.url = target;
    tab.title = TextHelpers.formatUrlLabel(target);
    tab.status = TabStatus.loading;
    _isReaderMode = false;

    if (tab.controller == null) {
      _setupController(tab);
    }
    tab.controller?.loadRequest(Uri.parse(target));
    notifyListeners();
  }

  void goBack() async {
    final tab = activeTab;
    if (tab?.controller != null && await tab!.controller!.canGoBack()) {
      tab.controller!.goBack();
    }
  }

  void goForward() async {
    final tab = activeTab;
    if (tab?.controller != null && await tab!.controller!.canGoForward()) {
      tab.controller!.goForward();
    }
  }

  void reload() {
    activeTab?.controller?.reload();
  }

  Future<Map<String, String>?> extractPageContext() async {
    final tab = activeTab;
    if (tab?.controller == null || tab!.isNewTab) return null;

    tab.status = TabStatus.synced;
    notifyListeners();

    try {
      final result = await tab.controller!.runJavaScriptReturningResult(
        AppConstants.extractPageJs,
      );

      String raw = result.toString();
      // On some platforms returning result is wrapped in quotes or JSON string
      if (raw.startsWith('"') && raw.endsWith('"')) {
        raw = jsonDecode(raw);
      }
      final parsed = jsonDecode(raw);
      final title = parsed['title'] as String? ?? tab.title;
      final content = parsed['content'] as String? ?? '';

      tab.peek = content.length > 160 ? "${content.substring(0, 160)}..." : content;
      notifyListeners();

      return {'title': title, 'content': content};
    } catch (e) {
      debugPrint("Failed to extract page context: $e");
      return {'title': tab.title, 'content': ''};
    }
  }

  // Reader Mode
  Future<void> toggleReaderMode() async {
    if (_isReaderMode) {
      _isReaderMode = false;
      notifyListeners();
      return;
    }

    _isReaderMode = true;
    _readerLoading = true;
    notifyListeners();

    final data = await extractPageContext();
    _readerTitle = data?['title'] ?? activeTab?.title ?? "Reader View";
    _readerContent = data?['content'] ?? "Unable to extract readable content from this page.";
    _readerHighlights = TextHelpers.deriveHighlights(_readerContent);
    _readerSyncedAt = DateTime.now();
    _readerLoading = false;
    notifyListeners();
  }

  // Bookmarks
  bool isCurrentBookmarked() {
    final tab = activeTab;
    if (tab == null || tab.isNewTab) return false;
    return _bookmarks.any((b) => b.url == tab.url);
  }

  Future<void> toggleBookmarkCurrent() async {
    final tab = activeTab;
    if (tab == null || tab.isNewTab) return;

    final existingIndex = _bookmarks.indexWhere((b) => b.url == tab.url);
    if (existingIndex >= 0) {
      _bookmarks.removeAt(existingIndex);
    } else {
      _bookmarks.insert(
        0,
        BookmarkEntry(
          id: _uuid.v4(),
          title: tab.title.isEmpty ? TextHelpers.formatUrlLabel(tab.url) : tab.title,
          url: tab.url,
          createdAt: DateTime.now(),
        ),
      );
    }
    notifyListeners();
    await _storageService.saveBookmarks(_bookmarks);
  }

  Future<void> removeBookmark(String id) async {
    _bookmarks.removeWhere((b) => b.id == id);
    notifyListeners();
    await _storageService.saveBookmarks(_bookmarks);
  }

  // History
  Future<void> addHistory({required String title, required String url}) async {
    _history.removeWhere((h) => h.url == url);
    _history.insert(
      0,
      HistoryEntry(
        id: _uuid.v4(),
        title: title,
        url: url,
        timestamp: DateTime.now(),
      ),
    );
    notifyListeners();
    await _storageService.saveHistory(_history);
  }

  Future<void> clearHistory() async {
    _history.clear();
    notifyListeners();
    await _storageService.clearHistory();
  }

  Future<void> _saveTabsState() async {
    final list = _tabs
        .where((t) => !t.isNewTab)
        .map((t) => {'url': t.url, 'title': t.title})
        .toList();
    await _storageService.saveSavedTabs(list);
  }
}
