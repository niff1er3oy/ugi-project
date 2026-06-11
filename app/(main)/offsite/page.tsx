"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { DEPT_CONFIG } from "@/lib/employees";

// ── Types ──────────────────────────────────────────────────────
type WorkType = "ซ่อมบำรุง" | "ติดตั้ง" | "ตรวจสอบ" | "อื่นๆ";
type WorkStatus = "pending" | "in_progress" | "completed" | "cancelled";

type OffsiteTask = {
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

// ── Config ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<WorkStatus, { label: string; bg: string; text: string; ring: string; dot: string }> = {
  pending:     { label: "รอดำเนินการ",    bg: "bg-accent-pale",                   text: "text-amber-700",               ring: "ring-accent/30",   dot: "oklch(0.72 0.14 75)"  },
  in_progress: { label: "กำลังดำเนินการ", bg: "bg-primary-ghost",                 text: "text-primary",                 ring: "ring-primary/20",  dot: "oklch(0.44 0.27 292)" },
  completed:   { label: "เสร็จแล้ว",      bg: "bg-[oklch(0.93_0.06_145)]",       text: "text-[oklch(0.37_0.13_145)]",  ring: "ring-[oklch(0.52_0.16_145)]/20", dot: "oklch(0.52 0.16 145)" },
  cancelled:   { label: "ถูกยกเลิก",      bg: "bg-error-pale",                   text: "text-error",                   ring: "ring-error/20",    dot: "oklch(0.50 0.17 25)"  },
};

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

// ── Mock data ──────────────────────────────────────────────────
const ALL_TASKS: OffsiteTask[] = [
  {
    id: "WO-001",
    title: "ซ่อมท่อน้ำรั่วบริเวณอาคาร A ชั้น 3",
    type: "ซ่อมบำรุง",
    status: "completed",
    date: "12 มิ.ย. 2568",
    time: "09:00",
    department: "ฝ่ายผลิต",
    location: "อาคาร A ชั้น 3",
    note: "ท่อน้ำแตกในห้องน้ำชาย ซ่อมเสร็จก่อนกำหนด",
  },
  {
    id: "WO-002",
    title: "ติดตั้งระบบกล้องวงจรปิดคลังสินค้า B",
    type: "ติดตั้ง",
    status: "in_progress",
    date: "11 มิ.ย. 2568",
    time: "13:00",
    department: "ฝ่ายวิศวกรรม",
    location: "คลังสินค้า B",
    note: "ติดตั้งแล้ว 6 จาก 12 จุด คาดเสร็จวันที่ 14 มิ.ย.",
  },
  {
    id: "WO-003",
    title: "ตรวจสอบระบบไฟฟ้าประจำเดือนมิถุนายน",
    type: "ตรวจสอบ",
    status: "completed",
    date: "10 มิ.ย. 2568",
    time: "08:00",
    department: "ฝ่ายความปลอดภัย",
    location: "โรงงานหลัก",
    note: "ผ่านมาตรฐานทุกจุด ไม่พบความผิดปกติ",
  },
  {
    id: "WO-004",
    title: "ซ่อมแซมหลังคารั่วอาคาร C",
    type: "ซ่อมบำรุง",
    status: "pending",
    date: "14 มิ.ย. 2568",
    time: "07:30",
    department: "ฝ่ายผลิต",
    location: "อาคาร C หลังคาชั้น 5",
    note: "รอช่างผู้รับเหมาภายนอกมาประเมินงาน",
  },
  {
    id: "WO-005",
    title: "ติดตั้งระบบปรับอากาศห้องประชุมใหญ่",
    type: "ติดตั้ง",
    status: "in_progress",
    date: "9 มิ.ย. 2568",
    time: "08:30",
    department: "ฝ่ายวิศวกรรม",
    location: "ห้องประชุมใหญ่ อาคาร B",
    note: "วางท่อลม 80% เหลือเชื่อมต่อไฟฟ้าและทดสอบระบบ",
  },
  {
    id: "WO-006",
    title: "ตรวจสอบระบบดับเพลิงอาคาร D",
    type: "ตรวจสอบ",
    status: "cancelled",
    date: "8 มิ.ย. 2568",
    time: "10:00",
    department: "ฝ่ายความปลอดภัย",
    location: "อาคาร D ทุกชั้น",
    note: "ยกเลิกเนื่องจากอาคารปิดปรับปรุง เลื่อนไปเดือน ก.ค.",
  },
  {
    id: "WO-007",
    title: "ซ่อมลิฟต์โดยสารอาคาร A",
    type: "ซ่อมบำรุง",
    status: "pending",
    date: "15 มิ.ย. 2568",
    time: "09:00",
    department: "ฝ่ายวิศวกรรม",
    location: "อาคาร A ลิฟต์หมายเลข 2",
    note: "รอชิ้นส่วนอะไหล่จากต่างประเทศ",
  },
  {
    id: "WO-008",
    title: "ทาสีรั้วและพื้นที่ลานจอดรถ",
    type: "อื่นๆ",
    status: "in_progress",
    date: "7 มิ.ย. 2568",
    time: "06:00",
    department: "ฝ่ายผลิต",
    location: "ลานจอดรถอาคาร A-B",
    note: "ทาเสร็จแล้ว 2 โซน เหลืออีก 1 โซน",
  },
  {
    id: "WO-009",
    title: "ตรวจสอบท่อระบายน้ำลานด้านหลัง",
    type: "ตรวจสอบ",
    status: "completed",
    date: "5 มิ.ย. 2568",
    time: "13:30",
    department: "ฝ่ายความปลอดภัย",
    location: "ลานด้านหลังโรงงาน",
    note: "พบตะกอนอุดตัน 2 จุด แนะนำล้างทำความสะอาดทุก 3 เดือน",
  },
  {
    id: "WO-010",
    title: "ซ่อมประตูโรลลิ่งโกดังคลังสินค้า A",
    type: "ซ่อมบำรุง",
    status: "completed",
    date: "3 มิ.ย. 2568",
    time: "11:00",
    department: "ฝ่ายวิศวกรรม",
    location: "คลังสินค้า A ประตูหมายเลข 3",
    note: "เปลี่ยนสปริงและระบบล็อค ทดสอบเรียบร้อย",
  },
];

