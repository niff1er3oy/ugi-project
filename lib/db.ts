import { collection, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

const OFFICE_ID = process.env.NEXT_PUBLIC_OFFICE_ID!;

export const officeRef = () => doc(db, "office", OFFICE_ID);

export const employeesRef    = () => collection(db, "office", OFFICE_ID, "employees");
export const employeeRef     = (id: string) => doc(db, "office", OFFICE_ID, "employees", id);
export const historyRef      = (empId: string) => collection(db, "office", OFFICE_ID, "employees", empId, "history");

export const companiesRef    = () => collection(db, "office", OFFICE_ID, "companies");
export const companyRef      = (id: string) => doc(db, "office", OFFICE_ID, "companies", id);

export const trainingRef     = () => collection(db, "office", OFFICE_ID, "training");
export const trainingDocRef  = (id: string) => doc(db, "office", OFFICE_ID, "training", id);

export const offsiteRef      = () => collection(db, "office", OFFICE_ID, "offsite");
export const offsiteDocRef   = (id: string) => doc(db, "office", OFFICE_ID, "offsite", id);

export const notificationsRef    = () => collection(db, "office", OFFICE_ID, "notifications");
export const notificationDocRef  = (id: string) => doc(db, "office", OFFICE_ID, "notifications", id);

export const userRef = (uid: string) => doc(db, "users", uid);
