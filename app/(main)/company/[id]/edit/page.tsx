"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import CompanyForm, { type CompanyFormData } from "@/components/company-form";
import { fetchCompany, updateCompany, type Company } from "@/lib/companies";

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompany(params.id).then((data) => {
      setCompany(data);
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(data: CompanyFormData) {
    await updateCompany(params.id, data);
    router.back();
  }

  if (loading) {
    return (
      <>
        <Navbar title="แก้ไขข้อมูลบริษัท" />
        <main className="mx-auto w-full max-w-2xl px-4 py-6" aria-busy="true">
          <div className="space-y-7" aria-hidden="true">
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 animate-pulse rounded-[16px] bg-border" />
              <div className="h-3 w-16 animate-pulse rounded-[3px] bg-border" />
            </div>
            {[3, 3, 1].map((fields, i) => (
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

  if (!company) {
    return (
      <>
        <Navbar title="แก้ไขข้อมูลบริษัท" />
        <div className="flex flex-col items-center py-24 text-center animate-enter">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-ink">ไม่พบข้อมูลบริษัท</p>
          <p className="mt-1 text-[13px] text-muted">{params.id}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="แก้ไขข้อมูลบริษัท" />
      <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 animate-enter">
        <CompanyForm
          defaultValues={company}
          companyId={params.id}
          submitLabel="บันทึกการเปลี่ยนแปลง"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
