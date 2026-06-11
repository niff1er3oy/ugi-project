"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { modules } from "@/lib/modules";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-ghost border-t-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar title="เมนูหลัก" back={false} />
      <main className="v1-main">
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
