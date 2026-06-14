<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# UGI — ระบบบริหารงานพนักงาน

ระบบ HR และ compliance สำหรับองค์กรไทย ใช้ภายในองค์กรเดียว (single-office deployment)

## Tech Stack

- **Next.js** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — OKLCH color tokens, ไม่มี arbitrary values
- **Firebase** — Auth (email/password + Google) และ Firestore
- **Font:** Sarabun (Google Fonts, รองรับภาษาไทย)

## ผู้ใช้งาน (User Roles)

### 1. เจ้าหน้าที่ (officer)
- Login: `/login` → setup: `/setup-profile` (ต้องใส่รหัส Office ที่ตรงกับ `NEXT_PUBLIC_OFFICE_ID`)
- เข้าถึงหน้าหลัก `/(main)/*` ผ่าน `AuthGuard` (ตรวจสอบ `role === "officer"`)
- **เจ้าหน้าที่ทุกคนใช้ข้อมูลร่วมกัน** — ทุกคนอ่าน/เขียน Firestore collection เดียวกันภายใต้ `OFFICE_ID` เดียว
- Firestore document: `users/{uid}` มี `role`, `firstName`, `lastName`, `position`, `email`, `photoURL`

### 2. พนักงาน (employee)
- Login: `/employee/login` → setup: `/employee/setup-profile`
- เข้าถึงหน้า `/me` — ดูข้อมูลของตัวเองเท่านั้น
- Firestore document: `users/{uid}` มี `role: "employee"`, `employeeId` (อ้างอิง employee record)

## โครงสร้าง Firestore

```
office/{OFFICE_ID}/
  employees/{id}          — ข้อมูลพนักงาน
    history/{id}          — ประวัติสถานะพนักงาน
  companies/{id}          — ข้อมูลบริษัท/นายจ้าง
  training/{id}           — บันทึกการอบรม
  offsite/{id}            — งานปฏิบัติการนอกสถานที่

users/{uid}               — โปรไฟล์ผู้ใช้ (officer หรือ employee)
```

db refs อยู่ใน `lib/db.ts` ทั้งหมด — ใช้จากที่นั่น อย่า hardcode path

## โมดูลหลัก

| Module | Path | รายละเอียด |
|--------|------|------------|
| ข้อมูลพนักงาน | `/employees` | CRUD พนักงาน, ประวัติสถานะ, ประวัติการอบรม |
| บริษัท | `/company` | ข้อมูลบริษัทนายจ้าง, ทีม |
| ประวัติการอบรม | `/training` | บันทึก training session, จัดการผู้เข้าร่วม |
| การปฏิบัติงานนอกสถานที่ | `/offsite` | งาน offsite, รูปภาพหน้างาน |
| รายงาน | `/reports` | สรุปข้อมูล |

## Data Types หลัก

**Employee** (`lib/employees.ts`)
- `status`: `"active"` | `"leave"` | `"resigned"`
- `department`: หนึ่งใน `DEPARTMENTS` — ฝ่ายผลิต, ฝ่ายวิศวกรรม, ฝ่าย HR, ฝ่ายบัญชี, ฝ่ายความปลอดภัย

**TrainingRecord** (`lib/training.ts`)
- `participants: string[]` — array ของ employee ID
- `category`: ความปลอดภัย | ทักษะวิชาชีพ | ทักษะทั่วไป | การจัดการ | อื่นๆ
- `status`: `"completed"` | `"in_progress"` | `"cancelled"`

**OffsiteTask** (`lib/offsite-tasks.ts`)
- `type`: ซ่อมบำรุง | ติดตั้ง | ตรวจสอบ | อื่นๆ
- `status`: `"pending"` | `"in_progress"` | `"completed"` | `"cancelled"`
- `workPhotos: string[]` — URLs รูปภาพหน้างาน (สูงสุด 5 รูป)
- `department` — ทีมที่รับผิดชอบ (string, ไม่ใช่ employee IDs)

## Design System

- **Primary:** `oklch(0.44 0.20 292)` — Studio Violet
- **Accent:** `oklch(0.72 0.14 75)` — Warm Amber
- **Font:** Sarabun เดี่ยว, Thai-first (ห้ามใช้ negative letter-spacing, body text ไม่น้อยกว่า 13px)
- **Radius:** controls 6px, panels 12px
- **Elevation:** flat โดย default, shadow เฉพาะ hover/interaction
- Design tokens และ snippets อยู่ใน `DESIGN.md` และ `.impeccable/design.json`

## หมายเหตุสำคัญ

- UI เป็น **ภาษาไทยทั้งหมด** — label, placeholder, error message ทุกอย่าง
- Responsive: sidebar บน desktop, bottom nav บน mobile
- `NEXT_PUBLIC_OFFICE_ID` — env var ที่ fix ไว้ ไม่ต้องจัดการ multi-tenancy
- File upload ผ่าน `lib/upload.ts` → Firebase Storage
