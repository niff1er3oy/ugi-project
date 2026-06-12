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
        <main className="v1-main" aria-busy="true" aria-label="กำลังโหลด">
          <div className="v1-profile-skeleton" aria-hidden="true">
            <div className="v1-avatar-skel animate-pulse" />
            <div>
              <div className="h-[16px] w-32 animate-pulse rounded-[3px] bg-border" />
              <div className="mt-1.5 h-[13px] w-40 animate-pulse rounded-[3px] bg-border" />
            </div>
          </div>
          <div className="v1-grid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="v1-card pointer-events-none select-none">
                <div className="v1-icon">
                  <div className="h-8 w-8 animate-pulse rounded-[8px] bg-border" />
                </div>
                <div className="mt-2 h-[13px] w-16 animate-pulse rounded-[3px] bg-border" />
                <div className="mt-1.5 h-[11px] w-24 animate-pulse rounded-[3px] bg-border" />
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="เมนูหลัก" back={false} />
      <main className="v1-main">
        <div className="v1-profile animate-enter">
          <div className="v1-avatar" aria-hidden="true">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="v1-profile-info">
            <p className="v1-username">{displayName}</p>
            {profile?.position && <p className="v1-usermeta">{profile.position}</p>}
          </div>
        </div>
        <nav aria-label="เมนูหลัก">
          <ul className="v1-grid">
            {modules.map((mod) => (
              <li key={mod.href}>
                <Link href={mod.href} className="v1-card">
                  <div className="v1-icon">{mod.icon}</div>
                  <span className="v1-label">{mod.label}</span>
                  <span className="v1-desc">{mod.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </>
  );
}
