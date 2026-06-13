"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import CompanyForm, { type CompanyFormData } from "@/components/company-form";
import { createCompany } from "@/lib/companies";

export default function NewCompanyPage() {
  const router = useRouter();

  async function handleSubmit(data: CompanyFormData) {
    const id = await createCompany(data);
    router.replace(`/company/${id}`);
  }

  return (
    <>
      <Navbar title="เพิ่มบริษัท" />
      <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 animate-enter">
        <CompanyForm
          submitLabel="เพิ่มบริษัท"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
