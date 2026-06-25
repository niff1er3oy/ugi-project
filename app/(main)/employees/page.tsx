"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Navbar from "@/components/navbar";
import {
  fetchEmployees, deleteEmployee,
  createEmployee, updateEmployee,
  getDeptColor,
  type Employee,
} from "@/lib/employees";
import { fetchCompanies as getCompanies, type Company } from "@/lib/companies";
import EmployeeTrainingSection from "@/components/employee-training-section";
import { Section, InfoRow } from "@/components/detail-section";
import EmployeeForm from "@/components/employee-form";
import type { EmployeeFormData } from "@/components/employee-form";

// ── Sub-components ─────────────────────────────────────────────
function EmpAvatar({ emp, size = 56 }: { emp: Employee; size?: number }) {
  const dept = getDeptColor(emp.department);
  const initials = emp.firstName.charAt(0) + emp.lastName.charAt(0);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {emp.photoURL ? (
        <img src={emp.photoURL} alt={`${emp.firstName} ${emp.lastName}`} loading="lazy" className="h-full w-full rounded-full object-cover ring-4 ring-background" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-bold ring-4 ring-background"
          style={{ backgroundColor: dept?.bg ?? "var(--surface)", color: dept?.color ?? "var(--muted)", fontSize: size * 0.27 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

function EmployeeCard({ emp, index, onSelect }: { emp: Employee; index: number; onSelect: (id: string) => void }) {
  const dept = getDeptColor(emp.department);
  return (
    <Link
      href={`/employees/${emp.id}`}
      onClick={(e) => { if (window.innerWidth >= 1024) { e.preventDefault(); onSelect(emp.id); } }}
      className={`flex flex-col items-center rounded-[14px] border border-border bg-background p-4 text-center transition-all duration-150 hover:border-border-strong hover:shadow-sm animate-enter-stagger`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <EmpAvatar emp={emp} />
      <p className="mt-3 text-[13px] font-semibold text-ink leading-snug">{emp.firstName} {emp.lastName}</p>
      {dept && (
        <span className="mt-2 inline-flex rounded-full px-2.5 py-[3px] text-[10px] font-semibold" style={{ backgroundColor: dept.bg, color: dept.color }}>
          {emp.department}
        </span>
      )}
      <p className="mt-3 w-full border-t border-border pt-2.5 text-[11px] text-muted">{emp.id}</p>
    </Link>
  );
}

function EmployeeDetailPanel({
  emp, onClose, onDelete, onEdit,
}: {
  emp: Employee; onClose: () => void; onDelete: (id: string) => void; onEdit: () => void;
}) {
  const dept = getDeptColor(emp.department);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDelete() {
    await deleteEmployee(emp.id);
    onDelete(emp.id);
  }

  return (
    <div className="px-6 py-6 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <button onClick={onEdit} className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-surface active:scale-95">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
          </svg>
          แก้ไข
        </button>
        <button onClick={onClose} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6 flex flex-col items-center text-center">
        <EmpAvatar emp={emp} size={72} />
        <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.01em] text-ink">{emp.firstName} {emp.lastName}</h2>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: dept?.bg, color: dept?.color }}>{emp.department}</span>
        </div>
      </div>

      <div className="space-y-5">
        <Section label="ข้อมูลส่วนตัว">
          <InfoRow label="รหัสพนักงาน" value={<span className="font-mono text-[12px]">{emp.id}</span>} />
          <InfoRow label="บริษัท"       value={emp.company} />
          <InfoRow label="ทีม"          value={
            <span className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold" style={{ backgroundColor: dept?.bg, color: dept?.color }}>{emp.department}</span>
          } />
        </Section>
        <EmployeeTrainingSection employeeId={emp.id} />
      </div>

      <div className="mt-8">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-error/30 bg-error-pale px-4 py-3 text-[13px] font-medium text-error transition-colors hover:bg-error/10 active:scale-[0.99]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            ลบพนักงานนี้
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

function EmployeeEditPanel({ emp, onClose, onSaved }: { emp: Employee; onClose: () => void; onSaved: (updated: Employee) => void }) {
  async function handleSubmit(data: EmployeeFormData) {
    await updateEmployee(emp.id, data);
    onSaved({ ...emp, ...data });
    onClose();
  }
  return (
    <div className="px-6 py-6 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-ink">แก้ไขข้อมูล</p>
        <button onClick={onClose} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="mb-5 flex items-center gap-3 rounded-[10px] bg-surface px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-[12px] font-bold text-muted">
          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">{emp.firstName} {emp.lastName}</p>
          <p className="text-[11px] text-muted">{emp.id}</p>
        </div>
      </div>
      <EmployeeForm defaultValues={emp} empId={emp.id} submitLabel="บันทึกการเปลี่ยนแปลง" onSubmit={handleSubmit} onCancel={onClose} />
    </div>
  );
}

function EmployeeAddPanel({ onClose, onAdded }: { onClose: () => void; onAdded: (emp: Employee) => void }) {
  async function handleSubmit(data: EmployeeFormData) {
    const id = await createEmployee(data);
    onAdded({ id, ...data });
    onClose();
  }
  return (
    <div className="px-6 py-6 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-ink">เพิ่มพนักงาน</p>
        <button onClick={onClose} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <EmployeeForm submitLabel="เพิ่มพนักงาน" onSubmit={handleSubmit} onCancel={onClose} />
    </div>
  );
}

function DetailEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
      </div>
      <p className="text-[14px] font-medium text-ink">เลือกพนักงาน</p>
      <p className="mt-1 text-[12px] text-muted">เพื่อดูรายละเอียด</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
function EmployeesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>(() => searchParams.get("company") ?? "all");
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get("select") ?? null);
  const [panelMode, setPanelMode] = useState<"detail" | "edit" | "add">("detail");

  useEffect(() => {
    Promise.all([fetchEmployees(), getCompanies()]).then(([emps, cos]) => {
      setEmployees(emps);
      setCompanies(cos);
      setLoading(false);
    });
  }, []);

  const companyDeptMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const c of companies) map[c.name] = c.departments ?? [];
    return map;
  }, [companies]);

  function handleCompanyFilter(company: string) {
    setCompanyFilter(company);
    if (company !== "all") {
      const depts = companyDeptMap[company] ?? [];
      if (deptFilter !== "all" && !depts.includes(deptFilter)) setDeptFilter("all");
    }
  }

  const availableFilterDepts = useMemo(() => {
    if (companyFilter !== "all") return companyDeptMap[companyFilter] ?? [];
    const set = new Set<string>();
    for (const c of companies) for (const d of c.departments ?? []) set.add(d);
    return [...set].sort();
  }, [companyFilter, companyDeptMap, companies]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter((e) => {
      if (companyFilter !== "all" && e.company !== companyFilter) return false;
      if (deptFilter !== "all" && e.department !== deptFilter) return false;
      if (q) {
        const hay = [e.firstName, e.lastName, e.department, e.company, e.id].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [employees, search, companyFilter, deptFilter]);

  const hasFilter = search || companyFilter !== "all" || deptFilter !== "all";

  if (loading) {
    return (
      <>
        <Navbar title="ข้อมูลพนักงาน" back={false} />
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md" aria-hidden="true">
          <div className="space-y-2.5 px-4 pt-3 pb-3">
            <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
          </div>
        </div>
        <main className="w-full px-4 py-4" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-3 h-4 w-10 animate-pulse rounded-[3px] bg-border" aria-hidden="true" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center rounded-[14px] border border-border bg-background p-4">
                <div className="h-14 w-14 animate-pulse rounded-full bg-border" />
                <div className="mt-3 h-3.5 w-20 animate-pulse rounded-[3px] bg-border" />
                <div className="mt-2 h-5 w-16 animate-pulse rounded-full bg-border" />
                <div className="mt-3 w-full border-t border-border pt-2.5"><div className="mx-auto h-3 w-14 animate-pulse rounded-[3px] bg-border" /></div>
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
        title="ข้อมูลพนักงาน"
        back={false}
        right={
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) { setSelectedId(null); setPanelMode("add"); }
              else router.push("/employees/new");
            }}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            เพิ่มพนักงาน
          </button>
        }
      />

      <main className="w-full lg:flex lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
        <div className="lg:flex lg:w-1/2 lg:flex-col lg:min-h-0 lg:border-r lg:border-border">
          <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md lg:static lg:z-auto lg:shrink-0">
            <div className="space-y-2.5 px-4 pt-3 pb-3">
              <div className="relative">
                <input type="search" placeholder="ค้นหาชื่อ ทีม บริษัท..." value={search} onChange={(e) => setSearch(e.target.value)} className="field-input pr-9" />
                {search ? (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-border text-muted hover:bg-border-strong hover:text-ink" aria-label="ล้างคำค้นหา">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                ) : (
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                )}
              </div>
              <select value={companyFilter} onChange={(e) => handleCompanyFilter(e.target.value)} aria-label="กรองตามบริษัท" className="field-input w-full">
                <option value="all">ทุกบริษัท</option>
                {companies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} aria-label="กรองตามทีม" className="field-input w-full">
                <option value="all">ทุกทีม</option>
                {availableFilterDepts.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
          </div>

          <div className="px-4 py-4 lg:flex-1 lg:overflow-y-auto">
            <div className="mb-3 flex items-center gap-2">
              <p aria-live="polite" aria-atomic="true" className="text-[12px] text-muted animate-enter">
                {filtered.length > 0 ? `${filtered.length} คน` : "ไม่พบพนักงาน"}
              </p>
              {hasFilter && (
                <button onClick={() => { setSearch(""); setCompanyFilter("all"); setDeptFilter("all"); }} className="text-[12px] text-primary-text hover:underline">
                  ล้างตัวกรอง
                </button>
              )}
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">
                {filtered.map((emp, i) => <EmployeeCard key={emp.id} emp={emp} index={i} onSelect={setSelectedId} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center animate-enter">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                </div>
                <p className="text-[15px] font-semibold text-ink">ไม่พบพนักงาน</p>
                <p className="mt-1 text-[13px] text-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 lg:overflow-y-auto">
          {(() => {
            const emp = selectedId ? employees.find((e) => e.id === selectedId) : null;
            if (panelMode === "add") return (
              <EmployeeAddPanel
                onClose={() => setPanelMode("detail")}
                onAdded={(e) => setEmployees((prev) => [...prev, e])}
              />
            );
            if (panelMode === "edit" && emp) return (
              <EmployeeEditPanel
                emp={emp}
                onClose={() => setPanelMode("detail")}
                onSaved={(updated) => setEmployees((prev) => prev.map((e) => e.id === updated.id ? updated : e))}
              />
            );
            if (emp) return (
              <EmployeeDetailPanel
                emp={emp}
                onClose={() => setSelectedId(null)}
                onDelete={(id) => { setEmployees((prev) => prev.filter((e) => e.id !== id)); setSelectedId(null); }}
                onEdit={() => { if (window.innerWidth >= 1024) setPanelMode("edit"); else router.push(`/employees/${emp.id}/edit`); }}
              />
            );
            return <DetailEmptyState />;
          })()}
        </div>
      </main>
    </>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense>
      <EmployeesPageContent />
    </Suspense>
  );
}
