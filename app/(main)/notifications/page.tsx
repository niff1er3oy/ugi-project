"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { useNotifications } from "@/components/notification-provider";
import {
  markNotifRead, markAllNotifsRead, formatNotifTime,
  TYPE_CONFIG, type AppNotification,
} from "@/lib/notifications";

// ── Icons ──────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  ),
  warning: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  ),
};

// ── NotifRow ───────────────────────────────────────────────────
function NotifRow({
  n, uid, isSelected, onSelect,
}: {
  n: AppNotification;
  uid: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const cfg = TYPE_CONFIG[n.type];
  const isRead = n.readBy.includes(uid);

  return (
    <button
      onClick={onSelect}
      className={`group w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-surface ${
        isSelected ? "bg-primary-ghost/40" : isRead ? "bg-background" : "bg-primary-ghost/20"
      }`}
    >
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${cfg.bg} ${cfg.text}`}>
        {TYPE_ICONS[n.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium leading-snug text-ink truncate">{n.title}</p>
          {!isRead && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cfg.dot }} aria-label="ยังไม่ได้อ่าน" />
          )}
        </div>
        <p className="mt-0.5 text-[12px] text-muted leading-relaxed line-clamp-2">{n.message}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`inline-block rounded-full px-2 py-px text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
            {n.category}
          </span>
          <span className="text-[11px] text-muted">{formatNotifTime(n.createdAt)}</span>
        </div>
      </div>
      <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-border-strong opacity-0 transition group-hover:opacity-100" fill="none" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 3.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── DetailPanel ────────────────────────────────────────────────
function DetailPanel({
  n, uid, onClose,
}: {
  n: AppNotification;
  uid: string;
  onClose: () => void;
}) {
  const cfg = TYPE_CONFIG[n.type];
  const isRead = n.readBy.includes(uid);

  useEffect(() => {
    if (!isRead) markNotifRead(n.id, uid);
  }, [n.id, uid, isRead]);

  return (
    <div className="px-6 py-6 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
          {n.category}
        </span>
        <button onClick={onClose} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[16px] ${cfg.bg} ${cfg.text}`}>
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          {n.type === "warning" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />}
          {n.type === "info"    && <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />}
          {n.type === "error"   && <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />}
        </svg>
      </div>

      <h2 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink mb-3">
        {n.title}
      </h2>
      <p className="text-[13px] text-muted leading-relaxed mb-2">{n.message}</p>
      {n.actorName && (
        <p className="text-[12px] text-muted mb-6">โดย {n.actorName}</p>
      )}

      <p className="text-[11px] text-muted mb-6">{formatNotifTime(n.createdAt)}</p>

      <Link
        href={n.href}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-3 text-[13px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98]"
      >
        ไปที่หน้าที่เกี่ยวข้อง
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
    </div>
  );
}

function DetailEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      </div>
      <p className="text-[14px] font-medium text-ink">เลือกการแจ้งเตือน</p>
      <p className="mt-1 text-[12px] text-muted">เพื่อดูรายละเอียด</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
type Filter = "all" | "unread" | "read";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications } = useNotifications();
  const [uid, setUid] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setUid(user.uid);
    });
  }, [router]);

  const filtered = notifications.filter((n) => {
    if (!uid) return true;
    if (filter === "unread") return !n.readBy.includes(uid);
    if (filter === "read")   return  n.readBy.includes(uid);
    return true;
  });

  const unreadIds = uid ? notifications.filter((n) => !n.readBy.includes(uid)).map((n) => n.id) : [];

  async function handleMarkAllRead() {
    if (!uid || unreadIds.length === 0) return;
    await markAllNotifsRead(unreadIds, uid);
  }

  function handleSelect(id: string) {
    if (window.innerWidth >= 1024) {
      setSelectedId(id);
    } else {
      router.push(`/notifications/${id}`);
    }
  }

  const selected = selectedId ? notifications.find((n) => n.id === selectedId) : null;

  if (!uid) {
    return (
      <>
        <Navbar title="แจ้งเตือน" back={false} />
        <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-busy="true" aria-label="กำลังโหลด">
          <div className="space-y-2" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[12px] border border-border px-4 py-3.5">
                <div className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded-[8px] bg-border" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-3.5 w-40 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-3 w-full animate-pulse rounded-[3px] bg-border" />
                  <div className="h-3 w-3/4 animate-pulse rounded-[3px] bg-border" />
                </div>
              </div>
            ))}
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
          unreadIds.length > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-[13px] font-medium text-primary-text transition-colors hover:text-primary-deep"
            >
              อ่านทั้งหมด
            </button>
          ) : undefined
        }
      />

      <main className="w-full lg:flex lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">

        {/* ── Left: list ─────────────────────────────────────── */}
        <div className="lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:border-r lg:border-border">

          {/* Filter bar */}
          <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md lg:static lg:z-auto lg:shrink-0">
            <div className="flex gap-1.5 px-4 py-3" role="group" aria-label="กรองการแจ้งเตือน">
              {(["all", "unread", "read"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-white"
                      : "border border-border bg-background text-muted hover:border-border-strong hover:text-ink"
                  }`}
                >
                  {f === "all" ? "ทั้งหมด" : f === "unread" ? "ยังไม่อ่าน" : "อ่านแล้ว"}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="lg:flex-1 lg:overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center animate-enter">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-ink">ไม่มีการแจ้งเตือน</p>
                <p className="mt-1 text-[13px] text-muted">
                  {filter === "unread" ? "อ่านครบแล้ว" : filter === "read" ? "ยังไม่มีที่อ่านแล้ว" : "ระบบจะแจ้งเตือนเมื่อมีเหตุการณ์สำคัญ"}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((n) => (
                  <li key={n.id}>
                    <NotifRow
                      n={n}
                      uid={uid}
                      isSelected={selectedId === n.id}
                      onSelect={() => handleSelect(n.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right: detail panel (desktop only) ─────────────── */}
        <div className="hidden lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:overflow-y-auto">
          {selected ? (
            <DetailPanel
              key={selected.id}
              n={selected}
              uid={uid}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <DetailEmptyState />
          )}
        </div>

      </main>
    </>
  );
}
