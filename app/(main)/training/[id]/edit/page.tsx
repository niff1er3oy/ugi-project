"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import TrainingForm, { type TrainingFormData } from "@/components/training-form";
import { fetchTraining, updateTraining, type TrainingRecord } from "@/lib/training";

export default function TrainingEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TrainingRecord | null>(null);

  useEffect(() => {
    fetchTraining(params.id).then((data) => {
      setRecord(data);
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(data: TrainingFormData) {
    await updateTraining(params.id, data);
    router.back();
  }

  if (loading) {
    return (
      <>
        <Navbar title="แก้ไขการอบรม" />
        <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6" aria-busy="true">
          <div className="space-y-5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-24 animate-pulse rounded-[3px] bg-border" />
                <div className="h-10 animate-pulse rounded-[6px] bg-border" />
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
        <Navbar title="แก้ไขการอบรม" />
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <p className="text-[15px] font-semibold text-ink">ไม่พบข้อมูลการอบรม</p>
          <p className="mt-1 text-[13px] text-muted">รหัส {params.id}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="แก้ไขการอบรม" />
      <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 animate-enter">
        <TrainingForm
          defaultValues={record}
          submitLabel="บันทึกการเปลี่ยนแปลง"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
