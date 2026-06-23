import { getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { employeesRef, employeeRef } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────
export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  company: string;
  phone: string;
  email: string;
  photoURL?: string;
};

// ── Config ─────────────────────────────────────────────────────
export const DEPT_CONFIG: Record<string, { color: string; bg: string }> = {
  "ฝ่ายผลิต":        { color: "var(--accent-text)",   bg: "var(--accent-pale)"   },
  "ฝ่ายวิศวกรรม":    { color: "var(--primary-text)",  bg: "var(--primary-ghost)" },
  "ฝ่าย HR":         { color: "var(--inspect-color)",  bg: "var(--inspect-bg)"    },
  "ฝ่ายบัญชี":       { color: "var(--success-text)",  bg: "var(--success-pale)"  },
  "ฝ่ายความปลอดภัย": { color: "var(--error)",         bg: "var(--error-pale)"    },
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
