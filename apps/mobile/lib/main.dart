import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'services/ai_service.dart';
import 'services/storage_service.dart';
import 'providers/browser_provider.dart';
import 'providers/tutor_provider.dart';
import 'providers/library_provider.dart';
import 'providers/settings_provider.dart';
import 'screens/home_browser_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storageService = StorageService();
  final aiService = AiService();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => SettingsProvider(storageService),
        ),
        ChangeNotifierProvider(
          create: (_) => BrowserProvider(storageService),
        ),
        ChangeNotifierProvider(
          create: (_) => TutorProvider(aiService),
        ),
        ChangeNotifierProvider(
          create: (_) => LibraryProvider(storageService),
        ),
      ],
      child: const EduAiApp(),
    ),
  );
}

class EduAiApp extends StatelessWidget {
  const EduAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    final settingsProv = context.watch<SettingsProvider>();

    return MaterialApp(
      title: 'EduAI Browser',
      debugShowCheckedModeBanner: false,
      themeMode: settingsProv.themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const HomeBrowserScreen(),
    );
  }
}
