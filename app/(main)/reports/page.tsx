"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip);
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { DepartmentChip } from "@/components/department-chip";

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
  note: string;
};

// ── Constants ──────────────────────────────────────────────────
const MONTHS_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];

const TYPE_CONFIG: Record<WorkType, { color: string; lightBg: string; iconPath: string }> = {
  "ซ่อมบำรุง": {
    color: "oklch(0.62 0.14 75)",
    lightBg: "oklch(0.95 0.04 75)",
    iconPath: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
  },
  "ติดตั้ง": {
    color: "oklch(0.44 0.27 292)",
    lightBg: "oklch(0.94 0.055 292)",
    iconPath: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  },
  "ตรวจสอบ": {
    color: "oklch(0.42 0.14 195)",
    lightBg: "oklch(0.93 0.04 195)",
    iconPath: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6",
  },
  "อื่นๆ": {
    color: "oklch(0.50 0.05 292)",
    lightBg: "oklch(0.96 0.01 292)",
    iconPath: "M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
  },
};

const STATUS_CONFIG: Record<WorkStatus, { label: string; bg: string; text: string; dot: string }> = {
  completed:   { label: "เสร็จแล้ว",      bg: "bg-success-pale",  text: "text-success-text", dot: "oklch(0.52 0.16 145)" },
  in_progress: { label: "กำลังดำเนินการ", bg: "bg-primary-ghost", text: "text-primary",      dot: "oklch(0.44 0.27 292)" },
  cancelled:   { label: "ถูกยกเลิก",      bg: "bg-error-pale",    text: "text-error",        dot: "oklch(0.50 0.17 25)"  },
};

// ── Mock data ──────────────────────────────────────────────────
const RECENT_TASKS: WorkTask[] = [
  {
    id: "WO-012",
    title: "ซ่อมท่อน้ำรั่วบริเวณอาคาร A ชั้น 3",
    type: "ซ่อมบำรุง",
    status: "completed",
    date: "12 มิ.ย. 2568",
    time: "09:30",
    department: "ฝ่ายผลิต",
    location: "อาคาร A ชั้น 3",
    note: "ท่อน้ำแตกในห้องน้ำชาย ซ่อมเสร็จก่อนกำหนด ไม่มีความเสียหายเพิ่มเติม",
  },
  {
    id: "WO-011",
    title: "ติดตั้งระบบแจ้งเตือนอัคคีภัยคลังสินค้า B",
    type: "ติดตั้ง",
    status: "in_progress",
    date: "11 มิ.ย. 2568",
    time: "13:00",
    department: "ฝ่ายวิศวกรรม",
    location: "คลังสินค้า B",
    note: "ติดตั้งหัวสปริงเกลอร์แล้ว 60% คาดเสร็จวันที่ 15 มิ.ย.",
  },
  {
    id: "WO-010",
    title: "ตรวจสอบระบบไฟฟ้าประจำเดือนมิถุนายน",
    type: "ตรวจสอบ",
    status: "completed",
    date: "10 มิ.ย. 2568",
    time: "08:00",
    department: "ฝ่ายความปลอดภัย",
    location: "โรงงานหลัก",
    note: "ผ่านมาตรฐานทุกจุด ไม่พบความผิดปกติ แนะนำเปลี่ยนสายดินจุด C-7",
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
    { label: "ซ่อมบำรุง", count: maint,   color: TYPE_CONFIG["ซ่อมบำรุง"].color },
    { label: "ติดตั้ง",   count: install, color: TYPE_CONFIG["ติดตั้ง"].color   },
    { label: "ตรวจสอบ",   count: inspect, color: TYPE_CONFIG["ตรวจสอบ"].color   },
    { label: "อื่นๆ",     count: other,   color: TYPE_CONFIG["อื่นๆ"].color     },
  ];
}

