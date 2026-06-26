"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import OffsiteTaskForm, { type OffsiteTaskFormData } from "@/components/offsite-task-form";
import { fetchTask, updateTask, formatDate, type OffsiteTask } from "@/lib/offsite-tasks";
import { fetchCompanies, type Company } from "@/lib/companies";
import { createNotification } from "@/lib/notifications";

export default function OffsiteEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<OffsiteTask | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    Promise.all([fetchTask(params.id), fetchCompanies()]).then(([data, cos]) => {
      setTask(data);
      setCompanies(cos);
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(data: OffsiteTaskFormData) {
    await updateTask(params.id, data);
    await createNotification({
      type: "info",
      category: "การปฏิบัติงานนอกสถานที่",
      title: `แก้ไขงานนอกสถานที่: ${data.title}`,
      message: `${data.type} · ${formatDate(data.startDate)}`,
      href: `/offsite/${params.id}`,
    });
    router.back();
  }

  if (loading) {
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
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <p className="text-[15px] font-semibold text-ink">ไม่พบข้อมูลงาน</p>
          <p className="mt-1 text-[13px] text-muted">รหัส {params.id}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="แก้ไขงาน" />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-24 animate-enter">

        {/* Identity chip */}
        <div className="mb-6 flex items-center gap-3 rounded-[10px] bg-surface px-3 py-2.5">
          {task.photoURL ? (
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[8px]">
              <img src={task.photoURL} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-primary-ghost">
              <svg className="h-4 w-4" fill="none" stroke="var(--primary)" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{task.title}</p>
            <p className="text-[11px] text-muted">{task.id}</p>
          </div>
        </div>

        <OffsiteTaskForm
          defaultValues={task}
          taskId={task.id}
          companies={companies}
          submitLabel="บันทึกการเปลี่ยนแปลง"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
