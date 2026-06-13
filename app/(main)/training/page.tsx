"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import ParticipantManager from "@/components/participant-manager";
import {
  fetchTrainings, createTraining, updateTraining, deleteTraining,
  STATUS_CONFIG, CATEGORY_CONFIG, CATEGORIES, STATUS_FILTER_OPTIONS,
  type TrainingCategory, type TrainingStatus, type TrainingRecord,
} from "@/lib/training";
import TrainingForm, { type TrainingFormData } from "@/components/training-form";

// ── Category icon ───────────────────────────────────────────────
function CategoryIcon({ category, size = 40 }: { category: TrainingCategory; size?: number }) {
  const cfg = CATEGORY_CONFIG[category];
  const radius = size >= 48 ? "rounded-[14px]" : "rounded-[10px]";
  return (
    <div className={`shrink-0 flex items-center justify-center ${radius}`} style={{ width: size, height: size, backgroundColor: cfg.bg }}>
      <svg className="h-5 w-5" fill="none" stroke={cfg.color} strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={cfg.iconPath} />
      </svg>
    </div>
  );
}

// ── Training card ───────────────────────────────────────────────
function TrainingCard({ record, index, onSelect }: { record: TrainingRecord; index: number; onSelect: (id: string) => void }) {
  const status = STATUS_CONFIG[record.status];
  const cat = CATEGORY_CONFIG[record.category];

  return (
    <button
      onClick={() => onSelect(record.id)}
      className="block w-full text-left rounded-[12px] border border-border bg-background transition-shadow duration-150 hover:shadow-sm animate-enter-stagger"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex items-start gap-3 px-4 pt-4">
        <CategoryIcon category={record.category} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-semibold text-ink leading-snug">{record.title}</p>
            <span className={`mt-0.5 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: cat.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
              {record.category}
            </span>
            <span className="text-border-strong">·</span>
            <span className="text-[11px] text-muted">{record.id}</span>
          </div>
        </div>
      </div>

      {record.note && <p className="mx-4 mt-2.5 text-[12px] text-muted leading-relaxed line-clamp-2">{record.note}</p>}

      <div className="mx-4 mt-3.5 border-t border-border" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
          {record.date}{record.endDate ? ` – ${record.endDate}` : ""}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          {record.hours} ชม.
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
          {record.participants.length} คน
        </span>
      </div>
    </button>
  );
}

// ── Detail panel ────────────────────────────────────────────────
function TrainingDetailPanel({ record, onClose, onEdit, onDeleted }: { record: TrainingRecord; onClose: () => void; onEdit: () => void; onDeleted: (id: string) => void }) {
  const status = STATUS_CONFIG[record.status];
  const cat = CATEGORY_CONFIG[record.category];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDelete() {
    await deleteTraining(record.id);
    onDeleted(record.id);
  }

  return (
    <div className="px-6 py-6 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${status.bg} ${status.text}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
          {status.label}
        </span>
        <button onClick={onClose} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <CategoryIcon category={record.category} size={48} />
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold text-ink leading-snug">{record.title}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[12px] font-medium" style={{ color: cat.color }}>{record.category}</span>
            <span className="text-border-strong">·</span>
            <span className="font-mono text-[11px] text-muted">{record.id}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-ink">
          <svg className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          {record.hours} ชั่วโมง
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-ink">
          <svg className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
          {record.participants.length} ผู้เข้าร่วม
        </span>
      </div>

      <div className="space-y-5">
        <Section label="ข้อมูลหลักสูตร">
          <InfoRow label="วันที่"         value={record.endDate ? `${record.date} – ${record.endDate}` : record.date} />
          <InfoRow label="จำนวนชั่วโมง"  value={`${record.hours} ชั่วโมง`} />
          <InfoRow label="วิทยากร"        value={record.instructor} />
          <InfoRow label="รหัสการอบรม"   value={<span className="font-mono text-[12px]">{record.id}</span>} />
        </Section>

        <Section label="สถานที่และหน่วยงาน">
          <InfoRow label="สถานที่" value={record.location} />
          <InfoRow label="บริษัท"  value={record.company} />
          {record.department && <InfoRow label="แผนก" value={record.department} />}
        </Section>

        <ParticipantManager key={record.id} trainingId={record.id} participants={record.participants} />

        {record.note && (
          <Section label="หมายเหตุ">
            <p className="px-4 py-3 text-[13px] text-ink leading-relaxed">{record.note}</p>
          </Section>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={onEdit} className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-background py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
          แก้ไข
        </button>
      </div>

      <div className="mt-3">
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-error/30 bg-error-pale px-4 py-3 text-[13px] font-medium text-error transition-colors hover:bg-error/10 active:scale-[0.99]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            ลบการอบรมนี้
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

function TrainingEditPanel({ record, onDone, onSaved }: { record: TrainingRecord; onDone: () => void; onSaved: (updated: TrainingRecord) => void }) {
  async function handleSubmit(data: TrainingFormData) {
    await updateTraining(record.id, data);
    onSaved({ ...record, ...data });
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">แก้ไขการอบรม</p>
        <button onClick={onDone} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <TrainingForm defaultValues={record} submitLabel="บันทึกการเปลี่ยนแปลง" onSubmit={handleSubmit} onCancel={onDone} />
    </div>
  );
}

function TrainingAddPanel({ onDone, onAdded }: { onDone: () => void; onAdded: (r: TrainingRecord) => void }) {
  async function handleSubmit(data: TrainingFormData) {
    const id = await createTraining(data as Omit<TrainingRecord, "id">);
    onAdded({ id, ...data } as TrainingRecord);
    onDone();
  }
  return (
    <div className="px-6 py-6 pb-10 animate-enter">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">เพิ่มการอบรม</p>
        <button onClick={onDone} aria-label="ปิด" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <TrainingForm submitLabel="เพิ่มการอบรม" onSubmit={handleSubmit} onCancel={onDone} />
    </div>
  );
}

function DetailEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
      </div>
      <p className="text-[14px] font-medium text-ink">เลือกการอบรม</p>
      <p className="mt-1 text-[12px] text-muted">เพื่อดูรายละเอียด</p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────
function TrainingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TrainingCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get("select") ?? null);
  const [panelMode, setPanelMode] = useState<"detail" | "edit" | "add">("detail");

  useEffect(() => {
    fetchTrainings().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (q) {
        const hay = [r.title, r.instructor, r.location, r.company, r.department ?? "", r.id, r.note ?? ""].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, search, statusFilter, categoryFilter]);

  const hasFilter = search || statusFilter !== "all" || categoryFilter !== "all";

  if (loading) {
    return (
      <>
        <Navbar title="ประวัติการอบรม" back={false} />
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
                      <div className="mt-0.5 h-5 w-20 shrink-0 animate-pulse rounded-full bg-border" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-3.5 w-20 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-3.5 w-12 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  </div>
                </div>
                <div className="mx-4 mt-3.5 border-t border-border" />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
                  <div className="h-4 w-28 animate-pulse rounded-[3px] bg-border" />
                  <div className="h-4 w-16 animate-pulse rounded-[3px] bg-border" />
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
        title="ประวัติการอบรม"
        back={false}
        right={
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) { setSelectedId(null); setPanelMode("add"); }
              else router.push("/training/new");
            }}
            className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 hover:bg-primary-deep active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            เพิ่ม
          </button>
        }
      />

      <main className="w-full lg:flex lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">

        <div className="lg:flex lg:w-1/2 lg:flex-col lg:min-h-0 lg:border-r lg:border-border">
          <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md lg:static lg:z-auto lg:shrink-0">
            <div className="space-y-2.5 px-4 pt-3 pb-3">
              <div className="relative">
                <input type="search" placeholder="ค้นหาชื่อหลักสูตร วิทยากร สถานที่..." value={search} onChange={(e) => setSearch(e.target.value)} className="field-input pr-9" />
                {search ? (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-border text-muted hover:bg-border-strong hover:text-ink" aria-label="ล้างคำค้นหา">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                ) : (
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                )}
              </div>
              <div className="flex gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TrainingStatus | "all")} aria-label="กรองตามสถานะ" className="field-input flex-1">
                  {STATUS_FILTER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as TrainingCategory | "all")} aria-label="กรองตามประเภท" className="field-input flex-1">
                  <option value="all">ทุกประเภท</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 lg:flex-1 lg:overflow-y-auto">
            <div className="mb-3 flex items-center gap-2">
              <p aria-live="polite" aria-atomic="true" className="text-[12px] text-muted animate-enter">
                {filtered.length > 0 ? `${filtered.length} รายการ` : "ไม่พบการอบรมที่ตรงกัน"}
              </p>
              {hasFilter && (
                <button onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }} className="text-[12px] text-primary-text hover:underline">
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((record, i) => (
                  <TrainingCard key={record.id} record={record} index={i} onSelect={(id) => { setSelectedId(id); setPanelMode("detail"); }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center animate-enter">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                </div>
                <p className="text-[15px] font-semibold text-ink">ไม่พบการอบรมที่ตรงกัน</p>
                <p className="mt-1 text-[13px] text-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 lg:min-h-0 lg:flex-col lg:overflow-y-auto">
          {(() => {
            if (panelMode === "add") return (
              <TrainingAddPanel onDone={() => setPanelMode("detail")} onAdded={(r) => setRecords((prev) => [r, ...prev])} />
            );
            const record = selectedId ? records.find((r) => r.id === selectedId) : null;
            if (!record) return <DetailEmptyState />;
            if (panelMode === "edit") return (
              <TrainingEditPanel record={record} onDone={() => setPanelMode("detail")} onSaved={(updated) => setRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r))} />
            );
            return (
              <TrainingDetailPanel
                key={record.id}
                record={record}
                onClose={() => setSelectedId(null)}
                onEdit={() => setPanelMode("edit")}
                onDeleted={(id) => { setRecords((prev) => prev.filter((r) => r.id !== id)); setSelectedId(null); }}
              />
            );
          })()}
        </div>

      </main>
    </>
  );
}

export default function TrainingPage() {
  return (
    <Suspense>
      <TrainingPageContent />
    </Suspense>
  );
}
