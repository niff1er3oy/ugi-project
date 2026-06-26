"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import {
  fetchCompanies, createCompany, updateCompany, deleteCompany,
  getCompanyStats, type Company,
} from "@/lib/companies";
import { fetchEmployees, type Employee } from "@/lib/employees";
import CompanyForm, { type CompanyFormData } from "@/components/company-form";
import TeamManager from "@/components/team-manager";

// ── Sub-components ─────────────────────────────────────────────
function CompanyAvatar({ company, size = 44 }: { company: Company; size?: number }) {
  const initials = company.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "บ";
  const radius = size >= 56 ? "rounded-[16px]" : "rounded-[12px]";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-primary font-bold text-white ${radius}`}
      style={{ width: size, height: size, fontSize: size * 0.28 }}
    >
      {company.logoURL ? (
        <img src={company.logoURL} alt={company.name} loading="lazy" className="h-full w-full object-contain p-[12%]" />
      ) : initials}
    </div>
  );
}

function CompanyCard({ company, employees, index, onSelect }: { company: Company; employees: Employee[]; index: number; onSelect: (id: string) => void }) {
  const stats = getCompanyStats(company.name, employees);
  return (
    <Link
      href={`/company/${company.id}`}
      onClick={(e) => { if (window.innerWidth >= 1024) { e.preventDefault(); onSelect(company.id); } }}
      className="block rounded-[12px] border border-border bg-background transition-shadow duration-150 hover:shadow-sm animate-enter-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <CompanyAvatar company={company} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-ink">{company.name}</p>
            </div>
            <span className="mt-0.5 shrink-0 rounded-full bg-primary-ghost px-2.5 py-0.5 text-[10px] font-semibold text-primary-text">
              {company.type}
            </span>
          </div>
        </div>
      </div>
      <div className="mx-4 border-t border-border" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
          {stats.total} คน
        </span>
        {stats.departments.length > 0 && (
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
            {stats.departments.length} ทีม
          </span>
        )}
      </div>
    </Link>
  );
}

function CompanyDetailPanel({ company, employees, onClose, onEdit, onDeleted, onUpdated }: { company: Company; employees: Employee[]; onClose: () => void; onEdit: () => void; onDeleted: (id: string) => void; onUpdated: (c: Company) => void }) {
  const stats = getCompanyStats(company.name, employees);
  const statsByName = new Map(stats.departments.map((d) => [d.name, d]));
  const teamEntries = company.departments.map((name, idx) => {
    const s = statsByName.get(name);
    return { id: `dept-${idx}`, name, color: s?.color ?? "var(--muted)", bg: s?.bg ?? "var(--surface)", count: s?.count ?? 0 };
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDelete() {
    await deleteCompany(company.id);
    onDeleted(company.id);
  }

  return (
    <div className="px-6 py-6 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-primary-ghost px-3 py-1 text-[11px] font-semibold text-primary-text">
          {company.type}
        </span>
        <button onClick={onClose} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <CompanyAvatar company={company} size={52} />
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-snug text-ink">{company.name}</h2>
        </div>
      </div>

      {company.phone && (
        <div className="mb-5">
          <a href={`tel:${company.phone}`} className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">
            <svg className="h-4 w-4 text-primary-text" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" /></svg>
            โทร {company.phone}
          </a>
        </div>
      )}

      <div className="mb-6 flex items-center justify-around rounded-[12px] border border-border bg-surface px-4 py-3">
        <div className="flex flex-col items-center"><span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{stats.total}</span><span className="mt-1 text-[10px] text-muted">พนักงาน</span></div>
        <div className="h-8 w-px bg-border" />
        <div className="flex flex-col items-center"><span className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{company.departments.length}</span><span className="mt-1 text-[10px] text-muted">ทีม</span></div>
      </div>

      <div className="space-y-5">
        <Section label="ข้อมูลบริษัท">
          <InfoRow labelWidth="w-36" label="รหัสบริษัท" value={<span className="font-mono text-[12px]">{company.id}</span>} />
          <InfoRow labelWidth="w-36" label="ประเภท" value={company.type} />
          {company.phone && <InfoRow labelWidth="w-36" label="โทรศัพท์" value={<a href={`tel:${company.phone}`} className="text-primary-text hover:underline">{company.phone}</a>} />}
        </Section>
        <TeamManager
          teams={teamEntries}
          onUpdate={async (names) => {
            await updateCompany(company.id, { departments: names });
            onUpdated({ ...company, departments: names });
          }}
        />
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={onEdit} className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
          แก้ไขข้อมูล
        </button>
      </div>

      <Link href={`/employees?company=${encodeURIComponent(company.name)}`} className="mt-3 flex items-center justify-between rounded-[10px] border border-border bg-background px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-surface">
        <span className="flex items-center gap-2.5">
          <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
          ดูพนักงานทั้งหมด ({stats.total} คน)
        </span>
        <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
      </Link>

      <div className="mt-4">
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-error/30 bg-error-pale px-4 py-3 text-[13px] font-medium text-error transition-colors hover:bg-error/10 active:scale-[0.99]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            ลบบริษัทนี้
          </button>
        ) : (
          <div className="animate-enter rounded-[12px] border border-error/40 bg-error-pale px-4 py-4">
            <p className="text-center text-[13px] font-semibold text-error">ยืนยันการลบ?</p>
            <p className="mt-0.5 text-center text-[12px] text-muted">การกระทำนี้ไม่สามารถยกเลิกได้</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-[8px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">ยกเลิก</button>
              <button onClick={handleDelete} className="flex-1 rounded-[8px] bg-error py-2.5 text-[13px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98]">ยืนยันลบ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyEditPanel({ company, onDone, onSaved }: { company: Company; onDone: () => void; onSaved: (updated: Company) => void }) {
  async function handleSubmit(data: CompanyFormData) {
    await updateCompany(company.id, data);
    onSaved({ ...company, ...data });
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">แก้ไขข้อมูลบริษัท</p>
        <button onClick={onDone} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <CompanyForm defaultValues={company} companyId={company.id} submitLabel="บันทึกการเปลี่ยนแปลง" onSubmit={handleSubmit} onCancel={onDone} />
    </div>
  );
}

function CompanyAddPanel({ onDone, onAdded }: { onDone: () => void; onAdded: (c: Company) => void }) {
  async function handleSubmit(data: CompanyFormData) {
    const id = await createCompany(data as Omit<Company, "id">);
    onAdded({ id, ...data } as Company);
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">เพิ่มบริษัทใหม่</p>
        <button onClick={onDone} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <CompanyForm submitLabel="เพิ่มบริษัท" onSubmit={handleSubmit} onCancel={onDone} />
    </div>
  );
}

function DetailEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
      </div>
      <p className="text-[14px] font-medium text-ink">เลือกบริษัท</p>
      <p className="mt-1 text-[12px] text-muted">เพื่อดูรายละเอียด</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function CompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<"detail" | "edit" | "add">("detail");

  useEffect(() => {
    Promise.all([fetchCompanies(), fetchEmployees()]).then(([cos, emps]) => {
      setCompanies(cos);
      setEmployees(emps);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return companies.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (q) {
        const hay = [c.name, c.type, c.phone].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [companies, search, typeFilter]);

  if (loading) {
    return (
      <>
        <Navbar title="บริษัท" back={false} />
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md" aria-hidden="true">
          <div className="space-y-3 px-4 pb-3 pt-3">
            <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            <div className="flex gap-1.5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 w-16 animate-pulse rounded-[6px] bg-border" />)}</div>
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
                      <div><div className="h-4 w-32 animate-pulse rounded-[3px] bg-border" /><div className="mt-1 h-3 w-48 animate-pulse rounded-[3px] bg-border" /></div>
                      <div className="h-5 w-14 animate-pulse rounded-full bg-border" />
                    </div>
                  </div>
                </div>
                <div className="mx-4 border-t border-border" />
                <div className="flex gap-4 px-4 py-3"><div className="h-4 w-14 animate-pulse rounded-[3px] bg-border" /><div className="h-4 w-24 animate-pulse rounded-[3px] bg-border" /><div className="h-4 w-14 animate-pulse rounded-[3px] bg-border" /></div>
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
            onClick={() => { if (window.innerWidth >= 1024) { setSelectedId(null); setPanelMode("add"); } else router.push("/company/new"); }}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            เพิ่มบริษัท
          </button>
        }
      />

      <main className="w-full lg:flex lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
        <div className="lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:border-r lg:border-border">
          <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md lg:static lg:z-auto lg:shrink-0">
            <div className="space-y-3 px-4 pb-3 pt-3">
              <div className="relative">
                <input type="search" placeholder="ค้นหาบริษัท..." value={search} onChange={(e) => setSearch(e.target.value)} className="field-input pr-9" />
                {search ? (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-border text-muted hover:bg-border-strong hover:text-ink" aria-label="ล้างคำค้นหา">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                ) : (
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                )}
              </div>
              <div className="flex gap-1.5" role="group" aria-label="กรองตามประเภทบริษัท">
                {(["all", "นิติบุคคล", "บุคคลธรรมดา"] as const).map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)} aria-pressed={typeFilter === t} className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-colors ${typeFilter === t ? "bg-primary text-white" : "border border-border bg-background text-muted hover:border-border-strong hover:text-ink"}`}>
                    {t === "all" ? "ทั้งหมด" : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-4 lg:flex-1 lg:overflow-y-auto">
            <p aria-live="polite" aria-atomic="true" className="mb-3 text-[12px] text-muted">
              {filtered.length > 0 ? `${filtered.length} บริษัท` : "ไม่พบบริษัทที่ตรงกัน"}
            </p>
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((company, i) => (
                  <CompanyCard key={company.id} company={company} employees={employees} index={i} onSelect={(id) => { setSelectedId(id); setPanelMode("detail"); }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center animate-enter">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                </div>
                <p className="text-[15px] font-semibold text-ink">ไม่พบบริษัทที่ตรงกัน</p>
                <p className="mt-1 text-[13px] text-muted">ลองเปลี่ยนคำค้นหา</p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:overflow-y-auto">
          {(() => {
            if (panelMode === "add") return (
              <CompanyAddPanel onDone={() => setPanelMode("detail")} onAdded={(c) => setCompanies((prev) => [...prev, c])} />
            );
            const company = selectedId ? companies.find((c) => c.id === selectedId) : null;
            if (!company) return <DetailEmptyState />;
            if (panelMode === "edit") return (
              <CompanyEditPanel company={company} onDone={() => setPanelMode("detail")} onSaved={(updated) => setCompanies((prev) => prev.map((c) => c.id === updated.id ? updated : c))} />
            );
            return (
              <CompanyDetailPanel
                key={company.id}
                company={company}
                employees={employees}
                onClose={() => setSelectedId(null)}
                onEdit={() => setPanelMode("edit")}
                onDeleted={(id) => { setCompanies((prev) => prev.filter((c) => c.id !== id)); setSelectedId(null); }}
                onUpdated={(updated) => setCompanies((prev) => prev.map((c) => c.id === updated.id ? updated : c))}
              />
            );
          })()}
        </div>
      </main>
    </>
  );
}
