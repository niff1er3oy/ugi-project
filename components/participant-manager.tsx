"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchEmployees, DEPT_CONFIG, type Employee } from "@/lib/employees";
import { updateTrainingParticipants } from "@/lib/training";

type Mode = "view" | "remove" | "add";

export default function ParticipantManager({
  trainingId,
  participants: initial,
}: {
  trainingId: string;
  participants: string[];
}) {
  const router = useRouter();
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [participants, setParticipants] = useState(initial);
  const [mode, setMode] = useState<Mode>("view");
  const [addSearch, setAddSearch] = useState("");

  useEffect(() => {
    fetchEmployees().then(setAllEmployees);
  }, []);

  const members = participants
    .map((id) => allEmployees.find((e) => e.id === id))
    .filter(Boolean) as Employee[];

  const available = allEmployees.filter((e) => !participants.includes(e.id));

  const filteredAvailable = available.filter((emp) => {
    if (!addSearch) return true;
    const q = addSearch.toLowerCase();
    return `${emp.firstName} ${emp.lastName} ${emp.position} ${emp.department}`
      .toLowerCase()
      .includes(q);
  });

  async function remove(id: string) {
    const next = participants.filter((x) => x !== id);
    setParticipants(next);
    await updateTrainingParticipants(trainingId, next);
  }

  async function add(id: string) {
    const next = [...participants, id];
    setParticipants(next);
    await updateTrainingParticipants(trainingId, next);
  }

  function closeAdd() {
    setMode("view");
    setAddSearch("");
  }

  return (
    <div className="animate-enter">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[13px] font-medium text-muted">
          ผู้เข้าร่วม{members.length > 0 ? ` (${members.length} คน)` : ""}
        </p>
        <div className="flex items-center gap-1">
          {mode === "view" && (
            <>
              {members.length > 0 && (
                <button
                  onClick={() => setMode("remove")}
                  aria-label="จัดการผู้เข้าร่วม"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </button>
              )}
              {available.length > 0 && (
                <button
                  onClick={() => setMode("add")}
                  aria-label="เพิ่มผู้เข้าร่วม"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              )}
            </>
          )}
          {mode === "remove" && (
            <button
              onClick={() => setMode("view")}
              className="rounded-full px-3 py-1 text-[11px] font-medium text-primary-text transition-colors hover:bg-primary-ghost"
            >
              เสร็จ
            </button>
          )}
          {mode === "add" && (
            <button
              onClick={closeAdd}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">

        {members.length === 0 && mode !== "add" && (
          <div className="flex flex-col items-center py-6 text-center">
            <p className="text-[13px] text-muted">ยังไม่มีผู้เข้าร่วม</p>
            {available.length > 0 && (
              <button
                onClick={() => setMode("add")}
                className="mt-2 text-[12px] text-primary-text hover:underline"
              >
                + เพิ่มพนักงาน
              </button>
            )}
          </div>
        )}

        {members.map((emp) => {
          const dept = DEPT_CONFIG[emp.department];
          const initials = emp.firstName.charAt(0) + emp.lastName.charAt(0);
          const row = (
            <>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{ backgroundColor: dept?.bg ?? "var(--surface)", color: dept?.color ?? "var(--muted)" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink">{emp.firstName} {emp.lastName}</p>
                <p className="text-[11px] text-muted">{emp.position}</p>
              </div>
            </>
          );

          if (mode === "remove") {
            return (
              <div key={emp.id} className="flex items-center gap-3 px-4 py-2.5">
                {row}
                <button
                  onClick={() => remove(emp.id)}
                  aria-label={`ลบ ${emp.firstName} ${emp.lastName}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-error transition-colors hover:bg-error-pale active:scale-90"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          }

          return (
            <button
              key={emp.id}
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  router.push(`/employees?select=${emp.id}`);
                } else {
                  router.push(`/employees/${emp.id}`);
                }
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface group"
            >
              {row}
              <svg
                className="h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          );
        })}

        {mode === "add" && (
          <div>
            <div className="px-3 py-2 border-b border-border">
              <div className="relative">
                <input
                  type="search"
                  autoFocus
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="ค้นหาพนักงาน..."
                  className="field-input py-2 text-[12px] pr-8"
                />
                {addSearch && (
                  <button
                    onClick={() => setAddSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    aria-label="ล้าง"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {filteredAvailable.length === 0 ? (
              <p className="px-4 py-4 text-center text-[12px] text-muted">
                {addSearch ? "ไม่พบพนักงาน" : "เพิ่มครบทุกคนแล้ว"}
              </p>
            ) : (
              <div className="max-h-52 overflow-y-auto divide-y divide-border">
                {filteredAvailable.map((emp) => {
                  const dept = DEPT_CONFIG[emp.department];
                  return (
                    <button
                      key={emp.id}
                      onClick={() => add(emp.id)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface active:scale-[0.99]"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: dept?.bg ?? "var(--surface)", color: dept?.color ?? "var(--muted)" }}
                      >
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-ink">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[11px] text-muted">{emp.position}</p>
                      </div>
                      <svg className="h-4 w-4 shrink-0 text-primary-text" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
