import {
  getDocs, addDoc, updateDoc, onSnapshot,
  query, orderBy, Timestamp,
} from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import { notificationsRef, notificationDocRef } from "@/lib/db";
import { auth } from "@/lib/firebase/client";

// ── Types ──────────────────────────────────────────────────────
export type NotifType     = "info" | "warning" | "error";
export type NotifCategory = "ข้อมูลพนักงาน" | "การอบรม" | "การปฏิบัติงานนอกสถานที่";

export type AppNotification = {
  id: string;
  type: NotifType;
  category: NotifCategory;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  createdBy: string;
  readBy: string[];
};

// ── Config ─────────────────────────────────────────────────────
export const TYPE_CONFIG: Record<NotifType, { bg: string; text: string; dot: string }> = {
  info:    { bg: "bg-primary-ghost", text: "text-primary-text", dot: "var(--primary)" },
  warning: { bg: "bg-accent-pale",   text: "text-accent-text",  dot: "var(--accent)"  },
  error:   { bg: "bg-error-pale",    text: "text-error",        dot: "var(--error)"   },
};

export const CATEGORY_CONFIG: Record<NotifCategory, { label: string }> = {
  "ข้อมูลพนักงาน":              { label: "ข้อมูลพนักงาน" },
  "การอบรม":                    { label: "การอบรม" },
  "การปฏิบัติงานนอกสถานที่":   { label: "การปฏิบัติงานนอกสถานที่" },
};

// ── Helpers ────────────────────────────────────────────────────
export function formatNotifTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "เมื่อกี้";
  if (m < 60)  return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h} ชั่วโมงที่แล้ว`;
  const d = Math.floor(h / 24);
  if (d === 1) return "เมื่อวาน";
  if (d < 7)   return `${d} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

// ── Firestore CRUD ─────────────────────────────────────────────
export async function createNotification(
  data: Pick<AppNotification, "type" | "category" | "title" | "message" | "href">
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await addDoc(notificationsRef(), {
    ...data,
    createdAt: new Date().toISOString(),
    createdBy: user.uid,
    readBy: [],
  });
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const snap = await getDocs(query(notificationsRef(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
}

export async function markNotifRead(notifId: string, uid: string): Promise<void> {
  await updateDoc(notificationDocRef(notifId), { readBy: arrayUnion(uid) });
}

export async function markAllNotifsRead(notifIds: string[], uid: string): Promise<void> {
  await Promise.all(notifIds.map((id) => markNotifRead(id, uid)));
}

export function subscribeNotifications(
  callback: (notifications: AppNotification[]) => void
): () => void {
  return onSnapshot(
    query(notificationsRef(), orderBy("createdAt", "desc")),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification)))
  );
}
