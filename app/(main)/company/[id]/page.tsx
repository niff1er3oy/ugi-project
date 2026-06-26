"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import TeamManager from "@/components/team-manager";
import { fetchCompany, updateCompany, getCompanyStats, type Company } from "@/lib/companies";
import { fetchEmployees, type Employee } from "@/lib/employees";

function CompanyLogo({ company, size = 72 }: { company: Company; size?: number }) {
  const initials = company.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "บ";
  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-[18px] bg-primary font-bold text-white shadow-sm ring-4 ring-background"
      style={{ width: size, height: size, fontSize: size * 0.28 }}
    >
      {company.logoURL ? (
        <img src={company.logoURL} alt={company.name} className="h-full w-full object-contain p-[12%]" />
      ) : initials}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    Promise.all([fetchCompany(params.id), fetchEmployees()]).then(([co, emps]) => {
      setCompany(co);
      setEmployees(emps);
      setLoading(false);
    });
  }, [params.id]);

  const editButton = (
    <button
      onClick={() => router.push(`/company/${params.id}/edit`)}
      className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-1.5 text-[12px] font-medium text-ink transition-colors duration-150 hover:bg-surface active:scale-95"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
      </svg>
      แก้ไข
    </button>
  );

  if (loading) {
    return (
      <>
        <Navbar title="รายละเอียดบริษัท" />
        <main className="mx-auto w-full max-w-3xl px-4 pb-8" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6 mt-4 flex flex-col items-center text-center" aria-hidden="true">
            <div className="h-[76px] w-[76px] animate-pulse rounded-[18px] bg-border" />
            <div className="mt-4 h-[19px] w-32 animate-pulse rounded-[3px] bg-border" />
            <div className="mt-1 h-3 w-48 animate-pulse rounded-[3px] bg-border" />
            <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-border" />
            <div className="mt-5 w-full max-w-xs rounded-[12px] border border-border bg-background px-4 py-3">
              <div className="flex items-center justify-around">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="h-5 w-8 animate-pulse rounded-[3px] bg-border" />
                    <div className="h-3 w-12 animate-pulse rounded-[3px] bg-border" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-5" aria-hidden="true">
            {[3, 3, 4].map((rows, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-24 animate-pulse rounded-[3px] bg-border" />
                <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
                  {Array.from({ length: rows }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between px-4 py-3">
                      <div className="h-3.5 w-28 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <Navbar title="รายละเอียดบริษัท" />
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-ink">ไม่พบข้อมูลบริษัท</p>
          <p className="mt-1 text-[13px] text-muted">{params.id}</p>
        </div>
      </>
    );
  }

  const stats = getCompanyStats(company.name, employees);
  const statsByName = new Map(stats.departments.map((d) => [d.name, d]));
  const teamEntries = company.departments.map((name, idx) => {
    const s = statsByName.get(name);
    return { id: `dept-${idx}`, name, color: s?.color ?? "var(--muted)", bg: s?.bg ?? "var(--surface)", count: s?.count ?? 0 };
  });

  return (
    <>
      <Navbar title="รายละเอียดบริษัท" right={editButton} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-8">

        {/* ── Profile hero ───────────────────────────────────── */}
        <div className="mb-6 mt-4 flex flex-col items-center text-center animate-enter">
          <CompanyLogo company={company} size={76} />

          <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.01em] text-ink leading-snug">
            {company.name}
          </h2>

          <span className="mt-3 inline-flex items-center rounded-full bg-primary-ghost px-3 py-1 text-[11px] font-semibold text-primary-text">
            {company.type}
          </span>

          {/* Stats row */}
          <div className="mt-5 flex w-full max-w-xs items-center justify-around rounded-[12px] border border-border bg-background px-4 py-3">
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{stats.total}</span>
              <span className="mt-1 text-[10px] text-muted">พนักงาน</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{company.departments.length}</span>
              <span className="mt-1 text-[10px] text-muted">ทีม</span>
            </div>
          </div>
        </div>

        {/* ── Action buttons ─────────────────────────────────── */}
        {company.phone && (
          <div className="mb-5">
            <a href={`tel:${company.phone}`} className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">
              <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" /></svg>
              โทร {company.phone}
            </a>
          </div>
        )}

        <div className="space-y-5">

          {/* ── ข้อมูลบริษัท ──────────────────────────────────── */}
          <Section label="ข้อมูลบริษัท">
            <InfoRow labelWidth="w-36" label="รหัสบริษัท" value={<span className="font-mono text-[12px]">{company.id}</span>} />
            <InfoRow labelWidth="w-36" label="ประเภท" value={company.type} />
            {company.phone && <InfoRow labelWidth="w-36" label="โทรศัพท์" value={<a href={`tel:${company.phone}`} className="text-primary-text hover:underline">{company.phone}</a>} />}
          </Section>

          {/* ── ทีมในบริษัท ───────────────────────────────────── */}
          <TeamManager
            teams={teamEntries}
            onUpdate={async (names) => {
              await updateCompany(params.id, { departments: names });
              setCompany((c) => c ? { ...c, departments: names } : c);
            }}
          />

          {/* ── ลิงก์ไปหน้าพนักงาน ────────────────────────────── */}
          <Link
            href={`/employees?company=${encodeURIComponent(company.name)}`}
            className="flex items-center justify-between rounded-[12px] border border-border bg-background px-4 py-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface animate-enter"
          >
            <span className="flex items-center gap-3">
              <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
              ดูพนักงานทั้งหมด ({stats.total} คน)
            </span>
            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </Link>

        </div>
      </main>
    </>
  );
}
