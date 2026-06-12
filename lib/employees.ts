// ── Types ──────────────────────────────────────────────────────
export type EmpStatus = "active" | "leave" | "resigned";

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

// ── Mock data ──────────────────────────────────────────────────
export const EMPLOYEES: Employee[] = [
  { id: "EMP-001", firstName: "สมชาย",    lastName: "กิจจา",      department: "ฝ่ายผลิต",        status: "active",   company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",   position: "ผู้จัดการฝ่ายผลิต",       phone: "081-234-5678", email: "somchai.k@ugi.co.th",   startDate: "1 ม.ค. 2560"  },
  { id: "EMP-002", firstName: "วิชัย",     lastName: "นวลจันทร์",  department: "ฝ่ายผลิต",        status: "active",   company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",   position: "หัวหน้างานผลิต",          phone: "082-345-6789", email: "wichai.n@ugi.co.th",    startDate: "3 มี.ค. 2561" },
  { id: "EMP-003", firstName: "นภา",       lastName: "มากมี",      department: "ฝ่ายผลิต",        status: "leave",    company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",   position: "เจ้าหน้าที่ฝ่ายผลิต",    phone: "083-456-7890", email: "napa.m@ugi.co.th",      startDate: "5 มิ.ย. 2563" },
  { id: "EMP-004", firstName: "กิตติ",     lastName: "ขาวสะอาด",   department: "ฝ่ายผลิต",        status: "active",   company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",   position: "ช่างเทคนิคผลิต",         phone: "084-567-8901", email: "kitti.k@ugi.co.th",     startDate: "12 ส.ค. 2564" },
  { id: "EMP-005", firstName: "วีระ",      lastName: "ศรีสุข",     department: "ฝ่ายวิศวกรรม",    status: "active",   company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",   position: "วิศวกรอาวุโส",           phone: "085-678-9012", email: "veera.s@ugi.co.th",     startDate: "8 ก.พ. 2559"  },
  { id: "EMP-006", firstName: "ประสิทธิ์", lastName: "รัตนชัย",    department: "ฝ่ายวิศวกรรม",    status: "active",   company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",   position: "วิศวกรระบบไฟฟ้า",        phone: "086-789-0123", email: "prasit.r@ugi.co.th",    startDate: "20 เม.ย. 2562"},
  { id: "EMP-007", firstName: "สุวรรณ",    lastName: "ดีเลิศ",     department: "ฝ่ายวิศวกรรม",    status: "leave",    company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",   position: "ช่างเทคนิคซ่อมบำรุง",   phone: "087-890-1234", email: "suwan.d@ugi.co.th",     startDate: "7 ก.ค. 2565"  },
  { id: "EMP-008", firstName: "มาลี",      lastName: "สุดสวย",     department: "ฝ่าย HR",         status: "active",   company: "บริษัท UGI จำกัด (มหาชน)",           position: "ผู้จัดการฝ่าย HR",        phone: "088-901-2345", email: "malee.s@ugi.co.th",     startDate: "15 ต.ค. 2558" },
  { id: "EMP-009", firstName: "รัตนา",     lastName: "พงษ์พาณิช",  department: "ฝ่าย HR",         status: "active",   company: "บริษัท UGI จำกัด (มหาชน)",           position: "เจ้าหน้าที่ HR",          phone: "089-012-3456", email: "rattana.p@ugi.co.th",   startDate: "2 พ.ย. 2566"  },
  { id: "EMP-010", firstName: "อนุชา",     lastName: "ป่าสมบูรณ์",  department: "ฝ่ายบัญชี",       status: "active",   company: "บริษัท UGI จำกัด (มหาชน)",           position: "ผู้จัดการฝ่ายบัญชี",      phone: "081-123-4567", email: "anucha.p@ugi.co.th",    startDate: "11 ธ.ค. 2557" },
  { id: "EMP-011", firstName: "จิตร์",     lastName: "ใจดี",       department: "ฝ่ายบัญชี",       status: "resigned", company: "บริษัท UGI จำกัด (มหาชน)",           position: "นักบัญชีอาวุโส",          phone: "082-234-5678", email: "jit.j@ugi.co.th",       startDate: "18 ม.ค. 2563" },
  { id: "EMP-012", firstName: "ปิยะ",      lastName: "สวัสดิ์มงคล", department: "ฝ่ายความปลอดภัย", status: "active",   company: "บริษัท UGI เซอร์วิสเซส จำกัด",       position: "เจ้าหน้าที่ความปลอดภัย", phone: "083-345-6789", email: "piya.s@ugi.co.th",      startDate: "24 มี.ค. 2561"},
  { id: "EMP-013", firstName: "บุญมี",     lastName: "แดงเข้ม",    department: "ฝ่ายความปลอดภัย", status: "active",   company: "บริษัท UGI เซอร์วิสเซส จำกัด",       position: "หัวหน้างานความปลอดภัย",  phone: "084-456-7890", email: "boonmee.d@ugi.co.th",   startDate: "9 มิ.ย. 2560"  },
  { id: "EMP-014", firstName: "สมพงษ์",    lastName: "ทองคำ",      department: "ฝ่ายความปลอดภัย", status: "leave",    company: "บริษัท UGI เซอร์วิสเซส จำกัด",       position: "เจ้าหน้าที่ความปลอดภัย", phone: "085-567-8901", email: "sompong.t@ugi.co.th",   startDate: "30 ส.ค. 2567" },
];
