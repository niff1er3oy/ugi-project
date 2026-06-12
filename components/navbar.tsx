"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Navbar({
  title,
  back = true,
  left,
  right,
}: {
  title: string;
  back?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/90 backdrop-blur-md">
      {/* Title — absolute center, never pushes left/right */}
      <h1 className="pointer-events-none absolute inset-x-0 flex h-full items-center justify-center px-16 text-[15px] font-semibold tracking-[-0.01em] text-ink">
        <span className="truncate">{title}</span>
      </h1>

      {/* Left zone */}
      <div className="relative z-10 flex w-12 shrink-0 items-center justify-center">
        {left ?? (back ? (
          <button
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-[8px] text-muted transition-colors duration-150 hover:bg-surface hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            aria-label="ย้อนกลับ"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        ) : null)}
      </div>

      {/* Spacer pushes right zone to the far right */}
      <div className="flex-1" />

      {/* Right zone */}
      <div className="relative z-10 flex shrink-0 items-center gap-1 pr-2">
        {right}
      </div>
    </header>
  );
}

/** Icon button preset for use in the right slot */
export function NavIconBtn({
  onClick,
  label,
  children,
}: {
  onClick?: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-[8px] text-muted transition-colors duration-150 hover:bg-surface hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
    >
      {children}
    </button>
  );
}
