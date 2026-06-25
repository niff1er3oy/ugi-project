import { getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { employeesRef, employeeRef } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────
export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  company: string;
  photoURL?: string;
};

// ── Config ─────────────────────────────────────────────────────
const DEPT_PALETTE = [
  { color: "oklch(0.44 0.27 292)", bg: "oklch(0.94 0.055 292)" },
  { color: "oklch(0.42 0.14 195)", bg: "oklch(0.93 0.04 195)"  },
  { color: "oklch(0.50 0.17 25)",  bg: "oklch(0.95 0.04 25)"   },
  { color: "oklch(0.42 0.16 145)", bg: "oklch(0.93 0.06 145)"  },
  { color: "oklch(0.46 0.16 75)",  bg: "oklch(0.95 0.04 75)"   },
  { color: "oklch(0.50 0.18 350)", bg: "oklch(0.95 0.04 350)"  },
  { color: "oklch(0.44 0.20 250)", bg: "oklch(0.94 0.04 250)"  },
  { color: "oklch(0.40 0.01 292)", bg: "oklch(0.94 0.005 292)" },
];

export function getDeptColor(name: string): { color: string; bg: string } {
  const idx = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % DEPT_PALETTE.length;
  return DEPT_PALETTE[idx];
}

// ── Helpers ────────────────────────────────────────────────────
function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

// ── Firestore CRUD ─────────────────────────────────────────────
export async function fetchEmployees(): Promise<Employee[]> {
  const snap = await getDocs(query(employeesRef(), orderBy("firstName")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee));
}

export async function fetchEmployee(id: string): Promise<Employee | null> {
  const snap = await getDoc(employeeRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Employee;
}

export async function createEmployee(data: Omit<Employee, "id">): Promise<string> {
  const ref = await addDoc(employeesRef(), strip(data));
  return ref.id;
}

export async function updateEmployee(id: string, data: Partial<Omit<Employee, "id">>): Promise<void> {
  await updateDoc(employeeRef(id), strip(data));
}

export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(employeeRef(id));
}
