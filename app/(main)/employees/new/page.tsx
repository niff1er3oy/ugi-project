"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import EmployeeForm, { type EmployeeFormData } from "@/components/employee-form";
import { createEmployee } from "@/lib/employees";
import { createNotification } from "@/lib/notifications";

export default function NewEmployeePage() {
  const router = useRouter();

  async function handleSubmit(data: EmployeeFormData) {
    const id = await createEmployee(data);
    await createNotification({
      type: "info",
      category: "ข้อมูลพนักงาน",
      title: `เพิ่มพนักงานใหม่: ${data.firstName} ${data.lastName}`,
      message: `${data.department} · ${data.company}`,
      href: `/employees/${id}`,
    });
    router.replace(`/employees/${id}`);
  }

  return (
    <>
      <Navbar title="เพิ่มพนักงาน" />
      <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 animate-enter">
        <EmployeeForm
          submitLabel="เพิ่มพนักงาน"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
