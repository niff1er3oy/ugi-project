"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { COMPANIES, getCompanyStats, type Company } from "@/lib/companies";
import { EMPLOYEES } from "@/lib/employees";

// ── Sub-components ─────────────────────────────────────────────

function CompanyAvatar({ company, size = 48 }: { company: Company; size?: number }) {
  const initials = company.shortName.replace(/[^A-Z]/g, "").slice(0, 2) || company.shortName.slice(0, 2).toUpperCase();
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[12px] font-bold"
      style={{
        width: size, height: size,
        backgroundColor: company.bg,
        color: company.color,
        fontSize: size * 0.28,
      }}
    >
      {initials}
    </div>
  );
}

function StatBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex max-w-[72px] flex-col items-center">
      <span className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</span>
      <span className="mt-1 text-center text-[10px] leading-tight text-muted">{label}</span>
    </div>
  );
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  const stats = getCompanyStats(company.name);
  return (
    <Link
      href={`/company/${company.id}`}
      className="group flex flex-col rounded-[16px] border border-border bg-background p-5 transition-all duration-150 hover:border-border-strong hover:shadow-sm animate-enter-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      {/* Header row */}
      <div className="flex items-start gap-4">
        <CompanyAvatar company={company} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[14px] font-semibold leading-snug text-ink">
                {company.shortName}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{company.name}</p>
            </div>
            <span
              className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: company.bg, color: company.color }}
            >
              บจก.{company.type === "จำกัด (มหาชน)" ? " (มหาชน)" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Stats */}
      <div className="flex items-center justify-around">
        <StatBadge value={stats.total}    label="พนักงานทั้งหมด" />
        <div className="h-8 w-px bg-border" />
        <StatBadge value={stats.active}   label="ปฏิบัติงาน" />
        <div className="h-8 w-px bg-border" />
        <StatBadge value={stats.leave}    label="ลาพัก" />
        <div className="h-8 w-px bg-border" />
        <StatBadge value={stats.departments.length} label="ทีม" />
      </div>

      {/* Departments */}
      {stats.departments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {stats.departments.map((dept) => (
            <span
              key={dept.name}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[10px] font-medium"
              style={{ backgroundColor: dept.bg, color: dept.color }}
            >
              <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: dept.color }} />
              {dept.name}
              <span className="opacity-60">({dept.count})</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          ก่อตั้ง พ.ศ. {company.founded}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="line-clamp-1">{company.address.split(" ").slice(-2).join(" ")}</span>
        </span>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function CompanyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const totalEmployees = EMPLOYEES.length;
  const activeEmployees = EMPLOYEES.filter((e) => e.status === "active").length;

  if (!ready) {
    return (
      <>
        <Navbar title="บริษัท" back={false} />
        <main className="mx-auto w-full max-w-5xl px-4 py-5" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-5 flex gap-2 sm:gap-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-1 items-center gap-2 sm:gap-3 rounded-[12px] border border-border bg-background px-3 sm:px-4 py-3">
                <div className="hidden sm:block h-9 w-9 shrink-0 animate-pulse rounded-[8px] bg-border" />
                <div>
                  <div className="h-5 w-7 animate-pulse rounded-[3px] bg-border" />
                  <div className="mt-1 h-3 w-16 animate-pulse rounded-[3px] bg-border" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[16px] border border-border bg-background p-5">
                <div className="flex items-start gap-4">
                  <div className="h-[52px] w-[52px] shrink-0 animate-pulse rounded-[12px] bg-border" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="h-4 w-28 animate-pulse rounded-[3px] bg-border" />
                        <div className="mt-1 h-3 w-40 animate-pulse rounded-[3px] bg-border" />
                      </div>
                      <div className="h-5 w-16 animate-pulse rounded-full bg-border" />
                    </div>
                  </div>
                </div>
                <div className="my-4 border-t border-border" />
                <div className="flex items-center justify-around">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex flex-col items-center gap-1">
                      <div className="h-5 w-8 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-3 w-16 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[64, 80, 72].map((w, j) => (
                    <div key={j} className="h-5 animate-pulse rounded-full bg-border" style={{ width: w }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-3.5 w-28 animate-pulse rounded-[3px] bg-border" />
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
        title="บริษัท"
        back={false}
        right={
          <button className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            เพิ่มบริษัท
          </button>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-5">

        {/* ── Summary strip ──────────────────────────────────── */}
        <div className="mb-5 flex gap-2 sm:gap-3 animate-enter">
          <div className="flex flex-1 items-center gap-2 sm:gap-3 rounded-[12px] border border-border bg-background px-3 sm:px-4 py-3">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-primary-ghost">
              <svg className="h-4.5 w-4.5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <p className="text-[18px] sm:text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{COMPANIES.length}</p>
              <p className="mt-1 text-[10px] sm:text-[11px] text-muted leading-tight">บริษัทในเครือ</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 sm:gap-3 rounded-[12px] border border-border bg-background px-3 sm:px-4 py-3">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-success-pale">
              <svg className="h-4.5 w-4.5 text-success-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <p className="text-[18px] sm:text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{totalEmployees}</p>
              <p className="mt-1 text-[10px] sm:text-[11px] text-muted leading-tight">พนักงานทั้งหมด</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 sm:gap-3 rounded-[12px] border border-border bg-background px-3 sm:px-4 py-3">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-accent-pale">
              <svg className="h-4.5 w-4.5 text-accent-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-[18px] sm:text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{activeEmployees}</p>
              <p className="mt-1 text-[10px] sm:text-[11px] text-muted leading-tight">ปฏิบัติงานอยู่</p>
            </div>
          </div>
        </div>

        {/* ── Company cards ──────────────────────────────────── */}
        <div className="space-y-3">
          {COMPANIES.map((company, i) => (
            <CompanyCard key={company.id} company={company} index={i} />
          ))}
        </div>
      </main>
    </>
  );
}
