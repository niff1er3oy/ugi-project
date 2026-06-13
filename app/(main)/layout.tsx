import BottomNav from "@/components/bottom-nav";
import Sidebar from "@/components/sidebar";
import { NotificationProvider } from "@/components/notification-provider";
import { UserProvider } from "@/lib/user-context";
import AuthGuard from "@/components/auth-guard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AuthGuard>
        <NotificationProvider initialCount={0}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
              <div className="pb-24 lg:pb-0">{children}</div>
            </div>
          </div>
          <BottomNav />
        </NotificationProvider>
      </AuthGuard>
    </UserProvider>
  );
}
