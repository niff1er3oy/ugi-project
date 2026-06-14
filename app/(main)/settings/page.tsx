"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  GoogleAuthProvider,
  linkWithPopup,
  linkWithCredential,
  unlink,
  User,
} from "firebase/auth";
import { getDoc, updateDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase/client";
import { userRef } from "@/lib/db";
import { uploadFile } from "@/lib/upload";
import Navbar from "@/components/navbar";

type SaveState = "idle" | "saving" | "saved" | "error";
type PwState  = "idle" | "saving" | "saved" | "error";
type LinkState = "idle" | "linking" | "unlinking" | "error";

type ProfileFields = {
  firstName: string;
  lastName: string;
  position: string;
  username: string;
};

const EMPTY: ProfileFields = { firstName: "", lastName: "", position: "", username: "" };

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [ready, setReady]     = useState(false);
  const [saved, setSaved]     = useState<ProfileFields>(EMPTY);
  const [form, setForm]       = useState<ProfileFields>(EMPTY);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [pwState, setPwState]     = useState<PwState>("idle");
  const [pwError, setPwError]     = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [linkState, setLinkState] = useState<LinkState>("idle");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pwTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/login"); return; }
      setUser(u);
      const snap = await getDoc(userRef(u.uid));
      const data = snap.data() ?? {};
      const profile: ProfileFields = {
        firstName: data.firstName ?? "",
        lastName:  data.lastName  ?? "",
        position:  data.position  ?? "",
        username:  data.username  ?? "",
      };
      setSaved(profile);
      setForm(profile);
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (pwTimerRef.current)   clearTimeout(pwTimerRef.current);
    };
  }, []);

  const isDirty =
    form.firstName !== saved.firstName ||
    form.lastName  !== saved.lastName  ||
    form.position  !== saved.position  ||
    form.username  !== saved.username;

  function set(key: keyof ProfileFields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setSaveState("idle");
    };
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !isDirty) return;
    setSaveState("saving");
    try {
      const trimmed: ProfileFields = {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        position:  form.position.trim(),
        username:  form.username.trim(),
      };
      await updateDoc(userRef(user.uid), trimmed);
      await updateProfile(user, {
        displayName: `${trimmed.firstName} ${trimmed.lastName}`.trim(),
      });
      setSaved(trimmed);
      setForm(trimmed);
      setSaveState("saved");
      saveTimerRef.current = setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = "";
    setAvatarUploading(true);
    try {
      const url = await uploadFile(file, `avatars/${user.uid}`);
      await updateProfile(user, { photoURL: url });
      await updateDoc(userRef(user.uid), { photoURL: url });
      await user.reload();
      setUser(auth.currentUser);
    } catch {
      // silent — avatar stays unchanged
    } finally {
      setAvatarUploading(false);
    }
  }

  const hasPasswordProvider = user?.providerData.some((p) => p.providerId === "password") ?? false;

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user?.email) return;
    setPwError("");
    if (newPw !== confirmPw) { setPwError("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    if (newPw.length < 6)    { setPwError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setPwState("saving");
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwState("saved");
      pwTimerRef.current = setTimeout(() => setPwState("idle"), 2500);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      setPwError(
        code === "auth/wrong-password" || code === "auth/invalid-credential"
          ? "รหัสผ่านปัจจุบันไม่ถูกต้อง"
          : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"
      );
      setPwState("error");
    }
  }

  async function handleSetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user?.email) return;
    setPwError("");
    if (newPw !== confirmPw) { setPwError("รหัสผ่านไม่ตรงกัน"); return; }
    if (newPw.length < 6)    { setPwError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setPwState("saving");
    try {
      await linkWithCredential(user, EmailAuthProvider.credential(user.email, newPw));
      await user.reload();
      setUser(auth.currentUser);
      setNewPw(""); setConfirmPw("");
      setPwState("saved");
      pwTimerRef.current = setTimeout(() => setPwState("idle"), 2500);
    } catch {
      setPwError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      setPwState("error");
    }
  }

  const googleProvider = user?.providerData.find((p) => p.providerId === "google.com") ?? null;
  const isGoogleLinked = googleProvider !== null;
  const canUnlink = (user?.providerData.length ?? 0) > 1;

  async function handleLinkGoogle() {
    if (!user) return;
    setLinkState("linking");
    try {
      await linkWithPopup(user, new GoogleAuthProvider());
      await user.reload();
      setUser(auth.currentUser);
      setLinkState("idle");
    } catch {
      setLinkState("error");
    }
  }

  async function handleUnlinkGoogle() {
    if (!user || !canUnlink) return;
    setLinkState("unlinking");
    try {
      await unlink(user, "google.com");
      await user.reload();
      setUser(auth.currentUser);
      setLinkState("idle");
    } catch {
      setLinkState("error");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (!ready) {
    return (
      <>
        <Navbar title="ตั้งค่า" back={false} />
        <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6 flex justify-center" aria-hidden="true">
            <div className="h-20 w-20 animate-pulse rounded-full bg-border" />
          </div>
          <div className="mb-6" aria-hidden="true">
            <div className="mb-2 h-3 w-24 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-background px-4 py-3.5">
                  <div className="mb-1.5 h-3 w-14 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
                </div>
              ))}
              <div className="flex items-center justify-end bg-background px-4 py-3.5">
                <div className="h-8 w-16 animate-pulse rounded-[6px] bg-border" />
              </div>
            </div>
          </div>
          <div className="mb-6" aria-hidden="true">
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
          <div className="mb-6" aria-hidden="true">
            <div className="mb-2 h-4 w-16 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-background px-4 py-3.5">
                  <div className="h-3.5 w-28 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-3.5 w-16 animate-pulse rounded-[3px] bg-border" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2" aria-hidden="true">
            <div className="h-[52px] w-full animate-pulse rounded-[12px] bg-border" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="ตั้งค่า" back={false} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">

        {/* Screen reader status announcements */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {saveState === "saved" && "บันทึกข้อมูลโปรไฟล์แล้ว"}
          {saveState === "error" && "เกิดข้อผิดพลาดในการบันทึก"}
          {pwState === "saved" && (hasPasswordProvider ? "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" : "ตั้งรหัสผ่านเรียบร้อยแล้ว")}
          {pwState === "error" && pwError}
          {linkState === "error" && "เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี"}
        </div>

        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-2 animate-enter" style={{ animationDelay: "30ms" }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            aria-label="เปลี่ยนรูปโปรไฟล์"
            className="group relative h-20 w-20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? "รูปโปรไฟล์"}
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
            <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-ink/60 transition-opacity duration-150 ${avatarUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {avatarUploading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              )}
            </div>
          </button>
          <p className="text-[12px] text-muted">กดที่รูปเพื่อเปลี่ยน</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Profile form */}
        <div className="mb-6 animate-enter" style={{ animationDelay: "60ms" }}>
          <p className="mb-2 px-1 text-[13px] font-medium text-muted">ข้อมูลโปรไฟล์</p>
          <form
            onSubmit={handleSave}
            className="rounded-[12px] border border-border overflow-hidden divide-y divide-border"
          >
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="bg-background px-4 py-3.5">
                <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="firstName">ชื่อ</label>
                <input id="firstName" type="text" value={form.firstName} onChange={set("firstName")} className="field-input" placeholder="สมชาย" autoComplete="given-name" />
              </div>
              <div className="bg-background px-4 py-3.5">
                <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="lastName">สกุล</label>
                <input id="lastName" type="text" value={form.lastName} onChange={set("lastName")} className="field-input" placeholder="กิจจา" autoComplete="family-name" />
              </div>
            </div>
            <div className="bg-background px-4 py-3.5">
              <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="position">ตำแหน่ง</label>
              <input id="position" type="text" value={form.position} onChange={set("position")} className="field-input" placeholder="เช่น วิศวกรอาวุโส, ผู้จัดการฝ่าย HR" />
            </div>
            <div className="bg-background px-4 py-3.5">
              <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="username">ชื่อผู้ใช้</label>
              <input id="username" type="text" value={form.username} onChange={set("username")} className="field-input" placeholder="@username" autoComplete="username" />
            </div>
            <div className="bg-background px-4 py-3.5">
              <label className="block text-[11px] font-medium text-muted mb-1.5">อีเมล</label>
              <input type="email" value={user?.email ?? ""} disabled className="field-input" />
              <p className="mt-1.5 text-[11px] text-muted">ไม่สามารถแก้ไขอีเมลได้</p>
            </div>
            <div className="flex items-center justify-between gap-4 bg-background px-4 py-3.5">
              {saveState === "error"  && <p className="text-[12px] text-error">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</p>}
              {saveState === "saved"  && <p className="text-[12px] text-primary-text">บันทึกเรียบร้อยแล้ว</p>}
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

        {/* Security */}
        <Section label="ความปลอดภัย" delay={100}>
          {hasPasswordProvider ? (
            <form onSubmit={handlePasswordChange} className="divide-y divide-border">
              <div className="bg-background px-4 py-3.5">
                <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="currentPw">รหัสผ่านปัจจุบัน</label>
                <input
                  id="currentPw"
                  type="password"
                  value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setPwError(""); setPwState("idle"); }}
                  className="field-input"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              <div className="bg-background px-4 py-3.5">
                <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="newPw">รหัสผ่านใหม่</label>
                <input
                  id="newPw"
                  type="password"
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError(""); setPwState("idle"); }}
                  className="field-input"
                  autoComplete="new-password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
              <div className="bg-background px-4 py-3.5">
                <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="confirmPw">ยืนยันรหัสผ่านใหม่</label>
                <input
                  id="confirmPw"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); setPwError(""); setPwState("idle"); }}
                  className="field-input"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between gap-4 bg-background px-4 py-3.5">
                {pwError && <p className="text-[12px] text-error">{pwError}</p>}
                {pwState === "saved" && !pwError && <p className="text-[12px] text-primary-text">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>}
                {!pwError && pwState !== "saved" && <span />}
                <button
                  type="submit"
                  disabled={!currentPw || !newPw || !confirmPw || pwState === "saving"}
                  className="shrink-0 rounded-[6px] bg-primary px-4 py-2 text-[13px] font-medium text-white transition-[background-color,opacity] duration-150 hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pwState === "saving" ? "กำลังบันทึก…" : "เปลี่ยนรหัสผ่าน"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSetPassword} className="divide-y divide-border">
              <div className="bg-background px-4 py-3.5">
                <p className="text-[14px] font-medium text-ink">ตั้งรหัสผ่าน</p>
                <p className="mt-0.5 text-[12px] text-muted">เพิ่มรหัสผ่านเพื่อเข้าสู่ระบบด้วยอีเมลได้</p>
              </div>
              <div className="bg-background px-4 py-3.5">
                <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="newPwSet">รหัสผ่านใหม่</label>
                <input
                  id="newPwSet"
                  type="password"
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError(""); setPwState("idle"); }}
                  className="field-input"
                  autoComplete="new-password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
              <div className="bg-background px-4 py-3.5">
                <label className="block text-[11px] font-medium text-muted mb-1.5" htmlFor="confirmPwSet">ยืนยันรหัสผ่าน</label>
                <input
                  id="confirmPwSet"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); setPwError(""); setPwState("idle"); }}
                  className="field-input"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between gap-4 bg-background px-4 py-3.5">
                {pwError && <p className="text-[12px] text-error">{pwError}</p>}
                {pwState === "saved" && !pwError && <p className="text-[12px] text-primary-text">ตั้งรหัสผ่านเรียบร้อยแล้ว</p>}
                {!pwError && pwState !== "saved" && <span />}
                <button
                  type="submit"
                  disabled={!newPw || !confirmPw || pwState === "saving"}
                  className="shrink-0 rounded-[6px] bg-primary px-4 py-2 text-[13px] font-medium text-white transition-[background-color,opacity] duration-150 hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pwState === "saving" ? "กำลังบันทึก…" : "ตั้งรหัสผ่าน"}
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* Account connections */}
        <Section label="การเชื่อมต่อบัญชี" delay={140}>
          <div className="bg-background px-4 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GoogleIcon />
                <div>
                  <p className="text-[14px] font-medium text-ink">Google</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {isGoogleLinked ? googleProvider?.email : "ยังไม่ได้เชื่อมต่อ"}
                  </p>
                </div>
              </div>
              {isGoogleLinked ? (
                <button
                  type="button"
                  onClick={handleUnlinkGoogle}
                  disabled={!canUnlink || linkState !== "idle"}
                  className="shrink-0 rounded-[6px] border border-border px-3 py-1.5 text-[13px] font-medium text-ink transition-[background-color,border-color] duration-150 hover:bg-surface hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {linkState === "unlinking" ? "กำลังยกเลิก…" : "ยกเลิกการเชื่อม"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLinkGoogle}
                  disabled={linkState !== "idle"}
                  className="shrink-0 rounded-[6px] bg-primary px-3 py-1.5 text-[13px] font-medium text-white transition-[background-color,opacity] duration-150 hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {linkState === "linking" ? "กำลังเชื่อมต่อ…" : "เชื่อมต่อ"}
                </button>
              )}
            </div>
            {isGoogleLinked && !canUnlink && (
              <p className="mt-2 text-[12px] text-muted">ไม่สามารถยกเลิกได้เนื่องจากเป็นวิธีเข้าสู่ระบบเดียว</p>
            )}
            {linkState === "error" && (
              <p className="mt-2 text-[12px] text-error">เกิดข้อผิดพลาด ลองใหม่อีกครั้ง</p>
            )}
          </div>
        </Section>

        {/* About */}
        <Section label="เกี่ยวกับ" delay={180}>
          <SettingRow label="เวอร์ชัน">
            <span className="text-[13px] text-muted">1.0.0</span>
          </SettingRow>
          <SettingRow label="ภาษา">
            <span className="text-[13px] text-muted">ภาษาไทย</span>
          </SettingRow>
          <SettingRow label="จัดทำโดย">
            <a
              href="https://github.com/Niff1er3oy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-muted transition-colors duration-150 hover:text-ink"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              Niff1er
            </a>
          </SettingRow>
        </Section>

        {/* Logout */}
        <div className="mt-2 animate-enter" style={{ animationDelay: "220ms" }}>
          <div className="rounded-[12px] border border-border overflow-hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] font-medium text-error transition-colors duration-150 hover:bg-error-pale focus:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-inset"
            >
              ออกจากระบบ
              <svg className="h-4 w-4 shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>

      </main>
    </>
  );
}

function Section({ label, delay, children }: { label: string; delay: number; children: React.ReactNode }) {
  return (
    <div className="mb-6 animate-enter" style={{ animationDelay: `${delay}ms` }}>
      <p className="mb-2 px-1 text-[13px] font-medium text-muted">{label}</p>
      <div className="rounded-[12px] border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-background px-4 py-3.5">
      <p className="text-[14px] font-medium text-ink">{label}</p>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

