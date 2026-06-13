"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/detail-section";
import { STATUS_CONFIG, fetchEmployeeHistory, type HistoryEntry } from "@/lib/employees";

export default function EmployeeHistorySection({ employeeId }: { employeeId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetchEmployeeHistory(employeeId).then(setHistory);
  }, [employeeId]);

  if (history.length === 0) return null;

  return (
    <Section label="ประวัติพนักงาน">
      {history.map((entry, i) => {
        const cfg = STATUS_CONFIG[entry.status];
        return (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex shrink-0 flex-col items-center self-stretch">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cfg.dot }} />
              {i < history.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="flex flex-1 items-center justify-between gap-3 py-0.5">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
                {entry.note && <span className="text-[12px] text-muted">{entry.note}</span>}
              </div>
              <span className="shrink-0 text-[11px] text-muted">{entry.date}</span>
            </div>
          </div>
        );
      })}
    </Section>
  );
}
