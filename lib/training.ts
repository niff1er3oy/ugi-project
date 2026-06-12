// ── Types ──────────────────────────────────────────────────────
export type TrainingCategory = "ความปลอดภัย" | "ทักษะวิชาชีพ" | "ทักษะทั่วไป" | "การจัดการ" | "อื่นๆ";
export type TrainingStatus   = "completed" | "in_progress" | "cancelled";

export type TrainingRecord = {
  id: string;
  title: string;
  category: TrainingCategory;
  status: TrainingStatus;
  date: string;
  endDate?: string;
  hours: number;
  instructor: string;
  location: string;
  company: string;
  department?: string;
  participants: string[];
  note?: string;
};

// ── Config ──────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<TrainingStatus, { label: string; bg: string; text: string; dot: string }> = {
  completed:   { label: "เสร็จสิ้น",       bg: "bg-success-pale",  text: "text-success-text", dot: "oklch(0.52 0.16 145)" },
  in_progress: { label: "กำลังดำเนินการ",  bg: "bg-primary-ghost", text: "text-primary-text", dot: "oklch(0.44 0.27 292)" },
  cancelled:   { label: "ยกเลิก",          bg: "bg-error-pale",    text: "text-error",        dot: "oklch(0.50 0.17 25)"  },
};

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

export const STATUS_FILTER_OPTIONS: { value: TrainingStatus | "all"; label: string }[] = [
  { value: "all",         label: "ทุกสถานะ"      },
  { value: "completed",   label: "เสร็จสิ้น"      },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "cancelled",   label: "ยกเลิก"         },
];

// ── Mock data ──────────────────────────────────────────────────
export const ALL_RECORDS: TrainingRecord[] = [
  {
    id: "TR-001",
    title: "การปฐมพยาบาลเบื้องต้นและความปลอดภัยในการทำงาน",
    category: "ความปลอดภัย", status: "completed",
    date: "15 มิ.ย. 2568", hours: 6,
    instructor: "วิทยากรจากกรมสวัสดิการแรงงาน",
    location: "ห้องประชุมอาคาร A",
    company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด", department: "ฝ่ายผลิต",
    participants: ["EMP-001","EMP-002","EMP-003","EMP-004","EMP-005","EMP-006","EMP-007","EMP-012","EMP-013","EMP-014"],
    note: "ครอบคลุมเนื้อหา CPR การใช้ถังดับเพลิง และการอพยพหนีไฟ",
  },
  {
    id: "TR-002",
    title: "Excel Advanced สำหรับงานบัญชีและการเงิน",
    category: "ทักษะวิชาชีพ", status: "completed",
    date: "8 มิ.ย. 2568", hours: 8,
    instructor: "อ.สมศักดิ์ วิทยาคม",
    location: "ห้อง Training Center ชั้น 4",
    company: "บริษัท UGI จำกัด (มหาชน)", department: "ฝ่ายบัญชี",
    participants: ["EMP-008","EMP-009","EMP-010","EMP-011"],
  },
  {
    id: "TR-003",
    title: "การสื่อสารและการทำงานเป็นทีม",
    category: "ทักษะทั่วไป", status: "in_progress",
    date: "20 มิ.ย. 2568", endDate: "21 มิ.ย. 2568", hours: 12,
    instructor: "บริษัท HR Training Solutions",
    location: "โรงแรม Amari Pattaya",
    company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด",
    participants: ["EMP-001","EMP-002","EMP-003","EMP-004","EMP-005","EMP-006","EMP-007","EMP-012","EMP-013","EMP-014"],
    note: "Workshop 2 วัน เนื้อหา Team Building และการแก้ปัญหาเชิงสร้างสรรค์",
  },
  {
    id: "TR-004",
    title: "ภาวะผู้นำและการบริหารทีมงาน",
    category: "การจัดการ", status: "completed",
    date: "1 มิ.ย. 2568", hours: 16,
    instructor: "ผศ.ดร.วิไลพร จันทรา",
    location: "ห้องประชุมชั้น 10 อาคาร UGI Tower",
    company: "บริษัท UGI จำกัด (มหาชน)",
    participants: ["EMP-001","EMP-002","EMP-005","EMP-008","EMP-010","EMP-012","EMP-013","EMP-006"],
  },
  {
    id: "TR-005",
    title: "การใช้อุปกรณ์ป้องกันส่วนบุคคล (PPE)",
    category: "ความปลอดภัย", status: "completed",
    date: "25 พ.ค. 2568", hours: 3,
    instructor: "เจ้าหน้าที่ความปลอดภัย",
    location: "โรงงาน UGI Services",
    company: "บริษัท UGI เซอร์วิสเซส จำกัด", department: "ฝ่ายความปลอดภัย",
    participants: ["EMP-012","EMP-013","EMP-014","EMP-001","EMP-002","EMP-003","EMP-004","EMP-005","EMP-006","EMP-007"],
  },
  {
    id: "TR-006",
    title: "การบำรุงรักษาเครื่องจักรเชิงป้องกัน (PM)",
    category: "ทักษะวิชาชีพ", status: "cancelled",
    date: "10 มิ.ย. 2568", hours: 8,
    instructor: "ผู้เชี่ยวชาญจาก Siemens Thailand",
    location: "ห้องฝึกอบรมวิศวกรรม",
    company: "บริษัท UGI แมนูแฟคเจอริ่ง จำกัด", department: "ฝ่ายวิศวกรรม",
    participants: [],
    note: "ยกเลิกเนื่องจากวิทยากรติดภารกิจ จะจัดใหม่เดือน ก.ค.",
  },
  {
    id: "TR-007",
    title: "เทคนิคการนำเสนองานอย่างมืออาชีพ",
    category: "ทักษะทั่วไป", status: "completed",
    date: "18 พ.ค. 2568", hours: 6,
    instructor: "อ.ณัฐพร สุขสม",
    location: "ห้อง Training Center ชั้น 4",
    company: "บริษัท UGI จำกัด (มหาชน)", department: "ฝ่าย HR",
    participants: ["EMP-008","EMP-009","EMP-010","EMP-001","EMP-005","EMP-012"],
  },
  {
    id: "TR-008",
    title: "การวางแผนกลยุทธ์องค์กร ประจำปี 2568",
    category: "การจัดการ", status: "in_progress",
    date: "22 มิ.ย. 2568", endDate: "23 มิ.ย. 2568", hours: 14,
    instructor: "ที่ปรึกษาจาก McKinsey Thailand",
    location: "โรงแรม Anantara Bangkok",
    company: "บริษัท UGI จำกัด (มหาชน)",
    participants: ["EMP-001","EMP-005","EMP-008","EMP-010","EMP-013","EMP-002"],
    note: "สัมมนาผู้บริหารระดับสูง",
  },
];
