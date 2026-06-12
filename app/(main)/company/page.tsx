"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import { COMPANIES, getCompanyStats, type Company } from "@/lib/companies";
import CompanyForm, { type CompanyFormData } from "@/components/company-form";
import TeamManager, { type TeamEntry } from "@/components/team-manager";

// ── Sub-components ─────────────────────────────────────────────

function CompanyAvatar({ company, size = 44 }: { company: Company; size?: number }) {
  const initials =
    company.shortName.replace(/[^A-Z]/g, "").slice(0, 2) ||
    company.shortName.slice(0, 2).toUpperCase();
  const radius = size >= 56 ? "rounded-[16px]" : "rounded-[12px]";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden font-bold ${radius}`}
      style={{
        width: size,
        height: size,
        backgroundColor: company.bg,
        color: company.color,
        fontSize: size * 0.28,
      }}
    >
      {company.logoURL ? (
        <img src={company.logoURL} alt={company.shortName} className="h-full w-full object-contain p-[12%]" />
      ) : (
        initials
      )}
    </div>
  );
}

function CompanyCard({
  company,
  index,
  onSelect,
}: {
  company: Company;
  index: number;
  onSelect: (id: string) => void;
}) {
  const stats = getCompanyStats(company.name);

  return (
    <Link
      href={`/company/${company.id}`}
      onClick={(e) => {
        if (window.innerWidth >= 1024) {
          e.preventDefault();
          onSelect(company.id);
        }
      }}
      className="block rounded-[12px] border border-border bg-background transition-shadow duration-150 hover:shadow-sm animate-enter-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <CompanyAvatar company={company} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-ink">
                {company.shortName}
              </p>
              <p className="mt-0.5 truncate text-[11px] leading-snug text-muted">
                {company.name}
              </p>
            </div>
            <span
              className="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: company.bg, color: company.color }}
            >
              {company.type === "จำกัด (มหาชน)" ? "มหาชน" : company.type}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-border" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          {stats.total} คน
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          ก่อตั้ง พ.ศ. {company.founded}
        </span>
        {stats.departments.length > 0 && (
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            {stats.departments.length} ทีม
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Detail panel ───────────────────────────────────────────────

function CompanyDetailPanel({
  company,
  onClose,
  onEdit,
}: {
  company: Company;
  onClose: () => void;
  onEdit: () => void;
}) {
  const stats = getCompanyStats(company.name);

  return (
    <div className="px-6 py-6 animate-enter">
      {/* Top row */}
      <div className="mb-5 flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: company.bg, color: company.color }}
        >
          บริษัท{company.type === "จำกัด (มหาชน)" ? "มหาชน" : company.type}
        </span>
        <button
          onClick={onClose}
          aria-label="ปิด"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Identity */}
      <div className="mb-6 flex gap-4">
        <CompanyAvatar company={company} size={52} />
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-snug text-ink">{company.shortName}</h2>
          <p className="mt-0.5 text-[12px] text-muted">{company.name}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-5 flex gap-3">
        {company.phone && (
          <a
            href={`tel:${company.phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]"
          >
            <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
            </svg>
            โทร
          </a>
        )}
        {company.email && (
          <a
            href={`mailto:${company.email}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]"
          >
            <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            อีเมล
          </a>
        )}
        {company.website && (
          <a
            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]"
          >
            <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            เว็บไซต์
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 flex items-center justify-around rounded-[12px] border border-border bg-surface px-4 py-3">
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

      <div className="space-y-5">
        <Section label="ข้อมูลบริษัท">
          <InfoRow
            labelWidth="w-36"
            label="เลขทะเบียนนิติบุคคล"
            value={<span className="font-mono text-[12px]">{company.taxId}</span>}
          />
          <InfoRow labelWidth="w-36" label="ประเภทนิติบุคคล" value={`บริษัท${company.type}`} />
          <InfoRow labelWidth="w-36" label="ปีที่ก่อตั้ง" value={`พ.ศ. ${company.founded}`} />
        </Section>

        <Section label="ช่องทางติดต่อ">
          <InfoRow
            labelWidth="w-36"
            label="ที่อยู่"
            value={<span className="text-left leading-relaxed">{company.address}</span>}
          />
          <InfoRow
            labelWidth="w-36"
            label="โทรศัพท์"
            value={<a href={`tel:${company.phone}`} className="text-primary-text hover:underline">{company.phone}</a>}
          />
          {company.email && (
            <InfoRow
              labelWidth="w-36"
              label="อีเมล"
              value={<a href={`mailto:${company.email}`} className="break-all text-primary-text hover:underline">{company.email}</a>}
            />
          )}
          <InfoRow
            labelWidth="w-36"
            label="เว็บไซต์"
            value={<span className="text-primary-text">{company.website}</span>}
          />
        </Section>

        <TeamManager
          teams={stats.departments.map((d) => ({
            id: `dept-${d.name}`,
            name: d.name,
            color: d.color,
            bg: d.bg,
            count: d.count,
          }))}
        />
      </div>

      {/* Edit action */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
          </svg>
          แก้ไขข้อมูล
        </button>
      </div>

      <Link
        href={`/employees?company=${encodeURIComponent(company.name)}`}
        className="mt-3 flex items-center justify-between rounded-[10px] border border-border bg-background px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-surface"
      >
        <span className="flex items-center gap-2.5">
          <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          ดูพนักงานทั้งหมด ({stats.total} คน)
        </span>
        <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
    </div>
  );
}

function CompanyEditPanel({ company, onDone }: { company: Company; onDone: () => void }) {
  function handleSubmit(data: CompanyFormData) {
    // TODO: update in Firestore
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">แก้ไขข้อมูลบริษัท</p>
        <button
          onClick={onDone}
          aria-label="ปิด"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <CompanyForm
        defaultValues={company}
        companyId={company.id}
        submitLabel="บันทึกการเปลี่ยนแปลง"
        onSubmit={handleSubmit}
        onCancel={onDone}
      />
    </div>
  );
}

function CompanyAddPanel({ onDone }: { onDone: () => void }) {
  function handleSubmit(data: CompanyFormData) {
    // TODO: save to Firestore
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">เพิ่มบริษัทใหม่</p>
        <button
          onClick={onDone}
          aria-label="ปิด"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <CompanyForm
        submitLabel="เพิ่มบริษัท"
        onSubmit={handleSubmit}
        onCancel={onDone}
      />
    </div>
  );
}

function DetailEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </div>
      <p className="text-[14px] font-medium text-ink">เลือกบริษัท</p>
      <p className="mt-1 text-[12px] text-muted">เพื่อดูรายละเอียด</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function CompanyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<"detail" | "edit" | "add">("detail");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COMPANIES.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (q) {
        const hay = [c.shortName, c.name, c.type, c.taxId, c.address].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, typeFilter]);

  if (!ready) {
    return (
      <>
        <Navbar title="บริษัท" back={false} />
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md" aria-hidden="true">
          <div className="space-y-3 px-4 pb-3 pt-3">
            <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            <div className="flex gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-16 animate-pulse rounded-[6px] bg-border" />
              ))}
            </div>
          </div>
        </div>
        <main className="w-full px-4 py-4" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-3 h-3.5 w-16 animate-pulse rounded-[3px] bg-border" aria-hidden="true" />
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[12px] border border-border bg-background">
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-[12px] bg-border" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="h-4 w-32 animate-pulse rounded-[3px] bg-border" />
                        <div className="mt-1 h-3 w-48 animate-pulse rounded-[3px] bg-border" />
                      </div>
                      <div className="h-5 w-14 animate-pulse rounded-full bg-border" />
                    </div>
                  </div>
                </div>
                <div className="mx-4 border-t border-border" />
                <div className="flex gap-4 px-4 py-3">
                  <div className="h-4 w-14 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-4 w-24 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-4 w-14 animate-pulse rounded-[3px] bg-border" />
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
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setSelectedId(null);
                setPanelMode("add");
              } else {
                router.push("/company/new");
              }
            }}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            เพิ่มบริษัท
          </button>
        }
      />

      <main className="w-full lg:flex lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">

        {/* Left: filter + list */}
        <div className="lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:border-r lg:border-border">

          {/* Search + summary strip */}
          <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md lg:static lg:z-auto lg:shrink-0">
            <div className="space-y-3 px-4 pb-3 pt-3">
              <div className="relative">
                <input
                  type="search"
                  placeholder="ค้นหาบริษัท..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="field-input pr-9"
                />
                {search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-border text-muted hover:bg-border-strong hover:text-ink"
                    aria-label="ล้างคำค้นหา"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                )}
              </div>
              <div className="flex gap-1.5" role="group" aria-label="กรองตามประเภทบริษัท">
                {(["all", "จำกัด", "มหาชน", "จำกัด (มหาชน)"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    aria-pressed={typeFilter === t}
                    className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      typeFilter === t
                        ? "bg-primary text-white"
                        : "border border-border bg-background text-muted hover:border-border-strong hover:text-ink"
                    }`}
                  >
                    {t === "all" ? "ทั้งหมด" : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Company list */}
          <div className="px-4 py-4 lg:flex-1 lg:overflow-y-auto">
            <p aria-live="polite" aria-atomic="true" className="mb-3 text-[12px] text-muted">
              {filtered.length > 0 ? `${filtered.length} บริษัท` : "ไม่พบบริษัทที่ตรงกัน"}
            </p>

            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((company, i) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    index={i}
                    onSelect={(id) => { setSelectedId(id); setPanelMode("detail"); }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center animate-enter">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-ink">ไม่พบบริษัทที่ตรงกัน</p>
                <p className="mt-1 text-[13px] text-muted">ลองเปลี่ยนคำค้นหา</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: detail / edit / add panel — desktop only */}
        <div className="hidden lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:overflow-y-auto">
          {(() => {
            if (panelMode === "add") {
              return <CompanyAddPanel onDone={() => setPanelMode("detail")} />;
            }
            const company = selectedId ? COMPANIES.find((c) => c.id === selectedId) : null;
            if (!company) return <DetailEmptyState />;
            if (panelMode === "edit") {
              return <CompanyEditPanel company={company} onDone={() => setPanelMode("detail")} />;
            }
            return (
              <CompanyDetailPanel
                key={company.id}
                company={company}
                onClose={() => setSelectedId(null)}
                onEdit={() => setPanelMode("edit")}
              />
            );
          })()}
        </div>

      </main>
    </>
  );
}
