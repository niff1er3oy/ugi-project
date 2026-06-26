"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function SetupProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/login"); return; }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          router.replace(snap.data().role === "employee" ? "/me" : "/");
          return;
        }
      } catch {
        // Rules may not be configured — show the form anyway so the user isn't stuck
      }
      const parts = (u.displayName ?? "").split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setUser(u);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError("");
    if (officeId.trim() !== process.env.NEXT_PUBLIC_OFFICE_ID) {
      setError("รหัส Office ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ");
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        role: "officer",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim(),
        email: user.email,
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
      });
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="h-7 w-12 animate-pulse rounded-[3px] bg-border mb-10" />
          <div className="h-[60px] w-[60px] animate-pulse rounded-full bg-border mb-6" />
          <div className="h-7 w-48 animate-pulse rounded-[3px] bg-border mb-2" />
          <div className="h-4 w-40 animate-pulse rounded-[3px] bg-border mb-8" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[46px] animate-pulse rounded-[6px] bg-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-enter">
        <span className="text-primary-text text-[28px] font-bold tracking-[-0.03em] leading-none">{process.env.NEXT_PUBLIC_APP_NAME}</span>

        <div className="mt-8 mb-8 flex items-center gap-4">
          <div
            className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ background: "var(--primary)" }}
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-white text-[20px] font-semibold select-none">
                {getInitials(user.displayName)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-[20px] font-semibold text-ink leading-snug">กรอกข้อมูลส่วนตัว</h1>
            <p className="text-[13px] text-muted mt-0.5">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="firstName" className="text-[13.5px] font-medium text-ink leading-none">ชื่อจริง</label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                className="field-input"
                style={{ padding: "10px 14px", fontSize: "15px" }}
                placeholder="สมชาย"
              />
            </div>
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="lastName" className="text-[13.5px] font-medium text-ink leading-none">นามสกุล</label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                className="field-input"
                style={{ padding: "10px 14px", fontSize: "15px" }}
                placeholder="กิจจา"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label htmlFor="position" className="text-[13.5px] font-medium text-ink leading-none">ตำแหน่งหน้าที่</label>
            <input
              id="position"
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={loading}
              className="field-input"
              style={{ padding: "10px 14px", fontSize: "15px" }}
              placeholder="เช่น วิศวกรอาวุโส, ผู้จัดการฝ่าย HR"
            />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label htmlFor="officeId" className="text-[13.5px] font-medium text-ink leading-none">รหัส Office</label>
            <input
              id="officeId"
              type="text"
              required
              value={officeId}
              onChange={(e) => setOfficeId(e.target.value)}
              disabled={loading}
              className="field-input font-mono"
              style={{ padding: "10px 14px", fontSize: "15px" }}
              placeholder="ขอรหัสจากผู้ดูแลระบบ"
            />
          </div>

          {error && (
            <p key={error} role="alert" className="animate-shake text-[13px] text-error leading-[1.45]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[6px] bg-primary px-4 py-[11px] text-[15px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-primary-deep active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white animate-spin" />กำลังบันทึก…</span>
              : "บันทึกและเริ่มใช้งาน"}
          </button>
        </form>
      </div>
    </div>
  );
}
