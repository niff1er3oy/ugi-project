<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — คู่มือสำหรับ AI Agent และนักพัฒนา

ไฟล์นี้คืออ้างอิงหลักสำหรับการพัฒนาต่อ อ่านให้ครบก่อนเขียนโค้ดใด ๆ

---

## สารบัญ

1. [สิ่งที่ต้องรู้ก่อนเริ่ม](#1-สิ่งที่ต้องรู้ก่อนเริ่ม)
2. [โครงสร้างไฟล์และหน้าที่ของแต่ละส่วน](#2-โครงสร้างไฟล์และหน้าที่ของแต่ละส่วน)
3. [Authentication และ Authorization](#3-authentication-และ-authorization)
4. [Firestore — กฎเหล็ก](#4-firestore--กฎเหล็ก)
5. [Data Types ที่มีอยู่](#5-data-types-ที่มีอยู่)
6. [Design System — กฎที่ห้ามละเมิด](#6-design-system--กฎที่ห้ามละเมิด)
7. [Pattern การเขียนโค้ด](#7-pattern-การเขียนโค้ด)
8. [การอัปโหลดรูปภาพ](#8-การอัปโหลดรูปภาพ)
9. [วิธีเพิ่มโมดูลใหม่](#9-วิธีเพิ่มโมดูลใหม่)
10. [สิ่งที่ห้ามทำเด็ดขาด](#10-สิ่งที่ห้ามทำเด็ดขาด)

---

## 1. สิ่งที่ต้องรู้ก่อนเริ่ม

### โปรเจคนี้คืออะไร

ระบบ HR และ compliance สำหรับองค์กรไทย — single-office deployment ไม่ต้องรองรับ multi-tenancy ทุกข้อมูลอยู่ใต้ `office/{NEXT_PUBLIC_OFFICE_ID}` เดียว

### Tech Stack

- **Next.js 16** (App Router) — อ่าน docs ที่ `node_modules/next/dist/docs/` ก่อนเขียน routing หรือ data fetching ใด ๆ
- **React 19** + **TypeScript**
- **Tailwind CSS v4** — ไม่ใช้ arbitrary values (`[...]`), ใช้ OKLCH design tokens เท่านั้น
- **Firebase** — Auth + Firestore (Client SDK บน browser, Admin SDK บน server)
- **Cloudinary** — เก็บรูปภาพทุกประเภท (ไม่ใช้ Firebase Storage)
- **Sarabun** — ฟอนต์เดียวในระบบ, ห้ามเพิ่มฟอนต์อื่น

### ภาษา UI

**ทุกอย่างบน UI ต้องเป็นภาษาไทย** — label, placeholder, error message, button text, tooltip, empty state ทุกอย่าง ไม่มีข้อยกเว้น

---

## 2. โครงสร้างไฟล์และหน้าที่ของแต่ละส่วน

```
app/
├── (main)/                  # Protected route group — officer เท่านั้น
│   ├── layout.tsx           # ห่อด้วย UserProvider → AuthGuard → NotificationProvider
│   └── {module}/            # แต่ละโมดูล: page.tsx, new/page.tsx, [id]/page.tsx, [id]/edit/page.tsx
├── login/                   # Public auth routes (officer)
├── register/
├── setup-profile/
├── employee/                # Public auth routes (employee)
│   ├── login/
│   ├── register/
│   └── setup-profile/
├── me/                      # Protected — employee self-view
└── api/
    └── upload/route.ts      # POST endpoint → Cloudinary (server-side signed upload)

components/
├── auth-guard.tsx           # ตรวจ role → redirect ถ้าไม่ใช่ officer
├── navbar.tsx               # Top navbar
├── sidebar.tsx              # Desktop sidebar navigation
├── bottom-nav.tsx           # Mobile bottom navigation
└── notification-provider.tsx # Toast context

lib/
├── firebase/
│   ├── client.ts            # auth, db (Firestore), storage — ใช้บน client เท่านั้น
│   └── admin.ts             # adminDb — ใช้บน server (API routes) เท่านั้น
├── db.ts                    # Firestore refs ทั้งหมด — อ้างอิงจากที่นี่เสมอ
├── employees.ts             # Employee type + CRUD + STATUS_CONFIG + DEPT_CONFIG
├── companies.ts             # Company type + CRUD
├── training.ts              # TrainingRecord type + CATEGORY_CONFIG + STATUS_CONFIG
├── offsite-tasks.ts         # OffsiteTask type + TYPE_CONFIG + STATUS_CONFIG
├── notifications.ts         # AppNotification type + helpers
├── upload.ts                # uploadFile() — เรียก /api/upload
├── user-context.tsx         # UserProvider + useUser() hook
└── modules.tsx              # Navigation module config (5 โมดูล)
```

---

## 3. Authentication และ Authorization

### ขั้นตอน Auth Flow

```
Officer:
  /login → (Firebase Auth) → /setup-profile (ถ้าไม่มี users/{uid}) → /(main)/*

Employee:
  /employee/login → (Firebase Auth) → /employee/setup-profile → /me
```

### AuthGuard Logic

`components/auth-guard.tsx` ตรวจสามเงื่อนไข:
1. `!user` → redirect `/login`
2. `!profile` → redirect `/setup-profile` (สมัครแล้วแต่ยังไม่กรอกโปรไฟล์)
3. `profile.role !== "officer"` → redirect `/me`

ทุกหน้าใน `app/(main)/` ได้รับการป้องกันโดยอัตโนมัติจาก `layout.tsx`

### useUser() Hook

```typescript
const { user, profile, loading } = useUser();
// user    — Firebase User object (null ถ้า logout)
// profile — { uid, role, employeeId? } จาก Firestore users/{uid}
// loading — true ระหว่างตรวจสอบ auth state
```

ใช้ hook นี้เพื่อดึงข้อมูล user ใน client component เสมอ อย่า query `users/{uid}` โดยตรงในที่อื่น

### UserProfile Type

```typescript
type UserProfile = {
  uid: string;
  role: "officer" | "employee";
  employeeId?: string; // มีเฉพาะ employee — ชี้ไปที่ employees/{id}
};
```

---

## 4. Firestore — กฎเหล็ก

### กฎข้อที่ 1: ใช้ refs จาก `lib/db.ts` เท่านั้น

```typescript
// ✅ ถูกต้อง
import { employeesRef, employeeRef } from "@/lib/db";
const snap = await getDocs(employeesRef());

// ❌ ผิด — ห้าม hardcode path
collection(db, "office", "my-office", "employees");
```

### Refs ที่มีอยู่

```typescript
officeRef()                    // doc: office/{OFFICE_ID}
employeesRef()                 // collection: .../employees
employeeRef(id)                // doc: .../employees/{id}
historyRef(empId)              // collection: .../employees/{id}/history
companiesRef()                 // collection: .../companies
companyRef(id)                 // doc: .../companies/{id}
trainingRef()                  // collection: .../training
trainingDocRef(id)             // doc: .../training/{id}
offsiteRef()                   // collection: .../offsite
offsiteDocRef(id)              // doc: .../offsite/{id}
notificationsRef()             // collection: .../notifications
notificationDocRef(id)         // doc: .../notifications/{id}
userRef(uid)                   // doc: users/{uid}
```

### กฎข้อที่ 2: Client SDK บน Client, Admin SDK บน Server

```typescript
// client component / lib/ → ใช้ firebase/client
import { db } from "@/lib/firebase/client";

// API route (app/api/*) → ใช้ firebase/admin
import { adminDb } from "@/lib/firebase/admin";
```

### Security Rules สรุป

| ผู้ใช้ | `users/{uid}` | `office/{id}/*` |
|--------|--------------|-----------------|
| officer | read/write ตัวเอง | read + write |
| employee | read/write ตัวเอง | read only |
| ไม่ login | ไม่ได้ | ไม่ได้ |

---

## 5. Data Types ที่มีอยู่

### Employee (`lib/employees.ts`)

```typescript
type EmpStatus = "active" | "leave" | "resigned";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  status: EmpStatus;
  department: string;        // ต้องเป็นหนึ่งใน DEPARTMENTS
  company: string;
  position: string;
  phone: string;
  email: string;
  startDate: string;         // ISO date string: "YYYY-MM-DD"
  photoURL?: string;         // Cloudinary URL
};

type HistoryEntry = {
  date: string;              // ISO date string
  status: EmpStatus;
  note?: string;
};
```

Constants สำคัญ:
- `DEPARTMENTS` — `["ฝ่ายผลิต", "ฝ่ายวิศวกรรม", "ฝ่าย HR", "ฝ่ายบัญชี", "ฝ่ายความปลอดภัย"]`
- `STATUS_CONFIG[status]` → `{ label, dot, bg, text }` ใช้แสดง badge
- `DEPT_CONFIG[dept]` → `{ color, bg }` ใช้แสดง chip

### TrainingRecord (`lib/training.ts`)

```typescript
type TrainingCategory = "ความปลอดภัย" | "ทักษะวิชาชีพ" | "ทักษะทั่วไป" | "การจัดการ" | "อื่นๆ";
type TrainingStatus   = "completed" | "in_progress" | "cancelled";

type TrainingRecord = {
  id: string;
  title: string;
  category: TrainingCategory;
  status: TrainingStatus;
  date: string;
  participants: string[];    // array ของ employee ID (ไม่ใช่ชื่อ)
  hours?: number;
  note?: string;
};
```

### OffsiteTask (`lib/offsite-tasks.ts`)

```typescript
type WorkType   = "ซ่อมบำรุง" | "ติดตั้ง" | "ตรวจสอบ" | "อื่นๆ";
type WorkStatus = "pending" | "in_progress" | "completed" | "cancelled";

type OffsiteTask = {
  id: string;
  title: string;
  type: WorkType;
  status: WorkStatus;
  department: string;        // ทีมที่รับผิดชอบ (string — ไม่ใช่ employee IDs)
  location: string;
  date: string;
  workPhotos: string[];      // Cloudinary URLs, สูงสุด 5 รูป
  note?: string;
};
```

### AppNotification (`lib/notifications.ts`)

```typescript
type NotifType     = "info" | "success" | "warning" | "error";
type NotifCategory = "employee" | "training" | "offsite" | "system";

type AppNotification = {
  id: string;
  type: NotifType;
  category: NotifCategory;
  title: string;
  message: string;
  createdAt: string;         // ISO datetime string
  read: boolean;
  link?: string;             // path ที่จะ navigate เมื่อกด
};
```

---

## 6. Design System — กฎที่ห้ามละเมิด

อ่าน `DESIGN.md` สำหรับรายละเอียดเต็ม ส่วนนี้คือกฎที่ต้องจำ

### สี — OKLCH Tokens

```css
--primary:       oklch(0.44 0.27 292)   /* Studio Violet — ปุ่มหลัก, active state */
--primary-deep:  oklch(0.33 0.23 292)   /* hover state ของ primary */
--primary-ghost: oklch(0.94 0.055 292)  /* ghost button hover bg */
--accent:        oklch(0.72 0.14 75)    /* Warm Amber — warning, status badge เท่านั้น */
--surface:       oklch(0.971 0.009 292) /* card/panel background */
--ink:           oklch(0.17 0.012 292)  /* body text */
--muted:         oklch(0.44 0.010 292)  /* secondary text, placeholder */
--border:        oklch(0.87 0.009 292)  /* default border */
--border-strong: oklch(0.63 0.016 292)  /* focus, hover border */
--error:         oklch(0.50 0.17 25)    /* error state */
```

**กฎสี:**
- Primary violet ใช้ได้อิสระสำหรับ interactive elements
- Accent amber ใช้เฉพาะ semantic signal (warning, status) ห้ามใช้ตกแต่ง
- ห้ามใช้สีที่ไม่อยู่ในรายการข้างต้น
- Text บน filled violet หรือ amber ต้องเป็น white เสมอ

### Typography — Sarabun เดี่ยว

| Role | Size | Weight | ใช้ที่ |
|------|------|--------|--------|
| Heading | 24px | 600 | ชื่อหน้า (ใช้ครั้งเดียวต่อ view) |
| Title | 15px | 600 | card heading, section label |
| Body | 14px | 400 | เนื้อหา, ตาราง |
| Label | 12px | 500 | form label, table header, badge |
| Data | 13px | 400 | ID, วันที่, reference number |

**กฎ typography:**
- ห้าม body text ต่ำกว่า 13px สำหรับภาษาไทย
- ห้าม negative letter-spacing บนภาษาไทย
- ห้ามใช้ฟอนต์อื่นนอกจาก Sarabun

### Component Rules

```
Radius:   controls = 6px,  panels/cards = 12px
Padding:  controls = 8px 12px,  cards = 20px
Shadow:   flat ตอน rest, shadow เฉพาะ hover/modal
Border:   1px --border ตอน rest → --border-strong ตอน hover/focus
```

**Buttons:**
- Primary: `bg-primary text-white` hover → `bg-primary-deep`
- Ghost: `border border-border-strong text-primary` hover → `bg-primary-ghost`
- Destructive: `bg-error text-white` — ใช้เฉพาะ confirm delete

**อย่าเพิ่ม shadow ลง card ที่ rest** — shadow ปรากฏเฉพาะ hover state

---

## 7. Pattern การเขียนโค้ด

### CRUD Pattern สำหรับหน้า list

```typescript
// app/(main)/{module}/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchXxx } from "@/lib/xxx";

export default function XxxPage() {
  const [items, setItems] = useState<Xxx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchXxx().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  // ...
}
```

### CRUD Pattern สำหรับหน้า detail

```typescript
// app/(main)/{module}/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function XxxDetailPage() {
  const { id } = useParams<{ id: string }>();
  // fetch by id...
}
```

### Form Submit Pattern

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    await createXxx(formData);
    router.push("/xxx");
    notify({ type: "success", title: "สำเร็จ", message: "บันทึกข้อมูลเรียบร้อย" });
  } catch {
    notify({ type: "error", title: "เกิดข้อผิดพลาด", message: "ไม่สามารถบันทึกข้อมูลได้" });
  } finally {
    setSubmitting(false);
  }
};
```

### การเพิ่ม CRUD function ใหม่ใน lib/

```typescript
// lib/xxx.ts
import { getDocs, addDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { xxxRef, xxxDocRef } from "@/lib/db";

export async function fetchXxxList(): Promise<Xxx[]> {
  const snap = await getDocs(xxxRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Xxx));
}

export async function fetchXxx(id: string): Promise<Xxx | null> {
  const snap = await getDoc(xxxDocRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Xxx;
}

export async function createXxx(data: Omit<Xxx, "id">): Promise<string> {
  const ref = await addDoc(xxxRef(), data);
  return ref.id;
}

export async function updateXxx(id: string, data: Partial<Omit<Xxx, "id">>): Promise<void> {
  await updateDoc(xxxDocRef(id), data);
}

export async function deleteXxx(id: string): Promise<void> {
  await deleteDoc(xxxDocRef(id));
}
```

### Loading / Error States

ทุก async component ต้องมี state ครบ:
- `loading = true` → แสดง skeleton หรือ spinner
- `error` → แสดง error message ภาษาไทย
- `empty` → แสดง empty state ภาษาไทย (อย่าแสดงหน้าว่าง)

---

## 8. การอัปโหลดรูปภาพ

### ใช้ `lib/upload.ts` เสมอ

```typescript
import { uploadFile } from "@/lib/upload";

// path คือ Cloudinary public_id — ควรมีโฟลเดอร์นำหน้า
const url = await uploadFile(file, `employees/${employeeId}/avatar`);
const url = await uploadFile(file, `offsite/${taskId}/photo-${Date.now()}`);
```

### ข้อกำหนด

- `workPhotos` ใน OffsiteTask: สูงสุด **5 รูป** — ตรวจสอบก่อน upload
- Upload ผ่าน `POST /api/upload` เท่านั้น (signed upload บน server)
- URL ที่ได้คือ Cloudinary `secure_url` — เก็บตรง ๆ ใน Firestore
- ห้าม upload รูปโดยตรงจาก client ไปยัง Cloudinary โดยไม่ผ่าน API route

### API Route (`app/api/upload/route.ts`)

รับ `FormData` ที่มี `file` (File) และ `path` (string) คืน `{ url: string }` หรือ `{ error: string }`

---

## 9. วิธีเพิ่มโมดูลใหม่

สมมติเพิ่มโมดูล `documents` (เอกสาร):

### ขั้นตอนที่ 1 — เพิ่ม Data Type และ Refs

```typescript
// lib/documents.ts
export type Document = {
  id: string;
  title: string;
  // ...
};

export async function fetchDocuments(): Promise<Document[]> { ... }
// เพิ่ม CRUD functions
```

```typescript
// lib/db.ts — เพิ่ม refs
export const documentsRef    = () => collection(db, "office", OFFICE_ID, "documents");
export const documentDocRef  = (id: string) => doc(db, "office", OFFICE_ID, "documents", id);
```

### ขั้นตอนที่ 2 — สร้างหน้า

```
app/(main)/documents/
├── page.tsx          # list
├── new/
│   └── page.tsx      # create form
└── [id]/
    ├── page.tsx      # detail view
    └── edit/
        └── page.tsx  # edit form
```

### ขั้นตอนที่ 3 — เพิ่มใน Navigation

```typescript
// lib/modules.tsx
export const modules: Module[] = [
  // ... existing modules
  {
    href: "/documents",
    label: "เอกสาร",
    description: "จัดการเอกสารสำคัญ",
    icon: <svg>...</svg>,
  },
];
```

Bottom nav (`components/bottom-nav.tsx`) และ Sidebar (`components/sidebar.tsx`) ดึง modules จาก `lib/modules.tsx` อัตโนมัติ

### ขั้นตอนที่ 4 — อัปเดต Firestore Rules (ถ้าจำเป็น)

ถ้า collection ใหม่ต้องการ rule พิเศษ แก้ `firestore.rules` แล้ว deploy:
```bash
firebase deploy --only firestore:rules
```

---

## 10. สิ่งที่ห้ามทำเด็ดขาด

### Firestore

```typescript
// ❌ ห้าม hardcode path
collection(db, "office", "some-id", "employees")
doc(db, "office", process.env.NEXT_PUBLIC_OFFICE_ID!, "employees", id)

// ✅ ใช้ refs จาก lib/db.ts
import { employeesRef, employeeRef } from "@/lib/db";
```

```typescript
// ❌ ห้ามใช้ Admin SDK บน client component
import { adminDb } from "@/lib/firebase/admin";  // ใน app/(main)/*.tsx

// ✅ Admin SDK ใช้ได้เฉพาะใน app/api/*
```

### Tailwind CSS

```tsx
// ❌ ห้าม arbitrary values
<div className="bg-[#6d28d9] p-[13px] rounded-[7px]">

// ✅ ใช้ token ที่กำหนดไว้
<div className="bg-primary p-3 rounded-md">
```

### UI Text

```tsx
// ❌ ห้าม English บน UI
<button>Save</button>
<p>No data found</p>
<label>First Name</label>

// ✅ ภาษาไทยทั้งหมด
<button>บันทึก</button>
<p>ไม่พบข้อมูล</p>
<label>ชื่อ</label>
```

### Typography

```tsx
// ❌ ห้าม negative letter-spacing บนภาษาไทย
<p className="-tracking-wide">ชื่อพนักงาน</p>

// ❌ ห้าม font size ต่ำกว่า 13px สำหรับ body Thai
<p className="text-[11px]">รายละเอียด</p>

// ❌ ห้ามเพิ่มฟอนต์อื่น
import { Inter } from "next/font/google";
```

### สี

```tsx
// ❌ ห้ามใช้ accent amber ตกแต่ง
<div className="bg-accent text-white">ส่วนหัว</div>

// ✅ amber ใช้เฉพาะ semantic signal
<span className="bg-accent-pale text-accent-text">คำเตือน</span>
```

### Upload

```typescript
// ❌ ห้าม upload ตรงจาก client ไป Cloudinary
const result = await cloudinary.uploader.upload(...);  // ใน client component

// ✅ ผ่าน lib/upload.ts เสมอ
import { uploadFile } from "@/lib/upload";
const url = await uploadFile(file, "path/to/file");
```

### รูปภาพ offsite

```typescript
// ❌ ห้าม upload เกิน 5 รูป
if (workPhotos.length >= 5) {
  // ต้องตรวจก่อน upload
}
```

### Next.js

```typescript
// ❌ ห้ามใช้ Pages Router convention
// pages/employees.tsx — ไม่มีในโปรเจคนี้

// ✅ App Router เท่านั้น
// app/(main)/employees/page.tsx
```

```typescript
// ❌ ห้ามใช้ getServerSideProps / getStaticProps
export async function getServerSideProps() { ... }

// ✅ ใช้ Server Component หรือ client-side fetch ตาม use case
```

---

## Quick Reference

| ต้องการทำ | ไฟล์ที่แก้ |
|-----------|-----------|
| เพิ่ม collection ใหม่ | `lib/db.ts` + `lib/{module}.ts` |
| เพิ่มโมดูลในเมนู | `lib/modules.tsx` |
| แก้สีหรือ token | `DESIGN.md` + CSS variables |
| เพิ่ม API endpoint | `app/api/{name}/route.ts` |
| ตรวจ user role | `useUser()` จาก `lib/user-context.tsx` |
| อัปโหลดรูป | `uploadFile()` จาก `lib/upload.ts` |
| แก้ Firestore rules | `firestore.rules` → `firebase deploy --only firestore:rules` |
