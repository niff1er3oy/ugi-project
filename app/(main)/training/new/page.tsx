"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import TrainingForm, { type TrainingFormData } from "@/components/training-form";
import { createTraining, type TrainingRecord } from "@/lib/training";

export default function TrainingNewPage() {
  const router = useRouter();

  async function handleSubmit(data: TrainingFormData) {
    const id = await createTraining(data as Omit<TrainingRecord, "id">);
    router.replace(`/training/${id}`);
  }

  return (
    <>
      <Navbar title="เพิ่มการอบรม" />
      <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 animate-enter">
        <TrainingForm
          submitLabel="เพิ่มการอบรม"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
