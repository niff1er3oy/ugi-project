"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import { modules } from "@/lib/modules";
import { useUser } from "@/lib/user-context";

function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function HomePage() {
  const { user, profile } = useUser();

  const displayName = profile
    ? `${(profile as { firstName?: string }).firstName ?? ""} ${(profile as { lastName?: string }).lastName ?? ""}`.trim() || user?.displayName || user?.email || "ผู้ใช้งาน"
    : (user?.displayName ?? user?.email ?? "ผู้ใช้งาน");

  const initials = getInitials(displayName !== "ผู้ใช้งาน" ? displayName : null);

  return (
    <>
      <Navbar title="เมนูหลัก" back={false} />
      <main className="mx-auto w-full max-w-[64rem] px-4 py-10">
        <div className="mb-6 flex items-center gap-3 animate-enter lg:mb-8 lg:gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[15px] font-semibold text-white lg:h-14 lg:w-14 lg:text-[18px]"
            aria-hidden="true"
          >
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold leading-[1.3] text-ink lg:text-[20px]">{displayName}</p>
            {(profile as { position?: string })?.position && (
              <p className="truncate text-[12px] leading-[1.4] text-muted lg:text-[13px]">
                {(profile as { position?: string }).position}
              </p>
            )}
          </div>
        </div>
        <nav aria-label="เมนูหลัก">
          <ul className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 sm:grid-cols-4">
            {modules.map((mod) => (
              <li key={mod.href} className="contents">
                <Link
                  href={mod.href}
                  className="group flex flex-col items-center rounded-[12px] border border-border bg-surface px-4 py-5 text-center transition-[box-shadow,border-color,transform] duration-150 hover:border-border-strong hover:shadow-[0_2px_8px_oklch(0.17_0.012_292_/_0.10)] active:scale-[0.97]"
                >
                  <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-primary-ghost text-primary-text transition-[background-color,color] duration-150 group-hover:bg-primary group-hover:text-white">
                    {mod.icon}
                  </div>
                  <span className="text-[14px] font-semibold leading-[1.4] text-ink transition-colors duration-150 group-hover:text-primary-text">{mod.label}</span>
                  <span className="mt-[3px] text-[12px] leading-[1.4] text-muted">{mod.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </>
  );
}
