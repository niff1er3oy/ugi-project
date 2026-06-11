"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type NotifCtx = {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
};

const NotifContext = createContext<NotifCtx>({
  unreadCount: 0,
  setUnreadCount: () => {},
});

export function NotificationProvider({
  children,
  initialCount,
}: {
  children: ReactNode;
  initialCount: number;
}) {
  const [unreadCount, setUnreadCount] = useState(initialCount);
  return (
    <NotifContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotificationCount() {
  return useContext(NotifContext);
}
