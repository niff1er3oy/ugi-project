"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

const CALIBRATION_WIDTHS = [100, 86, 74, 62, 52, 42, 34, 26];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) { router.push("/setup-profile"); return; }
      router.push(snap.data().role === "employee" ? "/me" : "/");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const snap = await getDoc(doc(db, "users", result.user.uid));
      if (!snap.exists()) { router.push("/setup-profile"); return; }
      router.push(snap.data().role === "employee" ? "/me" : "/");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Brand panel ─────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col flex-shrink-0 bg-primary select-none">
        {/* Wordmark */}
        <div className="px-12 pt-14">
          <span className="text-white text-[34px] font-bold tracking-[-0.03em] leading-none">
            {process.env.NEXT_PUBLIC_APP_NAME}
          </span>
        </div>

        {/* Product identity */}
        <div className="flex-1 flex flex-col justify-center px-12">
          <p
            className="text-white/90 text-[26px] font-semibold leading-[1.3] mb-4"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            ระบบบริหาร
            <br />
            งานพนักงาน
          </p>
          <p className="text-white/50 text-[13.5px] leading-[1.65]">
            จัดการข้อมูลพนักงาน เอกสารรับรอง
            <br />
            การอบรม และความปลอดภัยในที่เดียว
          </p>
        </div>

        {/* Instrument calibration marks */}
        <div className="px-12 pb-14 flex flex-col gap-[5px]">
          {CALIBRATION_WIDTHS.map((w, i) => (
            <div
              key={i}
              className="h-px animate-calibration"
              style={{
                width: `${w}%`,
                backgroundColor: `oklch(1 0 0 / ${Math.max(0.04, 0.11 - i * 0.01)})`,
                "--i": i,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </aside>

      {/* ── Right: Form panel ─────────────────────────────── */}
      <main className="flex flex-1 flex-col bg-primary lg:bg-background">
        <div className="lg:hidden select-none px-8 pt-12 pb-16">
          <span className="text-white text-[40px] font-bold tracking-[-0.03em] leading-none">{process.env.NEXT_PUBLIC_APP_NAME}</span>
          <p className="mt-2 text-white/85 text-[16px] font-medium">ระบบบริหารงานพนักงาน</p>
          <div className="mt-8 flex flex-col gap-[4px]">
            {CALIBRATION_WIDTHS.map((w, i) => (
              <div key={i} className="h-px animate-calibration" style={{ width: `${w}%`, backgroundColor: `oklch(1 0 0 / ${Math.max(0.04, 0.11 - i * 0.01)})`, "--i": i } as React.CSSProperties} />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center -mt-6 rounded-t-[28px] bg-background px-6 pt-8 pb-10 lg:mt-0 lg:justify-center lg:rounded-none lg:py-12">
        <div className="w-full max-w-[400px] animate-enter">
          <h1 className="text-[26px] font-semibold text-ink tracking-[-0.01em] leading-[1.2] mb-9" style={{ textWrap: "balance" } as React.CSSProperties}>เข้าสู่ระบบ</h1>
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="email" className="text-[13.5px] font-medium text-ink leading-none">อีเมล</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="you@example.com" />
            </div>
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="password" className="text-[13.5px] font-medium text-ink leading-none">รหัสผ่าน</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="••••••••" />
            </div>
            {error && <p key={error} role="alert" className="animate-shake text-[13px] text-error leading-[1.45]">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-[6px] bg-primary px-4 py-[11px] text-[15px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-primary-deep active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white animate-spin" />กำลังเข้าสู่ระบบ…</span> : "เข้าสู่ระบบ"}
            </button>
          </form>
          <div className="relative my-7 flex items-center">
            <div className="flex-1 border-t border-border" /><span className="px-3 text-[12px] text-muted bg-background">หรือ</span><div className="flex-1 border-t border-border" />
          </div>
          <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-[10px] rounded-[6px] border border-border bg-background px-4 py-[11px] text-[15px] font-medium text-ink transition-[background-color,border-color] duration-150 hover:bg-surface hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <GoogleIcon />เข้าสู่ระบบด้วย Google
          </button>
          <p className="mt-7 text-center text-[13px] text-muted">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="font-medium text-primary-text hover:underline">สมัครใหม่</Link>
          </p>
          <p className="mt-8 text-center text-[11px] text-muted/60">
            จัดทำโดย{" "}
            <a href="https://github.com/Niff1er3oy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-muted">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              Niff1er
            </a>
          </p>
        </div>
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function getFirebaseErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    const messages: Record<string, string> = {
      "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      "auth/user-not-found": "ไม่พบบัญชีนี้",
      "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
      "auth/too-many-requests": "ลองใหม่อีกครั้งในภายหลัง",
      "auth/popup-closed-by-user": "ปิด popup ก่อนเสร็จสิ้น",
    };
    return messages[code] ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
