import 'package:flutter/material.dart';
import '../models/learning_path.dart';
import '../services/storage_service.dart';

class LibraryProvider with ChangeNotifier {
  final StorageService _storageService;

  bool _focusMode = false;
  bool _notesEnabled = false;
  bool _aiSyncEnabled = true;

  LearningPath _learningPath = LearningPath.defaultPath();

  LibraryProvider(this._storageService) {
    _load();
  }

  bool get focusMode => _focusMode;
  bool get notesEnabled => _notesEnabled;
  bool get aiSyncEnabled => _aiSyncEnabled;
  LearningPath get learningPath => _learningPath;

  Future<void> _load() async {
    _learningPath = await _storageService.loadLearningPath();
    notifyListeners();
  }

  void toggleFocusMode() {
    _focusMode = !_focusMode;
    notifyListeners();
  }

  void toggleNotes() {
    _notesEnabled = !_notesEnabled;
    notifyListeners();
  }

  void toggleAiSync() {
    _aiSyncEnabled = !_aiSyncEnabled;
    notifyListeners();
  }

  Future<void> toggleTask(int index) async {
    if (index >= 0 && index < _learningPath.tasks.length) {
      _learningPath.tasks[index].isCompleted = !_learningPath.tasks[index].isCompleted;

      // Recalculate progress
      final completed = _learningPath.tasks.where((t) => t.isCompleted).length;
      _learningPath.progress = ((completed / _learningPath.tasks.length) * 100).round();

      notifyListeners();
      await _storageService.saveLearningPath(_learningPath);
    }
  }

  Future<void> updateGoal(String newGoal) async {
    _learningPath.goal = newGoal;
    notifyListeners();
    await _storageService.saveLearningPath(_learningPath);
  }
}
