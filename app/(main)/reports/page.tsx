"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { DEPT_CONFIG } from "@/lib/employees";

// ── Types ──────────────────────────────────────────────────────
type WorkType = "ซ่อมบำรุง" | "ติดตั้ง" | "ตรวจสอบ" | "อื่นๆ";
type WorkStatus = "completed" | "in_progress" | "cancelled";

type WorkTask = {
  id: string;
  title: string;
  type: WorkType;
  status: WorkStatus;
  date: string;
  time: string;
  department: string;
  location: string;
};

// ── Constants ──────────────────────────────────────────────────
const MONTHS_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];

const TYPE_COLORS: Record<WorkType, string> = {
  "ซ่อมบำรุง": "oklch(0.72 0.14 75)",
  "ติดตั้ง":   "oklch(0.44 0.27 292)",
  "ตรวจสอบ":   "oklch(0.50 0.15 195)",
  "อื่นๆ":     "oklch(0.60 0.04 292)",
};

const TYPE_ICON_PATH: Record<WorkType, string> = {
  "ซ่อมบำรุง": "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
  "ติดตั้ง":   "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  "ตรวจสอบ":   "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6",
  "อื่นๆ":     "M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
};

const STATUS_CONFIG: Record<WorkStatus, { label: string; bg: string; text: string; color: string }> = {
  completed:   { label: "เสร็จแล้ว",        bg: "bg-[oklch(0.93_0.06_145)]", text: "text-[oklch(0.37_0.13_145)]", color: "oklch(0.52 0.16 145)" },
  in_progress: { label: "กำลังดำเนินการ",   bg: "bg-primary-ghost",           text: "text-primary",               color: "oklch(0.44 0.27 292)" },
  cancelled:   { label: "ถูกยกเลิก",        bg: "bg-error-pale",              text: "text-error",                 color: "oklch(0.50 0.17 25)"  },
};

// ── Mock data ──────────────────────────────────────────────────
const RECENT_TASKS: WorkTask[] = [
  {
    id: "1",
    title: "ซ่อมท่อน้ำรั่วอาคาร A",
    type: "ซ่อมบำรุง",
    status: "completed",
    date: "12 มิ.ย.",
    time: "09:30",
    department: "ฝ่ายผลิต",
    location: "อาคาร A ชั้น 3",
  },
  {
    id: "2",
    title: "ติดตั้งระบบแจ้งเตือนอัคคีภัย",
    type: "ติดตั้ง",
    status: "in_progress",
    date: "11 มิ.ย.",
    time: "13:00",
    department: "ฝ่ายวิศวกรรม",
    location: "คลังสินค้า B",
  },
  {
    id: "3",
    title: "ตรวจสอบระบบไฟฟ้าประจำเดือน",
    type: "ตรวจสอบ",
    status: "completed",
    date: "10 มิ.ย.",
    time: "08:00",
    department: "ฝ่ายความปลอดภัย",
    location: "โรงงานหลัก",
  },
];

// ── Stat helpers ───────────────────────────────────────────────
function getStats(month: number, year: number) {
  const s = (month * 7 + (year - 2568) * 13) % 11;
  const total = 18 + s * 2;
  const completed = Math.round(total * (0.62 + (month % 5) * 0.03));
  const inProgress = 2 + (s % 3);
  const cancelled = Math.max(0, total - completed - inProgress);
  return { total, completed, inProgress, cancelled };
}

function getTypeBreakdown(month: number, total: number): { label: WorkType; count: number; color: string }[] {
  const maint   = Math.round(total * (0.34 + (month % 3) * 0.02));
  const install = Math.round(total * (0.22 + (month % 4) * 0.02));
  const inspect = Math.round(total * (0.27 + (month % 2) * 0.02));
  const other   = Math.max(0, total - maint - install - inspect);
  return [
    { label: "ซ่อมบำรุง", count: maint,   color: TYPE_COLORS["ซ่อมบำรุง"] },
    { label: "ติดตั้ง",   count: install, color: TYPE_COLORS["ติดตั้ง"]   },
    { label: "ตรวจสอบ",   count: inspect, color: TYPE_COLORS["ตรวจสอบ"]   },
    { label: "อื่นๆ",     count: other,   color: TYPE_COLORS["อื่นๆ"]     },
  ];
}

