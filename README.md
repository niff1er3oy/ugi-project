# UGI — ระบบบริหารงานพนักงาน

ระบบ HR และ compliance สำหรับองค์กรไทย จัดการข้อมูลพนักงาน การอบรม งานนอกสถานที่ และรายงาน

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Firebase** — Authentication + Firestore + Storage
- **Cloudinary** — อัปโหลดรูปภาพ
- **Chart.js** — กราฟรายงาน

## โมดูล

| โมดูล | Path |
|-------|------|
| ข้อมูลพนักงาน | `/employees` |
| บริษัท | `/company` |
| ประวัติการอบรม | `/training` |
| การปฏิบัติงานนอกสถานที่ | `/offsite` |
| รายงาน | `/reports` |

## ผู้ใช้งาน

- **เจ้าหน้าที่ (officer)** — login ที่ `/login` ต้องใส่รหัส Office ตอนสมัคร เข้าถึงทุกโมดูล
- **พนักงาน (employee)** — login ที่ `/employee/login` ดูข้อมูลของตัวเองที่ `/me`

## การติดตั้ง

```bash
npm install
```

สร้างไฟล์ `.env.local` และใส่ค่าตามนี้:

```env
# Office ID (fixed — ระบบนี้ใช้สำหรับ office เดียว)
NEXT_PUBLIC_OFFICE_ID=

# Firebase Client SDK (Firebase Console > Project Settings > Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary (cloudinary.com > Settings > API Keys)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Firebase Admin SDK (Firebase Console > Project Settings > Service accounts > Generate new private key)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

รัน dev server:

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## โครงสร้าง Firestore

```
office/{OFFICE_ID}/
  employees/{id}
    history/{id}
  companies/{id}
  training/{id}
  offsite/{id}

users/{uid}
```

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```
