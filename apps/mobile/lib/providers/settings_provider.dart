import 'package:flutter/material.dart';
import '../models/user_settings.dart';
import '../services/storage_service.dart';

class SettingsProvider with ChangeNotifier {
  final StorageService _storageService;
  UserSettings _settings = UserSettings();
  bool _isLoaded = false;

  SettingsProvider(this._storageService) {
    _load();
  }

  UserSettings get settings => _settings;
  bool get isLoaded => _isLoaded;
  ThemeMode get themeMode => _settings.themeMode;
  String get defaultSearchEngine => _settings.defaultSearchEngine;
  bool get integrityMode => _settings.integrityMode;
  String get aiProvider => _settings.aiProvider;

  Future<void> _load() async {
    _settings = await _storageService.loadSettings();
    _isLoaded = true;
    notifyListeners();
  }

  Future<void> updateSettings({
    ThemeMode? themeMode,
    String? defaultSearchEngine,
    String? geminiApiKey,
    String? geminiModel,
    String? openAiApiKey,
    String? openAiModel,
    String? aiProvider,
    bool? restoreSession,
    bool? integrityMode,
  }) async {
    if (themeMode != null) _settings.themeMode = themeMode;
    if (defaultSearchEngine != null) _settings.defaultSearchEngine = defaultSearchEngine;
    if (geminiApiKey != null) _settings.geminiApiKey = geminiApiKey;
    if (geminiModel != null) _settings.geminiModel = geminiModel;
    if (openAiApiKey != null) _settings.openAiApiKey = openAiApiKey;
    if (openAiModel != null) _settings.openAiModel = openAiModel;
    if (aiProvider != null) _settings.aiProvider = aiProvider;
    if (restoreSession != null) _settings.restoreSession = restoreSession;
    if (integrityMode != null) _settings.integrityMode = integrityMode;

    notifyListeners();
    await _storageService.saveSettings(_settings);
  }

  Future<void> toggleIntegrityMode() async {
    _settings.integrityMode = !_settings.integrityMode;
    notifyListeners();
    await _storageService.saveSettings(_settings);
  }

  Future<void> toggleAiProvider() async {
    _settings.aiProvider = _settings.aiProvider == 'gemini' ? 'openai' : 'gemini';
    notifyListeners();
    await _storageService.saveSettings(_settings);
  }
}
