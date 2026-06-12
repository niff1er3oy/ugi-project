"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import { DepartmentChip } from "@/components/department-chip";
import {
  ALL_TASKS, STATUS_CONFIG, TYPE_CONFIG,
  STATUS_FILTER_OPTIONS, TYPE_FILTER_OPTIONS,
  type WorkType, type WorkStatus, type OffsiteTask,
} from "@/lib/offsite-tasks";
import OffsiteTaskForm, { type OffsiteTaskFormData } from "@/components/offsite-task-form";

// ── Sub-components ─────────────────────────────────────────────
function TaskTypeIcon({ type, photoURL, size = 40 }: { type: WorkType; photoURL?: string; size?: number }) {
  const cfg = TYPE_CONFIG[type];
  const radius = size >= 48 ? "rounded-[14px]" : "rounded-[10px]";
  if (photoURL) {
    return (
      <div className={`shrink-0 overflow-hidden ${radius}`} style={{ width: size, height: size }}>
        <img src={photoURL} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`shrink-0 flex items-center justify-center ${radius}`}
      style={{ width: size, height: size, backgroundColor: cfg.lightBg }}
    >
      <svg className="h-5 w-5" fill="none" stroke={cfg.color} strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={cfg.iconPath} />
      </svg>
    </div>
  );
}

