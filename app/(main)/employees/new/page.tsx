"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import EmployeeForm, { type EmployeeFormData } from "@/components/employee-form";

export default function NewEmployeePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  function handleSubmit(data: EmployeeFormData) {
    // TODO: save to Firestore, then navigate
    console.log("new employee:", data);
    router.back();
  }

  if (!ready) {
    return (
      <>
        <Navbar title="เพิ่มพนักงาน" />
        <main className="mx-auto w-full max-w-2xl px-4 py-6" aria-busy="true">
          <div className="space-y-7" aria-hidden="true">
            {[4, 1, 2].map((fields, i) => (
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
