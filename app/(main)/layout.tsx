import BottomNav from "@/components/bottom-nav";
import Sidebar from "@/components/sidebar";
import { NotificationProvider } from "@/components/notification-provider";

// 3 = initial unread count matching mock data; replace with server fetch when backend is ready
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider initialCount={3}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <div className="pb-16 lg:pb-0">{children}</div>
        </div>
      </div>
      <BottomNav />
    </NotificationProvider>
  );
}
