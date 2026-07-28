import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar, AdminMobileNav, AdminHeader } from "@/components/admin/sidebar";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.user?.role !== "admin") redirect("/account");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader name={session.user?.name} email={session.user?.email} />
        <AdminMobileNav />
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
