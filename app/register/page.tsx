"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase/client";

const CALIBRATION_WIDTHS = [100, 86, 74, 62, 52, 42, 34, 26];

export default function RegisterPage() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (officeId.trim() !== process.env.NEXT_PUBLIC_OFFICE_ID) {
      setError("รหัส Office ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ");
      return;
    }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      let photoURL: string | null = null;
      if (photoFile) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, {
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        ...(photoURL ? { photoURL } : {}),
      });

      await setDoc(doc(db, "users", user.uid), {
        role: "officer",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim(),
        email: user.email,
        photoURL,
        createdAt: serverTimestamp(),
      });

      router.push("/");
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel ─────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col flex-shrink-0 bg-primary select-none">
        <div className="px-12 pt-14">
          <span className="text-white text-[34px] font-bold tracking-[-0.03em] leading-none">{process.env.NEXT_PUBLIC_APP_NAME}</span>
        </div>
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

      {/* ── Form panel ──────────────────────────────────────── */}
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
        <div className="w-full max-w-[420px] animate-enter">
          <h1
            className="text-[26px] font-semibold text-ink tracking-[-0.01em] leading-[1.2] mb-8"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            สมัครใช้งาน
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Photo upload */}
            <div className="flex flex-col items-center gap-2 mb-1">
              <label htmlFor="photo" className="cursor-pointer group relative">
                <div className="h-[76px] w-[76px] overflow-hidden rounded-full border-2 border-border bg-surface transition-colors duration-150 group-hover:border-primary-ghost flex items-center justify-center">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-8 w-8 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  )}
                </div>
                {/* Camera overlay */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors duration-150">
                  <svg className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                  disabled={loading}
                />
              </label>
              <p className="text-[12px] text-muted">
                {photoFile ? photoFile.name : "อัพโหลดรูปโปรไฟล์ (ไม่บังคับ)"}
              </p>
            </div>

            {/* Name row */}
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
              <label htmlFor="email" className="text-[13.5px] font-medium text-ink leading-none">อีเมล</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="field-input"
                style={{ padding: "10px 14px", fontSize: "15px" }}
                placeholder="you@ugi.co.th"
              />
            </div>

            <div className="flex flex-col gap-[7px]">
              <label htmlFor="password" className="text-[13.5px] font-medium text-ink leading-none">รหัสผ่าน</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="field-input"
                style={{ padding: "10px 14px", fontSize: "15px" }}
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
            </div>

            <div className="flex flex-col gap-[7px]">
              <label htmlFor="confirm" className="text-[13.5px] font-medium text-ink leading-none">ยืนยันรหัสผ่าน</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                className="field-input"
                style={{ padding: "10px 14px", fontSize: "15px" }}
                placeholder="••••••••"
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
                ? <span className="flex items-center justify-center gap-2"><span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white animate-spin" />กำลังสมัคร…</span>
                : "สมัครใช้งาน"}
            </button>
          </form>

          <p className="mt-7 text-center text-[13px] text-muted">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="font-medium text-primary-text hover:underline">เข้าสู่ระบบ</Link>
          </p>
          <p className="mt-3 text-center text-[13px] text-muted">
            สมัครในฐานะพนักงาน?{" "}
            <Link href="/employee/register" className="font-medium text-primary-text hover:underline">สมัครพนักงาน</Link>
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

function getFirebaseErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    const messages: Record<string, string> = {
      "auth/email-already-in-use": "อีเมลนี้มีบัญชีอยู่แล้ว",
      "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
      "auth/weak-password": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
      "auth/operation-not-allowed": "ไม่สามารถสมัครด้วยวิธีนี้ได้",
    };
    return messages[code] ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
