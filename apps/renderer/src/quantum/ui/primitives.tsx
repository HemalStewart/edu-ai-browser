"use client";

import {
  forwardRef,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "./icons";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/* ── Button ── */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. */
  icon?: IconName;
  /** Trailing icon (e.g. "chevron-down", "external"). */
  iconRight?: IconName;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, iconRight, block, className, type = "button", children, ...rest },
  ref,
) {
  const iconSize = size === "sm" ? 14 : 15;
  return (
    <button
      ref={ref}
      type={type}
      className={cx("q-btn", `q-btn--${variant}`, size === "sm" && "q-btn--sm", block && "q-btn--block", className)}
      {...rest}
    >
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={iconSize} /> : null}
    </button>
  );
});

/* ── IconButton ── */

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconName;
  /** Accessible name; also shown as the tooltip. Required. */
  label: string;
  size?: "sm" | "md";
  outline?: boolean;
  iconSize?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = "md", outline, iconSize, className, type = "button", title, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      className={cx("q-icon-btn", size === "sm" && "q-icon-btn--sm", outline && "q-icon-btn--outline", className)}
      {...rest}
    >
      <Icon name={icon} size={iconSize ?? (size === "sm" ? 14 : 16)} />
    </button>
  );
});

/* ── Card ── */

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  kicker?: ReactNode;
  /** Right side of the card header (buttons, badges). */
  actions?: ReactNode;
  /** Adds 16px padding (default true). */
  padded?: boolean;
  interactive?: boolean;
}

export function Card({ title, kicker, actions, padded = true, interactive, className, children, ...rest }: CardProps) {
  const hasHead = title != null || kicker != null || actions != null;
  return (
    <div className={cx("q-card", padded && "q-card--padded", interactive && "q-card--interactive", className)} {...rest}>
      {hasHead ? (
        <div className="q-card__head">
          <div style={{ minWidth: 0 }}>
            {kicker != null ? <div className="q-kicker">{kicker}</div> : null}
            {title != null ? <h3 className="q-card__title">{title}</h3> : null}
          </div>
          {actions != null ? <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>{actions}</div> : null}
        </div>
      ) : null}
      {hasHead ? <div className="q-card__body">{children}</div> : children}
    </div>
  );
}

/* ── Badge ── */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "outline" | "solid" | "muted" | "danger";
  /** Leading status dot; "pulse" animates it (e.g. syncing / live). */
  dot?: boolean | "pulse";
}

export function Badge({ variant = "outline", dot, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx("q-badge", variant !== "outline" && `q-badge--${variant}`, className)} {...rest}>
      {dot ? <span aria-hidden className={cx("q-badge__dot", dot === "pulse" && "q-badge__dot--pulse")} /> : null}
      {children}
    </span>
  );
}

/* ── Kicker (monospaced uppercase section label) ── */

export function Kicker({ as: Tag = "span", className, ...rest }: HTMLAttributes<HTMLElement> & { as?: "span" | "div" | "p" | "h2" | "h3" | "h4" }) {
  return <Tag className={cx("q-kicker", className)} {...rest} />;
}

/* ── Divider ── */

export function Divider({ vertical, className }: { vertical?: boolean; className?: string }) {
  return <span role="separator" aria-orientation={vertical ? "vertical" : "horizontal"} className={cx("q-divider", vertical && "q-divider--vertical", className)} />;
}

/* ── Input ── */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Leading icon inside the field. */
  icon?: IconName;
  /** Trailing content inside the field (e.g. a <kbd> hint or a clear button). */
  trailing?: ReactNode;
  /** Visible label above the field. */
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: "sm" | "md";
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, trailing, label, hint, error, size = "md", className, wrapperClassName, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? (label || hint || error ? autoId : undefined);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  const field =
    icon || trailing ? (
      <div className={cx("q-input", size === "sm" && "q-input--sm", className)} aria-invalid={error ? true : undefined}>
        {icon ? <Icon name={icon} size={15} /> : null}
        <input ref={ref} id={inputId} aria-describedby={describedBy} aria-invalid={error ? true : undefined} {...rest} />
        {trailing}
      </div>
    ) : (
      <input
        ref={ref}
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cx("q-input", size === "sm" && "q-input--sm", className)}
        {...rest}
      />
    );

  if (!label && !hint && !error) return field;
  return (
    <div className={cx("q-field", wrapperClassName)}>
      {label ? (
        <label className="q-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      {field}
      {error ? (
        <span className="q-field__error" id={`${inputId}-error`}>
          {error}
        </span>
      ) : hint ? (
        <span className="q-field__hint" id={`${inputId}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
});

/* ── Tabs ── */

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: IconName;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name of the tab list. */
  label?: string;
  className?: string;
  /** Prefix for tab/panel ids, so panels can use `aria-labelledby={`${idPrefix}-tab-${id}`}`. */
  idPrefix?: string;
}

/** Segmented tabs with roving focus (←/→/Home/End). Render the panel yourself. */
export function Tabs({ items, value, onChange, label, className, idPrefix = "q-tabs" }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const enabled = items.filter((t) => !t.disabled);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = enabled.findIndex((t) => t.id === value);
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % enabled.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + enabled.length) % enabled.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = enabled[next].id;
    onChange(id);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-tab-id="${CSS.escape(id)}"]`)?.focus();
  };

  return (
    <div ref={listRef} role="tablist" aria-label={label} className={cx("q-tabs", className)} onKeyDown={onKeyDown}>
      {items.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.id}`}
            data-tab-id={t.id}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            disabled={t.disabled}
            className="q-tab"
            onClick={() => onChange(t.id)}
          >
            {t.icon ? <Icon name={t.icon} size={14} /> : null}
            {t.label}
            {typeof t.count === "number" ? <span className="q-tab__count">{t.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ── EmptyState (q-empty) ── */

export function EmptyState({
  icon = "inbox",
  title,
  children,
  action,
  className,
}: {
  icon?: IconName;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("q-empty", className)}>
      <span className="q-empty__icon" aria-hidden>
        <Icon name={icon} size={18} />
      </span>
      <p className="q-empty__title">{title}</p>
      {children ? <p className="q-empty__text">{children}</p> : null}
      {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
    </div>
  );
}
