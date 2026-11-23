import 'package:webview_flutter/webview_flutter.dart';

enum TabStatus { idle, loading, live, synced, error }

class TabSession {
  final String id;
  String title;
  String url;
  String peek;
  TabStatus status;
  WebViewController? controller;
  int loadingProgress;

  TabSession({
    required this.id,
    this.title = "New Tab",
    this.url = "about:blank",
    this.peek = "Ready to explore",
    this.status = TabStatus.idle,
    this.controller,
    this.loadingProgress = 0,
  });

  bool get isNewTab => url.isEmpty || url == "about:blank";
}
