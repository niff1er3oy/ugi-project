"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import EmployeeForm, { type EmployeeFormData } from "@/components/employee-form";
import { EMPLOYEES } from "@/lib/employees";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const emp = EMPLOYEES.find((e) => e.id === params.id);

  function handleSubmit(data: EmployeeFormData) {
    // TODO: update in Firestore, then navigate
    router.back();
  }

  if (!ready) {
    return (
      <>
        <Navbar title="แก้ไขข้อมูลพนักงาน" />
        <main className="mx-auto w-full max-w-2xl px-4 py-6" aria-busy="true">
          <div className="space-y-7" aria-hidden="true">
            {[4, 1, 2].map((fields, i) => (
              <div key={i}>
                <div className="mb-3 h-3 w-20 animate-pulse rounded-[3px] bg-border" />
                <div className="space-y-3">
                  {Array.from({ length: fields }).map((_, j) => (
                    <div key={j}>
                      <div className="mb-1.5 h-3 w-14 animate-pulse rounded-[3px] bg-border" />
                      <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
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
        <Navbar title="แก้ไขข้อมูลพนักงาน" />
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

  return (
    <>
      <Navbar title="แก้ไขข้อมูลพนักงาน" />
      <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 animate-enter">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-[14px]"
            style={{ backgroundColor: "var(--surface)", color: "var(--muted)" }}
          >
            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">{emp.firstName} {emp.lastName}</p>
            <p className="text-[12px] text-muted">{emp.id}</p>
          </div>
        </div>
        <EmployeeForm
          defaultValues={emp}
          empId={emp.id}
          submitLabel="บันทึกการเปลี่ยนแปลง"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
