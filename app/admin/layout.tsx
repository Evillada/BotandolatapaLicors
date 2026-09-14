import AdminToaster from "./admin-toaster"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminToaster />
      {children}
    </div>
  )
}
