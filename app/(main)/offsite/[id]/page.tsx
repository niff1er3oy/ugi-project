"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import { DepartmentChip } from "@/components/department-chip";
import { fetchTask, deleteTask, STATUS_CONFIG, TYPE_CONFIG, type OffsiteTask } from "@/lib/offsite-tasks";

export default function OffsiteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<OffsiteTask | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchTask(params.id).then((data) => {
      setTask(data);
      setLoading(false);
    });
  }, [params.id]);

  async function handleDelete() {
    await deleteTask(params.id);
    router.back();
  }

  const editButton = (
    <button
      onClick={() => router.push(`/offsite/${params.id}/edit`)}
      className="flex items-center gap-1.5 rounded-[6px] border border-border px-3 py-1.5 text-[12px] font-medium text-ink transition-colors duration-150 hover:bg-surface active:scale-95"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
      </svg>
      แก้ไข
    </button>
  );

  if (loading) {
    return (
      <>
        <Navbar title="รายละเอียดงาน" />
        <main className="mx-auto w-full max-w-3xl px-4 pb-8" aria-busy="true">
          <div className="mb-6 mt-4 animate-pulse" aria-hidden="true">
            <div className="flex gap-4">
              <div className="h-14 w-14 shrink-0 rounded-[14px] bg-border" />
              <div className="flex-1 pt-1">
                <div className="h-5 w-3/4 rounded-[3px] bg-border" />
                <div className="mt-2 flex gap-2">
                  <div className="h-5 w-20 rounded-full bg-border" />
                  <div className="h-5 w-16 rounded-full bg-border" />
                </div>
              </div>
            </div>
            <div className="mt-5 h-16 rounded-[10px] bg-border" />
          </div>
          <div className="space-y-5" aria-hidden="true">
            <div>
              <div className="mb-2 h-4 w-24 animate-pulse rounded-[3px] bg-border" />
              <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-border" />
                    <div className="h-3.5 w-32 animate-pulse rounded-[3px] bg-border" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <Navbar title="รายละเอียดงาน" />
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-ink">ไม่พบข้อมูลงาน</p>
          <p className="mt-1 text-[13px] text-muted">รหัส {params.id}</p>
        </div>
      </>
    );
  }

  const status = STATUS_CONFIG[task.status];
  const type = TYPE_CONFIG[task.type];

  return (
    <>
      <Navbar title="รายละเอียดงาน" right={editButton} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-8">

        {/* ── Hero ───────────────────────────────────────────── */}
        <div className="mb-6 mt-4 animate-enter">
          <div className="flex gap-4">
            {task.photoURL ? (
              <div className="mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-[14px]">
                <img src={task.photoURL} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: type.lightBg }}
              >
                <svg className="h-7 w-7" fill="none" stroke={type.color} strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={type.iconPath} />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                {task.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.bg} ${status.text}`}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                  {status.label}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: type.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: type.color }} />
                  {task.type}
                </span>
                <span className="font-mono text-[11px] text-muted">{task.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── ข้อมูลงาน ────────────────────────────────────── */}
          <Section label="ข้อมูลงาน">
            <InfoRow label="เริ่มต้น"    value={`${task.startDate} · ${task.startTime}`} />
            {task.endDate && (
              <InfoRow label="สิ้นสุด"  value={`${task.endDate} · ${task.endTime}`} />
            )}
            <InfoRow label="สถานที่"     value={task.location} />
            <InfoRow label="ทีม"         value={<DepartmentChip name={task.department} />} />
            <InfoRow label="ประเภทงาน"   value={
              <span className="text-[12px] font-medium" style={{ color: TYPE_CONFIG[task.type].color }}>{task.type}</span>
            } />
            <InfoRow label="รหัสงาน"     value={<span className="font-mono text-[12px]">{task.id}</span>} />
          </Section>

          {/* ── รายละเอียดงาน ────────────────────────────────── */}
          {task.note && (
            <Section label="รายละเอียดงาน">
              <p className="px-4 py-3 text-[13px] text-ink leading-relaxed">{task.note}</p>
            </Section>
          )}

          {/* ── รูปภาพการปฏิบัติงาน ──────────────────────────── */}
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

        {/* ── ลบงาน ──────────────────────────────────────────── */}
        <div className="mt-8">
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
                  onClick={handleDelete}
                  className="flex-1 rounded-[8px] bg-error py-2.5 text-[13px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98]"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </>
  );
}
