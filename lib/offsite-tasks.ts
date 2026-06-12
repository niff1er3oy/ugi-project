// ── Types ──────────────────────────────────────────────────────
export type WorkType = "ซ่อมบำรุง" | "ติดตั้ง" | "ตรวจสอบ" | "อื่นๆ";
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
  pending:     { label: "รอดำเนินการ",    bg: "bg-accent-pale",   text: "text-accent-text",  dot: "oklch(0.72 0.14 75)"  },
  in_progress: { label: "กำลังดำเนินการ", bg: "bg-primary-ghost", text: "text-primary-text", dot: "oklch(0.44 0.27 292)" },
  completed:   { label: "เสร็จแล้ว",      bg: "bg-success-pale",  text: "text-success-text", dot: "oklch(0.52 0.16 145)" },
  cancelled:   { label: "ถูกยกเลิก",      bg: "bg-error-pale",    text: "text-error",        dot: "oklch(0.50 0.17 25)"  },
};

export const TYPE_CONFIG: Record<WorkType, { color: string; lightBg: string; iconPath: string }> = {
  "ซ่อมบำรุง": {
    color: "oklch(0.62 0.14 75)",
    lightBg: "oklch(0.95 0.04 75)",
    iconPath: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
  },
  "ติดตั้ง": {
    color: "oklch(0.44 0.27 292)",
    lightBg: "oklch(0.94 0.055 292)",
    iconPath: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  },
  "ตรวจสอบ": {
    color: "oklch(0.42 0.14 195)",
    lightBg: "oklch(0.93 0.04 195)",
    iconPath: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6",
  },
  "อื่นๆ": {
    color: "oklch(0.50 0.05 292)",
    lightBg: "oklch(0.96 0.01 292)",
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

// ── Mock data ──────────────────────────────────────────────────
export const ALL_TASKS: OffsiteTask[] = [
  {
    id: "WO-001", title: "ซ่อมท่อน้ำรั่วบริเวณอาคาร A ชั้น 3",
    type: "ซ่อมบำรุง", status: "completed",
    startDate: "12 มิ.ย. 2568", startTime: "09:00",
    endDate: "12 มิ.ย. 2568", endTime: "11:30",
    department: "ฝ่ายผลิต", location: "อาคาร A ชั้น 3",
    note: "ท่อน้ำแตกในห้องน้ำชาย ซ่อมเสร็จก่อนกำหนด เปลี่ยนข้อต่อและหัวจ่ายน้ำใหม่ ทดสอบแรงดันน้ำเรียบร้อย",
  },
  {
    id: "WO-002", title: "ติดตั้งระบบกล้องวงจรปิดคลังสินค้า B",
    type: "ติดตั้ง", status: "in_progress",
    startDate: "11 มิ.ย. 2568", startTime: "13:00",
    department: "ฝ่ายวิศวกรรม", location: "คลังสินค้า B",
    note: "ติดตั้งแล้ว 6 จาก 12 จุด คาดเสร็จวันที่ 14 มิ.ย. รอสายสัญญาณเพิ่มเติม",
  },
  {
    id: "WO-003", title: "ตรวจสอบระบบไฟฟ้าประจำเดือนมิถุนายน",
    type: "ตรวจสอบ", status: "completed",
    startDate: "10 มิ.ย. 2568", startTime: "08:00",
    endDate: "10 มิ.ย. 2568", endTime: "12:00",
    department: "ฝ่ายความปลอดภัย", location: "โรงงานหลัก",
    note: "ผ่านมาตรฐานทุกจุด ไม่พบความผิดปกติ ตรวจสอบครบ 48 จุดในโรงงานหลักและอาคารสนับสนุน",
  },
  {
    id: "WO-004", title: "ซ่อมแซมหลังคารั่วอาคาร C",
    type: "ซ่อมบำรุง", status: "pending",
    startDate: "14 มิ.ย. 2568", startTime: "07:30",
    department: "ฝ่ายผลิต", location: "อาคาร C หลังคาชั้น 5",
    note: "รอช่างผู้รับเหมาภายนอกมาประเมินงาน คาดการณ์ใช้เวลา 2-3 วัน",
  },
  {
    id: "WO-005", title: "ติดตั้งระบบปรับอากาศห้องประชุมใหญ่",
    type: "ติดตั้ง", status: "in_progress",
    startDate: "9 มิ.ย. 2568", startTime: "08:30",
    department: "ฝ่ายวิศวกรรม", location: "ห้องประชุมใหญ่ อาคาร B",
    note: "วางท่อลม 80% เหลือเชื่อมต่อไฟฟ้าและทดสอบระบบ คาดเสร็จสิ้นงวดนี้ภายใน 2 วัน",
  },
  {
    id: "WO-006", title: "ตรวจสอบระบบดับเพลิงอาคาร D",
    type: "ตรวจสอบ", status: "cancelled",
    startDate: "8 มิ.ย. 2568", startTime: "10:00",
    endDate: "8 มิ.ย. 2568", endTime: "10:30",
    department: "ฝ่ายความปลอดภัย", location: "อาคาร D ทุกชั้น",
    note: "ยกเลิกเนื่องจากอาคารปิดปรับปรุง เลื่อนไปเดือน ก.ค.",
  },
  {
    id: "WO-007", title: "ซ่อมลิฟต์โดยสารอาคาร A",
    type: "ซ่อมบำรุง", status: "pending",
    startDate: "15 มิ.ย. 2568", startTime: "09:00",
    department: "ฝ่ายวิศวกรรม", location: "อาคาร A ลิฟต์หมายเลข 2",
    note: "รอชิ้นส่วนอะไหล่จากต่างประเทศ คาดได้รับภายใน 3-5 วันทำการ",
  },
  {
    id: "WO-008", title: "ทาสีรั้วและพื้นที่ลานจอดรถ",
    type: "อื่นๆ", status: "in_progress",
    startDate: "7 มิ.ย. 2568", startTime: "06:00",
    department: "ฝ่ายผลิต", location: "ลานจอดรถอาคาร A-B",
    note: "ทาเสร็จแล้ว 2 โซน เหลืออีก 1 โซน คาดเสร็จสิ้นวันที่ 13 มิ.ย.",
  },
  {
    id: "WO-009", title: "ตรวจสอบท่อระบายน้ำลานด้านหลัง",
    type: "ตรวจสอบ", status: "completed",
    startDate: "5 มิ.ย. 2568", startTime: "13:30",
    endDate: "5 มิ.ย. 2568", endTime: "16:00",
    department: "ฝ่ายความปลอดภัย", location: "ลานด้านหลังโรงงาน",
    note: "พบตะกอนอุดตัน 2 จุด แนะนำล้างทำความสะอาดทุก 3 เดือน เก็บตัวอย่างตะกอนส่งวิเคราะห์แล้ว",
  },
  {
    id: "WO-010", title: "ซ่อมประตูโรลลิ่งโกดังคลังสินค้า A",
    type: "ซ่อมบำรุง", status: "completed",
    startDate: "3 มิ.ย. 2568", startTime: "11:00",
    endDate: "3 มิ.ย. 2568", endTime: "14:00",
    department: "ฝ่ายวิศวกรรม", location: "คลังสินค้า A ประตูหมายเลข 3",
    note: "เปลี่ยนสปริงและระบบล็อค ทดสอบเรียบร้อย พร้อมใช้งาน",
  },
];
