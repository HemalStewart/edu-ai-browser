class TextHelpers {
  static String formatUrlLabel(String url) {
    if (url.isEmpty || url == "about:blank") return "New Tab";
    try {
      final uri = Uri.parse(url);
      if (uri.host.isNotEmpty) {
        return uri.host.replaceFirst(RegExp(r'^www\.'), '');
      }
    } catch (_) {}
    return url;
  }

  static List<String> deriveHighlights(String content) {
    final sentenceRegExp = RegExp(r'[^.!?]+[.!?]');
    final matches = sentenceRegExp.allMatches(content);
    final scored = <Map<String, dynamic>>[];

    for (final m in matches) {
      final trimmed = (m.group(0) ?? '').trim();
      if (trimmed.length > 40) {
        final wordCount = trimmed.split(RegExp(r'\s+')).length;
        final score = wordCount +
            (trimmed.contains(',') ? 2 : 0) +
            (trimmed.length > 120 ? 4 : 0);
        scored.add({'sentence': trimmed, 'score': score});
      }
    }

    scored.sort((a, b) => (b['score'] as int).compareTo(a['score'] as int));
    return scored.take(5).map((e) => e['sentence'] as String).toList();
  }
}
