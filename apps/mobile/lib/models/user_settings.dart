import 'package:flutter/material.dart';

class UserSettings {
  ThemeMode themeMode;
  String defaultSearchEngine;
  String geminiApiKey;
  String geminiModel;
  String openAiApiKey;
  String openAiModel;
  String aiProvider; // 'gemini' or 'openai'
  bool restoreSession;
  bool integrityMode;

  UserSettings({
    this.themeMode = ThemeMode.dark,
    this.defaultSearchEngine = 'google',
    this.geminiApiKey = '',
    this.geminiModel = 'gemini-2.5-flash',
    this.openAiApiKey = '',
    this.openAiModel = 'gpt-4o-mini',
    this.aiProvider = 'gemini',
    this.restoreSession = true,
    this.integrityMode = false,
  });

  Map<String, dynamic> toJson() => {
        'themeMode': themeMode.name,
        'defaultSearchEngine': defaultSearchEngine,
        'geminiApiKey': geminiApiKey,
        'geminiModel': geminiModel,
        'openAiApiKey': openAiApiKey,
        'openAiModel': openAiModel,
        'aiProvider': aiProvider,
        'restoreSession': restoreSession,
        'integrityMode': integrityMode,
      };

  factory UserSettings.fromJson(Map<String, dynamic> json) => UserSettings(
        themeMode: ThemeMode.values.firstWhere(
          (e) => e.name == json['themeMode'],
          orElse: () => ThemeMode.dark,
        ),
        defaultSearchEngine: json['defaultSearchEngine'] as String? ?? 'google',
        geminiApiKey: json['geminiApiKey'] as String? ?? '',
        geminiModel: json['geminiModel'] as String? ?? 'gemini-2.5-flash',
        openAiApiKey: json['openAiApiKey'] as String? ?? '',
        openAiModel: json['openAiModel'] as String? ?? 'gpt-4o-mini',
        aiProvider: json['aiProvider'] as String? ?? 'gemini',
        restoreSession: json['restoreSession'] as bool? ?? true,
        integrityMode: json['integrityMode'] as bool? ?? false,
      );
}
