"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import OffsiteTaskForm, { type OffsiteTaskFormData } from "@/components/offsite-task-form";
import { createTask, type OffsiteTask } from "@/lib/offsite-tasks";
import { createNotification } from "@/lib/notifications";
import { fetchAllDepartments } from "@/lib/companies";

export default function OffsiteNewPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchAllDepartments().then(setDepartments);
  }, []);

  async function handleSubmit(data: OffsiteTaskFormData) {
    const id = await createTask(data as Omit<OffsiteTask, "id">);
    await createNotification({
      type: "info",
      category: "การปฏิบัติงานนอกสถานที่",
      title: "สร้างงานนอกสถานที่ใหม่",
      message: `${data.title} (${data.type}) — ${data.department} · ${data.startDate}`,
      href: `/offsite/${id}`,
    });
    router.replace(`/offsite/${id}`);
  }

  return (
    <>
      <Navbar title="สร้างงานใหม่" />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-24 animate-enter">
        <OffsiteTaskForm
          departments={departments}
          submitLabel="สร้างงาน"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