// ── Sub-components ─────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: { label: string; count: number; color: string }[]; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"doughnut"> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    chartRef.current?.destroy();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: segments.map((s) => s.label),
        datasets: [{
          data: segments.map((s) => s.count),
          backgroundColor: segments.map((s) => s.color),
          borderWidth: 0,
          hoverOffset: 6,
          spacing: 3,
        }],
      },
      options: {
        cutout: "70%",
        rotation: -90,
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        animation: {
          animateRotate: true,
          animateScale: false,
          duration: 500,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) =>
                ` ${item.label}: ${item.raw} งาน · ${total > 0 ? Math.round(((item.raw as number) / total) * 100) : 0}%`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [segments, total]);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative w-full max-w-[280px] mx-auto sm:mx-0 sm:w-[200px] shrink-0">
        <canvas ref={canvasRef} aria-label="สัดส่วนประเภทงาน" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-[28px] font-bold leading-none tracking-[-0.03em] text-ink">{total}</span>
          <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">งานทั้งหมด</span>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 w-full sm:flex-1">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
          return (
            <div key={seg.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-[13px] font-medium text-ink">{seg.label}</span>
                </div>
                <span className="text-[12px] tabular-nums text-muted">{seg.count} · {pct}%</span>
              </div>
              <div className="h-[3px] w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: seg.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, index }: { task: WorkTask; index: number }) {
  const status = STATUS_CONFIG[task.status];
  const type = TYPE_CONFIG[task.type];
  return (
    <div
      className="rounded-[12px] border border-border bg-background transition-shadow duration-150 hover:shadow-sm cursor-pointer animate-enter-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex items-start gap-3 px-4 pt-4">
        <div
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: type.lightBg }}
        >
          <svg className="h-5 w-5" fill="none" stroke={type.color} strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={type.iconPath} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-semibold text-ink leading-snug">{task.title}</p>
            <span className={`mt-0.5 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: type.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: type.color }} />
              {task.type}
            </span>
            <span className="text-border-strong">·</span>
            <span className="text-[11px] text-muted">{task.id}</span>
          </div>
        </div>
      </div>
      {task.note && (
        <p className="mx-4 mt-2.5 text-[12px] text-muted leading-relaxed line-clamp-2">{task.note}</p>
      )}
      <div className="mx-4 mt-3.5 border-t border-border" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          {task.date} · {task.time}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {task.location}
        </span>
        <DepartmentChip name={task.department} />
      </div>
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
      <>
        <Navbar title="รายงาน" back={false} />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 space-y-5" aria-busy="true" aria-label="กำลังโหลด">
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-10 animate-pulse rounded-[3px] bg-border" />
              <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            </div>
            <div className="w-32 space-y-1.5">
              <div className="h-3 w-14 animate-pulse rounded-[3px] bg-border" />
              <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            </div>
          </div>
          <div className="h-3.5 w-48 animate-pulse rounded-[3px] bg-border" aria-hidden="true" />
          <div className="grid grid-cols-2 gap-3" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[12px] border border-border bg-background px-4 py-3.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-border" />
                  <div className="h-3 w-28 animate-pulse rounded-[3px] bg-border" />
                </div>
                <div className="flex items-end gap-1">
                  <div className="h-8 w-10 animate-pulse rounded-[3px] bg-border" />
                  <div className="mb-0.5 h-4 w-6 animate-pulse rounded-[3px] bg-border" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[12px] border border-border bg-background px-5 py-4" aria-hidden="true">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="w-full max-w-[280px] aspect-square mx-auto sm:mx-0 sm:w-[200px] shrink-0 animate-pulse rounded-full bg-border" />
              <div className="flex flex-col w-full gap-3.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-border" />
                        <div className="h-3.5 w-20 animate-pulse rounded-[3px] bg-border" />
                      </div>
                      <div className="h-3 w-16 animate-pulse rounded-[3px] bg-border" />
                    </div>
                    <div className="h-[3px] w-full animate-pulse rounded-full bg-border" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div aria-hidden="true">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-28 animate-pulse rounded-[3px] bg-border" />
              <div className="h-3.5 w-14 animate-pulse rounded-[3px] bg-border" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[12px] border border-border bg-background">
                  <div className="flex items-start gap-3 px-4 pt-4">
                    <div className="mt-0.5 h-10 w-10 shrink-0 animate-pulse rounded-[10px] bg-border" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-[38px] flex-1 animate-pulse rounded-[3px] bg-border" />
                        <div className="mt-0.5 h-5 w-24 shrink-0 animate-pulse rounded-full bg-border" />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <div className="h-3.5 w-20 animate-pulse rounded-[3px] bg-border" />
                        <div className="h-3.5 w-14 animate-pulse rounded-[3px] bg-border" />
                      </div>
                    </div>
                  </div>
                  <div className="mx-4 mt-2.5 h-[30px] animate-pulse rounded-[3px] bg-border" />
                  <div className="mx-4 mt-3.5 border-t border-border" />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
                    <div className="h-4 w-32 animate-pulse rounded-[3px] bg-border" />
                    <div className="h-4 w-28 animate-pulse rounded-[3px] bg-border" />
                    <div className="h-5 w-20 animate-pulse rounded-full bg-border" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="รายงาน" back={false} />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 space-y-5">

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
            { label: "การปฏิบัติงานทั้งหมด", value: stats.total,      unit: "งาน", color: "text-ink",          dot: "bg-border-strong" },
            { label: "งานที่เสร็จแล้ว",      value: stats.completed,  unit: "งาน", color: "text-success-text", dot: "bg-success"        },
            { label: "กำลังดำเนินการ",        value: stats.inProgress, unit: "งาน", color: "text-primary",      dot: "bg-primary"        },
            { label: "ถูกยกเลิก",             value: stats.cancelled,  unit: "งาน", color: "text-error",        dot: "bg-error"          },
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
          className="rounded-[12px] border border-border bg-background overflow-hidden animate-enter"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-[13px] font-semibold text-ink">สัดส่วนประเภทงาน</p>
            <span className="text-[11px] font-medium text-muted">{MONTHS_TH[month]} {year}</span>
          </div>
          <div className="px-5 py-5">
            <DonutChart segments={typeBreakdown} total={stats.total} />
          </div>
        </div>

        {/* Recent work */}
        <div className="animate-enter" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-ink">การปฏิบัติงานล่าสุด</p>
            <button className="text-[12px] font-medium text-primary transition-colors hover:text-primary-deep">
              ดูทั้งหมด
            </button>
          </div>
          <div className="space-y-3">
            {RECENT_TASKS.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
