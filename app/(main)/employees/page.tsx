"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import {
  EMPLOYEES, DEPT_CONFIG, STATUS_CONFIG, DEPARTMENTS,
  type Employee, type EmpStatus,
} from "@/lib/employees";

// ── Filter options ─────────────────────────────────────────────
const STATUS_FILTER_OPTS: { value: EmpStatus | "all"; label: string }[] = [
  { value: "all",      label: "ทั้งหมด"    },
  { value: "active",   label: "ปฏิบัติงาน" },
  { value: "leave",    label: "ลาพัก"      },
  { value: "resigned", label: "ลาออก"      },
];

// ── Sub-components ─────────────────────────────────────────────
function EmpAvatar({ emp, size = 56 }: { emp: Employee; size?: number }) {
  const dept = DEPT_CONFIG[emp.department];
  const status = STATUS_CONFIG[emp.status];
  const initials = emp.firstName.charAt(0) + emp.lastName.charAt(0);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-bold ring-4 ring-background"
        style={{
          backgroundColor: dept?.bg ?? "var(--surface)",
          color: dept?.color ?? "var(--muted)",
          fontSize: size * 0.27,
        }}
      >
        {initials}
      </div>
      <span
        className="absolute rounded-full border-2 border-background"
        style={{
          width: size * 0.22, height: size * 0.22,
          bottom: size * 0.02, right: size * 0.02,
          backgroundColor: status.dot,
        }}
      />
    </div>
  );
}

function EmployeeCard({ emp, index }: { emp: Employee; index: number }) {
  const dept = DEPT_CONFIG[emp.department];
  const status = STATUS_CONFIG[emp.status];
  return (
    <Link
      href={`/employees/${emp.id}`}
      className={`flex flex-col items-center rounded-[14px] border border-border bg-background p-4 text-center transition-all duration-150 hover:border-border-strong hover:shadow-sm animate-enter-stagger ${emp.status === "resigned" ? "opacity-55" : ""}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <EmpAvatar emp={emp} />

      <p className="mt-3 text-[13px] font-semibold text-ink leading-snug">
        {emp.firstName} {emp.lastName}
      </p>

      {/* Team chip */}
      {dept && (
        <span
          className="mt-2 inline-flex rounded-full px-2.5 py-[3px] text-[10px] font-semibold"
          style={{ backgroundColor: dept.bg, color: dept.color }}
        >
          {emp.department}
        </span>
      )}

      {/* Status */}
      <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-medium ${status.bg} ${status.text}`}>
        {status.label}
      </span>

      <p className="mt-3 w-full border-t border-border pt-2.5 text-[11px] text-muted">
        {emp.id}
      </p>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function EmployeesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmpStatus | "all">("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return EMPLOYEES.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (deptFilter !== "all" && e.department !== deptFilter) return false;
      if (q) {
        const hay = [e.firstName, e.lastName, e.position, e.department, e.id].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, statusFilter, deptFilter]);

  const hasFilter = search || statusFilter !== "all" || deptFilter !== "all";

  if (!ready) {
    return (
      <>
        <Navbar title="ข้อมูลพนักงาน" back={false} />
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md" aria-hidden="true">
          <div className="px-4 pt-3 pb-2.5">
            <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
          </div>
          <div className="flex gap-1.5 overflow-x-hidden px-4 pb-2.5">
            {[72, 96, 64, 80].map((w, i) => (
              <div key={i} className="h-11 shrink-0 animate-pulse rounded-full bg-border" style={{ width: w }} />
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-hidden px-4 pb-3">
            {[52, 80, 88, 72, 80, 72].map((w, i) => (
              <div key={i} className="h-11 shrink-0 animate-pulse rounded-full bg-border" style={{ width: w }} />
            ))}
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
                <div className="mt-1.5 h-5 w-14 animate-pulse rounded-full bg-border" />
                <div className="mt-3 w-full border-t border-border pt-2.5">
                  <div className="mx-auto h-3 w-14 animate-pulse rounded-[3px] bg-border" />
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
        title="ข้อมูลพนักงาน"
        back={false}
        right={
          <button className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            เพิ่มพนักงาน
          </button>
        }
      />

      {/* Sticky search + filter */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-3 pb-2.5">
          <div className="relative">
            <input
              type="search"
              placeholder="ค้นหาชื่อ ตำแหน่ง ทีม..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input pr-9"
            />
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-border text-muted hover:bg-border-strong hover:text-ink"
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
        </div>

        {/* Status chips */}
        <div role="group" aria-label="กรองตามสถานะ" className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTER_OPTS.map((opt) => {
            const active = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors duration-150 min-h-[44px] ${active ? "border-primary bg-primary text-white" : "border-border bg-background text-muted hover:border-border-strong hover:text-ink"}`}
              >
                {opt.value !== "all" && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: active ? "white" : STATUS_CONFIG[opt.value as EmpStatus].dot }}
                  />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Department chips */}
        <div role="group" aria-label="กรองตามทีม" className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setDeptFilter("all")}
            aria-pressed={deptFilter === "all"}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors duration-150 min-h-[44px] ${deptFilter === "all" ? "border-primary bg-primary text-white" : "border-border bg-background text-muted hover:border-border-strong hover:text-ink"}`}
          >
            ทุกทีม
          </button>
          {DEPARTMENTS.map((dept) => {
            const active = deptFilter === dept;
            return (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors duration-150 min-h-[44px] ${active ? "border-primary bg-primary text-white" : "border-border bg-background text-muted hover:border-border-strong hover:text-ink"}`}
              >
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />}
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="w-full px-4 py-4">
        <div className="mb-3 flex items-center gap-2">
          <p aria-live="polite" aria-atomic="true" className="text-[12px] text-muted animate-enter">
            {filtered.length > 0 ? `${filtered.length} คน` : "ไม่พบพนักงาน"}
          </p>
          {hasFilter && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setDeptFilter("all"); }}
              className="text-[12px] text-primary hover:underline"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((emp, i) => (
              <EmployeeCard key={emp.id} emp={emp} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center animate-enter">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
              <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-ink">ไม่พบพนักงาน</p>
            <p className="mt-1 text-[13px] text-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
      </main>
    </>
  );
}
