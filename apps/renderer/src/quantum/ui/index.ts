/**
 * @quantum/ui — the Quantum design kit.
 * Import the styles once at the app root: `import "@quantum/ui/quantum-ui.css"`
 * (vendored: `import "./quantum/ui/quantum-ui.css"`).
 * See CONTRACT.md §1. Only react / react-dom, relative imports, no Tailwind.
 */

// theme
export {
  ThemeProvider,
  useTheme,
  ThemeToggle,
  THEME_STORAGE_KEY,
  THEME_EVENT,
  THEME_CHANGED_EVENT,
  type ThemePreference,
  type ResolvedTheme,
  type ThemeContextValue,
} from "./theme";

// icons
export { Icon, ICON_NAMES, type IconName, type IconProps } from "./icons";

// primitives
export {
  Button,
  IconButton,
  Card,
  Badge,
  Kicker,
  Input,
  Tabs,
  Divider,
  EmptyState,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type IconButtonProps,
  type CardProps,
  type BadgeProps,
  type InputProps,
  type TabsProps,
  type TabItem,
} from "./primitives";

// shell
export { QuantumShell, type QuantumShellProps, type NavItem } from "./shell";
export { AppSwitcher, type AppSwitcherProps } from "./app-switcher";
export { AssistantPanel, type AssistantConfig, type AssistantPanelProps } from "./assistant-panel";
export { OfflineGate, useOnline } from "./offline-gate";
export { Markdown } from "./markdown";
export { quantumHubUrl } from "./hub";

// catalog
export * from "./catalog";
