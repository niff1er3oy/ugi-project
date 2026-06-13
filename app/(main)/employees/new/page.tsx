"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import EmployeeForm, { type EmployeeFormData } from "@/components/employee-form";
import { createEmployee } from "@/lib/employees";

export default function NewEmployeePage() {
  const router = useRouter();

  async function handleSubmit(data: EmployeeFormData) {
    const id = await createEmployee(data);
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
