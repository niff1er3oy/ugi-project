"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import OffsiteTaskForm, { type OffsiteTaskFormData } from "@/components/offsite-task-form";

export default function OffsiteNewPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  function handleSubmit(data: OffsiteTaskFormData) {
    // TODO: save to Firestore
    console.log("new task", data);
    router.back();
  }

  if (!ready) {
    return (
      <>
        <Navbar title="สร้างงานใหม่" />
        <main className="mx-auto w-full max-w-3xl space-y-7 px-4 py-6" aria-busy="true">
          <div className="flex justify-center">
            <div className="h-20 w-20 animate-pulse rounded-[18px] bg-border" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3.5 w-24 animate-pulse rounded-[3px] bg-border" />
              <div className="h-9 w-full animate-pulse rounded-[6px] bg-border" />
            </div>
          ))}
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="สร้างงานใหม่" />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-24">
        <OffsiteTaskForm
          submitLabel="สร้างงาน"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
