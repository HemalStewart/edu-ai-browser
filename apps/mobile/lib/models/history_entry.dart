class HistoryEntry {
  final String id;
  final String title;
  final String url;
  final DateTime timestamp;

  HistoryEntry({
    required this.id,
    required this.title,
    required this.url,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'url': url,
        'timestamp': timestamp.millisecondsSinceEpoch,
      };

  factory HistoryEntry.fromJson(Map<String, dynamic> json) => HistoryEntry(
        id: json['id'] as String,
        title: json['title'] as String,
        url: json['url'] as String,
        timestamp: DateTime.fromMillisecondsSinceEpoch(json['timestamp'] as int),
      );
}
