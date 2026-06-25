import { getDocs, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { offsiteRef, offsiteDocRef } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────
export type OffsiteTask = {
  id: string;
  title: string;
  type: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  department: string;
  location: string;
  note?: string;
  workPhotos?: string[];
  photoURL?: string;
};

// ── Helpers ────────────────────────────────────────────────────
function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

// ── Firestore CRUD ─────────────────────────────────────────────
export async function fetchTasks(): Promise<OffsiteTask[]> {
  const snap = await getDocs(offsiteRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OffsiteTask));
}

export async function fetchTask(id: string): Promise<OffsiteTask | null> {
  const snap = await getDoc(offsiteDocRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as OffsiteTask;
}

export async function createTask(data: Omit<OffsiteTask, "id">): Promise<string> {
  const ref = await addDoc(offsiteRef(), strip(data));
  return ref.id;
}

export async function updateTask(id: string, data: Partial<Omit<OffsiteTask, "id">>): Promise<void> {
  await updateDoc(offsiteDocRef(id), strip(data));
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(offsiteDocRef(id));
}
