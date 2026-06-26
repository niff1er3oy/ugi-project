import { getDocs, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { trainingRef, trainingDocRef } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────
export type TrainingCategory = "ความปลอดภัย" | "ทักษะวิชาชีพ" | "ทักษะทั่วไป" | "การจัดการ" | "อื่นๆ";

export type TrainingRecord = {
  id: string;
  title: string;
  category: TrainingCategory;
  date: string;
  endDate?: string;
  hours: number;
  location: string;
  participants: string[];
  note?: string;
};

// ── Config ──────────────────────────────────────────────────────
export const CATEGORY_CONFIG: Record<TrainingCategory, { color: string; bg: string; iconPath: string }> = {
  "ความปลอดภัย": {
    color: "oklch(0.50 0.17 25)",
    bg: "oklch(0.95 0.04 25)",
    iconPath: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  },
  "ทักษะวิชาชีพ": {
    color: "oklch(0.44 0.27 292)",
    bg: "oklch(0.94 0.055 292)",
    iconPath: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5",
  },
  "ทักษะทั่วไป": {
    color: "oklch(0.42 0.16 145)",
    bg: "oklch(0.93 0.06 145)",
    iconPath: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
  },
  "การจัดการ": {
    color: "oklch(0.42 0.14 195)",
    bg: "oklch(0.93 0.04 195)",
    iconPath: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605",
  },
  "อื่นๆ": {
    color: "oklch(0.50 0.05 292)",
    bg: "oklch(0.96 0.01 292)",
    iconPath: "M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
  },
};

export const CATEGORIES: TrainingCategory[] = ["ความปลอดภัย", "ทักษะวิชาชีพ", "ทักษะทั่วไป", "การจัดการ", "อื่นๆ"];

// ── Firestore CRUD ─────────────────────────────────────────────
export async function fetchTrainings(): Promise<TrainingRecord[]> {
  const snap = await getDocs(trainingRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TrainingRecord));
}

export async function fetchTraining(id: string): Promise<TrainingRecord | null> {
  const snap = await getDoc(trainingDocRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as TrainingRecord;
}

function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export async function createTraining(data: Omit<TrainingRecord, "id">): Promise<string> {
  const ref = await addDoc(trainingRef(), strip(data));
  return ref.id;
}

export async function updateTraining(id: string, data: Partial<Omit<TrainingRecord, "id">>): Promise<void> {
  await updateDoc(trainingDocRef(id), strip(data));
}

export async function deleteTraining(id: string): Promise<void> {
  await deleteDoc(trainingDocRef(id));
}

export async function updateTrainingParticipants(id: string, participants: string[]): Promise<void> {
  await updateDoc(trainingDocRef(id), { participants });
}
