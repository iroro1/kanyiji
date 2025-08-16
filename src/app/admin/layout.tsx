import AdminNavbar from '@/components/layout/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="pt-16">
        {children}
      </main>
      {/* No Footer - Admin pages don't need the main site footer */}
    </div>
  );
}
