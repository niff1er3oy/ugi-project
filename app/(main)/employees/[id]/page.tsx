"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Section, InfoRow } from "@/components/detail-section";
import { fetchEmployee, deleteEmployee, DEPT_CONFIG, type Employee } from "@/lib/employees";
import EmployeeTrainingSection from "@/components/employee-training-section";

// ── Sub-components ─────────────────────────────────────────────
function Avatar({ emp, size = 80 }: { emp: Employee; size?: number }) {
  const dept = DEPT_CONFIG[emp.department];
  const initials = emp.firstName.charAt(0) + emp.lastName.charAt(0);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {emp.photoURL ? (
        <img
          src={emp.photoURL}
          alt={`${emp.firstName} ${emp.lastName}`}
          className="h-full w-full rounded-full object-cover ring-4 ring-background"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-bold ring-4 ring-background"
          style={{
            backgroundColor: dept?.bg ?? "var(--surface)",
            color: dept?.color ?? "var(--muted)",
            fontSize: size * 0.26,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [emp, setEmp] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchEmployee(params.id).then((data) => {
      setEmp(data);
      setLoading(false);
    });
  }, [params.id]);

  async function handleDelete() {
    await deleteEmployee(params.id);
    router.back();
  }

  const editButton = (
    <button
      onClick={() => router.push(`/employees/${params.id}/edit`)}
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
        <Navbar title="รายละเอียดพนักงาน" />
        <main className="mx-auto w-full max-w-3xl px-4 pb-8" aria-busy="true" aria-label="กำลังโหลด">
          <div className="mb-6 mt-4 flex flex-col items-center text-center" aria-hidden="true">
            <div className="h-[88px] w-[88px] animate-pulse rounded-full bg-border" />
            <div className="mt-4 h-5 w-32 animate-pulse rounded-[3px] bg-border" />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <div className="h-6 w-24 animate-pulse rounded-full bg-border" />
            </div>
          </div>
          <div className="space-y-5" aria-hidden="true">
            {[3].map((rows, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-24 animate-pulse rounded-[3px] bg-border" />
                <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
                  {Array.from({ length: rows }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between px-4 py-3">
                      <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-3.5 w-28 animate-pulse rounded-[3px] bg-border" />
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

  if (!emp) {
    return (
      <>
        <Navbar title="รายละเอียดพนักงาน" />
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-ink">ไม่พบข้อมูลพนักงาน</p>
          <p className="mt-1 text-[13px] text-muted">รหัส {params.id}</p>
        </div>
      </>
    );
  }

  const dept = DEPT_CONFIG[emp.department];

  return (
    <>
      <Navbar title="รายละเอียดพนักงาน" right={editButton} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-8">

        {/* ── Profile hero ───────────────────────────────────── */}
        <div className="mb-6 mt-4 flex flex-col items-center text-center animate-enter">
          <Avatar emp={emp} size={88} />

          <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.01em] text-ink">
            {emp.firstName} {emp.lastName}
          </h2>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: dept?.bg, color: dept?.color }}
            >
              {emp.department}
            </span>
          </div>

        </div>

        <div className="space-y-5">

          {/* ── ข้อมูลส่วนตัว ────────────────────────────────── */}
          <Section label="ข้อมูลส่วนตัว">
            <InfoRow label="รหัสพนักงาน" value={
              <span className="font-mono text-[12px]">{emp.id}</span>
            } />
            <InfoRow label="บริษัท"       value={emp.company} />
            <InfoRow label="ทีม"          value={
              <span
                className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
                style={{ backgroundColor: dept?.bg, color: dept?.color }}
              >
                {emp.department}
              </span>
            } />
          </Section>

          {/* ── ประวัติการอบรม ──────────────────────────────── */}
          <EmployeeTrainingSection employeeId={emp.id} />

        </div>

        {/* ── ลบพนักงาน ──────────────────────────────────────── */}
        <div className="mt-8">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-error/30 bg-error-pale px-4 py-3 text-[13px] font-medium text-error transition-colors duration-150 hover:bg-error/10 active:scale-[0.99]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ลบพนักงานนี้
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
