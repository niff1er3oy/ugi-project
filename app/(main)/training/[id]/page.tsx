"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import ParticipantManager from "@/components/participant-manager";
import { fetchTraining, deleteTraining, CATEGORY_CONFIG, type TrainingRecord, type TrainingCategory } from "@/lib/training";

function CategoryIcon({ category, size = 40 }: { category: TrainingCategory; size?: number }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-[14px]"
      style={{ width: size, height: size, backgroundColor: cfg.bg }}
    >
      <svg className="h-6 w-6" fill="none" stroke={cfg.color} strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={cfg.iconPath} />
      </svg>
    </div>
  );
}

export default function TrainingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TrainingRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchTraining(params.id).then((data) => {
      setRecord(data);
      setLoading(false);
    });
  }, [params.id]);

  async function handleDelete() {
    await deleteTraining(params.id);
    router.back();
  }

  const editButton = (
    <button
      onClick={() => router.push(`/training/${params.id}/edit`)}
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
        <Navbar title="รายละเอียดการอบรม" />
        <main className="mx-auto w-full max-w-3xl px-4 pb-8" aria-busy="true">
          <div className="mb-6 mt-4 flex flex-col items-center text-center" aria-hidden="true">
            <div className="h-20 w-20 animate-pulse rounded-[18px] bg-border" />
            <div className="mt-4 h-5 w-48 animate-pulse rounded-[3px] bg-border" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded-full bg-border" />
          </div>
          <div className="space-y-5" aria-hidden="true">
            {[4].map((rows, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-24 animate-pulse rounded-[3px] bg-border" />
                <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
                  {Array.from({ length: rows }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between px-4 py-3">
                      <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-3.5 w-32 animate-pulse rounded-[3px] bg-border" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  if (!record) {
    return (
      <>
        <Navbar title="รายละเอียดการอบรม" />
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-ink">ไม่พบข้อมูลการอบรม</p>
          <p className="mt-1 text-[13px] text-muted">รหัส {params.id}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="รายละเอียดการอบรม" right={editButton} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-8">
        {/* Hero */}
        <div className="mb-6 mt-4 flex flex-col items-center text-center animate-enter">
          <CategoryIcon category={record.category} size={80} />

          <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.01em] text-ink leading-snug max-w-xs">
            {record.title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-medium text-ink">
              {record.hours} ชม. · {record.participants.length} คน
            </span>
          </div>
        </div>

        <div className="space-y-5">
          <Section label="ข้อมูลหลักสูตร">
            <InfoRow label="วันที่"         value={record.endDate ? `${record.date} – ${record.endDate}` : record.date} />
            <InfoRow label="จำนวนชั่วโมง"  value={`${record.hours} ชั่วโมง`} />
            {record.location && <InfoRow label="สถานที่" value={record.location} />}
            <InfoRow label="รหัสการอบรม"   value={<span className="font-mono text-[12px]">{record.id}</span>} />
          </Section>

          <ParticipantManager trainingId={record.id} participants={record.participants} />

          {record.note && (
            <Section label="หมายเหตุ">
              <p className="px-4 py-3 text-[13px] text-ink leading-relaxed">{record.note}</p>
            </Section>
          )}
        </div>

        {/* Delete */}
        <div className="mt-8">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-error/30 bg-error-pale px-4 py-3 text-[13px] font-medium text-error transition-colors duration-150 hover:bg-error/10 active:scale-[0.99]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ลบการอบรมนี้
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
