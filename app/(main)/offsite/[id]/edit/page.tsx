"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import OffsiteTaskForm, { type OffsiteTaskFormData } from "@/components/offsite-task-form";
import { ALL_TASKS, STATUS_CONFIG, TYPE_CONFIG } from "@/lib/offsite-tasks";

export default function OffsiteEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const task = ALL_TASKS.find((t) => t.id === params.id);

  function handleSubmit(data: OffsiteTaskFormData) {
    // TODO: update in Firestore
    router.back();
  }

  if (!ready) {
    return (
      <>
        <Navbar title="แก้ไขงาน" />
        <main className="mx-auto w-full max-w-3xl space-y-7 px-4 py-6" aria-busy="true">
          <div className="flex justify-center">
            <div className="h-20 w-20 animate-pulse rounded-[18px] bg-border" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-border" />
              <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            </div>
          ))}
        </main>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <Navbar title="แก้ไขงาน" />
        <div className="flex flex-col items-center py-24 text-center">
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
      <Navbar title="แก้ไขงาน" />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-24">

        {/* Identity chip */}
        <div className="mb-6 flex items-center gap-3 rounded-[10px] bg-surface px-3 py-2.5">
          {task.photoURL ? (
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[8px]">
              <img src={task.photoURL} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
              style={{ backgroundColor: type.lightBg }}
            >
              <svg className="h-4.5 w-4.5" fill="none" stroke={type.color} strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={type.iconPath} />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{task.title}</p>
            <p className="text-[11px] text-muted">{task.id}</p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
            {status.label}
          </span>
        </div>

        <OffsiteTaskForm
          defaultValues={task}
          taskId={task.id}
          submitLabel="บันทึกการเปลี่ยนแปลง"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
