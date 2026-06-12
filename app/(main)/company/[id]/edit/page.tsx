"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import CompanyForm, { type CompanyFormData } from "@/components/company-form";
import { COMPANIES } from "@/lib/companies";

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const company = COMPANIES.find((c) => c.id === params.id);

  function handleSubmit(data: CompanyFormData) {
    // TODO: update in Firestore, then navigate
    router.back();
  }

  if (!ready) {
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
        {/* Identity chip */}
        <div className="mb-6 flex items-center gap-3 rounded-[10px] bg-surface px-3 py-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] text-[11px] font-bold"
            style={company.logoURL ? { backgroundColor: company.bg } : { backgroundColor: company.color, color: "white" }}
          >
            {company.logoURL ? (
              <img src={company.logoURL} alt="" className="h-full w-full object-contain p-0.5" />
            ) : (
              company.shortName.replace(/[^A-Z]/g, "").slice(0, 2) || company.shortName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{company.shortName}</p>
            <p className="text-[11px] text-muted">{company.id}</p>
          </div>
        </div>
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
