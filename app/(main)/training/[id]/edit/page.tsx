"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import TrainingForm from "@/components/training-form";
import { ALL_RECORDS } from "@/lib/training";

export default function TrainingEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  const record = ALL_RECORDS.find((r) => r.id === params.id);

  if (!ready) {
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
          onSubmit={() => { /* TODO: update in Firestore */ router.back(); }}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
