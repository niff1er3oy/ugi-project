# UGI — ระบบบริหารงานพนักงาน

ระบบ HR และ compliance สำหรับองค์กรไทย รองรับการจัดการข้อมูลพนักงาน การอบรม งานปฏิบัติการนอกสถานที่ และรายงานสรุปข้อมูล ออกแบบมาสำหรับการใช้งานภายในองค์กรเดียว (single-office deployment)

---

## สารบัญ

- [ภาพรวม](#ภาพรวม)
- [UI: Desktop และ Mobile](#ui-desktop-และ-mobile)
- [Tech Stack](#tech-stack)
- [ผู้ใช้งานและสิทธิ์](#ผู้ใช้งานและสิทธิ์)
- [โมดูลหลัก](#โมดูลหลัก)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [โครงสร้าง Firestore](#โครงสร้าง-firestore)
- [การติดตั้งและเริ่มต้นใช้งาน](#การติดตั้งและเริ่มต้นใช้งาน)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Cloudinary Setup](#cloudinary-setup)
- [คำสั่ง Scripts](#คำสั่ง-scripts)
- [Contributing](#contributing)
- [License](#license)

---

## ภาพรวม

UGI เป็น internal tool สำหรับ HR และทีมความปลอดภัย ช่วยจัดการข้อมูลพนักงาน ติดตามการอบรม บันทึกงานภาคสนาม และดูรายงานสรุปในที่เดียว ระบบรองรับสองบทบาท — **เจ้าหน้าที่ (officer)** ที่มีสิทธิ์จัดการข้อมูลทั้งหมด และ **พนักงาน (employee)** ที่ดูข้อมูลของตัวเองได้

ทุกคนในทีมเจ้าหน้าที่ใช้ข้อมูลร่วมกันภายใต้ Office ID เดียว ไม่ต้องจัดการ multi-tenancy

---

## UI: Desktop และ Mobile

ระบบรองรับการใช้งานทั้ง **Desktop** และ **Mobile** โดย layout จะเปลี่ยนอัตโนมัติตามขนาดหน้าจอ:

| | Desktop | Mobile |
|---|---|---|
| **Navigation** | Sidebar ซ้ายมือ แสดงเมนูโมดูลทั้งหมด | Bottom Navigation Bar ด้านล่างจอ |
| **Header** | Navbar บนสุด แสดงชื่อผู้ใช้และปุ่ม sign-out | Navbar บนสุด (compact) |
| **Layout** | Two-column (sidebar + content) | Single-column เต็มจอ |

> **หมายเหตุ:** ไม่ต้องเปลี่ยนโหมดด้วยตัวเอง — ระบบตรวจจับขนาดหน้าจอและปรับ layout ให้อัตโนมัติ

---

## Tech Stack

| เทคโนโลยี | เวอร์ชัน | บทบาท |
|-----------|---------|-------|
| [Next.js](https://nextjs.org/) | 16 (App Router) | React framework, routing, API routes |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Styling — ใช้ OKLCH color tokens |
| [Firebase Auth](https://firebase.google.com/docs/auth) | 12 | Authentication (email/password) |
| [Cloud Firestore](https://firebase.google.com/docs/firestore) | 12 | Database หลัก |
| [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) | 14 | Server-side Firestore operations |
| [Cloudinary](https://cloudinary.com/) | 2 | อัปโหลดและเก็บรูปภาพ |
| [Chart.js](https://www.chartjs.org/) | 4 | กราฟในหน้า Reports |
| [Sarabun](https://fonts.google.com/specimen/Sarabun) | — | ฟอนต์หลัก รองรับภาษาไทย |

---

## ผู้ใช้งานและสิทธิ์

### เจ้าหน้าที่ (officer)

- **Login:** `/login`
- **ลงทะเบียน:** `/register` → ต้องใส่ **รหัส Office** (`NEXT_PUBLIC_OFFICE_ID`) เพื่อยืนยันตัวตน
- **หลัง login:** `/setup-profile` (กรอกชื่อ-นามสกุล, ตำแหน่ง)
- **เข้าถึง:** ทุกโมดูล — จัดการข้อมูลพนักงาน, บริษัท, การอบรม, งานภาคสนาม, รายงาน
- **ข้อมูลร่วมกัน:** เจ้าหน้าที่ทุกคนอ่าน/เขียน Firestore collection เดียวกันภายใต้ Office ID เดียว

### พนักงาน (employee)

- **Login:** `/employee/login`
- **ลงทะเบียน:** `/employee/register`
- **หลัง login:** `/employee/setup-profile` → redirect ไปที่ `/me`
- **เข้าถึง:** ดูข้อมูลของตัวเองเท่านั้น (ประวัติ, การอบรม, สถานะ)

### Security Rules (Firestore)

- **officer** — อ่านและเขียนข้อมูลทั้งหมดใน `office/{OFFICE_ID}/*`
- **employee** — อ่านได้เท่านั้น, เขียนไม่ได้
- **user profile** — แต่ละคนเข้าถึงได้เฉพาะ `users/{uid}` ของตัวเอง

---

## โมดูลหลัก

### ข้อมูลพนักงาน `/employees`

จัดการข้อมูลพนักงานในองค์กรทั้งหมด

- เพิ่ม / แก้ไข / ลบข้อมูลพนักงาน
- บันทึกสถานะ: `ทำงาน` | `ลา` | `ลาออก`
- ดูประวัติการเปลี่ยนแปลงสถานะ (timeline)
- ดูประวัติการอบรมของพนักงานรายบุคคล
- แผนก: ฝ่ายผลิต, ฝ่ายวิศวกรรม, ฝ่าย HR, ฝ่ายบัญชี, ฝ่ายความปลอดภัย

### บริษัท `/company`

จัดการข้อมูลบริษัทนายจ้างและโครงสร้างทีม

- เพิ่ม / แก้ไข / ดูข้อมูลบริษัท
- จัดการทีมและแผนก

### ประวัติการอบรม `/training`

บันทึกและติดตาม training session

- สร้าง session การอบรม, เพิ่มผู้เข้าร่วมจากรายชื่อพนักงาน
- หมวดหมู่: ความปลอดภัย, ทักษะวิชาชีพ, ทักษะทั่วไป, การจัดการ, อื่นๆ
- สถานะ: กำลังดำเนินการ, เสร็จสิ้น, ยกเลิก

### การปฏิบัติงานนอกสถานที่ `/offsite`

บันทึกงานภาคสนามพร้อมรูปภาพหน้างาน

- สร้างและจัดการงาน offsite
- ประเภทงาน: ซ่อมบำรุง, ติดตั้ง, ตรวจสอบ, อื่นๆ
- สถานะ: รอดำเนินการ, กำลังดำเนินการ, เสร็จสิ้น, ยกเลิก
- อัปโหลดรูปภาพหน้างานได้สูงสุด 5 รูป (ผ่าน Cloudinary)

### รายงาน `/reports`

Dashboard สรุปข้อมูลองค์กร

- กราฟสรุปจำนวนพนักงานตามแผนกและสถานะ
- สรุปการอบรมและงานภาคสนาม

---

## โครงสร้างโปรเจค

```
ugi-project/
├── app/                        # Next.js App Router
│   ├── (main)/                 # Protected routes (officer เท่านั้น)
│   │   ├── layout.tsx          # Layout หลัก: sidebar + bottom nav + AuthGuard
│   │   ├── page.tsx            # Dashboard
│   │   ├── employees/          # โมดูลพนักงาน (list, new, [id], [id]/edit)
│   │   ├── company/            # โมดูลบริษัท
│   │   ├── training/           # โมดูลการอบรม
│   │   ├── offsite/            # โมดูลงานภาคสนาม
│   │   ├── reports/            # หน้ารายงาน
│   │   ├── notifications/      # การแจ้งเตือน
│   │   └── settings/           # ตั้งค่า
│   ├── login/                  # หน้า login เจ้าหน้าที่
│   ├── register/               # หน้าสมัครเจ้าหน้าที่
│   ├── setup-profile/          # ตั้งค่าโปรไฟล์เจ้าหน้าที่
│   ├── employee/               # Auth routes สำหรับพนักงาน
│   │   ├── login/
│   │   ├── register/
│   │   └── setup-profile/
│   ├── me/                     # หน้าพนักงานดูข้อมูลตัวเอง
│   └── api/
│       └── upload/route.ts     # API endpoint สำหรับ upload รูป → Cloudinary
│
├── components/                 # Reusable components
│   ├── auth-guard.tsx          # ป้องกัน route (ตรวจ role)
│   ├── navbar.tsx              # Navbar บนสุด
│   ├── sidebar.tsx             # Sidebar (desktop)
│   ├── bottom-nav.tsx          # Bottom navigation (mobile)
│   ├── employee-form.tsx       # ฟอร์มพนักงาน
│   ├── training-form.tsx       # ฟอร์มการอบรม
│   ├── offsite-task-form.tsx   # ฟอร์มงานภาคสนาม
│   ├── participant-manager.tsx # เลือกผู้เข้าร่วม training
│   └── notification-provider.tsx # Toast notifications
│
├── lib/                        # Utilities และ data layer
│   ├── firebase/
│   │   ├── client.ts           # Firebase Client SDK (auth, Firestore)
│   │   └── admin.ts            # Firebase Admin SDK (server-side)
│   ├── db.ts                   # Centralized Firestore refs — ใช้จากที่นี่เท่านั้น
│   ├── employees.ts            # Employee type + CRUD functions
│   ├── companies.ts            # Company type + CRUD functions
│   ├── training.ts             # Training type + config
│   ├── offsite-tasks.ts        # OffsiteTask type + config
│   ├── notifications.ts        # Notification type + helpers
│   ├── upload.ts               # File upload utility (→ Cloudinary)
│   ├── user-context.tsx        # React Context สำหรับ auth state
│   └── modules.tsx             # Navigation config (5 โมดูล)
│
├── public/                     # Static assets
├── firestore.rules             # Firestore security rules
├── firebase.json               # Firebase deploy config
├── DESIGN.md                   # Design system documentation
├── AGENTS.md                   # AI/development guidelines
└── .env.local                  # Environment variables (ไม่ commit)
```

---

## โครงสร้าง Firestore

```
office/{OFFICE_ID}/
│
├── employees/{id}              # ข้อมูลพนักงาน
│   └── history/{id}           # ประวัติการเปลี่ยนสถานะ
│
├── companies/{id}              # ข้อมูลบริษัทนายจ้าง
│
├── training/{id}               # บันทึก training session
│                                 (participants: string[] — array ของ employee ID)
│
├── offsite/{id}                # งานปฏิบัติการนอกสถานที่
│                                 (workPhotos: string[] — Cloudinary URLs, max 5)
│
└── notifications/{id}          # การแจ้งเตือนภายในระบบ

users/{uid}                     # โปรไฟล์ผู้ใช้แต่ละคน
                                  (role: "officer" | "employee", employeeId, firstName, ...)
```

> **สำคัญ:** DB references ทั้งหมดอยู่ใน `lib/db.ts` — อย่า hardcode Firestore path ในที่อื่น

---

## การติดตั้งและเริ่มต้นใช้งาน

### สิ่งที่ต้องมีก่อน

- **Node.js** 20 ขึ้นไป ([ดาวน์โหลด](https://nodejs.org/))
- **npm** 10 ขึ้นไป (มาพร้อม Node.js)
- **Firebase project** (ดู [Firebase Setup](#firebase-setup))
- **Cloudinary account** (ดู [Cloudinary Setup](#cloudinary-setup))

### ขั้นตอนการติดตั้ง

**1. Clone โปรเจค**

```bash
git clone https://github.com/your-username/ugi-project.git
cd ugi-project
```

**2. ติดตั้ง dependencies**

```bash
npm install
```

**3. สร้างไฟล์ environment variables**

คัดลอกตัวอย่างด้านล่างไปสร้างไฟล์ `.env.local` ที่ root ของโปรเจค แล้วใส่ค่าให้ครบ (ดูรายละเอียดแต่ละ key ได้ใน [Environment Variables](#environment-variables)):

```env
# Office
NEXT_PUBLIC_OFFICE_ID=

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

**4. Deploy Firestore Security Rules**

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

**5. รัน development server**

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### NEXT_PUBLIC_OFFICE_ID

รหัสประจำ office ขององค์กร ใช้เป็น key หลักใน Firestore (`office/{OFFICE_ID}/...`)

- กำหนดค่าได้เองเป็น string ใดก็ได้ เช่น `my-company-hq`
- เจ้าหน้าที่ที่สมัครใหม่ต้องกรอกรหัสนี้ให้ตรงจึงจะลงทะเบียนได้
- **อย่าเปลี่ยนหลังจากมีข้อมูลในระบบแล้ว** เพราะ Firestore path จะเปลี่ยนตามและข้อมูลเดิมจะหาไม่เจอ

```env
NEXT_PUBLIC_OFFICE_ID=your-office-id
```

---

### Firebase Client SDK

ค่าเหล่านี้ได้จาก Firebase Console → Project Settings → Your apps → Web app config

> prefix `NEXT_PUBLIC_` หมายความว่าค่านี้ถูกส่งไปยัง browser — ไม่ใช่ secret แต่ควรจำกัดด้วย Firebase Security Rules

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

### Firebase Admin SDK

ใช้ฝั่ง server-side เท่านั้น (API routes) ได้จาก Firebase Console → Project Settings → Service accounts → Generate new private key (ดาวน์โหลดเป็น JSON)

> **ข้อควรระวัง:** อย่า commit ค่าเหล่านี้เด็ดขาด — โดยเฉพาะ `FIREBASE_ADMIN_PRIVATE_KEY` ที่เป็น secret key จริง

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

> **หมายเหตุ:** `FIREBASE_ADMIN_PRIVATE_KEY` ต้องครอบด้วย `"..."` และ newline ต้องเป็น `\n` literal (ไม่ใช่ขึ้นบรรทัดใหม่จริง)

---

### Cloudinary

ใช้สำหรับอัปโหลดและเก็บรูปภาพหน้างาน (offsite photos) และรูปโปรไฟล์

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Firebase Setup

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **Add project** → ตั้งชื่อ → Create
3. ปิด Google Analytics ได้ถ้าไม่ต้องการ

### 2. เปิดใช้งาน Authentication

1. ไปที่ **Authentication** → **Sign-in method**
2. เปิด **Email/Password** → Save

### 3. สร้าง Firestore Database

1. ไปที่ **Firestore Database** → **Create database**
2. เลือก **Production mode** (จะใช้ rules จาก `firestore.rules`)
3. เลือก region ที่ใกล้ที่สุด (แนะนำ `asia-southeast1` สำหรับไทย)

### 4. เปิดใช้งาน Storage (สำหรับ Firebase Storage)

> โปรเจคนี้ใช้ **Cloudinary** เป็นหลักสำหรับรูปภาพ แต่ถ้าต้องการใช้ Firebase Storage เพิ่มเติม:

1. ไปที่ **Storage** → **Get started**
2. เลือก region เดียวกับ Firestore

### 5. ดึง Client SDK Config

1. ไปที่ **Project Settings** (icon ฟันเฟือง) → **Your apps**
2. คลิก **Add app** → เลือก Web (`</>`)
3. คัดลอก `firebaseConfig` object → นำค่าแต่ละ field ไปใส่ใน `.env.local`

### 6. ดึง Admin SDK Service Account

1. ไปที่ **Project Settings** → **Service accounts**
2. คลิก **Generate new private key** → ดาวน์โหลด JSON
3. เปิดไฟล์ JSON แล้วคัดลอก:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (ทั้ง block รวม `-----BEGIN...-----END-----`)

### 7. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

---

## Cloudinary Setup

### 1. สมัครบัญชี

ไปที่ [cloudinary.com](https://cloudinary.com/) → สมัครฟรี (Cloudinary Free tier เพียงพอสำหรับการใช้งานทั่วไป)

### 2. ดึง Credentials

1. เข้าสู่ Dashboard → จะเห็น **Cloud name**, **API Key**, **API Secret** ทันที
2. คัดลอกทั้งสามค่าไปใส่ใน `.env.local`

### 3. ตั้งค่า Upload Preset (ถ้าจำเป็น)

โปรเจคนี้ใช้ signed upload ผ่าน API route (`/api/upload`) — ไม่ต้องสร้าง unsigned upload preset แยก Cloudinary จะรับ upload จาก server โดยตรง

---

## คำสั่ง Scripts

```bash
npm run dev      # รัน development server ที่ localhost:3000
npm run build    # Build สำหรับ production
npm run start    # รัน production server (ต้อง build ก่อน)
npm run lint     # ตรวจสอบ code ด้วย ESLint
```

---

## Contributing

ยินดีรับ contribution ทุกรูปแบบ — bug report, feature request, หรือ pull request

### ขั้นตอน

1. Fork repository นี้
2. สร้าง branch ใหม่: `git checkout -b feature/your-feature-name`
3. แก้ไขและ commit: `git commit -m "feat: your change"`
4. Push: `git push origin feature/your-feature-name`
5. เปิด Pull Request พร้อมอธิบายสิ่งที่เปลี่ยนแปลง

### ข้อควรรู้ก่อน contribute

- **UI ต้องเป็นภาษาไทยทั้งหมด** — label, placeholder, error message ทุกอย่าง
- **อ่าน DESIGN.md** ก่อน — ระบบมี design system ที่ชัดเจน (สีผ่าน OKLCH tokens, ฟอนต์ Sarabun, radius กำหนดไว้แล้ว)
- **DB path ทั้งหมดต้องอยู่ใน `lib/db.ts`** — อย่า hardcode Firestore path ในที่อื่น
- **อย่าใช้ arbitrary values ใน Tailwind v4** — ใช้ token จาก design system เท่านั้น
- โปรเจคใช้ **Next.js 16 (App Router)** ซึ่งมี breaking changes หลายจุดจาก version ก่อนหน้า — อ่าน docs ใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด

---

## License

MIT License — ดูรายละเอียดใน [LICENSE](LICENSE)
