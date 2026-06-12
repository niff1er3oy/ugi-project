"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { modules } from "@/lib/modules";

type UserProfile = { firstName: string; lastName: string; position: string };

function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/login"); return; }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } catch {
        // Firestore unavailable — fall back to auth data
      }
    });
  }, [router]);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : (user?.displayName ?? user?.email ?? "ผู้ใช้งาน");

  const initials = getInitials(
    profile ? `${profile.firstName} ${profile.lastName}` : (user?.displayName ?? null),
  );

  if (!user) {
    return (
      <>
        <Navbar title="เมนูหลัก" back={false} />
        <main className="mx-auto w-full max-w-[64rem] px-4 py-10" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6 flex items-center gap-3 lg:mb-8 lg:gap-4" aria-hidden="true">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border lg:h-14 lg:w-14" />
            <div>
              <div className="h-[16px] w-32 animate-pulse rounded-[3px] bg-border" />
              <div className="mt-1.5 h-[13px] w-40 animate-pulse rounded-[3px] bg-border" />
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 sm:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="contents">
                <div className="flex flex-col items-center rounded-[12px] border border-border bg-surface px-4 py-5 pointer-events-none select-none">
                  <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-primary-ghost">
                    <div className="h-8 w-8 animate-pulse rounded-[8px] bg-border" />
                  </div>
                  <div className="mt-2 h-[13px] w-16 animate-pulse rounded-[3px] bg-border" />
                  <div className="mt-1.5 h-[11px] w-24 animate-pulse rounded-[3px] bg-border" />
                </div>
              </li>
            ))}
          </ul>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="เมนูหลัก" back={false} />
      <main className="mx-auto w-full max-w-[64rem] px-4 py-10">
        <div className="mb-6 flex items-center gap-3 animate-enter lg:mb-8 lg:gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[15px] font-semibold text-white lg:h-14 lg:w-14 lg:text-[18px]"
            aria-hidden="true"
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold leading-[1.3] text-ink lg:text-[20px]">{displayName}</p>
            {profile?.position && (
              <p className="truncate text-[12px] leading-[1.4] text-muted lg:text-[13px]">{profile.position}</p>
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