const STATUS_FILTER_OPTIONS: { value: WorkStatus | "all"; label: string }[] = [
  { value: "all",         label: "ทั้งหมด" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "pending",     label: "รอดำเนินการ" },
  { value: "completed",   label: "เสร็จแล้ว" },
  { value: "cancelled",   label: "ถูกยกเลิก" },
];

const TYPE_FILTER_OPTIONS: { value: WorkType | "all"; label: string }[] = [
  { value: "all",       label: "ทุกประเภท" },
  { value: "ซ่อมบำรุง", label: "ซ่อมบำรุง" },
  { value: "ติดตั้ง",   label: "ติดตั้ง" },
  { value: "ตรวจสอบ",   label: "ตรวจสอบ" },
  { value: "อื่นๆ",     label: "อื่นๆ" },
];

// ── Sub-components ─────────────────────────────────────────────
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
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dept?.color ?? "var(--muted)" }} />
      {name}
    </span>
  );
}

function TaskCard({ task, index }: { task: OffsiteTask; index: number }) {
  const status = STATUS_CONFIG[task.status];
  const type = TYPE_CONFIG[task.type];

  return (
    <div
      className="rounded-[12px] border border-border bg-background transition-shadow duration-150 hover:shadow-sm cursor-pointer animate-enter-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      {/* Card top bar: type icon + title + status */}
      <div className="flex items-start gap-3 px-4 pt-4">
        {/* Type icon */}
        <div
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: type.lightBg }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke={type.color}
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={type.iconPath} />
          </svg>
        </div>

        {/* Title + type + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-semibold text-ink leading-snug">{task.title}</p>
            <span
              className={`mt-0.5 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}
            >
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: type.color }}>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              {task.type}
            </span>
            <span className="text-border-strong">·</span>
            <span className="text-[11px] text-muted">{task.id}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      {task.note && (
        <p className="mx-4 mt-2.5 text-[12px] text-muted leading-relaxed line-clamp-2">
          {task.note}
        </p>
      )}

      {/* Divider */}
      <div className="mx-4 mt-3.5 border-t border-border" />

      {/* Meta row */}
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
export default function OfsitePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<WorkType | "all">("all");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_TASKS.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (q) {
        const haystack = [t.title, t.location, t.id, t.department, t.note].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, statusFilter, typeFilter]);

  const counts = useMemo(
    () => ({
      all: ALL_TASKS.length,
      in_progress: ALL_TASKS.filter((t) => t.status === "in_progress").length,
      pending: ALL_TASKS.filter((t) => t.status === "pending").length,
      completed: ALL_TASKS.filter((t) => t.status === "completed").length,
      cancelled: ALL_TASKS.filter((t) => t.status === "cancelled").length,
    }),
    []
  );

  const headerRight = (
    <button className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      สร้างงาน
    </button>
  );

  if (!ready) {
    return (
      <div className="flex min-h-64 flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-ghost border-t-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar title="ปฏิบัติงานนอกสถานที่" back={false} right={headerRight} />

      {/* Sticky search + filter bar */}
      <div className="sticky top-12 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        {/* Search */}
        <div className="px-4 pt-3 pb-2.5">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              placeholder="ค้นหาชื่องาน สถานที่ ทีมงาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input pl-9 pr-4"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-border text-muted hover:bg-border-strong hover:text-ink"
                aria-label="ล้างคำค้นหา"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Status chips */}
        <div
          className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="กรองตามสถานะ"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => {
            const active = statusFilter === opt.value;
            const count = opt.value === "all" ? counts.all : counts[opt.value];
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors duration-150 ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-muted hover:border-border-strong hover:text-ink"
                }`}
              >
                {opt.value !== "all" && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: active ? "white" : STATUS_CONFIG[opt.value as WorkStatus].dot,
                    }}
                  />
                )}
                {opt.label}
                <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${active ? "bg-white/20 text-white" : "bg-surface text-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Type chips */}
        <div
          className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="กรองตามประเภท"
        >
          {TYPE_FILTER_OPTIONS.map((opt) => {
            const active = typeFilter === opt.value;
            const tc = opt.value !== "all" ? TYPE_CONFIG[opt.value as WorkType] : null;
            return (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors duration-150 ${
                  active
                    ? "border-primary bg-primary-ghost text-primary"
                    : "border-border bg-background text-muted hover:border-border-strong hover:text-ink"
                }`}
              >
                {tc && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: tc.color }}
                  />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 py-4">
        {/* Result count */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] text-muted animate-enter">
            {filtered.length > 0
              ? `${filtered.length} งาน`
              : search || statusFilter !== "all" || typeFilter !== "all"
              ? "ไม่พบงานที่ตรงกัน"
              : "ไม่มีงาน"}
            {(search || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
                className="ml-2 text-primary hover:underline"
              >
                ล้างตัวกรอง
              </button>
            )}
          </p>
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center animate-enter">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
              <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-ink">ไม่พบงานที่ตรงกัน</p>
            <p className="mt-1 text-[13px] text-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
      </main>
    </>
  );
}
