"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
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

function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function EmployeeSetupProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [step, setStep] = useState<1 | 2>(1);

  // ── Step 1 state ──────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");

  // ── Step 2 state ──────────────────────────────────
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [verifiedCompany, setVerifiedCompany] = useState<VerifiedCompany | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [step2Error, setStep2Error] = useState("");
  const [step2Loading, setStep2Loading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/employee/login"); return; }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          router.replace(snap.data().role === "officer" ? "/" : "/me");
          return;
        }
      } catch {
        // Rules may not be configured yet — show form anyway
      }
      const parts = (u.displayName ?? "").split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setUser(u);
    });
  }, [router]);

  async function handleStep1Next(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep(2);
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
    if (!user || !verifiedCompany) return;
    setStep2Error("");
    if (!department.trim()) { setStep2Error("กรุณาระบุแผนก / ทีม"); return; }
    setStep2Loading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        role: "employee",
        employeeId: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: position.trim(),
        department: department.trim(),
        phone: phone.trim(),
        startDate,
        company: verifiedCompany.name,
        companyId: verifiedCompany.id,
        status: "active",
        email: user.email,
        photoURL: user.photoURL ?? null,
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

  // Loading skeleton
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="h-7 w-12 animate-pulse rounded-[3px] bg-border mb-10" />
          <div className="h-[60px] w-[60px] animate-pulse rounded-full bg-border mb-6" />
          <div className="h-7 w-48 animate-pulse rounded-[3px] bg-border mb-2" />
          <div className="h-4 w-40 animate-pulse rounded-[3px] bg-border mb-8" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[46px] animate-pulse rounded-[6px] bg-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-start px-6 py-12 overflow-y-auto">
      <div className="w-full max-w-sm mx-auto animate-enter">
        <span className="text-primary-text text-[28px] font-bold tracking-[-0.03em] leading-none">UGI</span>

        {/* User identity */}
        <div className="mt-8 mb-6 flex items-center gap-4">
          <div
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ background: "var(--primary)" }}
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-white text-[18px] font-semibold select-none">
                {getInitials(user.displayName)}
              </span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.08em] mb-0.5">พอร์ทัลพนักงาน</p>
            <p className="text-[15px] font-semibold text-ink leading-snug">กรอกข้อมูลส่วนตัว</p>
            <p className="text-[13px] text-muted">{user.email}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-7">
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
          <form key="step1" onSubmit={handleStep1Next} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-[7px]">
                <label htmlFor="firstName" className="text-[13.5px] font-medium text-ink leading-none">ชื่อจริง</label>
                <input
                  id="firstName" type="text" autoComplete="given-name" required
                  value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="สมชาย"
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <label htmlFor="lastName" className="text-[13.5px] font-medium text-ink leading-none">นามสกุล</label>
                <input
                  id="lastName" type="text" autoComplete="family-name" required
                  value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="กิจจา"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-[7px]">
                <label htmlFor="phone" className="text-[13.5px] font-medium text-ink leading-none">เบอร์โทร</label>
                <input
                  id="phone" type="tel" autoComplete="tel" required
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="0812345678"
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <label htmlFor="startDate" className="text-[13.5px] font-medium text-ink leading-none">วันที่เริ่มงาน</label>
                <input
                  id="startDate" type="date" required
                  value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="field-input" style={{ padding: "10px 14px", fontSize: "15px" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-[6px] bg-primary px-4 py-[11px] text-[15px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-primary-deep active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              ถัดไป →
            </button>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form key="step2" onSubmit={handleStep2Submit} className="flex flex-col gap-5">
            {/* Company verification */}
            {!verifiedCompany ? (
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
                      ? <span className="flex items-center gap-1.5"><span className="h-[13px] w-[13px] rounded-full border-2 border-border border-t-ink animate-spin" /></span>
                      : "ตรวจสอบ"}
                  </button>
                </div>
                {verifyError && (
                  <p key={verifyError} role="alert" className="animate-shake text-[13px] text-error leading-[1.45]">{verifyError}</p>
                )}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-1 text-[13px] text-muted hover:text-ink transition-colors text-left"
                >
                  ← กลับ
                </button>
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
                  className="text-[12px] text-muted hover:text-ink transition-colors shrink-0"
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
                    id="position" type="text" required
                    value={position} onChange={(e) => setPosition(e.target.value)}
                    disabled={step2Loading} className="field-input"
                    style={{ padding: "10px 14px", fontSize: "15px" }} placeholder="เช่น พนักงานฝ่ายผลิต"
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
                    id="department" type="text" required
                    value={department} onChange={(e) => setDepartment(e.target.value)}
                    disabled={step2Loading} className="field-input"
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
                    : "บันทึกและเริ่มใช้งาน"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