function TaskCard({ task, index, onSelect }: { task: OffsiteTask; index: number; onSelect: (id: string) => void }) {
  const router = useRouter();
  const status = STATUS_CONFIG[task.status];
  const type = TYPE_CONFIG[task.type];

  return (
    <div
      onClick={() => {
        if (window.innerWidth >= 1024) onSelect(task.id);
        else router.push(`/offsite/${task.id}`);
      }}
      className="rounded-[12px] border border-border bg-background transition-shadow duration-150 hover:shadow-sm cursor-pointer animate-enter-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex items-start gap-3 px-4 pt-4">
        <TaskTypeIcon type={task.type} photoURL={task.photoURL} />
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

// ── Detail panel ───────────────────────────────────────────────
function OffsiteDetailPanel({ task, onClose, onEdit }: { task: OffsiteTask; onClose: () => void; onEdit: () => void }) {
  const status = STATUS_CONFIG[task.status];
  const type = TYPE_CONFIG[task.type];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="px-6 py-6 animate-enter">
      {/* Top row: status + close */}
      <div className="mb-5 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${status.bg} ${status.text}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
          {status.label}
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

      {/* Title + type */}
      <div className="mb-6 flex gap-4">
        <TaskTypeIcon type={task.type} size={48} />
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold text-ink leading-snug">{task.title}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[12px] font-medium" style={{ color: type.color }}>{task.type}</span>
            <span className="text-border-strong">·</span>
            <span className="font-mono text-[11px] text-muted">{task.id}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-5">
        <Section label="ข้อมูลงาน">
          <InfoRow label="เริ่มต้น"   value={`${task.startDate} · ${task.startTime}`} />
          {task.endDate && (
            <InfoRow label="สิ้นสุด" value={`${task.endDate} · ${task.endTime}`} />
          )}
          <InfoRow label="สถานที่"    value={task.location} />
          <InfoRow label="ทีม"        value={<DepartmentChip name={task.department} />} />
          <InfoRow label="ประเภทงาน"  value={
            <span className="text-[12px] font-medium" style={{ color: TYPE_CONFIG[task.type].color }}>{task.type}</span>
          } />
          <InfoRow label="รหัสงาน"    value={<span className="font-mono text-[12px]">{task.id}</span>} />
        </Section>

        {task.note && (
          <Section label="รายละเอียดงาน">
            <p className="px-4 py-3 text-[13px] text-ink leading-relaxed">{task.note}</p>
          </Section>
        )}

        {task.workPhotos && task.workPhotos.length > 0 && (
          <Section label={`รูปภาพการปฏิบัติงาน (${task.workPhotos.length}/5)`}>
            <div className={`grid gap-2 p-3 ${task.workPhotos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {task.workPhotos.map((url, i) => (
                <div
                  key={i}
                  className={`aspect-square overflow-hidden rounded-[8px] bg-surface ${
                    (task.workPhotos!.length === 3 && i === 0) || (task.workPhotos!.length === 5 && i === 4)
                      ? "col-span-2"
                      : ""
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
          </svg>
          แก้ไข
        </button>
      </div>

      {/* Delete */}
      <div className="mt-3">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-error/30 bg-error-pale px-4 py-3 text-[13px] font-medium text-error transition-colors hover:bg-error/10 active:scale-[0.99]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            ลบงานนี้
          </button>
        ) : (
          <div className="animate-enter rounded-[12px] border border-error/40 bg-error-pale px-4 py-4">
            <p className="text-center text-[13px] font-semibold text-error">ยืนยันการลบ?</p>
            <p className="mt-0.5 text-center text-[12px] text-muted">การกระทำนี้ไม่สามารถยกเลิกได้</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-[8px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]"
              >
                ยกเลิก
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-[8px] bg-error py-2.5 text-[13px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98]"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OffsiteEditPanel({ task, onDone }: { task: OffsiteTask; onDone: () => void }) {
  function handleSubmit(data: OffsiteTaskFormData) {
    console.log("update task", task.id, data);
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">แก้ไขงาน</p>
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
      <OffsiteTaskForm
        defaultValues={task}
        taskId={task.id}
        submitLabel="บันทึกการเปลี่ยนแปลง"
        onSubmit={handleSubmit}
        onCancel={onDone}
      />
    </div>
  );
}

function OffsiteAddPanel({ onDone }: { onDone: () => void }) {
  function handleSubmit(data: OffsiteTaskFormData) {
    console.log("new task", data);
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">สร้างงานใหม่</p>
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
      <OffsiteTaskForm
        submitLabel="สร้างงาน"
        onSubmit={handleSubmit}
        onCancel={onDone}
      />
    </div>
  );
}

function DetailEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
        </svg>
      </div>
      <p className="text-[14px] font-medium text-ink">เลือกงาน</p>
      <p className="mt-1 text-[12px] text-muted">เพื่อดูรายละเอียด</p>
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
    return ALL_TASKS.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (q) {
        const hay = [t.title, t.location, t.id, t.department, t.note ?? "", t.type].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, statusFilter, typeFilter]);

  const hasFilter = search || statusFilter !== "all" || typeFilter !== "all";

  if (!ready) {
    return (
      <>
        <Navbar title="ปฏิบัติงานนอกสถานที่" back={false} />
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md" aria-hidden="true">
          <div className="space-y-2.5 px-4 pt-3 pb-3">
            <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            <div className="flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded-[6px] bg-border" />
              <div className="h-9 flex-1 animate-pulse rounded-[6px] bg-border" />
            </div>
          </div>
        </div>
        <main className="w-full px-4 py-4" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-3 h-4 w-10 animate-pulse rounded-[3px] bg-border" aria-hidden="true" />
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[12px] border border-border bg-background">
                <div className="flex items-start gap-3 px-4 pt-4">
                  <div className="mt-0.5 h-10 w-10 shrink-0 animate-pulse rounded-[10px] bg-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-[42px] flex-1 animate-pulse rounded-[3px] bg-border" />
                      <div className="mt-0.5 h-5 w-24 shrink-0 animate-pulse rounded-full bg-border" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-3.5 w-20 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-3.5 w-12 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  </div>
                </div>
                <div className="mx-4 mt-2.5 h-2.5 animate-pulse rounded-[3px] bg-border" />
                <div className="mx-4 mt-3.5 border-t border-border" />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
                  <div className="h-4 w-32 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-4 w-28 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-border" />
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
        title="ปฏิบัติงานนอกสถานที่"
        back={false}
        right={
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setSelectedId(null);
                setPanelMode("add");
              } else {
                router.push("/offsite/new");
              }
            }}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            สร้างงาน
          </button>
        }
      />

      {/* Content — split 50/50 on desktop with independent scroll */}
      <main className="w-full lg:flex lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">

        {/* Left: filter + list (own scroll on desktop) */}
        <div className="lg:flex lg:w-1/2 lg:flex-col lg:min-h-0 lg:border-r lg:border-border">

          {/* Filter — sticky on mobile, static header on desktop */}
          <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md lg:static lg:z-auto lg:shrink-0">
            <div className="space-y-2.5 px-4 pt-3 pb-3">
              <div className="relative">
                <input
                  type="search"
                  placeholder="ค้นหาชื่องาน สถานที่ ทีม ประเภท..."
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
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as WorkStatus | "all")}
                  aria-label="กรองตามสถานะ"
                  className="field-input flex-1"
                >
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as WorkType | "all")}
                  aria-label="กรองตามประเภท"
                  className="field-input flex-1"
                >
                  {TYPE_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Task list — scrollable on desktop */}
          <div className="px-4 py-4 lg:flex-1 lg:overflow-y-auto">
            <div className="mb-3 flex items-center gap-2">
              <p aria-live="polite" aria-atomic="true" className="text-[12px] text-muted animate-enter">
                {filtered.length > 0 ? `${filtered.length} งาน` : "ไม่พบงานที่ตรงกัน"}
              </p>
              {hasFilter && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
                  className="text-[12px] text-primary hover:underline"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((task, i) => (
                  <TaskCard key={task.id} task={task} index={i} onSelect={(id) => { setSelectedId(id); setPanelMode("detail"); }} />
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
          </div>

        </div>

        {/* Right: detail / edit / add panel — desktop only, full-height scroll */}
        <div className="hidden lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:overflow-y-auto">
          {(() => {
            if (panelMode === "add") {
              return <OffsiteAddPanel onDone={() => setPanelMode("detail")} />;
            }
            const task = selectedId ? ALL_TASKS.find((t) => t.id === selectedId) : null;
            if (!task) return <DetailEmptyState />;
            if (panelMode === "edit") {
              return <OffsiteEditPanel task={task} onDone={() => setPanelMode("detail")} />;
            }
            return (
              <OffsiteDetailPanel
                task={task}
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
