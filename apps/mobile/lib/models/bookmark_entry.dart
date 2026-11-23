class BookmarkEntry {
  final String id;
  final String title;
  final String url;
  final DateTime createdAt;

  BookmarkEntry({
    required this.id,
    required this.title,
    required this.url,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'url': url,
        'createdAt': createdAt.millisecondsSinceEpoch,
      };

  factory BookmarkEntry.fromJson(Map<String, dynamic> json) => BookmarkEntry(
        id: json['id'] as String,
        title: json['title'] as String,
        url: json['url'] as String,
        createdAt: DateTime.fromMillisecondsSinceEpoch(json['createdAt'] as int),
      );
}
