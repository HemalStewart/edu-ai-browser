import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/history_entry.dart';
import '../models/bookmark_entry.dart';
import '../models/user_settings.dart';
import '../models/learning_path.dart';

class StorageService {
  static const _keySettings = 'edu_ai_settings';
  static const _keyBookmarks = 'edu_ai_bookmarks';
  static const _keyHistory = 'edu_ai_history';
  static const _keyLearningPath = 'edu_ai_learning_path';
  static const _keySavedTabs = 'edu_ai_saved_tabs';

  Future<UserSettings> loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keySettings);
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        return UserSettings.fromJson(jsonDecode(jsonStr));
      } catch (_) {}
    }
    return UserSettings();
  }

  Future<void> saveSettings(UserSettings settings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keySettings, jsonEncode(settings.toJson()));
  }

  Future<List<BookmarkEntry>> loadBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyBookmarks);
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        final list = jsonDecode(jsonStr) as List;
        return list.map((e) => BookmarkEntry.fromJson(e)).toList();
      } catch (_) {}
    }
    return [];
  }

  Future<void> saveBookmarks(List<BookmarkEntry> bookmarks) async {
    final prefs = await SharedPreferences.getInstance();
    final list = bookmarks.map((b) => b.toJson()).toList();
    await prefs.setString(_keyBookmarks, jsonEncode(list));
  }

  Future<List<HistoryEntry>> loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyHistory);
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        final list = jsonDecode(jsonStr) as List;
        return list.map((e) => HistoryEntry.fromJson(e)).toList();
      } catch (_) {}
    }
    return [];
  }

  Future<void> saveHistory(List<HistoryEntry> history) async {
    final prefs = await SharedPreferences.getInstance();
    // Keep max 200 items
    final trimmed = history.take(200).map((h) => h.toJson()).toList();
    await prefs.setString(_keyHistory, jsonEncode(trimmed));
  }

  Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyHistory);
  }

  Future<LearningPath> loadLearningPath() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keyLearningPath);
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        return LearningPath.fromJson(jsonDecode(jsonStr));
      } catch (_) {}
    }
    return LearningPath.defaultPath();
  }

  Future<void> saveLearningPath(LearningPath path) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyLearningPath, jsonEncode(path.toJson()));
  }

  Future<List<Map<String, String>>> loadSavedTabs() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_keySavedTabs);
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        final list = jsonDecode(jsonStr) as List;
        return list.map((e) => Map<String, String>.from(e as Map)).toList();
      } catch (_) {}
    }
    return [];
  }

  Future<void> saveSavedTabs(List<Map<String, String>> tabs) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keySavedTabs, jsonEncode(tabs));
  }
}
