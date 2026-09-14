import AdminGuard from "../admin-guard"
import AdminSidebar from "../admin-sidebar"

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminSidebar />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </AdminGuard>
  )
}
