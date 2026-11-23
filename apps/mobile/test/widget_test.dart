import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/services/ai_service.dart';
import 'package:mobile/services/storage_service.dart';
import 'package:mobile/providers/browser_provider.dart';
import 'package:mobile/providers/tutor_provider.dart';
import 'package:mobile/providers/library_provider.dart';
import 'package:mobile/providers/settings_provider.dart';
import 'package:mobile/screens/home_browser_screen.dart';

void main() {
  testWidgets('EduAiApp smoke test', (WidgetTester tester) async {
    final storageService = StorageService();
    final aiService = AiService();

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => SettingsProvider(storageService)),
          ChangeNotifierProvider(create: (_) => BrowserProvider(storageService)),
          ChangeNotifierProvider(create: (_) => TutorProvider(aiService)),
          ChangeNotifierProvider(create: (_) => LibraryProvider(storageService)),
        ],
        child: MaterialApp(
          theme: AppTheme.darkTheme,
          home: const HomeBrowserScreen(),
        ),
      ),
    );

    // Verify Search Grid title renders
    expect(find.text('Where to learn?'), findsOneWidget);
  });
}
