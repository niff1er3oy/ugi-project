import { getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { companiesRef, companyRef } from "@/lib/db";
import { DEPT_CONFIG, type Employee } from "@/lib/employees";

// ── Types ──────────────────────────────────────────────────────
export type Company = {
  id: string;
  name: string;
  type: "นิติบุคคล" | "บุคคลธรรมดา";
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  departments: string[];
  logoURL?: string;
};

export type CompanyStats = {
  total: number;
  departments: { name: string; count: number; color: string; bg: string }[];
};

// ── Helpers ────────────────────────────────────────────────────
export function getCompanyStats(companyName: string, employees: Employee[]): CompanyStats {
  const emps = employees.filter((e) => e.company === companyName);
  const deptMap = new Map<string, number>();
  for (const e of emps) {
    deptMap.set(e.department, (deptMap.get(e.department) ?? 0) + 1);
  }
  return {
    total: emps.length,
    departments: [...deptMap.entries()].map(([name, count]) => ({
      name, count,
      color: DEPT_CONFIG[name]?.color ?? "var(--muted)",
      bg:    DEPT_CONFIG[name]?.bg    ?? "var(--surface)",
    })),
  };
}

// ── Firestore CRUD ─────────────────────────────────────────────
export async function fetchCompanies(): Promise<Company[]> {
  const snap = await getDocs(query(companiesRef(), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Company));
}

export async function fetchCompany(id: string): Promise<Company | null> {
  const snap = await getDoc(companyRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Company;
}

export async function createCompany(data: Omit<Company, "id">): Promise<string> {
  const ref = await addDoc(companiesRef(), data);
  return ref.id;
}

export async function updateCompany(id: string, data: Partial<Omit<Company, "id">>): Promise<void> {
  await updateDoc(companyRef(id), data);
}

export async function deleteCompany(id: string): Promise<void> {
  await deleteDoc(companyRef(id));
}

export async function fetchAllDepartments(): Promise<string[]> {
  const companies = await fetchCompanies();
  const set = new Set<string>();
  for (const c of companies) {
    for (const d of c.departments ?? []) set.add(d);
  }
  return [...set].sort();
}
