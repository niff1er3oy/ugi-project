"use client";

import { useRef, useState, useEffect } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
} from "chart.js";
Chart.register(DoughnutController, ArcElement, Tooltip);
import Navbar from "@/components/navbar";
import { DepartmentChip } from "@/components/department-chip";
import {
  fetchTasks,
  TYPE_CONFIG, STATUS_CONFIG,
  type OffsiteTask, type WorkType,
} from "@/lib/offsite-tasks";

// ── Thai date parsing ──────────────────────────────────────────
const MONTHS_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];

const MONTH_ABBR: Record<string, number> = {
  "ม.ค.": 1, "ก.พ.": 2, "มี.ค.": 3, "เม.ย.": 4, "พ.ค.": 5, "มิ.ย.": 6,
  "ก.ค.": 7, "ส.ค.": 8, "ก.ย.": 9, "ต.ค.": 10, "พ.ย.": 11, "ธ.ค.": 12,
};

function parseThaiDate(s: string): { month: number; year: number } | null {
  const parts = s.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const month = MONTH_ABBR[parts[1]];
  const year = parseInt(parts[2]);
  if (!month || isNaN(year)) return null;
  return { month, year };
}

function taskMatchesPeriod(task: OffsiteTask, month: number, yearBE: number): boolean {
  const parsed = parseThaiDate(task.startDate);
  if (!parsed) return false;
  return parsed.month === month + 1 && parsed.year === yearBE;
}

