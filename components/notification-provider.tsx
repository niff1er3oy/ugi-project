"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { subscribeNotifications, type AppNotification } from "@/lib/notifications";

type NotifCtx = {
  unreadCount: number;
  notifications: AppNotification[];
};

const NotifContext = createContext<NotifCtx>({ unreadCount: 0, notifications: [] });

export function NotificationProvider({
  children,
  initialCount,
}: {
  children: ReactNode;
  initialCount: number;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
  }, []);

  useEffect(() => {
    if (!uid) return;
    return subscribeNotifications(setNotifications);
  }, [uid]);

  const unreadCount = uid
    ? notifications.filter((n) => !n.readBy.includes(uid)).length
    : initialCount;

  return (
    <NotifContext.Provider value={{ unreadCount, notifications }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotifContext);
}

export function useNotificationCount() {
  const { unreadCount } = useContext(NotifContext);
  return { unreadCount };
}
