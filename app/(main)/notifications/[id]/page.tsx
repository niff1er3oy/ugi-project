"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import {
  fetchNotifications, markNotifRead, formatNotifTime,
  TYPE_CONFIG, type AppNotification,
} from "@/lib/notifications";

export default function NotificationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [uid, setUid] = useState<string | null>(null);
  const [notif, setNotif] = useState<AppNotification | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) { router.replace("/login"); return; }
      setUid(user.uid);
    });
  }, [router]);

  useEffect(() => {
    fetchNotifications().then((list) => {
      setNotif(list.find((n) => n.id === params.id) ?? null);
    });
  }, [params.id]);

  useEffect(() => {
    if (!notif || !uid) return;
    if (!notif.readBy.includes(uid)) markNotifRead(notif.id, uid);
  }, [notif, uid]);

  if (notif === undefined) {
    return (
      <>
        <Navbar title="การแจ้งเตือน" />
        <main className="mx-auto w-full max-w-2xl px-4 py-8 animate-enter" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6 flex flex-col items-center" aria-hidden="true">
            <div className="h-14 w-14 animate-pulse rounded-[16px] bg-border" />
            <div className="mt-4 h-5 w-48 animate-pulse rounded-[3px] bg-border" />
            <div className="mt-2 h-4 w-full animate-pulse rounded-[3px] bg-border" />
            <div className="mt-1 h-4 w-3/4 animate-pulse rounded-[3px] bg-border" />
          </div>
        </main>
      </>
    );
  }

  if (!notif) {
    return (
      <>
        <Navbar title="การแจ้งเตือน" />
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-ink">ไม่พบการแจ้งเตือน</p>
          <p className="mt-1 text-[13px] text-muted">รหัส {params.id}</p>
        </div>
      </>
    );
  }

  const cfg = TYPE_CONFIG[notif.type];

  return (
    <>
      <Navbar title="การแจ้งเตือน" />

      <main className="mx-auto w-full max-w-2xl px-4 py-8 animate-enter">

        {/* Icon */}
        <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] ${cfg.bg} ${cfg.text}`}>
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            {notif.type === "warning" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />}
            {notif.type === "info"    && <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />}
            {notif.type === "error"   && <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />}
          </svg>
        </div>

        {/* Header */}
        <div className="mb-1 flex items-center gap-2">
          <span className={`inline-block rounded-full px-2.5 py-px text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
            {notif.category}
          </span>
          <span className="text-[11px] text-muted">{formatNotifTime(notif.createdAt)}</span>
        </div>

        <h1 className="mb-3 text-[19px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {notif.title}
        </h1>
        <p className="text-[14px] text-muted leading-relaxed mb-8">{notif.message}</p>

        <Link
          href={notif.href}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-3.5 text-[14px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98]"
        >
          ไปที่หน้าที่เกี่ยวข้อง
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>

      </main>
    </>
  );
}
