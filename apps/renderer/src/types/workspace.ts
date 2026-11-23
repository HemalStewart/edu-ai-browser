export interface DiscoveryCard {
  title: string;
  url: string;
  label: string;
  description: string;
}

export interface RecentSession {
  id: string;
  title: string;
  url: string;
  status: string;
  time: string;
}

export interface SessionState {
  id: string;
  title: string;
  url: string;
  peek: string;
  status: string;
}

export interface QuickTool {
  id: string;
  title: string;
  detail: string;
  badge: string;
}

export interface ComplianceFeature {
  title: string;
  description: string;
  status: string;
}

export interface LearningPath {
  goal: string;
  timeline: string;
  progress: number;
  milestone: string;
  focus: string;
  tasks: Array<{ label: string; detail: string }>;
}

export interface ToolResult {
  title: string;
  detail: string;
}

export interface SearchEngine {
  name: string;
  url: string;
  icon: string;
}
