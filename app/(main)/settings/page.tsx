"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";

type NotifSettings = {
  training: boolean;
  reports: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [notif, setNotif] = useState<NotifSettings>({
    training: true,
    reports: false,
  });

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      else {
        setUser(u);
        setReady(true);
      }
    });
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  function toggleNotif(key: keyof NotifSettings) {
    setNotif((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (!ready) {
    return (
      <>
        <Navbar title="ตั้งค่า" back={false} />
        <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6" aria-hidden="true">
            <div className="mb-2 h-4 w-20 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border">
              <div className="flex items-center gap-3 bg-background px-4 py-3.5">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-border" />
                <div>
                  <div className="h-3.5 w-28 animate-pulse rounded-[3px] bg-border" />
                  <div className="mt-1 h-3 w-40 animate-pulse rounded-[3px] bg-border" />
                </div>
              </div>
            </div>
          </div>
          <div className="mb-6" aria-hidden="true">
            <div className="mb-2 h-4 w-24 animate-pulse rounded-[3px] bg-border" />
            <div className="overflow-hidden rounded-[12px] border border-border divide-y divide-border">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-background px-4 py-3.5">
                  <div>
                    <div className="h-3.5 w-40 animate-pulse rounded-[3px] bg-border" />
                    <div className="mt-1 h-3 w-56 animate-pulse rounded-[3px] bg-border" />
                  </div>
                  <div className="h-6 w-11 shrink-0 animate-pulse rounded-full bg-border" />
                </div>
              ))}
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

      {/* Account */}
      <Section label="บัญชีของฉัน" delay={40}>
        <LinkRow
          href="/settings/account"
          label={
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? "avatar"}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-primary/20"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-ghost text-primary-text shrink-0">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink truncate">
                  {user?.displayName ?? "ผู้ใช้งาน"}
                </p>
                <p className="text-[12px] text-muted truncate">{user?.email}</p>
              </div>
            </div>
          }
        />
      </Section>

      {/* Notifications */}
      <Section label="การแจ้งเตือน" delay={80}>
        <SettingRow
          label="การอบรมค้างชำระ"
          description="แจ้งเตือนเมื่อมีพนักงานที่ยังไม่ผ่านการอบรม"
        >
          <Toggle checked={notif.training} onChange={() => toggleNotif("training")} />
        </SettingRow>
        <Divider />
        <SettingRow
          label="รายงานประจำเดือน"
          description="แจ้งเตือนเมื่อรายงานสรุปพร้อมดาวน์โหลด"
        >
          <Toggle checked={notif.reports} onChange={() => toggleNotif("reports")} />
        </SettingRow>
      </Section>

      {/* About */}
      <Section label="เกี่ยวกับ" delay={120}>
        <SettingRow label="เวอร์ชัน">
          <span className="text-[13px] text-muted">1.0.0</span>
        </SettingRow>
        <Divider />
        <SettingRow label="ภาษา">
          <span className="text-[13px] text-muted">ภาษาไทย</span>
        </SettingRow>
        <Divider />
        <LinkRow label="นโยบายความเป็นส่วนตัว" href="#" />
        <Divider />
        <LinkRow label="ติดต่อฝ่ายสนับสนุน" href="#" />
      </Section>

      {/* Logout */}
      <div className="mt-2 animate-enter" style={{ animationDelay: "160ms" }}>
        <div className="rounded-[12px] border border-border overflow-hidden">
          <button
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

function Section({
  label,
  delay,
  children,
}: {
  label: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 animate-enter" style={{ animationDelay: `${delay}ms` }}>
      <p className="mb-2 px-1 text-[13px] font-medium text-muted">
        {label}
      </p>
      <div className="rounded-[12px] border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-background px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 text-[13px] text-muted leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function LinkRow({ label, href }: { label: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-3 bg-background px-4 py-3.5 transition-colors duration-150 hover:bg-surface"
    >
      <div className="min-w-0 flex-1">{typeof label === "string" ? <p className="text-[14px] font-medium text-ink">{label}</p> : label}</div>
      <svg
        className="h-3.5 w-3.5 text-border-strong transition-[color,transform] duration-150 group-hover:text-primary-text group-hover:translate-x-[2px]"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M6 3.5l4 4.5-4 4.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function Divider() {
  return <div className="h-px bg-border" />;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-border-strong"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
