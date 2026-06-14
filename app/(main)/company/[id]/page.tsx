"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import TeamManager from "@/components/team-manager";
import { fetchCompany, getCompanyStats, type Company } from "@/lib/companies";
import { fetchEmployees, type Employee } from "@/lib/employees";

function CompanyLogo({ company, size = 72 }: { company: Company; size?: number }) {
  const initials = company.shortName.replace(/[^A-Z]/g, "").slice(0, 2) || company.shortName.slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-[18px] font-bold shadow-sm ring-4 ring-background"
      style={{ width: size, height: size, backgroundColor: company.bg, color: company.color, fontSize: size * 0.28 }}
    >
      {company.logoURL ? (
        <img src={company.logoURL} alt={company.shortName} className="h-full w-full object-contain p-[12%]" />
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

  return (
    <>
      <Navbar title="รายละเอียดบริษัท" right={editButton} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-8">

        {/* ── Profile hero ───────────────────────────────────── */}
        <div className="mb-6 mt-4 flex flex-col items-center text-center animate-enter">
          <CompanyLogo company={company} size={76} />

          <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.01em] text-ink leading-snug">
            {company.shortName}
          </h2>
          <p className="mt-1 text-[12px] text-muted">{company.name}</p>

          <span
            className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: company.bg, color: company.color }}
          >
            บริษัท{company.type === "จำกัด (มหาชน)" ? "มหาชน" : company.type}
          </span>

          {/* Stats row */}
          <div className="mt-5 flex w-full max-w-xs items-center justify-around rounded-[12px] border border-border bg-background px-4 py-3">
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{stats.total}</span>
              <span className="mt-1 text-[10px] text-muted">พนักงาน</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-success-text">{stats.active}</span>
              <span className="mt-1 text-[10px] text-muted">ปฏิบัติงาน</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-accent-text">{stats.leave}</span>
              <span className="mt-1 text-[10px] text-muted">ลาพัก</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-muted">{stats.resigned}</span>
              <span className="mt-1 text-[10px] text-muted">ลาออก</span>
            </div>
          </div>
        </div>

        {/* ── Action buttons ─────────────────────────────────── */}
        {(company.phone || company.email || company.website) && (
          <div className="mb-5 flex gap-3">
            {company.phone && (
              <a href={`tel:${company.phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">
                <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" /></svg>
                โทร
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">
                <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                อีเมล
              </a>
            )}
            {company.website && (
              <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">
                <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                เว็บไซต์
              </a>
            )}
          </div>
        )}

        <div className="space-y-5">

          {/* ── ข้อมูลบริษัท ──────────────────────────────────── */}
          <Section label="ข้อมูลบริษัท">
            <InfoRow labelWidth="w-36" label="รหัสบริษัท" value={<span className="font-mono text-[12px]">{company.id}</span>} />
            <InfoRow labelWidth="w-36" label="เลขทะเบียนนิติบุคคล" value={<span className="font-mono text-[12px]">{company.taxId}</span>} />
            <InfoRow labelWidth="w-36" label="ประเภทนิติบุคคล" value={`บริษัท${company.type}`} />
            <InfoRow labelWidth="w-36" label="ปีที่ก่อตั้ง" value={`พ.ศ. ${company.founded}`} />
          </Section>

          {/* ── ช่องทางติดต่อ ──────────────────────────────────── */}
          <Section label="ช่องทางติดต่อ">
            <InfoRow labelWidth="w-36" label="ที่อยู่" value={<span className="text-left leading-relaxed">{company.address}</span>} />
            <InfoRow labelWidth="w-36" label="โทรศัพท์" value={<a href={`tel:${company.phone}`} className="text-primary-text hover:underline">{company.phone}</a>} />
            {company.email && <InfoRow labelWidth="w-36" label="อีเมล" value={<a href={`mailto:${company.email}`} className="break-all text-primary-text hover:underline">{company.email}</a>} />}
            <InfoRow labelWidth="w-36" label="เว็บไซต์" value={<span className="text-primary-text">{company.website}</span>} />
          </Section>

          {/* ── ทีมในบริษัท ───────────────────────────────────── */}
          <TeamManager
            teams={stats.departments.map((d) => ({
              id: `dept-${d.name}`,
              name: d.name,
              color: d.color,
              bg: d.bg,
              count: d.count,
            }))}
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
