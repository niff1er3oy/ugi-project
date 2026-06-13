import { getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { employeesRef, employeeRef, historyRef } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────
export type EmpStatus = "active" | "leave" | "resigned";

export type HistoryEntry = {
  date: string;
  status: EmpStatus;
  note?: string;
};

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  status: EmpStatus;
  department: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  startDate: string;
  photoURL?: string;
};

// ── Config ─────────────────────────────────────────────────────
export const DEPT_CONFIG: Record<string, { color: string; bg: string }> = {
  "ฝ่ายผลิต":        { color: "oklch(0.42 0.15 75)",  bg: "oklch(0.95 0.04 75)"  },
  "ฝ่ายวิศวกรรม":    { color: "oklch(0.44 0.27 292)", bg: "oklch(0.94 0.05 292)" },
  "ฝ่าย HR":         { color: "oklch(0.36 0.14 195)", bg: "oklch(0.93 0.04 195)" },
  "ฝ่ายบัญชี":       { color: "oklch(0.35 0.14 145)", bg: "oklch(0.93 0.06 145)" },
  "ฝ่ายความปลอดภัย": { color: "oklch(0.40 0.18 25)",  bg: "oklch(0.95 0.04 25)"  },
};

export const STATUS_CONFIG: Record<EmpStatus, { label: string; dot: string; bg: string; text: string }> = {
  active:   { label: "ปฏิบัติงาน", dot: "oklch(0.52 0.16 145)", bg: "bg-success-pale",  text: "text-success-text"  },
  leave:    { label: "ลาพัก",      dot: "oklch(0.72 0.14 75)",  bg: "bg-accent-pale",   text: "text-accent-text"   },
  resigned: { label: "ลาออก",      dot: "oklch(0.60 0.04 292)", bg: "bg-surface",       text: "text-muted"         },
};

export const DEPARTMENTS = Object.keys(DEPT_CONFIG);

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
  const ref = await addDoc(employeesRef(), data);
  return ref.id;
}

export async function updateEmployee(id: string, data: Partial<Omit<Employee, "id">>): Promise<void> {
  await updateDoc(employeeRef(id), data);
}

export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(employeeRef(id));
}

// ── History subcollection ──────────────────────────────────────
export async function fetchEmployeeHistory(empId: string): Promise<HistoryEntry[]> {
  const snap = await getDocs(historyRef(empId));
  return snap.docs.map((d) => d.data() as HistoryEntry);
}

export async function addEmployeeHistory(empId: string, entry: HistoryEntry): Promise<void> {
  await addDoc(historyRef(empId), entry);
}
