"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Navbar from "@/components/navbar";
import TrainingForm from "@/components/training-form";

export default function TrainingNewPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <>
        <Navbar title="เพิ่มการอบรม" />
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

  return (
    <>
      <Navbar title="เพิ่มการอบรม" />
      <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 animate-enter">
        <TrainingForm
          submitLabel="เพิ่มการอบรม"
          onSubmit={() => { /* TODO: save to Firestore */ router.back(); }}
          onCancel={() => router.back()}
        />
      </main>
    </>
  );
}
