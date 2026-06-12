import { EMPLOYEES, DEPT_CONFIG } from "./employees";

export type Company = {
  id: string;
  name: string;
  shortName: string;
  type: "จำกัด" | "มหาชน" | "จำกัด (มหาชน)";
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  founded: string;
  color: string;
  bg: string;
  logoURL?: string;
};

export const COMPANIES: Company[] = [
  {
    id: "ugi-manufacturing",
    name: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",
    shortName: "UGI Manufacturing",
    type: "จำกัด",
    taxId: "0105556123456",
    address: "99/1 นิคมอุตสาหกรรมอมตะซิตี้ ชลบุรี 20000",
    phone: "038-100-200",
    email: "info@ugi-manufacturing.co.th",
    website: "www.ugi-manufacturing.co.th",
    founded: "2556",
    color: "oklch(0.44 0.27 292)",
    bg: "oklch(0.94 0.05 292)",
  },
  {
    id: "ugi-public",
    name: "บริษัท UGI จำกัด (มหาชน)",
    shortName: "UGI PCL",
    type: "จำกัด (มหาชน)",
    taxId: "0107548234567",
    address: "388 อาคาร UGI ทาวเวอร์ ถ.สีลม บางรัก กรุงเทพฯ 10500",
    phone: "02-200-3000",
    email: "info@ugi.co.th",
    website: "www.ugi.co.th",
    founded: "2548",
    color: "oklch(0.42 0.14 195)",
    bg: "oklch(0.93 0.04 195)",
  },
  {
    id: "ugi-services",
    name: "บริษัท UGI เซอร์วิสเซส จำกัด",
    shortName: "UGI Services",
    type: "จำกัด",
    taxId: "0105562345678",
    address: "99/1 นิคมอุตสาหกรรมอมตะซิตี้ ชลบุรี 20000",
    phone: "038-100-300",
    email: "info@ugi-services.co.th",
    website: "www.ugi-services.co.th",
    founded: "2562",
    color: "oklch(0.50 0.17 25)",
    bg: "oklch(0.95 0.04 25)",
  },
];

export type CompanyStats = {
  total: number;
  active: number;
  leave: number;
  resigned: number;
  departments: { name: string; count: number; color: string; bg: string }[];
};

export function getCompanyStats(companyName: string): CompanyStats {
  const emps = EMPLOYEES.filter((e) => e.company === companyName);
  const deptMap = new Map<string, number>();
  for (const e of emps) {
    deptMap.set(e.department, (deptMap.get(e.department) ?? 0) + 1);
  }
  return {
    total:    emps.length,
    active:   emps.filter((e) => e.status === "active").length,
    leave:    emps.filter((e) => e.status === "leave").length,
    resigned: emps.filter((e) => e.status === "resigned").length,
    departments: [...deptMap.entries()].map(([name, count]) => ({
      name, count,
      color: DEPT_CONFIG[name]?.color ?? "var(--muted)",
      bg:    DEPT_CONFIG[name]?.bg    ?? "var(--surface)",
    })),
  };
}
