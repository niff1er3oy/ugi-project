"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useNotificationCount } from "@/components/notification-provider";
import Navbar from "@/components/navbar";

type Notification = {
  id: string;
  type: "warning" | "info" | "error";
  category: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  href: string;
};

const mockNotifications: Notification[] = [
  {
    id: "2",
    type: "warning",
    category: "การอบรม",
    title: "การอบรมค้างเกินกำหนด",
    message: "พนักงาน 3 คนยังไม่ผ่านการอบรมความปลอดภัยประจำปี",
    time: "1 ชั่วโมงที่แล้ว",
    read: false,
    href: "/training",
  },
  {
    id: "3",
    type: "info",
    category: "ข้อมูลพนักงาน",
    title: "เพิ่มพนักงานใหม่",
    message: "นางสาวมาลี รักงาน เริ่มงานวันนี้ในตำแหน่งเจ้าหน้าที่ HR",
    time: "3 ชั่วโมงที่แล้ว",
    read: false,
    href: "/employees",
  },
  {
    id: "5",
    type: "info",
    category: "รายงาน",
    title: "รายงานประจำเดือนพร้อมแล้ว",
    message: "รายงานสรุปข้อมูลพนักงานประจำเดือนพฤษภาคม 2568 พร้อมดาวน์โหลด",
    time: "เมื่อวาน",
    read: true,
    href: "/reports",
  },
  {
    id: "7",
    type: "info",
    category: "การปฏิบัติงานนอกสถานที่",
    title: "อนุมัติงานนอกพื้นที่",
    message: "คำขอปฏิบัติงานนอกสถานที่ของทีมช่างได้รับการอนุมัติแล้ว",
    time: "3 วันที่แล้ว",
    read: true,
    href: "/offsite",
  },
];

const typeConfig = {
  warning: {
    bg: "bg-accent-pale",
    text: "text-accent-text",
    dot: "bg-accent",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  },
  info: {
    bg: "bg-primary-ghost",
    text: "text-primary-text",
    dot: "bg-primary",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    ),
  },
  error: {
    bg: "bg-error-pale",
    text: "text-error",
    dot: "bg-error",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const { setUnreadCount } = useNotificationCount();

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const unread = notifications.filter((n) => !n.read);
  const earlier = notifications.filter((n) => n.read);

  useEffect(() => {
    setUnreadCount(unread.length);
  }, [unread.length, setUnreadCount]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  if (!ready) {
    return (
      <>
        <Navbar title="แจ้งเตือน" back={false} />
        <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6" aria-hidden="true">
            <div className="mb-2 h-4 w-8 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 bg-primary-ghost/20">
                  <div className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded-[8px] bg-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3.5 w-40 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-border" />
                    </div>
                    <div className="h-3 w-full animate-pulse rounded-[3px] bg-border" />
                    <div className="mt-0.5 h-3 w-3/4 animate-pulse rounded-[3px] bg-border" />
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-4 w-20 animate-pulse rounded-full bg-border" />
                      <div className="h-3 w-16 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div aria-hidden="true">
            <div className="mb-2 h-4 w-16 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 bg-background opacity-75">
                  <div className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded-[8px] bg-border" />
                  <div className="flex-1 min-w-0">
                    <div className="h-3.5 w-36 animate-pulse rounded-[3px] bg-border" />
                    <div className="mt-1 h-3 w-full animate-pulse rounded-[3px] bg-border" />
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-4 w-20 animate-pulse rounded-full bg-border" />
                      <div className="h-3 w-16 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar
        title="แจ้งเตือน"
        back={false}
        right={
          unread.length > 0 ? (
            <button
              onClick={markAllRead}
              className="text-[13px] font-medium text-primary-text transition-colors duration-150 hover:text-primary-deep"
            >
              อ่านทั้งหมด
            </button>
          ) : undefined
        }
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">

      {unread.length === 0 && earlier.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center animate-enter">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">ไม่มีการแจ้งเตือน</p>
          <p className="mt-1 text-sm text-muted">ระบบจะแจ้งเตือนเมื่อมีเหตุการณ์สำคัญ</p>
        </div>
      )}

      {unread.length > 0 && (
        <section className="mb-6 animate-enter" style={{ animationDelay: "40ms" }}>
          <p className="mb-2 text-[13px] font-medium text-muted">ใหม่</p>
          <ul className="divide-y divide-border rounded-[12px] border border-border overflow-hidden">
            {unread.map((n, i) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={() => markRead(n.id)}
                index={i}
              />
            ))}
          </ul>
        </section>
      )}

      {earlier.length > 0 && (
        <section className="animate-enter" style={{ animationDelay: "80ms" }}>
          <p className="mb-2 text-[13px] font-medium text-muted">ก่อนหน้า</p>
          <ul className="divide-y divide-border rounded-[12px] border border-border overflow-hidden">
            {earlier.map((n, i) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={() => markRead(n.id)}
                index={i}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
    </>
  );
}

function NotificationItem({
  notification: n,
  onRead,
  index,
}: {
  notification: Notification;
  onRead: () => void;
  index: number;
}) {
  const cfg = typeConfig[n.type];

  return (
    <li>
      <Link
        href={n.href}
        onClick={onRead}
        className={`group flex items-start gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-surface ${
          !n.read ? "bg-primary-ghost/30" : "bg-background"
        }`}
      >
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${cfg.bg} ${cfg.text}`}>
          {cfg.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-[13px] font-medium leading-snug ${n.read ? "text-ink" : "text-ink"}`}>
              {n.title}
            </p>
            {!n.read && (
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} aria-label="ยังไม่ได้อ่าน" />
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-muted leading-relaxed line-clamp-2">
            {n.message}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`inline-block rounded-full px-2 py-px text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
              {n.category}
            </span>
            <span className="text-[11px] text-muted">{n.time}</span>
          </div>
        </div>

        <svg
          className="mt-1 h-3.5 w-3.5 shrink-0 text-border-strong transition-[color,transform] duration-150 group-hover:text-primary-text group-hover:translate-x-[2px]"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 3.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </li>
  );
}
