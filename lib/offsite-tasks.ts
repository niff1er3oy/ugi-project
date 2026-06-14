import { getDocs, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { offsiteRef, offsiteDocRef } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────
export type WorkType   = "ซ่อมบำรุง" | "ติดตั้ง" | "ตรวจสอบ" | "อื่นๆ";
export type WorkStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type OffsiteTask = {
  id: string;
  title: string;
  type: WorkType;
  customType?: string;
  status: WorkStatus;
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

// ── Config ─────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<WorkStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:     { label: "รอดำเนินการ",    bg: "bg-accent-pale",   text: "text-accent-text",  dot: "var(--accent)"   },
  in_progress: { label: "กำลังดำเนินการ", bg: "bg-primary-ghost", text: "text-primary-text", dot: "var(--primary)"  },
  completed:   { label: "เสร็จแล้ว",      bg: "bg-success-pale",  text: "text-success-text", dot: "var(--success)"  },
  cancelled:   { label: "ถูกยกเลิก",      bg: "bg-error-pale",    text: "text-error",        dot: "var(--error)"    },
};

export const TYPE_CONFIG: Record<WorkType, { color: string; lightBg: string; iconPath: string }> = {
  "ซ่อมบำรุง": {
    color: "var(--accent-text)",
    lightBg: "var(--accent-pale)",
    iconPath: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
  },
  "ติดตั้ง": {
    color: "var(--primary-text)",
    lightBg: "var(--primary-ghost)",
    iconPath: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  },
  "ตรวจสอบ": {
    color: "var(--inspect-color)",
    lightBg: "var(--inspect-bg)",
    iconPath: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6",
  },
  "อื่นๆ": {
    color: "var(--muted)",
    lightBg: "var(--surface)",
    iconPath: "M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
  },
};

export const STATUS_FILTER_OPTIONS: { value: WorkStatus | "all"; label: string }[] = [
  { value: "all",         label: "ทุกสถานะ"       },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "pending",     label: "รอดำเนินการ"    },
  { value: "completed",   label: "เสร็จแล้ว"      },
  { value: "cancelled",   label: "ถูกยกเลิก"      },
];

export const TYPE_FILTER_OPTIONS: { value: WorkType | "all"; label: string }[] = [
  { value: "all",       label: "ทุกประเภท" },
  { value: "ซ่อมบำรุง", label: "ซ่อมบำรุง" },
  { value: "ติดตั้ง",   label: "ติดตั้ง"   },
  { value: "ตรวจสอบ",   label: "ตรวจสอบ"   },
  { value: "อื่นๆ",     label: "อื่นๆ"     },
];

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
  const ref = await addDoc(offsiteRef(), data);
  return ref.id;
}

export async function updateTask(id: string, data: Partial<Omit<OffsiteTask, "id">>): Promise<void> {
  await updateDoc(offsiteDocRef(id), data);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(offsiteDocRef(id));
}
