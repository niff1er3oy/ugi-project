"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { COMPANIES, getCompanyStats, type Company } from "@/lib/companies";

// ── Sub-components ─────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="w-36 shrink-0 text-[12px] text-muted">{label}</span>
      <span className="text-right text-[13px] text-ink">{value}</span>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="animate-enter">
      <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{label}</p>
      <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function CompanyLogo({ company, size = 72 }: { company: Company; size?: number }) {
  const initials = company.shortName.replace(/[^A-Z]/g, "").slice(0, 2) || company.shortName.slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-[18px] font-bold shadow-sm ring-4 ring-background"
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

// ── Page ───────────────────────────────────────────────────────
export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const company = COMPANIES.find((c) => c.id === params.id);
  const stats = company ? getCompanyStats(company.name) : null;

  const editButton = (
    <button className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-1.5 text-[12px] font-medium text-ink transition-colors duration-150 hover:bg-surface active:scale-95">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
      </svg>
      แก้ไข
    </button>
  );

  if (!ready) {
    return (
      <div className="flex min-h-64 flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-ghost border-t-primary" />
      </div>
    );
  }

  if (!company || !stats) {
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

  return (
    <>
      <Navbar title="รายละเอียดบริษัท" right={editButton} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-8">

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
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-[oklch(0.37_0.13_145)]">{stats.active}</span>
              <span className="mt-1 text-[10px] text-muted">ปฏิบัติงาน</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-amber-600">{stats.leave}</span>
              <span className="mt-1 text-[10px] text-muted">ลาพัก</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-muted">{stats.resigned}</span>
              <span className="mt-1 text-[10px] text-muted">ลาออก</span>
            </div>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── ข้อมูลบริษัท ──────────────────────────────────── */}
          <Section label="ข้อมูลบริษัท">
            <InfoRow label="เลขทะเบียนนิติบุคคล" value={
              <span className="font-mono text-[12px]">{company.taxId}</span>
            } />
            <InfoRow label="ประเภทนิติบุคคล" value={`บริษัท${company.type}`} />
            <InfoRow label="ปีที่ก่อตั้ง" value={`พ.ศ. ${company.founded}`} />
          </Section>

          {/* ── ช่องทางติดต่อ ──────────────────────────────────── */}
          <Section label="ช่องทางติดต่อ">
            <InfoRow label="ที่อยู่" value={
              <span className="text-left leading-relaxed">{company.address}</span>
            } />
            <InfoRow label="โทรศัพท์" value={
              <a href={`tel:${company.phone}`} className="text-primary hover:underline">{company.phone}</a>
            } />
            <InfoRow label="เว็บไซต์" value={
              <span className="text-primary">{company.website}</span>
            } />
          </Section>

          {/* ── ทีมในบริษัท ───────────────────────────────────── */}
          <Section label="ทีมในบริษัท">
            {stats.departments.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="text-[13px] text-ink">{dept.name}</span>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: dept.bg, color: dept.color }}
                >
                  {dept.count} คน
                </span>
              </div>
            ))}
          </Section>

          {/* ── ลิงก์ไปหน้าพนักงาน ────────────────────────────── */}
          <Link
            href="/employees"
            className="flex items-center justify-between rounded-[12px] border border-border bg-background px-4 py-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface animate-enter"
          >
            <span className="flex items-center gap-3">
              <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              ดูพนักงานทั้งหมด ({stats.total} คน)
            </span>
            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>

        </div>
      </main>
    </>
  );
}
