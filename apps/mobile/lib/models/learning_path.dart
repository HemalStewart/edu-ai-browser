class LearningTask {
  final String label;
  final String detail;
  bool isCompleted;

  LearningTask({
    required this.label,
    required this.detail,
    this.isCompleted = false,
  });

  Map<String, dynamic> toJson() => {
        'label': label,
        'detail': detail,
        'isCompleted': isCompleted,
      };

  factory LearningTask.fromJson(Map<String, dynamic> json) => LearningTask(
        label: json['label'] as String,
        detail: json['detail'] as String,
        isCompleted: json['isCompleted'] as bool? ?? false,
      );
}

class LearningPath {
  String goal;
  String timeline;
  int progress;
  String milestone;
  String focus;
  List<LearningTask> tasks;

  LearningPath({
    required this.goal,
    required this.timeline,
    required this.progress,
    required this.milestone,
    required this.focus,
    required this.tasks,
  });

  Map<String, dynamic> toJson() => {
        'goal': goal,
        'timeline': timeline,
        'progress': progress,
        'milestone': milestone,
        'focus': focus,
        'tasks': tasks.map((t) => t.toJson()).toList(),
      };

  factory LearningPath.fromJson(Map<String, dynamic> json) => LearningPath(
        goal: json['goal'] as String? ?? 'Learn React & Modern Web in 30 Days',
        timeline: json['timeline'] as String? ?? 'Day 12 · Foundations Track',
        progress: json['progress'] as int? ?? 42,
        milestone: json['milestone'] as String? ?? 'Hooks, effects, and state machines',
        focus: json['focus'] as String? ?? "Today's focus: Render cycle diagnostics",
        tasks: (json['tasks'] as List<dynamic>?)
                ?.map((t) => LearningTask.fromJson(t as Map<String, dynamic>))
                .toList() ??
            [
              LearningTask(
                label: "Warm-up",
                detail: "Reader Mode + Gemini summary",
                isCompleted: true,
              ),
              LearningTask(
                label: "Practice",
                detail: "Adaptive quiz · 10 mins",
                isCompleted: false,
              ),
              LearningTask(
                label: "Review",
                detail: "Flashcards with spaced repetition",
                isCompleted: false,
              ),
            ],
      );

  static LearningPath defaultPath() => LearningPath(
        goal: "Learn React & Modern Web in 30 Days",
        timeline: "Day 12 · Foundations Track",
        progress: 42,
        milestone: "Hooks, effects, and state machines",
        focus: "Today's focus: Render cycle diagnostics",
        tasks: [
          LearningTask(
            label: "Warm-up",
            detail: "Reader Mode + Gemini summary",
            isCompleted: true,
          ),
          LearningTask(
            label: "Practice",
            detail: "Adaptive quiz · 10 mins",
            isCompleted: false,
          ),
          LearningTask(
            label: "Review",
            detail: "Flashcards with spaced repetition",
            isCompleted: false,
          ),
        ],
      );
}
