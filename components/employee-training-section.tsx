"use client";

import { useRouter } from "next/navigation";
import { ALL_RECORDS, STATUS_CONFIG, CATEGORY_CONFIG } from "@/lib/training";

export default function EmployeeTrainingSection({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const records = ALL_RECORDS.filter((r) => r.participants.includes(employeeId));

  if (records.length === 0) return null;

  function handleClick(id: string) {
    if (window.innerWidth >= 1024) {
      router.push(`/training?select=${id}`);
    } else {
      router.push(`/training/${id}`);
    }
  }

  return (
    <div className="animate-enter">
      <p className="mb-2 px-1 text-[13px] font-medium text-muted">
        ประวัติการอบรม ({records.length} รายการ)
      </p>
      <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
        {records.map((record) => {
          const status = STATUS_CONFIG[record.status];
          const cat = CATEGORY_CONFIG[record.category];
          return (
            <button
              key={record.id}
              onClick={() => handleClick(record.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface group active:scale-[0.99]"
            >
              {/* Category icon */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                style={{ backgroundColor: cat.bg }}
              >
                <svg className="h-4 w-4" fill="none" stroke={cat.color} strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.iconPath} />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-medium text-ink leading-snug">
                  {record.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[11px] text-muted">{record.date}</span>
                  <span className="text-border-strong">·</span>
                  <span className="text-[11px] text-muted">{record.hours} ชม.</span>
                </div>
              </div>

              {/* Status badge */}
              <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
                {status.label}
              </span>

              {/* Chevron */}
              <svg
                className="h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
