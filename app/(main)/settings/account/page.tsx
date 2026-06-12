"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";

type SaveState = "idle" | "saving" | "saved" | "error";
type ResetState = "idle" | "sending" | "sent" | "error";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [resetState, setResetState] = useState<ResetState>("idle");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      else {
        setUser(u);
        setDisplayName(u.displayName ?? "");
        setReady(true);
      }
    });
  }, [router]);

  const isDirty = displayName !== (user?.displayName ?? "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !isDirty) return;
    setSaveState("saving");
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    setResetState("sending");
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetState("sent");
    } catch {
      setResetState("error");
    }
  }

  if (!ready) {
    return (
      <>
        <Navbar title="ตั้งค่าบัญชี" />
        <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6 flex justify-center" aria-hidden="true">
            <div className="h-20 w-20 animate-pulse rounded-full bg-border" />
          </div>
          <div className="mb-6" aria-hidden="true">
            <div className="mb-2 h-3 w-24 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border divide-y divide-border">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-background px-4 py-3.5">
                  <div className="mb-1.5 h-3 w-12 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
                </div>
              ))}
              <div className="flex items-center justify-end bg-background px-4 py-3.5">
                <div className="h-8 w-16 animate-pulse rounded-[6px] bg-border" />
              </div>
            </div>
          </div>
          <div aria-hidden="true">
            <div className="mb-2 h-3 w-16 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border">
              <div className="flex items-center justify-between bg-background px-4 py-3.5">
                <div>
                  <div className="h-3.5 w-20 animate-pulse rounded-[3px] bg-border" />
                  <div className="mt-1 h-3 w-48 animate-pulse rounded-[3px] bg-border" />
                </div>
                <div className="h-8 w-28 animate-pulse rounded-[6px] bg-border" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="ตั้งค่าบัญชี" />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">

      {/* Avatar */}
      <div className="mb-6 flex justify-center animate-enter" style={{ animationDelay: "30ms" }}>
        {user?.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName ?? "avatar"}
            referrerPolicy="no-referrer"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-ghost text-primary-text">
            <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Profile form */}
      <div className="mb-6 animate-enter" style={{ animationDelay: "60ms" }}>
        <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
          ข้อมูลโปรไฟล์
        </p>
        <form
          onSubmit={handleSave}
          className="rounded-[12px] border border-border overflow-hidden divide-y divide-border"
        >
          <div className="bg-background px-4 py-3.5">
            <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="displayName">
              ชื่อแสดง
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSaveState("idle");
              }}
              className="field-input"
              placeholder="ชื่อ-นามสกุล"
              autoComplete="name"
            />
          </div>

          <div className="bg-background px-4 py-3.5">
            <label className="block text-[11px] font-medium text-muted mb-1.5">
              อีเมล
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="field-input"
              aria-readonly="true"
            />
            <p className="mt-1.5 text-[11px] text-muted">ไม่สามารถแก้ไขอีเมลได้</p>
          </div>

          <div className="flex items-center justify-between gap-4 bg-background px-4 py-3.5">
            {saveState === "error" && (
              <p className="text-[12px] text-error">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</p>
            )}
            {saveState === "saved" && (
              <p className="text-[12px] text-primary-text">บันทึกเรียบร้อยแล้ว</p>
            )}
            {(saveState === "idle" || saveState === "saving") && <span />}
            <button
              type="submit"
              disabled={!isDirty || saveState === "saving"}
              className="rounded-[6px] bg-primary px-4 py-2 text-[13px] font-medium text-white transition-[background-color,opacity] duration-150 hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saveState === "saving" ? "กำลังบันทึก…" : "บันทึก"}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="mb-6 animate-enter" style={{ animationDelay: "100ms" }}>
        <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
          ความปลอดภัย
        </p>
        <div className="rounded-[12px] border border-border overflow-hidden">
          <div className="bg-background px-4 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-medium text-ink">รหัสผ่าน</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง {user?.email}
                </p>
              </div>
              <button
                onClick={handlePasswordReset}
                disabled={resetState === "sending" || resetState === "sent"}
                className="shrink-0 rounded-[6px] border border-border px-3 py-1.5 text-[13px] font-medium text-ink transition-[background-color,border-color] duration-150 hover:bg-surface hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resetState === "sending"
                  ? "กำลังส่ง…"
                  : resetState === "sent"
                  ? "ส่งแล้ว ✓"
                  : "เปลี่ยนรหัสผ่าน"}
              </button>
            </div>
            {resetState === "sent" && (
              <p className="mt-2 text-[12px] text-primary-text">
                ตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน
              </p>
            )}
            {resetState === "error" && (
              <p className="mt-2 text-[12px] text-error">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</p>
            )}
          </div>
        </div>
      </div>

    </main>
    </>
  );
}
