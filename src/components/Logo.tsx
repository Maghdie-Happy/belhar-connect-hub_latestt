import { Link } from "@tanstack/react-router";

export function LogoMark({
  className = "h-9 w-9",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect
        width="64"
        height="64"
        rx="16"
        fill={onDark ? "rgba(255,255,255,0.14)" : "currentColor"}
      />
      <path
        d="M46 21a17 17 0 1 0 0 22"
        fill="none"
        stroke={onDark ? "#FFFFFF" : "var(--surface)"}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="44" cy="20" r="7" fill="var(--secondary)" />
      <circle cx="44" cy="44" r="7" fill="var(--secondary)" />
    </svg>
  );
}

export function Logo({
  reversed = false,
  className = "",
  to = "/",
}: {
  reversed?: boolean;
  className?: string;
  to?: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="Connectly home"
    >
      <span className={reversed ? "text-primary-dark" : "text-primary"}>
        <LogoMark />
      </span>
      <span
        className={`font-display text-xl font-extrabold tracking-tight ${
          reversed ? "text-white" : "text-foreground"
        }`}
      >
        Connectly
      </span>
    </Link>
  );
}
