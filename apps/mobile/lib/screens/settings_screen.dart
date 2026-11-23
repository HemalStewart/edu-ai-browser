import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/settings_provider.dart';
import '../widgets/glass_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _geminiKeyCtrl;
  late TextEditingController _openAiKeyCtrl;

  @override
  void initState() {
    super.initState();
    final settings = context.read<SettingsProvider>().settings;
    _geminiKeyCtrl = TextEditingController(text: settings.geminiApiKey);
    _openAiKeyCtrl = TextEditingController(text: settings.openAiApiKey);
  }

  @override
  void dispose() {
    _geminiKeyCtrl.dispose();
    _openAiKeyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settingsProv = context.watch<SettingsProvider>();
    final settings = settingsProv.settings;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Settings & AI Config"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // AI Configuration Section
            GlassCard(
              borderRadius: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.psychology, color: Color(0xFF3B82F6), size: 20),
                      SizedBox(width: 8),
                      Text(
                        "AI MODEL & API KEYS",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.5,
                          color: Color(0xFF3B82F6),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Provider selection
                  Row(
                    children: [
                      const Text("Active Provider",
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const Spacer(),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(value: 'gemini', label: Text("Gemini")),
                          ButtonSegment(value: 'openai', label: Text("OpenAI")),
                        ],
                        selected: {settings.aiProvider},
                        onSelectionChanged: (val) {
                          settingsProv.updateSettings(aiProvider: val.first);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Gemini Key
                  TextField(
                    controller: _geminiKeyCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: "Google Gemini API Key",
                      hintText: "Enter your Gemini API key",
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                    onChanged: (val) {
                      settingsProv.updateSettings(geminiApiKey: val.trim());
                    },
                  ),
                  const SizedBox(height: 14),
                  // OpenAI Key
                  TextField(
                    controller: _openAiKeyCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: "OpenAI API Key",
                      hintText: "Enter your OpenAI API key",
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                    onChanged: (val) {
                      settingsProv.updateSettings(openAiApiKey: val.trim());
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Academic Integrity & Features
            GlassCard(
              borderRadius: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.verified_user_outlined,
                          color: Color(0xFF10B981), size: 20),
                      SizedBox(width: 8),
                      Text(
                        "ACADEMIC INTEGRITY",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.5,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      "Socratic Integrity Mode",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      "Instructs the AI Tutor to guide with questions and hints rather than giving direct homework solutions.",
                      style: TextStyle(fontSize: 12),
                    ),
                    value: settings.integrityMode,
                    activeTrackColor: const Color(0xFF10B981),
                    onChanged: (_) => settingsProv.toggleIntegrityMode(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Appearance & Search
            GlassCard(
              borderRadius: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.palette_outlined,
                          color: Color(0xFF8B5CF6), size: 20),
                      SizedBox(width: 8),
                      Text(
                        "PREFERENCES",
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.5,
                          color: Color(0xFF8B5CF6),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Theme Mode
                  Row(
                    children: [
                      const Text("App Theme",
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const Spacer(),
                      DropdownButton<ThemeMode>(
                        value: settings.themeMode,
                        underline: const SizedBox(),
                        items: const [
                          DropdownMenuItem(
                              value: ThemeMode.dark, child: Text("Dark")),
                          DropdownMenuItem(
                              value: ThemeMode.light, child: Text("Light")),
                          DropdownMenuItem(
                              value: ThemeMode.system, child: Text("System")),
                        ],
                        onChanged: (mode) {
                          if (mode != null) {
                            settingsProv.updateSettings(themeMode: mode);
                          }
                        },
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  // Search Engine
                  Row(
                    children: [
                      const Text("Search Engine",
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      const Spacer(),
                      DropdownButton<String>(
                        value: settings.defaultSearchEngine,
                        underline: const SizedBox(),
                        items: const [
                          DropdownMenuItem(
                              value: "google", child: Text("Google")),
                          DropdownMenuItem(value: "bing", child: Text("Bing")),
                          DropdownMenuItem(
                              value: "duckduckgo", child: Text("DuckDuckGo")),
                          DropdownMenuItem(
                              value: "wikipedia", child: Text("Wikipedia")),
                          DropdownMenuItem(
                              value: "perplexity", child: Text("Perplexity")),
                        ],
                        onChanged: (engine) {
                          if (engine != null) {
                            settingsProv.updateSettings(
                                defaultSearchEngine: engine);
                          }
                        },
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  // Restore Session
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text("Restore open tabs on startup",
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    value: settings.restoreSession,
                    activeTrackColor: const Color(0xFF3B82F6),
                    onChanged: (val) =>
                        settingsProv.updateSettings(restoreSession: val),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