// ── Sub-components ─────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: { label: WorkType; count: number; color: string }[]; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart<"doughnut"> | null>(null);

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
        animation: { animateRotate: true, animateScale: false, duration: 500 },
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
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [segments, total]);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative mx-auto w-full max-w-[280px] shrink-0 sm:mx-0 sm:w-[200px]">
        <canvas ref={canvasRef} role="img" aria-label="สัดส่วนประเภทงาน" />
        <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center">
          <span className="text-[28px] font-bold leading-none tracking-[-0.03em] text-ink">{total}</span>
          <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">งานทั้งหมด</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3.5 sm:flex-1">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
          return (
            <div key={seg.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-[13px] font-medium text-ink">{seg.label}</span>
                </div>
                <span className="text-[12px] tabular-nums text-muted">{seg.count} · {pct}%</span>
              </div>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-border">
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

function TaskCard({ task, index }: { task: OffsiteTask; index: number }) {
  const status = STATUS_CONFIG[task.status];
  const type   = TYPE_CONFIG[task.type];
  return (
    <div
      className="animate-enter-stagger cursor-pointer rounded-[12px] border border-border bg-background transition-shadow duration-150 hover:shadow-sm"
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
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-semibold leading-snug text-ink">{task.title}</p>
            <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: type.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: type.color }} />
              {task.type}
            </span>
            <span className="text-border-strong">·</span>
            <span className="font-mono text-[11px] text-muted">{task.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
      {task.note && (
        <p className="mx-4 mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-muted">{task.note}</p>
      )}
      <div className="mx-4 mt-3.5 border-t border-border" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          {task.startDate} · {task.startTime}
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
  const now = new Date();
  const [month, setMonth]   = useState(now.getMonth());        // 0-indexed
  const [year, setYear]     = useState(now.getFullYear() + 543); // BE
  const [tasks, setTasks]   = useState<OffsiteTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks().then((data) => {
      setTasks(data);
      setLoading(false);
      // Jump to the most recent period that has data
      if (data.length > 0) {
        const parsed = data.map((t) => parseThaiDate(t.startDate)).filter(Boolean) as { month: number; year: number }[];
        if (parsed.length > 0) {
          const latest = parsed.reduce((a, b) =>
            b.year > a.year || (b.year === a.year && b.month > a.month) ? b : a
          );
          setYear(latest.year);
          setMonth(latest.month - 1);
        }
      }
    });
  }, []);

  // Build unique periods from actual task dates
  const periods = tasks.reduce<Map<string, { year: number; month: number }>>(
    (acc, t) => {
      const parsed = parseThaiDate(t.startDate);
      if (!parsed) return acc;
      const key = `${parsed.year}-${parsed.month}`;
      if (!acc.has(key)) acc.set(key, parsed);
      return acc;
    },
    new Map()
  );

  const availableYears = periods.size > 0
    ? [...new Set([...periods.values()].map((p) => p.year))].sort((a, b) => b - a)
    : [now.getFullYear() + 543];

  const availableMonths = periods.size > 0
    ? [...new Set([...periods.values()].filter((p) => p.year === year).map((p) => p.month))].sort((a, b) => a - b)
    : [now.getMonth() + 1];

  const periodTasks  = tasks.filter((t) => taskMatchesPeriod(t, month, year));
  const usePeriod    = periodTasks.length > 0;
  const displayTasks = usePeriod ? periodTasks : tasks;

  const total      = displayTasks.length;
  const completed  = displayTasks.filter((t) => t.status === "completed").length;
  const inProgress = displayTasks.filter((t) => t.status === "in_progress").length;
  const pending    = displayTasks.filter((t) => t.status === "pending").length;
  const cancelled  = displayTasks.filter((t) => t.status === "cancelled").length;

  const typeBreakdown: { label: WorkType; count: number; color: string }[] = (
    ["ซ่อมบำรุง", "ติดตั้ง", "ตรวจสอบ", "อื่นๆ"] as WorkType[]
  ).map((type) => ({
    label: type,
    count: displayTasks.filter((t) => t.type === type).length,
    color: TYPE_CONFIG[type].color,
  }));

  const recentTasks = displayTasks.slice(0, 5);

  const CE_YEAR = year - 543;

  const skeleton = (
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
            <div className="mx-auto aspect-square w-full max-w-[280px] animate-pulse rounded-full bg-border sm:mx-0 sm:w-[200px] shrink-0" />
            <div className="flex w-full flex-col gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex items-center justify-between">
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
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-28 animate-pulse rounded-[3px] bg-border" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[12px] border border-border bg-background">
                <div className="flex items-start gap-3 px-4 pt-4">
                  <div className="mt-0.5 h-10 w-10 shrink-0 animate-pulse rounded-[10px] bg-border" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-[38px] flex-1 animate-pulse rounded-[3px] bg-border" />
                      <div className="mt-0.5 h-5 w-24 shrink-0 animate-pulse rounded-full bg-border" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-3.5 w-20 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  </div>
                </div>
                <div className="mx-4 mt-3.5 border-t border-border" />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
                  <div className="h-4 w-32 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-4 w-28 animate-pulse rounded-[3px] bg-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );

  if (loading) return skeleton;

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
                {availableMonths.map((m) => (
                  <option key={m} value={m - 1}>{MONTHS_TH[m - 1]}</option>
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
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setYear(y);
                  const months = [...new Set(
                    [...periods.values()].filter((p) => p.year === y).map((p) => p.month)
                  )].sort((a, b) => a - b);
                  if (months.length > 0) setMonth(months[months.length - 1] - 1);
                }}
                className="field-input cursor-pointer appearance-none pr-8"
              >
                {availableYears.map((y: number) => <option key={y} value={y}>{y}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Period label */}
        <p className="text-[12px] text-muted animate-enter" style={{ animationDelay: "30ms" }}>
          {usePeriod
            ? <>สรุปการปฏิบัติงาน{MONTHS_TH[month]} {year} <span className="text-border-strong">({MONTHS_TH[month]} {CE_YEAR})</span></>
            : <span className="text-accent-text">ไม่พบงานในเดือนนี้ — แสดงข้อมูลทั้งหมด ({tasks.length} งาน)</span>
          }
        </p>

        {/* Stat cards */}
        <div key={`${month}-${year}`} className="grid grid-cols-2 gap-3 animate-enter" style={{ animationDelay: "50ms" }}>
          {[
            { label: "การปฏิบัติงานทั้งหมด", value: total,      unit: "งาน", color: "text-ink",          dot: "bg-border-strong" },
            { label: "งานที่เสร็จแล้ว",      value: completed,  unit: "งาน", color: "text-success-text", dot: "bg-success"        },
            { label: "กำลังดำเนินการ",        value: inProgress + pending, unit: "งาน", color: "text-primary-text", dot: "bg-primary" },
            { label: "ถูกยกเลิก",             value: cancelled,  unit: "งาน", color: "text-error",        dot: "bg-error"          },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className="animate-enter-stagger rounded-[12px] border border-border bg-background px-4 py-3.5"
              style={{ "--i": i } as React.CSSProperties}
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${kpi.dot}`} />
                <p className="text-[11px] leading-tight text-muted">{kpi.label}</p>
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

        {/* Donut chart */}
        <div className="overflow-hidden rounded-[12px] border border-border bg-background animate-enter" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-[13px] font-semibold text-ink">สัดส่วนประเภทงาน</p>
            <span className="text-[11px] font-medium text-muted">{MONTHS_TH[month]} {year}</span>
          </div>
          <div className="px-5 py-5">
            {total === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted">ไม่มีข้อมูล</p>
            ) : (
              <DonutChart segments={typeBreakdown} total={total} />
            )}
          </div>
        </div>

        {/* Recent work */}
        <div className="animate-enter" style={{ animationDelay: "140ms" }}>
          <p className="mb-3 text-[13px] font-semibold text-ink">การปฏิบัติงานล่าสุด</p>
          {recentTasks.length === 0 ? (
            <div className="rounded-[12px] border border-border bg-background px-4 py-10 text-center">
              <p className="text-[13px] text-muted">ยังไม่มีงานในช่วงเวลานี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task, i) => (
                <TaskCard key={task.id} task={task} index={i} />
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  );
}
