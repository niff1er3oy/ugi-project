"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import OffsiteTaskForm, { type OffsiteTaskFormData } from "@/components/offsite-task-form";
import { createTask, type OffsiteTask } from "@/lib/offsite-tasks";

export default function OffsiteNewPage() {
  const router = useRouter();

  async function handleSubmit(data: OffsiteTaskFormData) {
    const id = await createTask(data as Omit<OffsiteTask, "id">);
    router.replace(`/offsite/${id}`);
  }

  return (
    <>
      <Navbar title="สร้างงานใหม่" />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-24 animate-enter">
        <OffsiteTaskForm
          submitLabel="สร้างงาน"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