// ── Sub-components ─────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: { label: string; count: number; color: string }[]; total: number }) {
  const r = 36, cx = 50, cy = 50;
  const C = 2 * Math.PI * r;
  let cumFraction = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
      <div className="relative shrink-0" style={{ width: 148, height: 148 }}>
        <svg viewBox="0 0 100 100" width={148} height={148} aria-hidden="true">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
          {segments.filter((s) => s.count > 0).map((seg) => {
            const fraction = seg.count / total;
            const dashLen = fraction * C;
            const rotDeg = cumFraction * 360 - 90;
            cumFraction += fraction;
            return (
              <circle
                key={seg.label}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={10}
                strokeDasharray={`${dashLen} ${C}`}
                transform={`rotate(${rotDeg} ${cx} ${cy})`}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">{total}</span>
          <span className="mt-1 text-[11px] text-muted">งานทั้งหมด</span>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1 sm:w-auto">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-start gap-2.5">
            <div className="mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink">{seg.label}</p>
              <p className="text-[11px] text-muted">
                {seg.count} งาน · {total > 0 ? Math.round((seg.count / total) * 100) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepartmentChip({ name }: { name: string }) {
  const dept = DEPT_CONFIG[name];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[10px] font-semibold"
      style={{
        backgroundColor: dept?.bg ?? "var(--surface)",
        color: dept?.color ?? "var(--muted)",
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dept?.color ?? "var(--muted)" }}
      />
      {name}
    </span>
  );
}

function TaskThumbnail({ type }: { type: WorkType }) {
  const color = TYPE_COLORS[type];
  const iconPath = TYPE_ICON_PATH[type];
  return (
    <div
      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px]"
      style={{ backgroundColor: `color-mix(in oklch, ${color} 14%, white)` }}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function ReportsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [year, setYear] = useState(now.getFullYear() + 543); // BE

  const CE_YEAR = year - 543;
  const stats = getStats(month + 1, year);
  const typeBreakdown = getTypeBreakdown(month + 1, stats.total);

  const YEARS_BE = [now.getFullYear() + 543, now.getFullYear() + 542, now.getFullYear() + 541];

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-64 flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-ghost border-t-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar title="รายงาน" back={false} />

      <main className="mx-auto w-full max-w-2xl px-4 py-6 space-y-5">

        {/* Period selector */}
        <div className="flex items-center gap-3 animate-enter">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] font-medium text-muted">เดือน</label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="field-input cursor-pointer appearance-none pr-8"
              >
                {MONTHS_TH.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div className="w-32">
            <label className="mb-1 block text-[11px] font-medium text-muted">ปี (พ.ศ.)</label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="field-input cursor-pointer appearance-none pr-8"
              >
                {YEARS_BE.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Period label */}
        <p className="text-[12px] text-muted animate-enter" style={{ animationDelay: "30ms" }}>
          สรุปการปฏิบัติงาน{MONTHS_TH[month]} {year}
          <span className="ml-1 text-border-strong">({MONTHS_TH[month]} {CE_YEAR})</span>
        </p>

        {/* Stat cards */}
        <div
          key={`${month}-${year}`}
          className="grid grid-cols-2 gap-3 animate-enter"
          style={{ animationDelay: "50ms" }}
        >
          {[
            { label: "การปฏิบัติงานทั้งหมด", value: stats.total,      unit: "งาน", color: "text-ink",                        dot: "bg-border-strong" },
            { label: "งานที่เสร็จแล้ว",      value: stats.completed,  unit: "งาน", color: "text-[oklch(0.37_0.13_145)]",   dot: "bg-[oklch(0.52_0.16_145)]" },
            { label: "กำลังดำเนินการ",        value: stats.inProgress, unit: "งาน", color: "text-primary",                   dot: "bg-primary" },
            { label: "ถูกยกเลิก",             value: stats.cancelled,  unit: "งาน", color: "text-error",                     dot: "bg-error" },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className="rounded-[12px] border border-border bg-background px-4 py-3.5 animate-enter-stagger"
              style={{ "--i": i } as React.CSSProperties}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`h-2 w-2 rounded-full ${kpi.dot}`} />
                <p className="text-[11px] text-muted leading-tight">{kpi.label}</p>
              </div>
              <div className="flex items-end gap-1">
                <span className={`text-[28px] font-semibold leading-none tracking-[-0.025em] ${kpi.color}`}>
                  {kpi.value}
                </span>
                <span className="mb-0.5 text-[13px] text-muted">{kpi.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Donut chart card */}
        <div
          className="rounded-[12px] border border-border bg-background px-5 py-4 animate-enter"
          style={{ animationDelay: "100ms" }}
        >
          <p className="mb-4 text-[13px] font-semibold text-ink">สัดส่วนประเภทงาน</p>
          <DonutChart segments={typeBreakdown} total={stats.total} />
        </div>

        {/* Recent work card */}
        <div
          className="rounded-[12px] border border-border bg-background animate-enter overflow-hidden"
          style={{ animationDelay: "140ms" }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-[13px] font-semibold text-ink">การปฏิบัติงานล่าสุด</p>
            <button className="text-[12px] font-medium text-primary transition-colors hover:text-primary-deep">
              ดูทั้งหมด
            </button>
          </div>

          <ul className="divide-y divide-border">
            {RECENT_TASKS.map((task, i) => {
              const status = STATUS_CONFIG[task.status];
              return (
                <li
                  key={task.id}
                  className="flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-surface cursor-pointer animate-enter-stagger"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {/* Thumbnail */}
                  <TaskThumbnail type={task.type} />

                  {/* Detail */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold text-ink leading-snug truncate pr-1">
                        {task.title}
                      </p>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {/* Date + time */}
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        {task.date} · {task.time}
                      </span>
                      {/* Location */}
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {task.location}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="mt-2">
                      <DepartmentChip name={task.department} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

      </main>
    </>
  );
}
