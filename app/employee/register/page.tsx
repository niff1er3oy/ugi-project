"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase/client";
import { companyRef } from "@/lib/db";

type VerifiedCompany = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  color: string;
  bg: string;
  logoURL?: string;
  departments: string[];
};

const CALIBRATION_WIDTHS = [100, 86, 74, 62, 52, 42, 34, 26];

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // ── Step 1 state ──────────────────────────────────
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step1Error, setStep1Error] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);

  // ── Created user (set after step 1) ───────────────
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  // ── Step 2 state ──────────────────────────────────
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [verifiedCompany, setVerifiedCompany] = useState<VerifiedCompany | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [step2Error, setStep2Error] = useState("");
  const [step2Loading, setStep2Loading] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleStep1Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep1Error("");
    if (password !== confirm) { setStep1Error("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 8) { setStep1Error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    setStep1Loading(true);
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
      setCreatedUser(user);
      setStep(2);
    } catch (err: unknown) {
      setStep1Error(getFirebaseErrorMessage(err));
    } finally {
      setStep1Loading(false);
    }
  }

  async function handleVerifyCompany() {
    const id = companyIdInput.trim();
    if (!id) return;
    setVerifyError("");
    setVerifiedCompany(null);
    setDepartment("");
    setVerifying(true);
    try {
      const snap = await getDoc(companyRef(id));
      if (!snap.exists()) {
        setVerifyError("ไม่พบบริษัทนี้ในระบบ กรุณาตรวจสอบรหัส");
        return;
      }
      const data = snap.data();
      setVerifiedCompany({
        id: snap.id,
        name: data.name,
        shortName: data.shortName,
        type: data.type,
        color: data.color,
        bg: data.bg,
        logoURL: data.logoURL,
        departments: data.departments ?? [],
      });
    } catch {
      setVerifyError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setVerifying(false);
    }
  }

  async function handleStep2Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!createdUser || !verifiedCompany) return;
    setStep2Error("");
    if (!department.trim()) { setStep2Error("กรุณาระบุแผนก / ทีม"); return; }
    setStep2Loading(true);
    try {
      await setDoc(doc(db, "users", createdUser.uid), {
        role: "employee",
        employeeId: createdUser.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim(),
        department: department.trim(),
        phone: phone.trim(),
        startDate,
        company: verifiedCompany.name,
        companyId: verifiedCompany.id,
        status: "active",
        email: createdUser.email,
        photoURL: createdUser.photoURL ?? null,
        createdAt: serverTimestamp(),
      });
      router.push("/me");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStep2Error(msg);
    } finally {
      setStep2Loading(false);
    }
  }

  function resetVerify() {
    setVerifiedCompany(null);
    setCompanyIdInput("");
    setVerifyError("");
    setDepartment("");
  }

  const hasDepts = (verifiedCompany?.departments ?? []).length > 0;

  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel ─────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col flex-shrink-0 bg-primary select-none">
        <div className="px-12 pt-14">
          <span className="text-white text-[34px] font-bold tracking-[-0.03em] leading-none">UGI</span>
        </div>
        <div className="flex-1 flex flex-col justify-center px-12">
          <p className="text-white/60 text-[13px] font-medium mb-3">
            พอร์ทัลพนักงาน
          </p>
          <p
            className="text-white/90 text-[22px] font-semibold leading-[1.35] mb-4"
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
      <main className="flex flex-1 flex-col items-center justify-start px-6 py-12 bg-background overflow-y-auto">
        <div className="w-full max-w-[420px] animate-enter">
          {/* Mobile wordmark */}
          <div className="lg:hidden mb-10">
            <span className="text-primary-text text-[32px] font-bold tracking-[-0.03em] leading-none">UGI</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-300 ${step >= 1 ? "bg-primary text-white" : "bg-border text-muted"}`}>
                1
              </div>
              <span className={`text-[13px] transition-colors duration-200 ${step === 1 ? "text-ink font-medium" : "text-muted"}`}>
                ข้อมูลส่วนตัว
              </span>
            </div>
            <div className="flex-1 h-px bg-border mx-3" />
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-300 ${step >= 2 ? "bg-primary text-white" : "bg-border text-muted"}`}>
                2
              </div>
              <span className={`text-[13px] transition-colors duration-200 ${step === 2 ? "text-ink font-medium" : "text-muted"}`}>
                ข้อมูลงาน
              </span>
            </div>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form key="step1" onSubmit={handleStep1Submit} className="flex flex-col gap-5">
              <h1 className="text-[24px] font-semibold text-ink tracking-[-0.01em] leading-[1.2] -mt-1 mb-1"
                style={{ textWrap: "balance" } as React.CSSProperties}>
                สมัครใช้งาน
              </h1>

              {/* Photo upload */}
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="photo" className="cursor-pointer group relative">
                  <div className="h-[80px] w-[80px] overflow-hidden rounded-full border-2 border-border bg-surface transition-colors duration-150 group-hover:border-primary flex items-center justify-center">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-8 w-8 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-150">
                    <svg className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  </div>
                  <input id="photo" type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} disabled={step1Loading} />
                </label>
                <p className="text-[12px] text-muted">{photoFile ? photoFile.name : "รูปโปรไฟล์ (ไม่บังคับ)"}</p>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor="firstName" className="text-[13.5px] font-medium text-ink leading-none">ชื่อจริง</label>
                  <input id="firstName" type="text" autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={step1Loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="สมชาย" />
                </div>
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor="lastName" className="text-[13.5px] font-medium text-ink leading-none">นามสกุล</label>
                  <input id="lastName" type="text" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={step1Loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="กิจจา" />
                </div>
              </div>

              {/* Phone + Start date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor="phone" className="text-[13.5px] font-medium text-ink leading-none">เบอร์โทร</label>
                  <input id="phone" type="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={step1Loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="0812345678" />
                </div>
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor="startDate" className="text-[13.5px] font-medium text-ink leading-none">วันที่เริ่มงาน</label>
                  <input id="startDate" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={step1Loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-[7px]">
                <label htmlFor="email" className="text-[13.5px] font-medium text-ink leading-none">อีเมล</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={step1Loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="you@example.com" />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor="password" className="text-[13.5px] font-medium text-ink leading-none">รหัสผ่าน</label>
                  <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={step1Loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="≥ 8 ตัวอักษร" />
                </div>
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor="confirm" className="text-[13.5px] font-medium text-ink leading-none">ยืนยัน</label>
                  <input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={step1Loading} className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="••••••••" />
                </div>
              </div>

              {step1Error && (
                <p key={step1Error} role="alert" className="animate-shake text-[13px] text-error leading-[1.45]">{step1Error}</p>
              )}

              <button
                type="submit"
                disabled={step1Loading}
                className="mt-1 w-full rounded-[6px] bg-primary px-4 py-[11px] text-[15px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-primary-deep active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step1Loading
                  ? <span className="flex items-center justify-center gap-2"><span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white animate-spin" />กำลังดำเนินการ…</span>
                  : "ถัดไป →"}
              </button>

              <p className="mt-1 text-center text-[13px] text-muted">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/employee/login" className="font-medium text-primary-text hover:underline">เข้าสู่ระบบ</Link>
              </p>
              <p className="mt-1 text-center text-[13px] text-muted">
                สมัครในฐานะเจ้าหน้าที่?{" "}
                <Link href="/register" className="font-medium text-primary-text hover:underline">สมัครเจ้าหน้าที่</Link>
              </p>
              <p className="mt-7 text-center text-[11px] text-muted/60">
                จัดทำโดย{" "}
                <a href="https://github.com/Niff1er3oy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-muted">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                  </svg>
                  Niff1er
                </a>
              </p>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && createdUser && (
            <form key="step2" onSubmit={handleStep2Submit} className="flex flex-col gap-5">
              {/* Welcome header */}
              <div className="flex items-center gap-3 mb-1">
                {createdUser.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={createdUser.photoURL} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-[14px] font-semibold shrink-0 select-none">
                    {firstName[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div>
                  <p className="text-[15px] font-semibold text-ink leading-tight">ยินดีต้อนรับ, {firstName}!</p>
                  <p className="text-[13px] text-muted">กรอกข้อมูลการทำงานเพื่อเริ่มต้นใช้งาน</p>
                </div>
              </div>

              {/* Company ID verification */}
              {!verifiedCompany ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="companyId" className="text-[13.5px] font-medium text-ink leading-none">รหัสบริษัท</label>
                    <div className="flex gap-2">
                      <input
                        id="companyId"
                        type="text"
                        value={companyIdInput}
                        onChange={(e) => { setCompanyIdInput(e.target.value); setVerifyError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleVerifyCompany(); } }}
                        disabled={verifying}
                        className="field-input font-mono flex-1"
                        style={{ padding: "10px 14px", fontSize: "15px" }}
                        placeholder="ขอรหัสจากผู้ดูแลระบบ"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCompany}
                        disabled={verifying || !companyIdInput.trim()}
                        className="shrink-0 rounded-[6px] border border-border bg-surface px-4 py-[10px] text-[14px] font-medium text-ink transition-colors duration-150 hover:bg-background hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {verifying
                          ? <span className="flex items-center gap-2"><span className="h-[13px] w-[13px] rounded-full border-2 border-border border-t-ink animate-spin" /></span>
                          : "ตรวจสอบ"}
                      </button>
                    </div>
                    {verifyError && (
                      <p key={verifyError} role="alert" className="animate-shake text-[13px] text-error leading-[1.45]">{verifyError}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Verified company card */
                <div className="flex items-center gap-3 rounded-[10px] border border-success/40 bg-success-pale px-4 py-3">
                  <div
                    className="h-10 w-10 rounded-[7px] flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: verifiedCompany.color }}
                  >
                    {verifiedCompany.logoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={verifiedCompany.logoURL} alt="" className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-white text-[11px] font-bold leading-none text-center">{verifiedCompany.shortName}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink leading-tight truncate">{verifiedCompany.name}</p>
                    <p className="text-[12px] text-success-text">{verifiedCompany.type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetVerify}
                    className="text-[12px] text-muted hover:text-ink transition-colors shrink-0 focus:outline-none focus-visible:underline"
                  >
                    เปลี่ยน
                  </button>
                </div>
              )}

              {/* Position + Department — shown only after company verified */}
              {verifiedCompany && (
                <>
                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="position" className="text-[13.5px] font-medium text-ink leading-none">ตำแหน่งหน้าที่</label>
                    <input
                      id="position"
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={step2Loading}
                      className="field-input"
                      style={{ padding: "10px 14px", fontSize: "15px" }}
                      placeholder="เช่น พนักงานฝ่ายผลิต"
                    />
                  </div>

                  <div className="flex flex-col gap-[7px]">
                    <label htmlFor="department" className="text-[13.5px] font-medium text-ink leading-none">แผนก / ทีม</label>
                    {hasDepts && (
                      <div className="flex flex-wrap gap-2">
                        {verifiedCompany.departments.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDepartment(d)}
                            disabled={step2Loading}
                            className={`px-3 py-[7px] rounded-full text-[13px] font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                              department === d
                                ? "bg-primary text-white"
                                : "bg-surface border border-border text-ink hover:border-primary hover:bg-primary-ghost"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      id="department"
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={step2Loading}
                      className="field-input"
                      style={{ padding: "10px 14px", fontSize: "15px" }}
                      placeholder={hasDepts ? "หรือพิมพ์ชื่อแผนก / ทีม" : "พิมพ์ชื่อแผนก / ทีม"}
                    />
                  </div>

                  {step2Error && (
                    <p key={step2Error} role="alert" className="animate-shake text-[13px] text-error leading-[1.45]">{step2Error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={step2Loading}
                    className="mt-1 w-full rounded-[6px] bg-primary px-4 py-[11px] text-[15px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-primary-deep active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {step2Loading
                      ? <span className="flex items-center justify-center gap-2"><span className="h-[14px] w-[14px] rounded-full border-2 border-white/30 border-t-white animate-spin" />กำลังบันทึก…</span>
                      : "สมัครใช้งาน"}
                  </button>
                </>
              )}
            </form>
          )}
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
